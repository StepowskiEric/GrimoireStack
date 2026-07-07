/**
 * functions/api/llm-proxy.js — Pages Function
 *
 * OpenAI-compatible proxy for page-agent and other browser clients.
 *
 * Translates standard `/v1/chat/completions` requests into
 * Cloudflare Workers AI calls, then maps the response back into
 * the OpenAI shape expected by page-agent.
 *
 * Security:
 * - This route is intentionally unauthenticated because the app
 *   already exposes public skill data. If you add private prompts
 *   later, protect this endpoint with a short-lived token or
 *   session check.
 * - CORS is restricted to the site origin to limit abuse from
 *   other origins.
 */

import { SKILL_CATALOG } from './skill-catalog.js';

const CATALOG_TEXT = SKILL_CATALOG
  .map((s) => `- ${s.skill}: "${s.name}" [${s.school}] — ${s.effect}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a skill-matching oracle for the GrimoireStack.
Given a user's problem description, return the 3-5 most relevant skills from the catalog.

For each match, output a JSON object with:
- "skill": the skill id
- "name": the skill display name
- "school": the school name
- "score": a number 0-1 indicating relevance
- "reason": one short sentence explaining why this skill fits

Return ONLY a JSON array. No markdown, no explanation, no preamble.

CATALOG:
${CATALOG_TEXT}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractTextFromWorkersAIResponse(response) {
  if (typeof response === 'string') return response;
  if (!response || typeof response !== 'object') return '';

  const candidate = response.response || response.content || response.text || '';
  if (typeof candidate === 'string') return candidate;

  if (Array.isArray(candidate)) {
    return candidate
      .map((part) => part.text || part.content || '')
      .join('');
  }

  if (candidate && typeof candidate === 'object') {
    return candidate.text || candidate.content || '';
  }

  return '';
}

function normalizeMessageContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part.text || part.content || ''))
      .join('');
  }
  if (content && typeof content === 'object') {
    return content.text || content.content || '';
  }
  return '';
}

function parseResultsFromText(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return [];

  try {
    const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 5);
  } catch {
    return [];
  }
}

function buildOpenAIChatResponse(text) {
  const results = parseResultsFromText(text);
  const content = results.length > 0 ? JSON.stringify(results) : '[]';

  return {
    id: `grimoire-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'workers-ai/granite-4.0-h-micro',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
  const userMessage = messages.find((m) => m.role === 'user');
  const query = typeof userMessage?.content === 'string'
    ? userMessage.content.trim()
    : normalizeMessageContent(userMessage?.content).trim();

  if (!query) {
    return json({ error: 'Missing user message' }, 400);
  }

  if (!env.AI) {
    return json({ error: 'Workers AI binding is not configured' }, 500);
  }

  try {
    const aiResponse = await env.AI.run('@cf/ibm-granite/granite-4.0-h-micro', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `User problem: "${query}"\n\nReturn the 3-5 most relevant skills from the catalog as a JSON array.` },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    const text = extractTextFromWorkersAIResponse(aiResponse);
    const results = parseResultsFromText(text);

    if (results.length === 0) {
      return json({
        error: 'Failed to parse AI response',
        raw: text,
      }, 500);
    }

    return json(buildOpenAIChatResponse(text));
  } catch (err) {
    return json({
      error: 'AI inference failed',
      detail: err.message,
    }, 500);
  }
}
