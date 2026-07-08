/**
 * functions/api/recommend.js — Pages Function
 *
 * POST /api/recommend
 * Body: { query: string }
 * Returns: { results: Array<{ skill: string, name: string, school: string, score: number, reason: string }> }
 *
 * Architecture: every first-touch query awaits Groq AI synchronously
 * so the user gets LLM-quality recommendations immediately. Successful AI
 * results are cached in the background (via `context.waitUntil`) under
 * `caches.default` keyed by the query; subsequent requests for the same
 * query hit the cache in O(1) edge lookup time.
 *
 * Fallback: if AI is unavailable or returns empty results, the local
 * token-overlap matcher runs as a sub-50ms fallback.
 *
 * Security: CORS locked to grimoirestack.com origins, query length capped
 * to 500 chars, rate limiting via Cloudflare dashboard binding (RECOMMEND).
 */

import { SKILL_CATALOG } from './skill-catalog.js';

const ALLOWED_ORIGINS = [
  'https://grimoirestack.com',
  'https://www.grimoirestack.com',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
  };
}

const CACHE_TTL_SECONDS = 60 * 60 * 6; // 6 hours
const MAX_QUERY_LENGTH = 500;

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

function jsonResponse(data, status, corsH) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsH, 'Content-Type': 'application/json' },
  });
}

function cacheKey(query) {
  return `https://grimoirestack.com/api/recommend?q=${encodeURIComponent(query)}`;
}

async function runAiInference(env, query) {
  const candidates = localMatch(query, 20).map((r) => r.skill);
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
  let text = data.choices?.[0]?.message?.content || '';
  // Auto-close incomplete JSON from prefilled assistant message.
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

  // Filter to valid IDs only, then build result objects from catalog data.
  const filtered = rankedIds.filter((id) => validIds.has(id));
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

const MAX_INTERVIEW_ROUNDS = 15;

// Tool definitions for Qwen3.6 native function calling
const INTERVIEW_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'ask_question',
      description: 'Ask the user a multiple-choice question to narrow down their problem.',
      parameters: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: 'A specific, targeted question about their problem. Avoid generic questions.',
          },
          choices: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
            description: 'Exactly 3 distinct answer choices.',
          },
        },
        required: ['question', 'choices'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'finish_interview',
      description: 'Call this when you are at least 90% confident you understand the user problem well enough to recommend a skill. Provide a brief summary and 3-5 search keywords.',
      parameters: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Brief summary of what the user needs (2-3 sentences).',
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 5,
            description: 'Search keywords that describe the user problem, from most to least specific.',
          },
        },
        required: ['summary', 'keywords'],
      },
    },
  },
];

/**
 * Try to parse a plain-text question with numbered choices, e.g.:
 *   "What type of loop?\n\n1. Option A\n2. Option B\n3. Option C"
 * Returns { question, choices } or null.
 */
function parsePlainTextQuestion(text) {
  if (!text) return null;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  // Find the first line that's not a numbered choice — that's the question
  const choiceRe = /^\d+[\.\)]\s+(.+)/;
  const questionLines = [];
  const choices = [];
  let inChoices = false;
  for (const line of lines) {
    const match = line.match(choiceRe);
    if (match) {
      inChoices = true;
      choices.push(match[1].replace(/\.\.\.+$/, '').trim());
    } else if (!inChoices) {
      questionLines.push(line);
    }
  }
  if (questionLines.length > 0 && choices.length >= 2) {
    // Pad or trim to exactly 3 choices
    while (choices.length < 3) choices.push(choices[choices.length - 1]);
    return { question: questionLines.join(' '), choices: choices.slice(0, 3) };
  }
  return null;
}

/**
 * Interview-mode inference via OpenRouter free tier. The LLM asks targeted
 * multiple-choice questions to understand the user's problem, then signals
 * when confident via finish_interview. The server performs skill matching
 * against the full catalog.
 * Returns either { type: 'question', question, choices: [a,b,c] }
 * or { type: 'results', results: [...] }.
 */
