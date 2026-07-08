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
  const candidates = localMatch(query, 20);
  const pool = candidates.length > 0
    ? SKILL_CATALOG.filter((s) => candidates.includes(s.skill))
    : SKILL_CATALOG;
  const skillIds = pool.map((s) => s.skill);
  const validIds = new Set(skillIds);
  const idToSkill = new Map(pool.map((s) => [s.skill, s]));

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Rank these skill IDs by relevance to the user's problem. Pick the top 5 most relevant from the list below. Output only a JSON object with a "ranked_ids" array.

Example:
User problem: "I have security vulnerabilities"
Output: {"ranked_ids": ["security-threat-modeling", "vibe-coding-security-hardening", "security-review-protocol"]}

Skill IDs to choose from:
${skillIds.join(', ')}

User problem: ${query}`,
        },
        {
          role: 'assistant',
          content: '{"ranked_ids": ["',
        },
      ],
      max_tokens: 256,
      temperature: 0.0,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Groq API ${res.status}: ${errBody.slice(0, 300)}`);
  }
  const data = await res.json();
  // The prefilled assistant message means content starts with {"ranked_ids": ["
  // The model continues from there, so we need to close the JSON ourselves.
  let text = data.choices?.[0]?.message?.content || '';
  // If the model didn't close the array/object, auto-close it.
  if (text.startsWith('{"ranked_ids":')) {
    const openBrackets = (text.match(/\[/g) || []).length;
    const closeBrackets = (text.match(/\]/g) || []).length;
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;
    if (closeBrackets < openBrackets) text += ']';
    if (closeBraces < openBraces) text += '}';
  }

  let rankedIds = [];
  try {
    const parsed = JSON.parse(text);
    rankedIds = Array.isArray(parsed.ranked_ids) ? parsed.ranked_ids : [];
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try { rankedIds = JSON.parse(match[0]); } catch {}
    }
  }

  const filtered = rankedIds.filter((id) => validIds.has(id));
  if (filtered.length === 0 && rankedIds.length > 0) {
    throw new Error(`AI returned ${rankedIds.length} IDs but 0 matched. Raw: ${text.slice(0, 200)}. Valid sample: ${[...validIds].slice(0, 3).join(', ')}`);
  }
  return filtered
    .slice(0, 5)
    .map((id, i) => {
      const s = idToSkill.get(id);
      return {
        skill: s.skill,
        name: s.name,
        school: s.school,
        score: Math.max(0.1, 1 - i * 0.15),
        reason: s.effect,
      };
    });
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

  // 2) Synchronous AI inference with a timeout guard. The pre-filtered
  // prompt (top-20 candidates) keeps the model input small, but cold
  // starts can still be slow. If the AI doesn't respond in 5s, fall
  // back to local matching and warm the cache in the background.
  if (env.GROQ_API_KEY) {
    try {
      const aiTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 5000),
      );
      const aiResults = await Promise.race([
        runAiInference(env, query),
        aiTimeout,
      ]);
      if (aiResults.length > 0) {
        if (cache && typeof waitUntil === 'function') {
          waitUntil(populateCache(cache, key, aiResults));
        }
        return jsonResponse({ results: aiResults, source: 'ai' });
      }
      // AI returned empty — fall through to local with debug.
      const lr = localMatch(query);
      return jsonResponse({ results: lr, source: 'local', debug: 'AI returned 0 results' });
    } catch (err) {
      const lr = localMatch(query);
      return jsonResponse({ results: lr, source: 'local', debug: err?.message || String(err) });
    }
  }

  // 3) Local token-overlap fallback (sub-50ms).
  const localResults = localMatch(query);
  return jsonResponse({ results: localResults, source: 'local' });
}
