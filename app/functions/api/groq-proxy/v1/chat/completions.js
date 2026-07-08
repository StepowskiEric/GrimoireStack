// Explicit route at the exact path the OpenAI SDK reaches when it
// appends `/chat/completions` to baseURL. The handler is the same
// one that serves `/api/groq-proxy` directly.
export { onRequest } from '../../../groq-proxy.js';
