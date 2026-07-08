// Tool normalization + response shaping for the llm-proxy.
//
// The proxy has only one job on output: turn whatever the model
// returned into the OpenAI chat.completion shape, with `id`/`created`
// filled in and an empty-content 502 surfaced for the caller to
// observe. Workers AI's binding returns the OpenAI shape directly for
// chat-completion models and the legacy text-completion shape
// ({choices:[{text:...}]}) for prompt-only models, so the normalizer
// handles both.

function uuid() {
  return `chatcmpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Workers AI chat-completion models accept the OpenAI nested tool
// shape: { type: "function", function: { name, description, parameters } }.
// The flat shape is also accepted (legacy) and promoted.
export function normalizeTools(tools) {
  if (!Array.isArray(tools)) return undefined;
  return tools
    .map((t) => {
      if (!t || typeof t !== 'object') return null;
      const fn = t.type === 'function' ? t.function : t.function ?? (t.name ? t : null);
      if (!fn?.name) return null;
      return {
        type: 'function',
        function: {
          name: String(fn.name),
          description: typeof fn.description === 'string' ? fn.description : '',
          parameters: fn.parameters ?? { type: 'object', properties: {} },
          strict: fn.strict === true,
        },
      };
    })
    .filter(Boolean);
}

// Coerce any model response shape into the OpenAI chat.completion
// shape. Returns { ok: false, status, body } when the response is
// empty (no content and no tool_calls) so the proxy can surface a
// 502 to the caller.
export function toChatCompletion(response, model) {
  if (!response || typeof response !== 'object') {
    return emptyResponse(model);
  }

  const choice = Array.isArray(response.choices) ? response.choices[0] : null;
  if (!choice) {
    return emptyResponse(model);
  }

  // Normalize content / tool_calls out of either response shape.
  let content = null;
  let toolCalls = null;
  let finishReason = choice.finish_reason;

  if (choice.message) {
    content = typeof choice.message.content === 'string' ? choice.message.content : null;
    if (Array.isArray(choice.message.tool_calls) && choice.message.tool_calls.length > 0) {
      toolCalls = choice.message.tool_calls
        .map((call, i) => normalizeToolCall(call, i))
        .filter(Boolean);
    }
  } else if (typeof choice.text === 'string') {
    // Legacy text-completion shape (granite prompt-only path).
    const parsed = parseJsonToolCall(choice.text);
    if (parsed) {
      content = null;
      toolCalls = [parsed];
      finishReason = 'tool_calls';
    } else {
      content = choice.text;
    }
  }

  if (!content && !toolCalls) {
    return emptyResponse(model);
  }

  const message = { role: 'assistant', content };
  if (toolCalls) message.tool_calls = toolCalls;

  // Only set finish_reason to "tool_calls" if we actually surfaced a
  // tool call. The model may emit a misleading finish_reason for
  // prompt-only models; trust the parsed structure.
  const resolvedFinishReason = toolCalls
    ? 'tool_calls'
    : (finishReason === 'tool_calls' ? 'stop' : finishReason) ?? 'stop';

  return {
    ok: true,
    body: JSON.stringify({
      id: response.id ?? uuid(),
      object: 'chat.completion',
      created: response.created ?? Math.floor(Date.now() / 1000),
      model: response.model ?? model,
      choices: [
        {
          index: 0,
          message,
          finish_reason: resolvedFinishReason,
        },
      ],
      ...(response.usage ? { usage: response.usage } : {}),
    }),
  };
}

function normalizeToolCall(call, index) {
  if (!call) return null;
  const name = call.function?.name ?? call.name;
  if (!name) return null;
  const argsRaw = call.function?.arguments ?? call.arguments;
  const args = typeof argsRaw === 'string' ? argsRaw : JSON.stringify(argsRaw ?? {});
  return {
    id: call.id ?? `call_${index}_${Math.random().toString(36).slice(2, 10)}`,
    type: 'function',
    function: { name, arguments: args },
  };
}

// Pull a JSON tool call out of free-form content. Used for prompt-only
// models (e.g. granite-4.0-h-micro) that emit their tool call as raw
// JSON rather than structured fields.
function parseJsonToolCall(content) {
  const trimmed = content.trim();
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const fenceMatch = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const parsed = tryParse(fenceMatch ? fenceMatch[1] : trimmed);
  if (!parsed) return null;

  const tc = parsed.call ?? parsed.tool_call ?? parsed.tool_calls?.[0];
  if (!tc?.name) return null;

  const args =
    typeof tc.args === 'string'
      ? tc.args
      : typeof tc.arguments === 'string'
        ? tc.arguments
        : JSON.stringify(tc.args ?? tc.arguments ?? {});

  return {
    id: `call_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'function',
    function: { name: tc.name, arguments: args },
  };
}

function emptyResponse(model) {
  return {
    ok: false,
    status: 502,
    body: {
      error: 'empty_model_response',
      message:
        'Workers AI returned an empty response (no content and no tool_calls). ' +
        'The model may be in a degraded state; retry after a short delay or switch models.',
      model,
    },
  };
}
