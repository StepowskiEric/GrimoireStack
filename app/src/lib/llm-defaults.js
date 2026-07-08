// Single source of truth for the default LLM served by the proxy.
// Imported by both the Pages Function (functions/api/llm-proxy.js) and
// the browser hook (src/hooks/useAgentMode.js) so they cannot drift.
export const DEFAULT_LLM_MODEL = '@cf/ibm-granite/granite-4.0-h-micro';

// Path the OpenAI SDK reaches when it appends `/chat/completions` to
// `baseURL`. Exposed so the hook's default baseURL and the proxy's
// catch-all route stay aligned.
export const DEFAULT_LLM_PROXY_PATH = '/api/llm-proxy/v1';

// Defaults for the page-agent browser automation mode, which connects
// directly to Groq (OpenAI-compatible) for the ReAct agent loop.
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_MODEL = 'qwen/qwen3.6-27b';
