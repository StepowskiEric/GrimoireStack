# Security Review Report — GrimoireStack

**Date:** 2026-07-12
**Scope:** Full repository (React + Vite frontend + Cloudflare Pages Functions + CLI installer)
**Method:** STRIDE + Unsafe Control Actions + LLM-Specific Vulnerability Audit + Evidence Verification

---

## Phase 1: STRIDE — Threat Model

### Component Map

| Component | Type | Data | Exposure |
|-----------|------|------|----------|
| `POST /api/favorites-sync` | CF Pages Function | User favorites in KV (sync code keyed) | Public internet |
| `POST /api/groq-proxy` | CF Pages Function | LLM chat completions via Groq | Public internet |
| `POST /api/groq-proxy/v1/chat/completions` | CF Pages Function | Re-export of groq-proxy | Public internet |
| `POST /api/llm-proxy` | CF Pages Function | LLM chat completions via Workers AI | Public internet |
| `POST /api/llm-proxy/v1/chat/completions` | CF Pages Function | Re-export of llm-proxy | Public internet |
| `POST /api/recommend` | CF Pages Function | Skill recommendations via Groq/OpenRouter | Public internet |
| `sw.js` | Service Worker | Cache of static assets + skill files | Client browser |
| `bin/install.js` | CLI tool | Writes skill files to home dirs | User's machine |
| Static pages (React) | Client | UI rendering of skill catalog | Public internet |

### Threat Table

| Threat | Component | Risk | Current Mitigations | Severity |
|--------|-----------|------|---------------------|----------|
| **Spoofing** | Favorites Sync | Anyone with sync code reads/writes that user's data | 16-char (2^80) code from 32-char alphabet | **Low** — accepted risk per inline threat model |
| **Spoofing** | Groq/LLM/Recommend | Unauthenticated call to LLM proxies | CORS origin check (limited allowlist), but no request auth | **Medium** — CORS is bypassable (Origin header is spoofable on server-side requests) |
| **Tampering** | Favorites Sync | Malformed favorites data | `isValidFavoritesShape` validation on both read/write; 1 MB payload cap | **Low** |
| **Tampering** | LLM Proxies | Malicious body injected | JSON parsing with try/catch, messages array validation | **Low** |
| **Repudiation** | All Functions | No audit logging of operations | Console.log statements exist but no persistent audit trail | **Low** — acceptable for personal tool |
| **Information Disclosure** | Groq Proxy | Error detail leakage in responses | `errBody.slice(0,300)` and `errBody.slice(0,500)` in error responses | **Low** — truncated, but could expose internal state |
| **Information Disclosure** | Favorites Sync | Corrupt data error messages | Returns "Corrupt cloud data" with no detail | **None** |
| **Information Disclosure** | LLM Proxy | Empty model response leaks model name | Returns model name in 502 error | **Low** — model name only |
| **Denial of Service** | Recommend API | LLM quota exhaustion via repeated calls | KV-based rate limiting (20 req/min/IP) using FAVORITES namespace | **Medium** — KV is eventually consistent, rate limit can be bypassed slightly under concurrent load |
| **Denial of Service** | Groq Proxy | LLM cost exhaustion | No rate limiting on groq-proxy | **High** — no throttle on a paid API proxy |
| **Denial of Service** | All Functions | Large payloads | MAX_PAYLOAD=1MB on favorites, no payload cap on LLM proxies beyond CF limits | **Low** — CF body size limits apply |
| **Elevation of Privilege** | Install Script | Writes to `~/.agents/skills/`, `~/.hermes/skills/`, etc. | Only copies skill files, no shell execution | **Low** |
| **Elevation of Privilege** | LLM Proxies | User controls model selection in request body | Models are forwarded from request; no allowlist | **Medium** — user-specified model could hit unexpected endpoints? No, base URL is hardcoded. |

---

## Phase 2: AUDIT — Unsafe Control Actions

### Action 1: Favorites Sync — `env.FAVORITES.put(code, data)`

