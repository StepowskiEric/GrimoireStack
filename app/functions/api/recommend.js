/**
 * functions/api/recommend.js — Pages Function
 *
 * POST /api/recommend
 * Body: { query: string }
 * Returns: { results: Array<{ skill: string, name: string, school: string, score: number, reason: string }> }
 *
 * Speed model: return local token-overlap matches immediately (sub-100ms),
 * then fire a Workers AI call in the background via `context.waitUntil`
 * and cache the AI-ranked result under `caches.default` keyed by the query.
 * Subsequent requests for the same query hit the cache and return the
 * AI-ranked results in O(1) edge lookup time.
 *
 * Fallback: if the local matcher finds nothing for a query (rare — only
 * queries with every token in the stopword list), the AI call is awaited
 * synchronously so we still return something useful.
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
    }
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

async function populateCache(cache, key, query, env) {
  try {
    const results = await runAiInference(env, query);
    if (!results.length) return;
    const response = jsonResponse({ results, source: 'ai' });
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}`);
    await cache.put(key, response);
  } catch {
    // Cache stays empty; future requests retry the AI path.
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

  // 2) Local token-overlap match (immediate, <50ms).
  const localResults = localMatch(query);

  // If local matching found nothing useful, wait synchronously for AI
  // so we still return useful results.
  if (localResults.length === 0) {
    if (env.AI) {
      try {
        const aiResults = await runAiInference(env, query);
        if (aiResults.length > 0) return jsonResponse({ results: aiResults, source: 'ai' });
      } catch {
        // Fall through to empty local.
      }
    }
    return jsonResponse({ results: localResults, source: 'local' });
  }

  // 3) Kick off AI enrichment in the background to populate the cache
  // for subsequent requests.
  if (env.AI && cache && typeof waitUntil === 'function') {
    waitUntil(populateCache(cache, key, query, env));
  }

  return jsonResponse({ results: localResults, source: 'local' });
}
