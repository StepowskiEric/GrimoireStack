/**
 * functions/api/groq-proxy.js — Pages Function
 *
 * OpenAI-compatible chat-completions proxy for page-agent.
 * Forwards requests to Groq's API using the server-side GROQ_API_KEY
 * secret, so users don't need to provide their own key.
 */

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

function json(data, status, corsH) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsH, 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const corsH = corsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsH });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsH);
  }
  if (!env.GROQ_API_KEY) {
    return json({ error: 'GROQ_API_KEY is not configured on the server' }, 500, corsH);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsH);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: 'Missing messages array' }, 400, corsH);
  }

  const model = typeof body.model === 'string' && body.model ? body.model : 'qwen/qwen3.6-27b';
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
  const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : 4096;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text().catch(() => '');
      return json({ error: 'Groq API error', detail: errBody.slice(0, 500) }, groqRes.status, corsH);
    }

    const groqData = await groqRes.json();
    // Pass through the Groq response as-is (OpenAI-compatible format)
    return new Response(JSON.stringify(groqData), {
      status: 200,
      headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return json({ error: 'Groq proxy failed', detail: err.message }, 500, corsH);
  }
}
