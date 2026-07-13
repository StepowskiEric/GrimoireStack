// Single source of truth for the default LLM served by the proxy.
// Imported by both the Pages Function (functions/api/llm-proxy.js) and
// the browser hook (src/hooks/useAgentMode.js) so they cannot drift.
export const DEFAULT_LLM_MODEL = '@cf/ibm-granite/granite-4.0-h-micro';