async function runInterviewInference(env, query, history, useOpenRouter) {
  const apiKey = useOpenRouter ? env.OPENROUTER_API_KEY : env.GROQ_API_KEY;
  const baseUrl = useOpenRouter
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.groq.com/openai/v1';
  const model = useOpenRouter ? 'openrouter/free' : 'qwen/qwen3.6-27b';
  const extraHeaders = useOpenRouter
    ? { 'HTTP-Referer': 'https://grimoirestack.com', 'X-Title': 'GrimoireStack' }
    : {};
  const extraBody = useOpenRouter ? {} : { reasoning_effort: 'none' };

  const systemPrompt = `You are a skilled interviewer for GrimoireStack, a skill-matching system. Your ONLY job is to ask multiple-choice questions to understand the user's problem. NEVER answer the user's question directly.

Rules:
- Ask exactly one question at a time, with exactly 3 distinct choices.
- Each question must dig into their specific problem — environment, stack, what broke, what they tried.
- Do NOT provide advice, solutions, or analysis. Only ask questions.
- You may ask up to ${MAX_INTERVIEW_ROUNDS} questions. Do NOT rush.
- When you are 90%+ confident of the correct skill match, call finish_interview with a summary and 3-5 search keywords.`;

  // Build conversation — previous rounds as plain text so the model
  // sees the full dialogue even though tool calls aren't stored in history
  const messages = [{ role: 'system', content: systemPrompt }];
  messages.push({ role: 'user', content: `User's problem: ${query}` });

  for (const turn of history.slice(-2)) {
    const qText = turn.question?.question || (typeof turn.question === 'string' ? turn.question : JSON.stringify(turn.question));
    messages.push({ role: 'assistant', content: qText });
    messages.push({ role: 'user', content: turn.answer });
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      // On the first round, only expose ask_question so the model can't
      // immediately finish. Add finish_interview on subsequent rounds.
      tools: history.length === 0
        ? INTERVIEW_TOOLS.filter((t) => t.function.name === 'ask_question')
        : INTERVIEW_TOOLS,
      // Force tool use — openrouter/free sometimes routes to models that
      // ignore tool definitions and answer directly.
      tool_choice: 'required',
      max_tokens: 512,
      temperature: 0.7,
      ...extraBody,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`OpenRouter API ${res.status}: ${errBody.slice(0, 300)}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0]?.message;
  const toolCalls = choice?.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    console.log('[ritual] no tool calls, content:', (choice?.content || '').slice(0, 200));
    // Some free models return questions as plain text. Try to parse them.
    const text = (choice?.content || '').trim();
    const parsed = parsePlainTextQuestion(text);
    if (parsed) return { type: 'question', question: parsed.question, choices: parsed.choices };
    const localResults = localMatch(query, 3);
    return { type: 'results', results: localResults };
  }

  const tc = toolCalls[0];
  if (tc.function.name === 'ask_question') {
    let args;
    try { args = JSON.parse(tc.function.arguments); } catch { args = null; }
    if (args && args.question && Array.isArray(args.choices) && args.choices.length === 3) {
      return { type: 'question', question: args.question, choices: args.choices };
    }
    return { type: 'results', results: localMatch(query, 3) };
  }

  if (tc.function.name === 'finish_interview') {
    let args;
    try { args = JSON.parse(tc.function.arguments); } catch { args = null; }
    if (args && args.summary && Array.isArray(args.keywords)) {
      // Build a combined query from the interview context and do server-side matching
      const combinedQuery = `${query} ${args.keywords.join(' ')} ${args.summary}`;
      const results = localMatch(combinedQuery, 3); // use the same localMatch with combined query
      return { type: 'results', results };
    }
    return { type: 'results', results: localMatch(query, 3) };
  }

  console.log('[ritual] unexpected tool call:', tc.function.name);
  return { type: 'results', results: localMatch(query, 3) };
}

async function populateCache(cache, key, results, corsH) {
  try {
    if (!results || !results.length) return;
    const response = jsonResponse({ results, source: 'ai' }, 200, corsH);
    response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}`);
    await cache.put(key, response);
  } catch {
    // Cache stays empty; future requests retry the AI path.
  }
}

async function warmCacheInBackground(env, cache, key, query, corsH) {
  try {
    const results = await runAiInference(env, query);
    if (results.length > 0) {
      await populateCache(cache, key, results, corsH);
    }
  } catch {
    // Cache stays empty; future requests retry.
  }
}

export async function onRequest(context) {
  const { request, env, waitUntil } = context;
  const corsH = corsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsH });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, corsH);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, corsH);
  }

  const query = (body.query || '').trim();
  if (!query) {
    return jsonResponse({ error: 'Missing query' }, 400, corsH);
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return jsonResponse({ error: `Query too long (max ${MAX_QUERY_LENGTH} chars)` }, 400, corsH);
  }

  // Interview mode: multi-turn narrowing dialogue via OpenRouter (preferred) or Groq
  const useOpenRouter = !!env.OPENROUTER_API_KEY;
  if (body.mode === 'interview' && (useOpenRouter || env.GROQ_API_KEY)) {
    const history = Array.isArray(body.history) ? body.history.slice(0, MAX_INTERVIEW_ROUNDS) : [];
    try {
      const aiTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 20000),
      );
      const result = await Promise.race([
        runInterviewInference(env, query, history, useOpenRouter),
        aiTimeout,
      ]);
      if (result) {
        return jsonResponse({ ...result, source: 'ai' }, 200, corsH);
      }
    } catch (err) {
      console.log('[recommend] interview inference failed', err?.message?.slice(0, 500) || 'unknown error');
      const localResults = localMatch(query, 3);
      return jsonResponse({ type: 'results', results: localResults, source: 'local' }, 200, corsH);
    }
    const localResults = localMatch(query, 3);
    return jsonResponse({ type: 'results', results: localResults, source: 'local' }, 200, corsH);
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
          headers: { ...corsH, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Cache read failure is non-fatal.
    }
  }

  // 2) Synchronous AI inference with a timeout guard. If the AI doesn't
  // respond in 5s, fall back to local matching and warm the cache in
  // the background.
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
          waitUntil(populateCache(cache, key, aiResults, corsH));
        }
        return jsonResponse({ results: aiResults, source: 'ai' }, 200, corsH);
      }
    } catch {
      // AI failed or timed out — fall through to local matching.
      // Warm cache in the background for subsequent requests.
      if (cache && typeof waitUntil === 'function') {
        waitUntil(warmCacheInBackground(env, cache, key, query, corsH));
      }
    }
  }

  // 3) Local token-overlap fallback (sub-50ms).
  const localResults = localMatch(query);
  return jsonResponse({ results: localResults, source: 'local' }, 200, corsH);
}
