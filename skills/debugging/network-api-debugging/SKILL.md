---
source: "GrimoireStack"
name: network-api-debugging
description: "Diagnose and fix network and API failures — CORS, auth token issues, rate limiting, redirect chains, WebSocket drops, and HTTP request/response mismatches."
triggers:
  - CORS errors in browser or mobile app
  - Auth token expiry, refresh loops, or missing auth headers
  - 429 Too Many Requests / rate limiting
  - Redirect chains that lose data or cause infinite loops
  - WebSocket connection drops or reconnection failures
  - Requests that work in Postman/curl but fail in the app
  - "Network request failed with no useful error message"
  - Server returns different data than expected
  - Request body or content-type mismatches
  - SSL/TLS certificate issues in development
---

# Network / API Debugging

Code-level debugging skills (specter, debug-to-fix-pipeline) assume the code is the problem. But network/API failures exist in a gray zone: the code is correct, the server is correct, but something between them is broken. These failures require **inspect the actual HTTP request/response, not the code that generates it.**

---

## Phase 1: CAPTURE THE ACTUAL TRAFFIC

Before hypothesizing, see exactly what's going over the wire.

**Done when:** at least one complete request-response pair has been captured and the request method, URL, headers, and response status are known. If no traffic could be captured, the issue is before the network layer (syntax error, build failure, environment).

### Browser

```javascript
const originalFetch = globalThis.fetch;
globalThis.fetch = async function(...args) {
  const [url, options] = args;
  console.log('→ REQUEST:', {
    url: typeof url === 'string' ? url : url.toString(),
    method: options?.method || 'GET',
    headers: Object.fromEntries(options?.headers ?
      (options.headers instanceof Headers ? options.headers.entries() : Object.entries(options.headers)) : []),
    body: options?.body ? (typeof options.body === 'string' ? options.body : '[non-string body]') : undefined
  });
  const response = await originalFetch.apply(this, args);
  const clone = response.clone();
  const responseBody = await clone.text();
  console.log('← RESPONSE:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseBody.substring(0, 500)
  });
  return response;
};
```

### React Native / Expo

```typescript
if (__DEV__) {
  const originalFetch = global.fetch;
  global.fetch = async (input, init) => {
    console.log(`→ ${init?.method || 'GET'} ${input}`);
    if (init?.body) console.log('  Body:', typeof init.body === 'string' ? init.body : '[FormData/Blob]');
    console.log('  Headers:', JSON.stringify(init?.headers));
    const res = await originalFetch(input, init);
    console.log(`← ${res.status} ${res.statusText}`);
    return res;
  };
}
```

### Server-side (Node.js)

```bash
NODE_DEBUG=http,https node server.js
```

**Decision: What you're looking for**

| Symptom | Phase 1 Finding | Skip to |
|---------|----------------|---------|
| CORS error | Origin header doesn't match server's allowed origins | Fix #1 |
| 401/403 | Auth token missing, expired, or wrong format | Fix #2 |
| 429 | Rate limiting headers in response | Fix #3 |
| 301/302 chain | Redirects causing data loss | Fix #4 |
| Connection refused | Server not running or wrong port | Phase 2 |
| Timeout | Network unreachable or server hanging | Phase 2 |
| 200 but wrong data | Request body or content-type mismatch | Fix #5 |

---

## Phase 2: DIAGNOSE BY STATUS CODE

**Done when:** the status code category is identified (2xx, 3xx, 4xx, or 5xx) and the corresponding diagnosis section has been read. If 5xx, the bug is server-side — switch to server debugging. If 4xx, the bug is in what the client sent — proceed to Phase 3 for the specific fix.

### 2xx — Everything OK but Wrong Data

Check:
1. Content-Type header — is the server returning JSON when you expect it? Is it HTML (error page)?
2. Request body — is the client sending the payload the server expects? Check:
   - `Content-Type: application/json` with `JSON.stringify(body)` — must match
   - `Content-Type: multipart/form-data` — don't JSON.stringify
   - Form data vs JSON body — server may expect one and receive the other
3. Query parameters — are they encoded correctly? (`?` vs `&`, URL encoding)
4. Pagination — are you getting page 1 when you expect page 5?

### 3xx — Redirects

1. **301 vs 302** — 301 is permanent; browser caches it. If server changed, clear browser cache or use 302.
2. **Redirect losing POST body** — 301/302 converts POST to GET. Data lost. Use 307/308 for body-preserving redirects.
3. **Redirect loop** — Server redirects back to itself. Check for mixed HTTP/HTTPS, trailing slashes, or auth redirects that loop.
4. **React Native** — Fetch follows redirects automatically. To inspect, set `redirect: 'manual'`.

### 4xx — Client Errors

**4xx means the server received the request but refused it. The problem is what the client sent, not the server.**

| Code | Cause | Quick Fix |
|------|-------|----------|
| 400 | Bad request syntax | Compare your request to API docs. Check body format, encoding. |
| 401 | Not authenticated | Check auth token — is it present? Valid? Correct scheme (Bearer vs Basic)? |
| 403 | Authenticated but not authorized | Token is valid but lacks permission. Check scopes/roles. |
| 404 | Not found | URL is wrong. Check base URL, path params, trailing slashes. |
| 405 | Method not allowed | Using GET when endpoint expects POST, or vice versa. |
| 409 | Conflict | Resource already exists (duplicate creation) or version conflict. |
| 415 | Unsupported media type | Content-Type header doesn't match what server expects. |
| 422 | Unprocessable entity | Body is valid JSON but missing required fields or has validation errors. |
| 429 | Too many requests | Rate limited. Check Retry-After header. |

