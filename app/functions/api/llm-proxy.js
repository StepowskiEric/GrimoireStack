/**
 * functions/api/llm-proxy.js — Pages Function
 *
 * OpenAI-compatible chat-completions proxy for page-agent. Translates
 * `/v1/chat/completions` requests into Cloudflare Workers AI calls
 * and returns OpenAI-shaped responses. Per-model quirks (tool-call
 * formats, reasoning controls, prompt-only inputs) are handled by the
 * adapter layer in `_lib/llm-adapters.js`.
 *
 * Skill-matching has its own endpoint: /api/recommend
 */

import { DEFAULT_LLM_MODEL } from '../../src/lib/llm-defaults.js';
import { normalizeTools, toChatCompletion } from './_lib/llm-format.js';
import { buildBindingInputs } from './_lib/llm-adapters.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!env.AI) {
    return json({ error: 'Workers AI binding is not configured' }, 500);
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

  const model =
    typeof body.model === 'string' && body.model ? body.model : DEFAULT_LLM_MODEL;
  const tools = normalizeTools(body.tools);
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
  const maxTokens = typeof body.max_tokens === 'number' ? body.max_tokens : 4096;

  const inputs = buildBindingInputs({ model, messages, tools, temperature, maxTokens });
  if (tools) inputs.tool_choice = body.tool_choice;

  try {
    const aiResponse = await env.AI.run(model, inputs);
    const built = toChatCompletion(aiResponse, model);
    if (!built.ok) return json(built.body, built.status);
    return new Response(built.body, {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return json({ error: 'AI inference failed', detail: err.message }, 500);
  }
}
