---
name: network-api-debugging
description: "Diagnose and fix network and API failures — CORS, auth token issues, rate limiting, redirect chains, WebSocket drops, and HTTP request/response mismatches."
triggers:
  - cors-error
  - auth-token-issue
  - rate-limit-429
  - redirect-chain
  - websocket-drop
  - works-in-curl-not-app
disable-model-invocation: true
---

# Network / API Debugging

**Inspect the actual request, not the code that generates it.** Code-level debugging assumes the code is the problem — but network/API failures live in the gray zone where the code is correct, the server is correct, and something between them is broken. Capture what goes over the wire first, diagnose by status code, then fix by failure type.

## The Move

### 1. Capture the actual traffic
Before hypothesizing, see exactly what's on the wire: request method, URL, headers, body, response status, and body. Capture at least one complete request-response pair. If no traffic can be captured at all, the issue is before the network layer (syntax error, build failure, environment). Capture snippets per platform (browser fetch interceptor, React Native, `NODE_DEBUG=http,https node server.js`) are in Reference.

**Route by what you see:**

| Symptom | Phase-1 finding | Fix |
|---------|----------------|-----|
| CORS error | Origin header doesn't match server's allowed origins | Fix #1 |
| 401/403 | Auth token missing, expired, or wrong format | Fix #2 |
| 429 | Rate-limit headers in response | Fix #3 |
| 301/302 chain | Redirects causing data loss | Fix #4 |
| Connection refused / timeout | Server not running, wrong port, or hanging | Phase 2 |
| 200 but wrong data | Request body or content-type mismatch | Fix #5 |

### 2. Diagnose by status code
- **2xx but wrong data** — content-type mismatch (JSON vs HTML error page), request body format (JSON vs multipart vs form), query encoding, pagination
- **3xx** — 301 vs 302 (permanent redirects get cached), redirects converting POST to GET (use 307/308), redirect loops (HTTP/HTTPS, trailing slashes, auth loops)
- **4xx** — the server received the request but refused it; the problem is what the client sent (see the 4xx table in Reference)
- **5xx** — the server crashed; the client is fine. Switch to server debugging. If you control the server, debug it; if not, check whether your request is crashing it

### 3. Fix by failure type
- **Fix #1 CORS** — server must answer preflight `OPTIONS` with the right `Access-Control-Allow-*` headers; `*` with credentials is not allowed; React Native doesn't enforce CORS, so browser-only failures are CORS
- **Fix #2 Auth tokens** — token present? right header (`Authorization: Bearer <token>`)? valid (`exp` claim)? refresh loop? async race (request fires before token resolves — gate with `enabled: !!authToken`)?
- **Fix #3 Rate limiting** — honor `Retry-After`; exponential backoff with jitter, capped; check `X-RateLimit-*` headers
- **Fix #4 Redirect chains** — trace with `curl -v -L`; use 307/308 for body-preserving redirects; clear browser cache after a wrong 301
- **Fix #5 Body mismatches** — double-encoding (`JSON.stringify(JSON.stringify(body))`), FormData sent as JSON, missing fields, wrong types

## Reference
For the per-platform traffic-capture snippets, the full 4xx/5xx tables with first-check actions, and the fix code patterns, see [`references/http-status-quick-reference.md`](references/http-status-quick-reference.md).

## Rules
- **Do** capture the actual request before hypothesizing — the wire never lies.
- **Do** treat 5xx as a server bug: check server logs, not client code.
- **Do** treat 4xx as a client bug: compare what you send to what the server expects.
- **Do** verify the fix against the original request before moving on.
- **Do** gate requests on token availability — firing before auth resolves is a race, not a network bug.
