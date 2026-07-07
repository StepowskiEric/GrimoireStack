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
 * Setup:
 *   1. Create the namespace once:
 *        npx wrangler kv namespace create FAVORITES
 *      Paste the returned `id` into `wrangler.toml` under the
 *      `[[kv_namespaces]] binding = "FAVORITES"` block.
 *   2. The rate-limit binding (SYNC_WRITES) is configured in wrangler.toml
 *      with [[ratelimits]] — no dashboard step required.
 *   3. No secret env vars. The KV binding is configured via dashboard or wrangler.
 *
 * Free tier (2026): 100K reads/day, 1K writes/day, 1 GB storage,
 * 25 MiB max value. Per https://developers.cloudflare.com/kv/platform/limits/
 *
 * Rate limit: 10 writes (put/delete) per minute per sync code. Reads are
 * not rate-limited (legitimate device-pairing reads are continuous). The
 * limit fails open if the rate limiter binding is unreachable — the KV
 * 1K writes/day free tier is the natural backstop.
 *
 * Threat model & accepted risks:
 *   - The 16-char sync code is the only auth. Anyone with the code owns
 *     that key's data. This is anonymous pairing, not real auth.
 *   - CORS is `*` because the API uses body-based auth (code in JSON),
 *     not cookies — there's no CSRF surface.
 *   - Validation runs before KV access. Malformed bodies return 400,
 *     never 500.
 *   - Read operations are not rate-limited to avoid blocking device
 *     pairing; if code enumeration becomes a concern, add a second
 *     [[ratelimits]] block keyed by client IP.
 *
 * Bound at runtime: env.FAVORITES (KVNamespace), env.SYNC_WRITES (RateLimiter)
 */

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // 32 chars, no 0/o/1/i/l
const CODE_LEN = 16;
const MAX_FAVORITES = 5000;     // soft cap; KV limit is 25 MiB
const MAX_NAME_LEN = 120;
const MAX_SKILL_LEN = 120;
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

function isValidCode(code) {
  return typeof code === 'string'
    && code.length === CODE_LEN
    && code.split('').every(c => ALPHABET.includes(c));
}

function isValidFavoritesShape(data) {
  if (!Array.isArray(data)) return false;
  if (data.length > MAX_FAVORITES) return false;
  return data.every(f =>
    f !== null
    && typeof f === 'object'
    && typeof f.name === 'string' && f.name.length > 0 && f.name.length <= MAX_NAME_LEN
    && typeof f.skill === 'string' && f.skill.length > 0 && f.skill.length <= MAX_SKILL_LEN
    && (typeof f.addedAt === 'number' || typeof f.addedAt === 'string')
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
  if (body && body.data && JSON.stringify(body.data).length > MAX_PAYLOAD) {
    return json({ error: 'Payload too large' }, 413);
  }

  const { op, code, data } = body || {};

  if (!isValidCode(code)) {
    return json({ error: 'Invalid sync code (must be 16 chars from a-z2-9)' }, 400);
  }

  // Rate limit writes (put/delete) per sync code. Reads are deliberately
  // not rate-limited — device pairing fires a get on every mount. Fails
  // open if the binding is unavailable; the KV 1K writes/day free tier
  // is the natural ceiling below this.
  if (op === 'put' || op === 'delete') {
    if (env.SYNC_WRITES) {
      try {
        const { success } = await env.SYNC_WRITES.limit({ key: code });
        if (!success) {
          return json({ error: 'Rate limit exceeded. Try again in a minute.' }, 429);
        }
      } catch (e) {
        console.warn('rate limiter unavailable, failing open:', e.message);
      }
    }
  }
  try {
    if (op === 'get') {
      const raw = await env.FAVORITES.get(code);
      if (raw === null) {
        return json({ data: null });
      }
      let parsed;
      try { parsed = JSON.parse(raw); } catch { return json({ error: 'Corrupt cloud data' }, 500); }
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
