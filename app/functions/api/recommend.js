/**
 * functions/api/recommend.js — Pages Function
 *
 * POST /api/recommend
 * Body: { query: string }
 * Returns: { results: Array<{ skill: string, name: string, school: string, score: number, reason: string }> }
 *
 * Calls Workers AI (granite-4.0-h-micro) with the skill catalog
 * and the user's problem description, returns top-5 matches.
 */

import { SKILL_CATALOG } from './skill-catalog.js';

// Build the system prompt once at module scope (cold start only)
const CATALOG_TEXT = SKILL_CATALOG
  .map((s) => `- ${s.skill}: "${s.name}" [${s.school}] — ${s.effect}`)
  .join('\n');

const SYSTEM_PROMPT = `You are a skill-matching oracle for the GrimoireStack — a catalog of agent skills.
Given a user's problem description, return the 3-5 most relevant skills from the catalog.

For each match, output a JSON object with:
- "skill": the skill id (e.g. "cognitive-bias-checklist")
- "name": the skill display name
- "school": the school name
- "score": a number 0-1 indicating relevance
- "reason": one short sentence explaining why this skill fits

Return ONLY a JSON array. No markdown, no explanation, no preamble.

CATALOG:
${CATALOG_TEXT}`;

export async function onRequest(context) {
  const { request, env } = context;

  // CORS headers for the frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const query = (body.query || '').trim();
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Build the user message
  const userMessage = `User problem: "${query}"

Return the 3-5 most relevant skills from the catalog as a JSON array.`;

  try {
    const aiResponse = await env.AI.run('@cf/ibm-granite/granite-4.0-h-micro', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    // Parse the response — the model should return a JSON array
    const text = typeof aiResponse === 'object'
      ? aiResponse.response || aiResponse.choices?.[0]?.message?.content || JSON.stringify(aiResponse)
      : aiResponse;


    let results;
    try {
      // Try to find a JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try parsing the whole response
        results = JSON.parse(text);
      }
    } catch {
      // If parsing fails, return the raw text for debugging
      return new Response(JSON.stringify({
        error: 'Failed to parse AI response',
        raw: text,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and limit results
    if (!Array.isArray(results)) {
      results = [];
    }
    results = results.slice(0, 5);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'AI inference failed',
      detail: err.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
