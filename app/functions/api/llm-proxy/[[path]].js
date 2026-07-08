// Multi-segment catch-all re-export so the OpenAI SDK (which appends
// /chat/completions to baseURL) can call /api/llm-proxy/v1/chat/completions
// and have the request reach the same handler as /api/llm-proxy.
// Any subpath is treated identically — body, headers, and method are
// forwarded unchanged to the main handler.
export { onRequest } from '../llm-proxy.js';
