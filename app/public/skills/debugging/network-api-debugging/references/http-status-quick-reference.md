# HTTP Status Code Quick Reference for Debugging

## Client Errors (4xx) — Your Request Is Wrong

| Code | Name | Likely Cause | First Check |
|------|------|-------------|-------------|
| 400 | Bad Request | Malformed JSON, wrong content-type, missing required field | Log request body verbatim, compare to API docs |
| 401 | Unauthorized | Missing auth, expired token, wrong auth scheme | Check Authorization header, decode JWT exp claim |
| 403 | Forbidden | Valid auth but insufficient permissions | Check user roles/scopes vs endpoint requirements |
| 404 | Not Found | URL path is wrong | Compare request URL to API docs, check trailing slashes |
| 405 | Method Not Allowed | GET vs POST vs PUT vs DELETE | Check which HTTP method the endpoint requires |
| 408 | Request Timeout | Client took too long to send request | Unlikely client-side; check slow upload or streaming |
| 409 | Conflict | Duplicate creation, version conflict | Check if resource already exists |
| 415 | Unsupported Media Type | Content-Type header mismatch | Verify Content-Type matches body format |
| 422 | Unprocessable Entity | Valid JSON but fails validation | Read response body for validation error details |
| 429 | Too Many Requests | Rate limiting | Check Retry-After header, implement backoff |

## Server Errors (5xx) — Server Bug or Overload

| Code | Name | Likely Cause | First Check |
|------|------|-------------|-------------|
| 500 | Internal Server Error | Unhandled exception in server code | Check server logs, not client code |
| 502 | Bad Gateway | Reverse proxy can't reach upstream | Server may be down or misconfigured |
| 503 | Service Unavailable | Server overloaded or restarting | Retry with exponential backoff |
| 504 | Gateway Timeout | Server too slow | Check if request is causing expensive DB query |

## Auth Token Debugging Cheat Sheet

```bash
# Decode JWT without verification (check claims)
echo "TOKEN_HERE" | cut -d. -f1 | base64 -d 2>/dev/null | python3 -m json.tool
echo "TOKEN_HERE" | cut -d. -f2 | base64 -d 2>/dev/null | python3 -m json.tool

# Check if token is expired
node -e "const [,payload] = 'TOKEN'.split('.'); const {exp} = JSON.parse(Buffer.from(payload, 'base64').toString()); console.log(new Date(exp*1000).toISOString(), exp > Date.now()/1000 ? 'VALID' : 'EXPIRED')"

# Check what curl sends vs what app sends
curl -v -H "Authorization: Bearer $TOKEN" https://api.example.com/endpoint
```