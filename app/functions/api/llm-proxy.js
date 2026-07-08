/**
 * functions/api/llm-proxy.js — Pages Function
 *
 * OpenAI-compatible chat-completions proxy for page-agent and other
 * browser clients. Translates standard `/v1/chat/completions` requests
 * into Cloudflare Workers AI calls and maps the response back into
 * the OpenAI shape.
 *
 * Workers AI's chat-completion models (e.g. @cf/zai-org/glm-4.7-flash)
 * accept the standard OpenAI nested tool shape:
 *   { type: "function", function: { name, description, parameters, strict } }
 * We pass that through (and accept flat { name, description, parameters }
 * for backward compat). The default model is glm-4.7-flash because it has
 * `tools` in its input schema; granite-4.0-h-micro's input schema is
 * prompt-only and rejects `tools` with 8001 Invalid input.
 *
 * Pass-through semantics:
 *   - `messages`  forwarded verbatim (system / user / assistant / tool)
 *   - `tools`     normalized to OpenAI nested shape (passes through)
 *   - `tool_choice` forwarded verbatim
 *   - `temperature`, `max_tokens`, `stream` forwarded as configured
 *
 * Response mapping:
 *   - Workers AI's `env.AI.run()` already returns the OpenAI chat.completion
 *     shape (choices[].message.{content,tool_calls}, finish_reason, usage).
 *     We pass that through and add an `id` and `created` timestamp if absent.
 *   - `tool_calls` from either format (OpenAI nested or Workers flat) are
 *     normalized into OpenAI's nested shape.
 *   - `finish_reason` is mapped to "tool_calls" or "stop" if not already set.
 *
 * Skill-matching has its own endpoint: /api/recommend
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DEFAULT_MODEL = '@cf/zai-org/glm-4.7-flash';
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
  // Workers AI's chat-completion models (e.g. @cf/zai-org/glm-4.7-flash)
  // accept the OpenAI nested tool shape:
  //   { type: "function", function: { name, description, parameters } }
  // Pass through as-is. We only filter out malformed entries and fill
  // in `strict: false` when not provided (Workers AI's schema requires
  // a default for this field).
  return tools
    .map((t) => {
      if (!t || typeof t !== 'object') return null;
      // Already in OpenAI nested shape
      if (t.type === 'function' && t.function?.name) {
        return {
          type: 'function',
          function: {
            name: String(t.function.name),
            description: typeof t.function.description === 'string' ? t.function.description : '',
            parameters: t.function.parameters ?? { type: 'object', properties: {} },
            strict: t.function.strict === true,
          },
        };
      }
      // Flat shape (e.g. { name, description, parameters }) — promote to nested
      if (t.name && !t.type) {
        return {
          type: 'function',
          function: {
            name: String(t.name),
            description: typeof t.description === 'string' ? t.description : '',
            parameters: t.parameters ?? { type: 'object', properties: {} },
            strict: t.strict === true,
          },
        };
      }
      return null;
    })
    .filter(Boolean);
}

function extractText(response) {
  if (typeof response === 'string') return response;
  if (!response || typeof response !== 'object') return '';

  // OpenAI chat.completion shape (Workers AI returns this directly):
  //   { choices: [{ message: { content: "..." } }] }
  if (Array.isArray(response.choices) && response.choices.length > 0) {
    const first = response.choices[0];
    const message = first?.message;
    if (message) {
      const c = message.content;
      if (typeof c === 'string') return c;
      if (Array.isArray(c)) return c.map((p) => p?.text ?? p?.content ?? '').join('');
      if (c && typeof c === 'object' && typeof c.text === 'string') return c.text;
    }
    if (typeof first?.text === 'string') return first.text;
  }

  // Workers AI native prompt shape:
  //   { response: "..." }
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

  // OpenAI chat.completion shape: choices[0].message.tool_calls
  if (Array.isArray(response.choices) && response.choices.length > 0) {
    const first = response.choices[0];
    const message = first?.message;
    if (message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
      return message.tool_calls
        .map((call, index) => {
          if (!call) return null;
          const name = call.function?.name ?? call.name;
          if (!name) return null;
          const argsRaw = call.function?.arguments ?? call.arguments ?? '{}';
          const argsString =
            typeof argsRaw === 'string' ? argsRaw : JSON.stringify(argsRaw ?? {});
          return {
            id: call.id ?? `call_${index}_${Math.random().toString(36).slice(2, 10)}`,
            type: 'function',
            function: { name, arguments: argsString },
          };
        })
        .filter(Boolean);
    }
  }

  // Workers AI native shape: { tool_calls: [{ name, arguments }] }
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
  // Workers AI's `env.AI.run()` already returns the OpenAI chat.completion
  // shape directly. When that's the case, just enrich with `id`/`created`
  // (if missing) and pass through — preserving `usage`, `finish_reason`,
  // and any other fields the model emitted.
  if (
    response &&
    typeof response === 'object' &&
    Array.isArray(response.choices) &&
    response.choices.length > 0 &&
    response.choices[0]?.message
  ) {
    const payload = { ...response, model: response.model ?? model };
    if (!payload.id) payload.id = uuid();
    if (!payload.created) payload.created = Math.floor(Date.now() / 1000);
    if (payload.object === undefined) payload.object = 'chat.completion';
    if (!stream) {
      return {
        ok: true,
        body: new Response(JSON.stringify(payload), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }),
      };
    }
    // Streaming: emit the payload as a single SSE chunk + DONE. (page-agent
    // doesn't use streaming, so this path is rarely hit. A more thorough
    // pass-through could relay Workers AI's native SSE stream directly.)
    const sse = `data: ${JSON.stringify(payload)}\n\ndata: [DONE]\n\n`;
    return {
      ok: true,
      body: new Response(sse, {
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

  // Fallback: native Workers AI prompt shape or unrecognized format.
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

  const aiParams = {
    messages: augmentedMessages,
    temperature,
    max_tokens: maxTokens,
    // glm-4.7-flash is a reasoning model that defaults to burning the
    // entire output budget on chain-of-thought. Disable thinking for
    // agentic callers (page-agent) so the model produces content
    // directly. Reasoning controls belong on the inputs object of
    // `binding.run()`, not the options argument — see
    // https://github.com/cloudflare/ai/issues/501
    chat_template_kwargs: { enable_thinking: false },
    reasoning_effort: null,
  };
  if (tools) {
    aiParams.tools = tools;
    // tool_choice is OpenAI-shaped in both worlds. Pass it through.
    // Accepted values per glm-4.7-flash's input schema:
    //   - "none" | "auto" | "required"
    //   - { type: "function", function: { name } }
    if (toolChoice) aiParams.tool_choice = toolChoice;
  }

  // Workers AI binding (native). As of 2026, the binding returns
  // the OpenAI chat.completion shape directly, so we pass it
  // through with minor enrichment (id, created) when present.
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