| Hazard | Status | Evidence |
|--------|--------|----------|
| **Not provided** | Safe | KV not configured → returns 500 at `favorites-sync.js:32` |
| **Provided incorrectly** | **RISK** | PUT targets the `code` from request body. If validation passes, any code writes. No ownership check — code A can overwrite code B's data if guessed. |
| **Provided too early/late** | Safe | Stateless function, no ordering concerns |
| **Provided too long** | **RISK** | Stale code still works. Comment at `favorites-sync.js:32` explicitly notes "no rate limiting." KV 1K writes/day free tier is the only natural throttle. |

### Action 2: Groq Proxy — `fetch('https://api.groq.com/...')`

| Hazard | Status | Evidence |
|--------|--------|----------|
| **Not provided** | Safe | Missing `GROQ_API_KEY` returns 500 at `groq-proxy.js:43` |
| **Provided incorrectly** | **RISK** | No rate limiting. A single user could exhaust the daily Groq API quota. |
| **Provided too early/late** | Safe | Stateless |
| **Provided too long** | Safe | Stateless |

### Action 3: LLM Proxy — `env.AI.run(model, inputs)`

| Hazard | Status | Evidence |
|--------|--------|----------|
| **Not provided** | Safe | Missing `AI` binding returns 500 at `llm-proxy.js:34` |
| **Provided incorrectly** | **MEDIUM RISK** | Model name is taken from request body (`body.model`). No allowlist. Could attempt to call unavailable/non-chat models. Workers AI binding limits scope, but unexpected models could produce unexpected behavior or errors leaking info. |
| **Provided too early/late** | Safe | Stateless |
| **Provided too long** | Safe | Stateless |

### Action 4: Recommend API — LLM inference + KV rate limiting

| Hazard | Status | Evidence |
|--------|--------|----------|
| **Not provided** | Safe | KV rate limit fails open (no rate limiting if KV unavailable) — acceptable |
| **Provided incorrectly** | Safe | Query length capped at 500 chars, rate limit at 20 req/min/IP |
| **Provided too early/late** | Safe | Stateless |
| **Provided too long** | Safe | Rate key has TTL (60s), auto-expires |

### Action 5: Install Script — File writes to home directories

| Hazard | Status | Evidence |
|--------|--------|----------|
| **Not provided** | Safe | CLI errors if no target |
| **Provided incorrectly** | **MEDIUM RISK** | Writes to `~/.agents/skills/`, `~/.hermes/skills/`, etc. Does not validate that paths are within expected agent directories. If `AGENT_DIRS` map is modified or if symlinks exist, could write outside intended scope. |
| **Provided too early/late** | Safe | Sequential operations |
| **Provided too long** | Safe | CLI exits after copying |

---

## Phase 3: HARDCODE — LLM-Specific Vulnerability Checklist

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Exposed secrets** | **PASS** | No API keys, JWT secrets, or passwords in source code. All secrets use `env.*` references in Functions code and are set via `npx wrangler pages secret put`. |
| 2 | **Missing auth guards** | **MEDIUM FINDING** | All API endpoints are unauthenticated. CORS origin checks on groq-proxy, llm-proxy, and recommend are the only access control. Favorites-sync uses body-based sync code auth (intentional). |
| 3 | **Missing RLS** | N/A | No database. KV is used for favorites storage with sync-code key access. |
| 4 | **Injection vectors** | **PASS** | No SQL/NoSQL query string interpolation. All LLM API calls use structured JSON bodies. User input (query, messages) is passed as structured fields, not string-interpolated into prompts unsafely (the recommend API does interpolate query into a prompt string, but this is the intended LLM input, not a code execution vector). |
| 5 | **Overly permissive CORS** | **MEDIUM FINDING** | Favorites-sync uses `Access-Control-Allow-Origin: *` (justified in inline threat model — body-based auth, no CSRF surface). LLM/recommend proxies use origin allowlist. Acceptable tradeoff but unusual for a production API. |
| 6 | **Verbose error responses** | **LOW FINDING** | Groq proxy returns truncated error detail (`detail: errBody.slice(0,500)`) in error responses — could leak internal API behavior. Favorites-sync returns "Corrupt cloud data" (safe). Recommend returns no error detail (safe). |
| 7 | **Insecure defaults** | **LOW FINDING** | `app/scripts/prerender.mjs` uses `ORIGIN = process.env.SITE_ORIGIN || 'https://grimoirestack.dev'` — the `.dev` fallback is a dev default, could be confused with `grimoirestack.com` but is build-time only, not runtime. |
| 8 | **Missing rate limiting** | **HIGH FINDING** | Groq proxy has NO rate limiting. This is a paid API proxy with no throttling — a simple loop could exhaust the daily Groq quota. Recommend has KV-based rate limiting (20/min). Favorites-sync has no rate limiting (explicitly documented). |
| 9 | **Stale dependencies** | Not assessed in detail | Package versions present; no known CVEs checked in this review. |

