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

  // For models without native tool-calling support (e.g. granite-4.0-h-micro),
  // prepend a tool-instruction block to the first user message so the
  // model knows what tools exist and how to emit a tool call. (We use
  // the user message rather than system because Workers AI's chat
  // template for some models stops generation early after a system
  // message that contains tool-call instructions, producing truncated
  // JSON.) The response handler then parses the JSON tool call out of
  // content.
  if (tools && !modelSupportsNativeTools(model)) {
    const instruction = buildToolPromptInstruction(tools);
    // Prepend to the last user message — that's where the actual query
    // lives, and prepending to the first user message has the model
    // emit a greeting instead of a tool call.
    const lastUserIdx = augmentedMessages.findLastIndex((m) => m.role === 'user');
    const targetIdx = lastUserIdx >= 0 ? lastUserIdx : 0;
    augmentedMessages[targetIdx] = {
      ...augmentedMessages[targetIdx],
      content: `${instruction} ${augmentedMessages[targetIdx].content}`,
    };
  }

  if (!env.AI) {
    return json({ error: 'Workers AI binding is not configured' }, 500);
  }

  const aiParams = { messages: augmentedMessages, temperature, max_tokens: maxTokens };

  // glm-4.7-flash is a reasoning model that defaults to burning the
  // entire output budget on chain-of-thought. Disable thinking for
  // agentic callers (page-agent) so the model produces content
  // directly. Reasoning controls belong on the inputs object of
  // `binding.run()`, not the options argument — see
  // https://github.com/cloudflare/ai/issues/501. We only set these on
  // models that accept them; passing them to other models can hang
  // the inference call.
  if (model === '@cf/zai-org/glm-4.7-flash') {
    aiParams.chat_template_kwargs = { enable_thinking: false };
    aiParams.reasoning_effort = null;
  }

  if (tools && modelSupportsNativeTools(model)) {
    aiParams.tools = tools;
    // tool_choice is OpenAI-shaped in both worlds. Pass it through.
    // Accepted values per glm-4.7-flash's input schema:
    //   - "none" | "auto" | "required"
    //   - { type: "function", function: { name } }
    if (toolChoice) aiParams.tool_choice = toolChoice;
  }

  // Models with prompt-only input schemas (granite-4.0-h-micro and
  // similar) reject messages that have non-string content (null, array,
// etc.) and tool messages in their native shape. We only serialize the
// conversation into a single `prompt` string when tools are present —
// for plain chat, the binding accepts `messages` directly and the
// model responds correctly without any transformation.
  if (modelNeedsPromptString(model) && tools) {
    const promptStr = serializeMessagesToPrompt(augmentedMessages, tools);
    // Drop messages; send a single prompt string instead.
    delete aiParams.messages;
    aiParams.prompt = promptStr;
  }

  // Workers AI binding (native). As of 2026, the binding returns
  // the OpenAI chat.completion shape directly, so we pass it
  // through with minor enrichment (id, created) when present.
  try {
    const aiResponse = await env.AI.run(model, aiParams);
    // Models without native tool-calling support (e.g. granite-4.0-h-micro
    // — its input schema is prompt-only) need us to inject tool
    // descriptions into the system prompt and parse JSON tool calls out
    // of the response content. Do that here for the affected models.
    const responseForBuild =
      tools && !modelSupportsNativeTools(model)
        ? parseJsonToolCallsFromContent(aiResponse, tools)
        : aiResponse;
    const built = buildChatCompletion({ response: responseForBuild, model, stream });
    if (!built.ok) {
      return json(built.body, built.status);
    }
    return built.body;
  } catch (err) {
    return json({ error: 'AI inference failed', detail: err.message }, 500);
  }
}

// Models whose input schema (per Cloudflare's sync-input.json) includes
// a `tools` field support native OpenAI-style tool calling. Other
// models need us to inject tool descriptions into the prompt and parse
// the response manually.
const NATIVE_TOOL_MODELS = new Set([
  '@cf/zai-org/glm-4.7-flash',
  '@cf/moonshotai/kimi-k2.6',
  '@cf/google/gemma-4-26b-a4b-it',
]);

function modelSupportsNativeTools(model) {
  return NATIVE_TOOL_MODELS.has(model);
}

// Models whose input schema is prompt-only (no `messages` field) —
// the binding still accepts `messages` for a single user turn, but
// rejects multi-turn tool-call histories with a 5006 validation error.
// For those models we serialize the conversation into a single prompt
// string the binding can accept.
const PROMPT_STRING_MODELS = new Set([
  '@cf/ibm-granite/granite-4.0-h-micro',
]);

function modelNeedsPromptString(model) {
  return PROMPT_STRING_MODELS.has(model);
}

