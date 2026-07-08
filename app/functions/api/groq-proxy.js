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
  const requestId = crypto.randomUUID().slice(0, 8);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsH });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsH);
  }
  if (!env.GROQ_API_KEY) {
    console.log(`[groq-proxy:${requestId}] MISSING GROQ_API_KEY on server`);
    return json({ error: 'GROQ_API_KEY is not configured on the server' }, 500, corsH);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    console.log(`[groq-proxy:${requestId}] Invalid JSON body`);
    return json({ error: 'Invalid JSON body' }, 400, corsH);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    console.log(`[groq-proxy:${requestId}] Missing messages array`);
    return json({ error: 'Missing messages array' }, 400, corsH);
  }

  const model = typeof body.model === 'string' && body.model ? body.model : 'qwen/qwen3.6-27b';
  const hasTools = Array.isArray(body.tools) && body.tools.length > 0;
  const toolChoice = body.tool_choice;

  console.log(`[groq-proxy:${requestId}] Request: model=${model}, tools=${hasTools}, tool_choice=${JSON.stringify(toolChoice)}, messages=${messages.length}, lastMsg=${(messages[messages.length - 1]?.content || '').slice(0, 120)}`);

  // Forward the full body as-is, preserving tools, tool_choice,
  // parallel_tool_calls, temperature, max_tokens, etc.
  const groqBody = { ...body, model };

  try {
    console.log(`[groq-proxy:${requestId}] Sending to Groq: ${JSON.stringify({ model, hasTools, toolChoice, msgCount: groqBody.messages?.length })}`);

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text().catch(() => '');
      console.log(`[groq-proxy:${requestId}] Groq returned ${groqRes.status}: ${errBody.slice(0, 300)}`);
      return json({ error: 'Groq API error', detail: errBody.slice(0, 500) }, groqRes.status, corsH);
    }

    const groqData = await groqRes.json();
    const finishReason = groqData.choices?.[0]?.finish_reason;
    const toolCalls = groqData.choices?.[0]?.message?.tool_calls;
    const hasToolCalls = Array.isArray(toolCalls) && toolCalls.length > 0;
    const content = (groqData.choices?.[0]?.message?.content || '').slice(0, 100);

    console.log(`[groq-proxy:${requestId}] Groq response: finish_reason=${finishReason}, tool_calls=${hasToolCalls ? toolCalls.length : 0}, content_preview="${content}"`);

    // Pass through the Groq response as-is (OpenAI-compatible format)
    return new Response(JSON.stringify(groqData), {
      status: 200,
      headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.log(`[groq-proxy:${requestId}] Fetch error: ${err.message}`);
    return json({ error: 'Groq proxy failed', detail: err.message }, 500, corsH);
  }
}
