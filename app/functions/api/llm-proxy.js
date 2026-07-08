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

const ALLOWED_ORIGINS = [
  'https://grimoirestack.com',
  'https://www.grimoirestack.com',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
  };
}

function json(data, status, corsH) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsH, 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const corsH = corsHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsH });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsH);
  }
  if (!env.AI) {
    return json({ error: 'Workers AI binding is not configured' }, 500, corsH);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, corsH);
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return json({ error: 'Missing messages array' }, 400, corsH);
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
    if (!built.ok) return json(built.body, built.status, corsH);
    return new Response(built.body, {
      status: 200,
      headers: { ...corsH, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return json({ error: 'AI inference failed', detail: err.message }, 500, corsH);
  }
}
