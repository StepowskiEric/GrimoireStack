// Per-model input adapters for the llm-proxy.
//
// Each adapter takes the OpenAI-shaped request and returns the Workers
// AI `binding.run(model, inputs)` arguments. A model either:
//
//   - speaks the OpenAI chat-completion protocol natively
//     (`native`), in which case `messages`+`tools`+`tool_choice` are
//     passed through verbatim and `transformMessages` is a no-op;
//   - or does not (`manual`), in which case we inject a tool-instruction
//     block into the last user message and serialize the whole
//     conversation into a single chat-template prompt string.
//
// Keeping the per-model quirks in one table replaces four scattered
// `if (model === ...)` branches in the proxy handler.


const ADAPTERS = {

  // glm-4.7-flash is a reasoning model that defaults to burning the
  // entire output budget on chain-of-thought. Disable thinking so
  // agentic callers (page-agent) see direct content. Reasoning
  // controls live on the inputs object, not the options arg — see
  // https://github.com/cloudflare/ai/issues/501
  '@cf/zai-org/glm-4.7-flash': {
    native: true,
    extraInputs: () => ({
      chat_template_kwargs: { enable_thinking: false },
      reasoning_effort: null,
    }),
    transformMessages: (messages) => ({ messages }),
  },
};

// Native tool models register themselves automatically: any model
// not in ADAPTERS defaults to the native chat-completion protocol.
const DEFAULT_ADAPTER = {
  native: true,
  transformMessages: (messages) => ({ messages }),
};

export function getAdapter(model) {
  return ADAPTERS[model] ?? DEFAULT_ADAPTER;
}

export function buildBindingInputs({ model, messages, tools, temperature, maxTokens }) {
  const adapter = getAdapter(model);
  const result = adapter.transformMessages(messages, tools);

  const inputs = { temperature, max_tokens: maxTokens };
  if (result.serialize) {
    inputs.prompt = result.serialize();
  } else {
    inputs.messages = result.messages;
  }

  if (adapter.extraInputs) {
    Object.assign(inputs, adapter.extraInputs());
  }

  // Native tool models get the OpenAI-shaped tools/tool_choice through;
  // manual models have already been handled in transformMessages.
  if (adapter.native && tools) {
    inputs.tools = tools;
  }

  return inputs;
}