### 5xx — Server Errors

**5xx means the server crashed. The client is fine — this is a server bug.**

| Code | Cause | What to do |
|------|-------|-----------|
| 500 | Internal server error | Check server logs, not client code. |
| 502 | Bad gateway | Reverse proxy couldn't reach upstream. Server may be down. |
| 503 | Service unavailable | Server overloaded or restarting. Retry with backoff. |
| 504 | Gateway timeout | Server took too long. Check if the query is too expensive. |

**For 5xx:** The bug is on the server side. If you control the server, debug the server. If not, check if your request is causing the server to crash (sending unexpected data).

---

## Phase 3: FIX BY FAILURE TYPE

**Done when:** the specific fix matching the diagnosis has been applied and the original request now works (or the fix is confirmed to address the root cause).

### Fix #1: CORS

**Symptom:** Browser console shows "Access-Control-Allow-Origin" error.

**Diagnosis:**
- Browser sends a preflight `OPTIONS` request
- Server must respond with correct CORS headers
- If server doesn't handle `OPTIONS`, preflight fails

**Common causes:**
1. Server doesn't return `Access-Control-Allow-Origin` header
2. Server returns `Access-Control-Allow-Origin: *` but credentials are being sent (not allowed)
3. Server doesn't return `Access-Control-Allow-Headers` for custom headers
4. Server doesn't handle `OPTIONS` method at all
5. React Native doesn't enforce CORS — if it works in RN but not browser, it's CORS

**Fix (server-side):**
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://your-app.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};
```

**Fix (development only):** Use a proxy or browser extension. Never in production.

### Fix #2: Auth Token Issues

**Symptom:** 401/403 responses, or requests that work in curl but not in app.

**Diagnosis checklist:**
1. Is the token being sent? Check request headers.
2. Is the token in the right header? `Authorization: Bearer <token>` vs `Authorization: <token>` vs custom header
3. Is the token still valid? Check `exp` claim: `JSON.parse(atob(token.split('.')[1])).exp`
4. Is the token being refreshed? Check for refresh loops (token expires → refresh → new token → still 401 → refresh again)
5. Is the token set before the request fires? (Async race condition — token promise not awaited)

**Common causes:**
```typescript
// CAUSE 1: Token not set before request fires (race condition)
// BAD: useQuery fires before token is available
const { data } = useQuery(api.someData, {}); // no auth yet!
// GOOD: wait for token before querying
const { data } = useQuery(api.someData, {}, { enabled: !!authToken });

// CAUSE 2: Token in wrong format
// BAD: headers: { Authorization: token }  // missing "Bearer" prefix
// GOOD: headers: { Authorization: `Bearer ${token}` }

// CAUSE 3: Refresh loop
// BAD: refresh on every 401
if (response.status === 401) { refreshToken(); retry(); }  // infinite loop if refresh also 401s
// GOOD: limit refresh attempts
if (response.status === 401 && !hasRetried) {
  await refreshToken();
  hasRetried = true;
  return retry();
}
```

### Fix #3: Rate Limiting (429)

**Symptoms:**
- 429 status code
- `Retry-After` header in response
- Requests work, then suddenly fail, then work again

**Diagnosis:**
- Check response headers for rate limit info: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

**Fix patterns:**
```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status !== 429) return response;
    const retryAfter = response.headers.get('Retry-After');
    const delay = retryAfter
      ? parseInt(retryAfter) * 1000
      : Math.min(1000 * 2 ** attempt + Math.random() * 1000, 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error(`Max retries exceeded for ${url}`);
}
```

### Fix #4: Redirect Chains

**Symptoms:**
- Request should POST but browser sends GET
- Request body disappears after redirect
- Infinite redirect loop
- Data lost between redirects

**Diagnosis:**
```bash
curl -v -L http://your-api.com/endpoint 2>&1 | grep -E "< HTTP|< Location"
```

**Common fixes:**
- Use 307/308 instead of 301/302 for POST redirects
- Check for HTTP→HTTPS redirects losing the body
- Check for trailing slash redirects (`/api/users` → `/api/users/`)
- Clear browser cache if permanent redirect (301) was wrong

### Fix #5: Request Body Mismatches

**Symptoms:**
- 200 OK but response has unexpected data
- 422 Unprocessable Entity
- Server receives empty body or wrong format

**Diagnosis:**
```typescript
console.log('Request body:', JSON.stringify(body, null, 2));
```

**Common causes:**
- Double-encoding: `JSON.stringify(JSON.stringify(body))`
- FormData sent as JSON (should be multipart)
- Missing required fields
- Wrong data types (string instead of number)

---

## Failure Modes

- **Debugging client code when the problem is server-side:** 5xx errors mean the server crashed — check server logs, not client code
- **Assuming the request is correct without capturing it:** always capture the actual HTTP request before hypothesizing
- **Ignoring CORS in development:** React Native doesn't enforce CORS, so a bug that only appears in the browser is likely CORS
- **Auth refresh loops:** refreshing the token on every 401 without limiting retries creates infinite loops
- **Double-encoding request bodies:** `JSON.stringify(JSON.stringify(body))` silently corrupts the payload

## References

- `references/http-status-quick-reference.md` — Full HTTP status code reference table for 4xx and 5xx responses with first-check actions for each.
