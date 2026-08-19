# Network / API Debugging — Capture Snippets & Status Tables

## Traffic capture snippets

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

## 4xx table — client sent something wrong

| Code | Cause | First check |
|------|-------|-------------|
| 400 | Bad request syntax | Compare your request to API docs; check body format and encoding |
| 401 | Not authenticated | Token present? Valid? Correct scheme (Bearer vs Basic)? |
| 403 | Authenticated but not authorized | Token is valid but lacks permission — check scopes/roles |
| 404 | Not found | URL wrong — base URL, path params, trailing slashes |
| 405 | Method not allowed | GET when the endpoint expects POST, or vice versa |
| 408 | Request timeout | Client took too long to send the request | Slow upload or streaming; unlikely client-side |
| 409 | Conflict | Resource already exists (duplicate creation) or version conflict |
| 415 | Unsupported media type | Content-Type header doesn't match what the server expects |
| 422 | Unprocessable entity | Body is valid JSON but missing required fields or failing validation |
| 429 | Too many requests | Rate limited — check `Retry-After` header |

## 5xx table — the server crashed

| Code | Cause | What to do |
|------|-------|-----------|
| 500 | Internal server error | Check server logs, not client code |
| 502 | Bad gateway | Reverse proxy couldn't reach upstream — server may be down |
| 503 | Service unavailable | Server overloaded or restarting — retry with backoff |
| 504 | Gateway timeout | Server took too long — check if the query is too expensive |

## Fix code patterns

### CORS headers (server-side)

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://your-app.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};
```

### Auth token causes

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

### Rate-limit retry with backoff

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

### Redirect chain trace

```bash
curl -v -L http://your-api.com/endpoint 2>&1 | grep -E "< HTTP|< Location"
```

## Auth token debugging cheat sheet

```bash
# Decode JWT without verification (check claims)
echo "TOKEN_HERE" | cut -d. -f1 | base64 -d 2>/dev/null | python3 -m json.tool
echo "TOKEN_HERE" | cut -d. -f2 | base64 -d 2>/dev/null | python3 -m json.tool

# Check if token is expired
node -e "const [,payload] = 'TOKEN'.split('.'); const {exp} = JSON.parse(Buffer.from(payload, 'base64').toString()); console.log(new Date(exp*1000).toISOString(), exp > Date.now()/1000 ? 'VALID' : 'EXPIRED')"

# Check what curl sends vs what app sends
curl -v -H "Authorization: Bearer $TOKEN" https://api.example.com/endpoint
```

## Failure modes

- Debugging client code when the problem is server-side — 5xx means check server logs
- Assuming the request is correct without capturing it
- Ignoring CORS in development — React Native doesn't enforce CORS, so browser-only failures are CORS
- Auth refresh loops — refreshing on every 401 without limiting retries
- Double-encoding request bodies — `JSON.stringify(JSON.stringify(body))` silently corrupts the payload