---

## Phase 4: VERIFY — Evidence-Grounded Claims

| Claim | Verification | Result |
|-------|-------------|--------|
| "Secrets are not in source code" | Grep'd for `api_key`, `secret`, `token`, `password`, `Bearer` across all .js/.jsx/.mjs/.json files | **CONFIRMED** — all secrets use `env.*` at runtime |
| "CORS is origin-locked on LLM proxies" | Read `groq-proxy.js:14-22`, `llm-proxy.js:14-22`, `recommend.js:28-36` | **CONFIRMED** — allowlist with `grimoirestack.com` |
| "CORS is wildcard on favorites-sync" | Read `favorites-sync.js:43` | **CONFIRMED** — `Access-Control-Allow-Origin: *` |
| "Sync code validation runs" | Read `favorites-sync.js` + `sync-codes.js` | **CONFIRMED** — `isValidSyncCode` validates length (16) and alphabet before KV access |
| "Favorites data shape is validated" | Read `favorites-sync.js:58-67` | **CONFIRMED** — `isValidFavoritesShape` runs on both read and write |
| "Rate limiting on recommend" | Read `recommend.js:446-467` | **CONFIRMED** — KV-based, 20 req/min/IP, fails open |
| "No rate limiting on groq-proxy" | Read `groq-proxy.js` | **CONFIRMED** — no throttle logic present |
| "Model is validated on LLM proxy" | Read `llm-proxy.js:50` | **PARTIALLY CONFIRMED** — checks it's a non-empty string, no allowlist |
| "No remote downloads in install script" | Grep'd `install.js` for fetch/curl/wget | **CONFIRMED** — no remote downloads |
| "Service worker is same-origin only" | Read `sw.js:55-57` | **CONFIRMED** — `url.origin !== self.location.origin` check |
| "AI binding check exists" | Read `llm-proxy.js:34` | **CONFIRMED** — returns 500 if missing |

---

## Severity-Rated Findings

### HIGH — Fix Before Next Release

**H-01: Groq proxy has no rate limiting**
- **Where:** `app/functions/api/groq-proxy.js`
- **Impact:** Anyone who discovers the URL (or is a legitimate user) can call the paid Groq API proxy unlimited times. A single script could exhaust the daily quota, denying service to all users and incurring cost.
- **Evidence:** Full file review confirmed zero rate-limiting logic.
- **Fix:** Add the same KV-based rate limiting pattern used in `recommend.js` (20 req/min/IP via FAVORITES KV namespace). Or add the RECOMMEND rate limiter binding once CF Pages supports it.

**H-02: Favorites sync has no rate limiting on writes**
- **Where:** `app/functions/api/favorites-sync.js`
- **Impact:** An attacker with a valid sync code (or brute-forcing one) can spam PUT/DELETE operations. KV free tier has 1K writes/day which is a soft cap, but production users' data could be corrupted.
- **Evidence:** Comment at line 75 explicitly states no rate limiter is configured. KV's free tier limit is the only protection.
- **Fix:** Same as H-01 — add KV-based write rate limiting per sync code.

