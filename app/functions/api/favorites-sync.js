/**
 * functions/api/favorites-sync.js — Pages Function
 *
 * POST /api/favorites-sync   { op: "get"|"put"|"delete", code, data? }
 *
 * Cross-device sync for the user's "bound incantations" (favorites).
 * Storage: Cloudflare KV (binding: FAVORITES). Each user's favorites are
 * stored under a single key — the sync code — so reads and writes are
 * a single KV op. The 16-char sync code is the only auth: anyone with it
 * can read/write that key. This is anonymous pairing, not real auth, and
 * that's the point — see SPEC for the threat model and tradeoffs.
 *
 * Sync code alphabet/length are imported from the shared `sync-codes.js`
 * module so this validator and the frontend generator can never drift.
 *
 * Setup:
 *   1. Create the namespace once:
 *        npx wrangler kv namespace create FAVORITES
 *      Paste the returned `id` into `wrangler.toml` under the
 *      `[[kv_namespaces]] binding = "FAVORITES"` block.
 *   2. No secret env vars.
 *
 * Rate limiting: Write operations (put/delete) are throttled to 10 per
 * 60s per sync code using KV itself (key prefix "rl:"). This works
 * without any Cloudflare binding beyond the FAVORITES namespace.
 *
 * Free tier (2026): 100K reads/day, 1K writes/day, 1 GB storage,
 * 25 MiB max value. Per https://developers.cloudflare.com/kv/platform/limits/
 *
 * Threat model & accepted risks:
 *   - The 16-char sync code is the only auth. Anyone with the code owns
 *     that key's data. This is anonymous pairing, not real auth.
 *   - CORS is `*` because the API uses body-based auth (code in JSON),
 *     not cookies — there's no CSRF surface.
 *   - Validation runs before KV access. Malformed bodies return 400,
 *     never 500.
 *
 * Bound at runtime: env.FAVORITES (KVNamespace)
 */

import { ALPHABET, CODE_LEN, isValidSyncCode } from '../../src/data/sync-codes.js';

const MAX_FAVORITES = 5000; // soft cap; KV limit is 25 MiB
const MAX_NAME_LEN = 120;
const MAX_SKILL_LEN = 120;
const MAX_PAYLOAD = 1_000_000; // 1 MB hard ceiling per request

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  // Defense in depth: prevent MIME-sniffing of the JSON response. CSP
  // and HSTS are the responsibility of the static asset hosting layer.
  'X-Content-Type-Options': 'nosniff',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isValidFavoritesShape(data) {
  if (!Array.isArray(data)) return false;
  if (data.length > MAX_FAVORITES) return false;
  return data.every(
    (f) =>
      f !== null &&
      typeof f === 'object' &&
      typeof f.name === 'string' &&
      f.name.length > 0 &&
      f.name.length <= MAX_NAME_LEN &&
      typeof f.skill === 'string' &&
      f.skill.length > 0 &&
      f.skill.length <= MAX_SKILL_LEN &&
      (typeof f.addedAt === 'number' || typeof f.addedAt === 'string'),
  );
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!env.FAVORITES) {
    return json({ error: 'KV binding FAVORITES is not configured' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (body?.data && JSON.stringify(body.data).length > MAX_PAYLOAD) {
    return json({ error: 'Payload too large' }, 413);
  }

  const { op, code, data } = body || {};

  if (!isValidSyncCode(code)) {
    return json({ error: `Invalid sync code (must be ${CODE_LEN} chars from ${ALPHABET})` }, 400);
  }

  // KV-based write rate limiting: 10 PUT/DELETE ops per 60s per sync code.
  // Uses the FAVORITES KV namespace itself (key prefix "rl:") with KV's
  // expirationTtl to auto-clean stale windows. This works without any
  // Cloudflare binding beyond the KV namespace we already have.
  const WRITE_LIMIT = 10;
  const WRITE_WINDOW_SEC = 60;

  if (op === 'put' || op === 'delete') {
    const rlKey = `rl:${code}`;
    const rlRaw = await env.FAVORITES.get(rlKey);
    const rlCount = rlRaw ? parseInt(rlRaw, 10) : 0;
    if (rlCount >= WRITE_LIMIT) {
      return json({ error: 'Rate limit exceeded (max 10 writes per minute per sync code)' }, 429);
    }
    // Increment; set TTL on first write to auto-expire the window
    await env.FAVORITES.put(rlKey, String(rlCount + 1), { expirationTtl: WRITE_WINDOW_SEC });
  }

  try {
    if (op === 'get') {
      const raw = await env.FAVORITES.get(code);
      if (raw === null) {
        return json({ data: null });
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return json({ error: 'Corrupt cloud data' }, 500);
      }
      if (!isValidFavoritesShape(parsed)) {
        return json({ error: 'Corrupt cloud data' }, 500);
      }
      return json({ data: parsed });
    }

    if (op === 'put') {
      if (!isValidFavoritesShape(data)) {
        return json({ error: 'Invalid favorites shape' }, 400);
      }
      await env.FAVORITES.put(code, JSON.stringify(data));
      return json({ ok: true, syncedAt: Date.now() });
    }

    if (op === 'delete') {
      await env.FAVORITES.delete(code);
      return json({ ok: true });
    }

    return json({ error: 'Unknown op (expected get|put|delete)' }, 400);
  } catch (err) {
    return json({ error: 'KV operation failed', detail: err.message }, 500);
  }
}
