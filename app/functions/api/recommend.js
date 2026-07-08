/**
 * functions/api/recommend.js — Pages Function
 *
 * POST /api/recommend
 * Body: { query: string }
 * Returns: { results: Array<{ skill: string, name: string, school: string, score: number, reason: string }> }
 *
 * Architecture: every first-touch query awaits Workers AI synchronously
 * so the user gets LLM-quality recommendations immediately. Successful AI
 * results are cached in the background (via `context.waitUntil`) under
 * `caches.default` keyed by the query; subsequent requests for the same
 * query hit the cache in O(1) edge lookup time.
 *
 * Fallback: if AI is unavailable or returns empty results, the local
 * token-overlap matcher runs as a sub-50ms fallback.
 */

import { SKILL_CATALOG } from './skill-catalog.js';

// Build the system prompt once at module scope (cold start only)
const CATALOG_TEXT = SKILL_CATALOG
  .map((s) => `- ${s.skill}: "${s.name}" [${s.school}] — ${s.effect}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a skill-matching oracle for the GrimoireStack — a catalog of agent skills.
Given a user's problem description, return the 3-5 most relevant skills from the catalog.

For each match, output a JSON object with:
- "skill": the skill id (e.g. "cognitive-bias-checklist")
- "name": the skill display name
- "school": the school name
- "score": a number 0-1 indicating relevance
- "reason": one short sentence explaining why this skill fits

Return ONLY a JSON array. No markdown, no explanation, no preamble.

CATALOG:
${CATALOG_TEXT}`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CACHE_TTL_SECONDS = 60 * 60 * 6; // 6 hours

// Server-side replica of `spellMatcher.matchProblem` in
// app/src/data/spellMatcher.js. Kept short and identical so the
// server's local matches align with what the client falls back to.
const STOPWORDS = new Set([
  'a','an','the','i','im','ive','id','is','it','of','to','and','or','but',
  'my','in','on','for','with','this','that','those','these','be','been',
  'was','were','are','am','do','does','did','have','has','had','you','your',
  'me','we','us','our','so','just','very','really','about','what','how',
  'when','where','why','which','than','then','too','any','some','no','not',
]);

function tokenizeQuery(query) {
  const cleaned = String(query || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const out = [];
  for (const raw of cleaned.split(/\s+/)) {
    if (raw && !STOPWORDS.has(raw) && raw.length > 1) out.push(raw);
  }
  return out;
}

function localMatch(query, limit = 5) {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return [];

  const scored = [];
  for (const skill of SKILL_CATALOG) {
    const haystack = `${skill.name} ${skill.skill} ${skill.effect} ${skill.school} ${skill.schoolName || ''} ${skill.status || ''}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (haystack.includes(tok)) score += 2;
    }
    if (skill.status === 'Proven') score += 0.5;
    if (score > 0) {
      scored.push({ skill, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ skill, score }) => ({
    skill: skill.skill,
    name: skill.name,
    school: skill.school,
    score: Math.min(1, score / 10),
    reason: skill.effect,
  }));
}

function extractText(response) {
  if (typeof response === 'string') return response;
  if (!response || typeof response !== 'object') return '';
  const candidate = response.response || response.content || response.text || '';
  if (typeof candidate === 'string') return candidate;
  if (Array.isArray(candidate)) {
    return candidate.map((p) => p?.text || p?.content || '').join('');
  }
  if (candidate && typeof candidate === 'object') {
    return candidate.text || candidate.content || '';
  }
  return '';
}

function parseAiResults(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];
  try {
    const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 5);
  } catch {
    return [];
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function cacheKey(query) {
  return `https://grimoirestack.com/api/recommend?q=${encodeURIComponent(query)}`;
}

async function runAiInference(env, query) {
  const aiResponse = await env.AI.run('@cf/ibm-granite/granite-4.0-h-micro', {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `User problem: "${query}"\n\nReturn the 3-5 most relevant skills from the catalog as a JSON array.` },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  const text = extractText(aiResponse);
  return parseAiResults(text);
}

async function populateCache(cache, key, results) {
  try {
    if (!results || !results.length) return;
    const response = jsonResponse({ results, source: 'ai' });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}`);
    await cache.put(key, response);
  } catch {
    // Cache stays empty; future requests retry the AI path.
  }
}

async function warmCacheInBackground(env, cache, key, query) {
  try {
    const results = await runAiInference(env, query);
    if (results.length > 0) {
      await populateCache(cache, key, results);
    }
  } catch {
    // Cache stays empty; future requests retry.
  }
}

export async function onRequest(context) {
  const { request, env, waitUntil } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const query = (body.query || '').trim();
  if (!query) {
    return jsonResponse({ error: 'Missing query' }, 400);
  }

  const cache = caches.default;
  const key = cacheKey(query);

  // 1) Cached AI result for this exact query (fastest path).
  if (cache) {
    try {
      const cached = await cache.match(key);
      if (cached) {
        return new Response(cached.body, {
          status: cached.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Cache read failure is non-fatal.
    }
  }

  // 2) Synchronous AI inference with a timeout guard. Granite processing
  // the 181-skill catalog (~15K tokens) can take 10-20s on cold starts.
  // If the AI doesn't respond in 8s, fall back to local matching and
  // let the AI populate the cache in the background for next time.
  if (env.AI) {
    try {
      const aiTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 8000),
      );
      const aiResults = await Promise.race([
        runAiInference(env, query),
        aiTimeout,
      ]);
      if (aiResults.length > 0) {
        // Populate cache in the background for subsequent requests.
        if (cache && typeof waitUntil === 'function') {
          waitUntil(populateCache(cache, key, aiResults));
        }
        return jsonResponse({ results: aiResults, source: 'ai' });
      }
    } catch {
      // AI failed or timed out — fall through to local matching.
      // Still kick off background AI to warm the cache for next time.
      if (env.AI && cache && typeof waitUntil === 'function') {
        waitUntil(warmCacheInBackground(env, cache, key, query));
      }
    }
  }

  // 3) Local token-overlap fallback (sub-50ms).
  const localResults = localMatch(query);
  return jsonResponse({ results: localResults, source: 'local' });
}
