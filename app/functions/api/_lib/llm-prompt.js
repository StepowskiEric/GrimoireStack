// Tool prompt + chat-template serialization for models whose binding
// does not accept OpenAI tool-calling natively. Currently only
// granite-4.0-h-micro needs this.
//
// Why custom keys (`call`/`args`) instead of `tool_call`/`arguments`:
// the chat template Workers AI ships for granite adds stop tokens on
// `tool_call` and `}}` patterns, which truncates the emitted JSON
// mid-output. Using shorter keys avoids that.
//
// Why inject into the last user message (not a system message):
// granite ignored system-message instructions during testing and
// produced greetings or direct answers instead of the JSON tool call.

export function buildToolPromptInstruction(tools) {
  return [
    'IMPORTANT: To answer this request, output ONLY the JSON below (no prose, no markdown fences):',
    '',
    'Tools available:',
    ...tools.map(formatToolEntry),
    '',
    'Output format (one JSON object, nothing else):',
    '{"call":{"name":"<tool_name>","args":{<params>}}}',
    '',
    'Or, if no tool is needed, answer normally.',
    '',
    'User request:',
  ].join('\n');
}

function formatToolEntry(tool) {
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
}

// Serialize an OpenAI messages array into a single chat-template
// prompt string using Granite 4.0's <|role|> tokens. All message
// content is coerced to string (null becomes empty, arrays are JSON).
export function serializeMessagesToPrompt(messages, tools) {
  const parts = [];
  for (const m of messages) {
    if (!m?.role) continue;
    const content = stringifyContent(m.content);

    if (m.role === 'system') {
      parts.push(`<|system|>\n${content}`);
    } else if (m.role === 'user') {
      parts.push(`<|user|>\n${content}`);
    } else if (m.role === 'assistant') {
      const block = appendToolCall(m, content);
      parts.push(`<|assistant|>\n${block}`);
    } else if (m.role === 'tool') {
      parts.push(`<|tool|>\n${content}`);
    }
  }
  parts.push('<|assistant|>');
  return parts.join('\n\n');
}

function stringifyContent(content) {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  return JSON.stringify(content);
}

function appendToolCall(message, content) {
  if (!Array.isArray(message.tool_calls) || message.tool_calls.length === 0) return content;
  const tc = message.tool_calls[0];
  const args = stringifyContent(tc.function?.arguments);
  const name = tc.function?.name ?? tc.name;
  return `${content}\n{"call": {"name": "${name}", "args": ${args}}}`;
}
