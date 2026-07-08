/**
 * functions/api/llm-proxy.js — Pages Function
 *
 * OpenAI-compatible chat-completions proxy for page-agent and other
 * browser clients. Translates standard `/v1/chat/completions` requests
 * into Cloudflare Workers AI calls and maps the response back into
 * the OpenAI shape.
 *
 * Pass-through semantics:
 *   - `messages`  forwarded verbatim (system / user / assistant / tool)
 *   - `tools`     forwarded verbatim (function-calling tool definitions)
 *   - `tool_choice` forwarded verbatim
 *   - `temperature`, `max_tokens`, `stream` forwarded as configured
 *
 * Response mapping:
 *   - Workers AI response is wrapped into OpenAI's chat.completion shape
 *   - `tool_calls` from Workers AI are normalized into OpenAI's nested format
 *   - `finish_reason` is mapped to "tool_calls" or "stop"
 *
 * Skill-matching has its own endpoint: /api/recommend
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DEFAULT_MODEL = '@cf/ibm-granite/granite-4.0-h-micro';
const MAX_OUTPUT_TOKENS = 4096;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function sseError(message) {
  return `data: ${JSON.stringify({ error: message })}\n\n`;
}

function uuid() {
  return `chatcmpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTools(tools) {
  if (!Array.isArray(tools)) return undefined;
  return tools
    .filter((t) => t && typeof t === 'object' && t.type === 'function' && t.function?.name)
    .map((t) => ({
      type: 'function',
      function: {
        name: String(t.function.name),
        description: typeof t.function.description === 'string' ? t.function.description : '',
        parameters: t.function.parameters ?? { type: 'object', properties: {} },
      },
    }));
}

function extractText(response) {
  if (typeof response === 'string') return response;
  if (!response || typeof response !== 'object') return '';
  const candidate = response.response ?? response.content ?? response.text ?? '';
  if (typeof candidate === 'string') return candidate;
  if (Array.isArray(candidate)) {
    return candidate.map((p) => p?.text ?? p?.content ?? '').join('');
  }
  if (candidate && typeof candidate === 'object') {
    return candidate.text ?? candidate.content ?? '';
  }
  return '';
}

function extractToolCalls(response) {
  if (!response || typeof response !== 'object') return [];
  const raw = response.tool_calls ?? response.toolCalls;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((call, index) => {
      if (!call) return null;
      const name = call.name ?? call.function?.name;
      if (!name) return null;
      const args = call.arguments ?? call.function?.arguments ?? '{}';
      const argsString = typeof args === 'string' ? args : JSON.stringify(args ?? {});
      return {
        id: call.id ?? `call_${index}_${Math.random().toString(36).slice(2, 10)}`,
        type: 'function',
        function: { name, arguments: argsString },
      };
    })
    .filter(Boolean);
}

function buildChatCompletion({ response, model, stream = false }) {
  const text = extractText(response);
  const toolCalls = extractToolCalls(response);
  const hasOutput = Boolean(text) || toolCalls.length > 0;

  if (!hasOutput) {
    return {
      ok: false,
      status: 502,
      body: {
        error: 'empty_model_response',
        message: 'Workers AI returned an empty response (no content and no tool_calls). The model may be in a degraded state; retry after a short delay or switch models.',
        model,
      },
    };
  }

  const finishReason = toolCalls.length > 0 ? 'tool_calls' : 'stop';

  const message = {
    role: 'assistant',
    content: text || null,
  };
  if (toolCalls.length > 0) message.tool_calls = toolCalls;

  const payload = {
    id: uuid(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };

  if (stream) {
    const lines = [];
    lines.push(`data: ${JSON.stringify({
      id: payload.id,
      object: 'chat.completion.chunk',
      created: payload.created,
      model,
      choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }],
    })}\n\n`);
    if (text) {
      lines.push(`data: ${JSON.stringify({
        id: payload.id,
        object: 'chat.completion.chunk',
        created: payload.created,
        model,
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
      })}\n\n`);
    }
    if (toolCalls.length > 0) {
      lines.push(`data: ${JSON.stringify({
        id: payload.id,
        object: 'chat.completion.chunk',
        created: payload.created,
        model,
        choices: [{ index: 0, delta: { tool_calls: toolCalls }, finish_reason: null }],
      })}\n\n`);
    }
    lines.push(`data: ${JSON.stringify({
      id: payload.id,
      object: 'chat.completion.chunk',
      created: payload.created,
      model,
      choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
    })}\n\n`);
    lines.push('data: [DONE]\n\n');
    return {
      ok: true,
      body: new Response(lines.join(''), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }),
    };
  }

  return {
    ok: true,
    body: new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }),
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: 'Missing messages array' }, 400);
  }

  // Inject a default system prompt if the caller didn't provide one —
  // Workers AI models (especially the smaller ones) behave erratically
  // with bare user messages, returning empty content.
  const hasSystem = messages.some((m) => m && m.role === 'system');
  const augmentedMessages = hasSystem
    ? messages
    : [
        {
          role: 'system',
          content: 'You are a helpful assistant with access to tools. Use the tools when the user asks for actions you cannot perform with text alone. Always produce a non-empty response.',
        },
        ...messages,
      ];

  const model = typeof body.model === 'string' && body.model ? body.model : DEFAULT_MODEL;
  const tools = normalizeTools(body.tools);
  const toolChoice = body.tool_choice;
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
  const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : MAX_OUTPUT_TOKENS;
  const stream = body.stream === true;

  if (!env.AI) {
    return json({ error: 'Workers AI binding is not configured' }, 500);
  }

  const aiParams = { messages: augmentedMessages, temperature, max_tokens: maxTokens };
  if (tools) {
    aiParams.tools = tools;
    if (toolChoice) aiParams.tool_choice = toolChoice;
  }

  // Workers AI binding (native). Per Cloudflare's 2026-02-17 changelog,
  // the binding's response shape and tool-call handling have been
  // fixed in newer releases — we map that native shape into the
  // OpenAI chat-completion shape below.
  try {
    const aiResponse = await env.AI.run(model, aiParams);
    const built = buildChatCompletion({ response: aiResponse, model, stream });
    if (!built.ok) {
      return json(built.body, built.status);
    }
    return built.body;
  } catch (err) {
    return json({ error: 'AI inference failed', detail: err.message }, 500);
  }
}