// Serialize an OpenAI-style messages array into a single chat-template
// prompt string. Used for models whose input schema is prompt-only.
// All message content is coerced to a string (null becomes empty).
function serializeMessagesToPrompt(messages, tools) {
  const parts = [];
  for (const m of messages) {
    if (!m || !m.role) continue;
    const content = typeof m.content === 'string'
      ? m.content
      : (m.content == null ? '' : JSON.stringify(m.content));

    if (m.role === 'system') {
      parts.push(`<|system|>\n${content}`);
    } else if (m.role === 'user') {
      parts.push(`<|user|>\n${content}`);
    } else if (m.role === 'assistant') {
      let assistantBlock = content;
      if (Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
        const tc = m.tool_calls[0];
        const args = typeof tc.function?.arguments === 'string'
          ? tc.function.arguments
          : JSON.stringify(tc.function?.arguments ?? {});
        // Use the same `call`/`args` keys the prompt asks the model for.
        assistantBlock = `${content}\n{"call": {"name": "${tc.function?.name ?? tc.name}", "args": ${args}}}`;
      }
      parts.push(`<|assistant|>\n${assistantBlock}`);
    } else if (m.role === 'tool') {
      parts.push(`<|tool|>\n${content}`);
    }
  }
  // End with the assistant prompt prefix so the model continues from there.
  parts.push('<|assistant|>');
  return parts.join('\n\n');
}

// Inject tool descriptions into the user prompt. For models without
// native tool support (e.g. granite-4.0-h-micro), the binding's input
// schema is prompt-only, so we have to spell out the available tools
// in plain text and tell the model to emit a JSON tool call.
//
// Notes from testing:
//  - Keys are `call`/`args` (NOT `tool_call`/`arguments`) — the chat
//    template Workers AI uses for granite adds stop tokens on `}}` and
//    `tool_call` patterns, which truncates the emitted JSON.
//  - The instruction is placed at the START of the user prompt (not a
//    system message) and uses short, direct language so the model
//    actually follows it instead of just answering the question.
function buildToolPromptInstruction(tools) {
  const lines = [
    'IMPORTANT: To answer this request, output ONLY the JSON below (no prose, no markdown fences):',
    '',
    'Tools available:',
    ...tools.map((tool) => {
      const fn = tool.function ?? tool;
      const params = fn.parameters?.properties ?? {};
      const required = fn.parameters?.required ?? [];
      const paramDescs = Object.entries(params)
        .map(([k, v]) => {
          const isReq = required.includes(k) ? '*' : '';
          return `  - ${k}${isReq}: ${v.description ?? v.type ?? 'value'}`;
        })
        .join('\n');
      return `${fn.name}(${fn.description ?? ''})\n${paramDescs}`;
    }),
    '',
    'Output format (one JSON object, nothing else):',
    '{"call":{"name":"<tool_name>","args":{<params>}}}',
    '',
    'Or, if no tool is needed, answer normally.',
    '',
    'User request:',
  ];
  return lines.join('\n');
}

// Parse a JSON tool call out of the model's content. Returns a shallow
// clone of the response with the tool_calls field populated in OpenAI's
// nested shape, OR the original response if no tool call was detected.
function parseJsonToolCallsFromContent(response, tools) {
  if (!response || typeof response !== 'object') return response;

  // The model may return content in either the chat.completion shape
  // (choices[0].message.content) or the legacy text-completion shape
  // (choices[0].text). Check both.
  const choice = response.choices?.[0];
  const contentStr =
    (typeof choice?.message?.content === 'string' && choice.message.content) ||
    (typeof choice?.text === 'string' && choice.text) ||
    null;
  if (typeof contentStr !== 'string') return response;

  // Try to extract a JSON object from the content. Models sometimes wrap
  // it in markdown fences or add prose around it, so be tolerant.
  const trimmed = contentStr.trim();
  let parsed = null;
  const fenceMatch = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : trimmed;

  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  parsed = tryParse(jsonStr);
  if (!parsed) {
    const objMatch = trimmed.match(/(\{(?:[^{}]|\{[^{}]*\})*\})/);
    if (objMatch) parsed = tryParse(objMatch[1]);
  }

  if (!parsed) return response;

  const tc = parsed.call ?? parsed.tool_call ?? parsed.tool_calls?.[0];
  if (!tc?.name) return response;

  const knownTool = tools.find((t) => (t.function?.name ?? t.name) === tc.name);
  if (!knownTool) return response;

  const argsString =
    typeof tc.args === 'string'
      ? tc.args
      : typeof tc.arguments === 'string'
        ? tc.arguments
        : JSON.stringify(tc.args ?? tc.arguments ?? {});

  const toolCall = {
    id: `call_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'function',
    function: { name: tc.name, arguments: argsString },
  };

  // Return the response in OpenAI chat.completion shape regardless of
  // which input shape we received.
  return {
    ...response,
    object: 'chat.completion',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [toolCall],
        },
        finish_reason: 'tool_calls',
      },
    ],
  };
}