### MEDIUM — Fix Before Next Release

**M-01: No authentication on LLM proxy endpoints**
- **Where:** `groq-proxy.js`, `llm-proxy.js`, `recommend.js`
- **Impact:** Anyone who knows the Cloudflare Pages URL can call the LLM proxies. CORS only restricts browser-based access — server-side scripts (curl, Postman) bypass CORS entirely since CORS is a browser-enforced mechanism, not a server-enforced one.
- **Evidence:** CORS origin check exists but is not authentication. No API key, token, or session check on any endpoint.
- **Fix less severe than H-01/H-02 because these are Cloudflare Pages Functions behind a random subdomain or custom domain — not easily discoverable. But defense-in-depth warrants an API key header check.**

**M-02: Groq proxy leaks truncated error detail to clients**
- **Where:** `groq-proxy.js:89`
- **Impact:** `errBody.slice(0,500)` returned in error responses could leak Groq API error details, internal model behavior, or partial response data.
- **Evidence:** `return json({ error: 'Groq API error', detail: errBody.slice(0, 500) }, groqRes.status, corsH);` at line 89.
- **Fix:** Replace with generic error message. Log full detail server-side via `console.log`.

**M-03: LLM proxy accepts arbitrary model names from request body**
- **Where:** `llm-proxy.js:50`
- **Impact:** Users can specify any model name. While Workers AI binding limits scope, this could cause unexpected behavior, errors leaking model availability, or attempts to call deprecated/non-existent models.
- **Evidence:** `const model = typeof body.model === 'string' && body.model ? body.model : DEFAULT_LLM_MODEL;` — no allowlist validation.
- **Fix:** Whitelist supported model names or reject unknown models with a 400.

### LOW — Track, Fix When Convenient

**L-01: Static `.dev` fallback URL in build scripts**
- **Where:** `app/scripts/prerender.mjs:32`, `build-sitemap.mjs:32`, `build-rss.mjs:32`
- **Details:** `ORIGIN = process.env.SITE_ORIGIN || 'https://grimoirestack.dev'` — production builds could accidentally use the `.dev` fallback if env var is unset.

**L-02: Service worker caches API response-like paths**
- **Where:** `sw.js:30-40`
- **Details:** Cache-first strategy for `/skills/*` is correct for static content, but `networkFirst` for `STATIC_CACHE` could cache API responses if any API paths are served from the same origin without unique cache keys.

**L-03: `page-agent` uses hardcoded `apiKey: 'skip-auth'`**
- **Where:** `app/src/hooks/useAgentMode.js:43-44`
- **Details:** This is intentional (the proxy handles auth), but the string `'skip-auth'` in client code could confuse auditors. Minor naming concern.

**L-04: No Content-Security-Policy or HSTS headers in source**
- **Where:** All responses
- **Details:** CSP and HSTS are the responsibility of the Cloudflare Pages hosting layer / `_headers` file. No evidence of configuration found in the repo. Not a code vulnerability, but defense-in-depth gap.

---

## Summary

**Verified safe:** Secrets management (env vars only), sync code validation, favorites data shape validation, no remote downloads in CLI, same-origin service worker, recommend endpoint rate limiting, proper error sanitization on favorites-sync.

**Needs attention:**
1. **HIGH** — Add rate limiting to `groq-proxy.js` (same pattern as recommend.js)
2. **HIGH** — Add rate limiting to `favorites-sync.js` writes
3. **MEDIUM** — Consider authentication requirement for LLM proxy endpoints (CORS is not auth)
4. **MEDIUM** — Sanitize error detail leakage in groq-proxy error responses
5. **MEDIUM** — Add model allowlist to llm-proxy
6. **LOW** — Remove `.dev` fallback URLs from build scripts
7. **LOW** — Add `_headers` file with CSP/HSTS for Cloudflare Pages
