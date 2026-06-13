# Threat Catalog: Top 15 Web/API Security Threats

Quick-reference guide for detecting common security vulnerabilities using ripgrep (rg) patterns and manual inspection. Each entry includes OWASP category, description, and practical detection commands.

---

## 1. SQL Injection (SQLi)

**OWASP:** A03:2021 – Injection

**Description:** User input is concatenated into SQL queries, allowing attackers to manipulate database commands.

**Detection Patterns:**

```bash
# String concatenation in queries (TypeScript/JavaScript)
rg -n "(query|sql|execute)\s*\+\s*" --type ts --type js

# Template literals in database calls
rg -n "(query|sql)\s*`[^`]*\$\{" --type ts --type js

# Raw SQL with string interpolation (Python)
rg -n "execute\(f\"|execute\(.*\%.*\" --type py

# ORM bypass / raw queries
rg -n "\.raw\(|\.execute\(|cursor\.execute" --type ts --type js --type py
```

**Manual Checks:**
- Look for `Prisma.$raw` or `sequelize.query` with interpolated values
- Check if all queries use parameterized inputs

---

## 2. Cross-Site Scripting (XSS)

**OWASP:** A03:2021 – Injection

**Description:** Untrusted user input is rendered in HTML without proper escaping, allowing script injection.

**Detection Patterns:**

```bash
# React: dangerouslySetInnerHTML
rg -n "dangerouslySetInnerHTML" --type ts --type tsx --type js --type jsx

# InnerHTML assignments
rg -n "\.innerHTML\s*=" --type ts --type js

# Document.write with variables
rg -n "document\.write\(" --type ts --type js

# eval() usage
rg -n "\beval\(" --type ts --type js --type py
```

**Manual Checks:**
- Check if user-generated content is sanitized before rendering
- Verify Content-Security-Policy headers are set
- Ensure React's JSX auto-escaping isn't bypassed

---

## 3. Cross-Site Request Forgery (CSRF)

**OWASP:** A01:2021 – Broken Access Control

**Description:** State-changing operations lack CSRF protection, allowing attackers to forge requests from authenticated users.

**Detection Patterns:**

```bash
# Missing CSRF middleware in Express
rg -n "app\.post|router\.post" --type ts --type js | grep -v "csrf"

# No CSRF token in forms
rg -n "<form" --type html --type tsx --type jsx | grep -v "csrf"

# Next.js: missing CSRF in API routes
rg -n "export\s+async\s+function\s+POST" --type ts --type tsx
```

**Manual Checks:**
- Verify CSRF tokens on all state-changing endpoints
- Check SameSite cookie attributes
- Ensure Origin/Referer headers are validated

---

## 4. Insecure Deserialization

**OWASP:** A08:2021 – Software and Data Integrity Failures

**Description:** Untrusted serialized data is deserialized without validation, enabling remote code execution.

**Detection Patterns:**

```bash
# Python pickle usage
rg -n "pickle\.loads|pickle\.load\b" --type py

# PHP unserialize
rg -n "unserialize\(" --type php

# Java/ObjectStream deserialization
rg -n "ObjectInputStream|readObject\b" --type java --type kt

# Node.js serialization libraries
rg -n "serialize|deserialize" --type ts --type js | grep -v "JSON"
```

**Manual Checks:**
- Verify only JSON is used for data exchange
- Check if any binary deserialization (MessagePack, protobuf) has schema validation
- Never accept serialized objects from untrusted sources

---

## 5. Broken Authentication / Missing Auth Guards

**OWASP:** A01:2021 – Broken Access Control

**Description:** Endpoints lack proper authentication or authorization checks.

**Detection Patterns:**

```bash
# Express routes without auth middleware
rg -n "(app|router)\.(get|post|put|delete|patch)\(" --type ts --type js | grep -v "auth"

# Next.js API routes without session check
rg -n "export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)" --type ts | grep -v "getServerSession\|withAuth"

# Missing @RequireAuth or similar (NestJS)
rg -n "@(Get|Post|Put|Delete|Patch)\(" --type ts | grep -v "@RequireAuth\|@UseGuards"
```

**Manual Checks:**
- Every protected route must verify identity and permissions
- Session tokens must be validated server-side
- Check for direct object references (IDOR) - user can access other users' data

---

## 6. Authorization Bypass / IDOR

**OWASP:** A01:2021 – Broken Access Control

**Description:** Users can access resources belonging to other users by manipulating IDs or parameters.

**Detection Patterns:**

```bash
# Find resource access by ID
rg -n "params\.(id|userId|accountId|orgId)|req\.params\[" --type ts --type js

# Database queries without user ownership check
rg -n "find(Unique|One|Many)\(.*params\.(id|userId)" --type ts

# GraphQL: fetching without context auth
rg -n "@Query\(|@Mutation\(" --type ts | grep -v "@UseGuards"
```

**Manual Checks:**
- Every `findById`, `findOne`, database lookup must filter by authenticated user
- Verify `userId` is extracted from session, not client-provided param
- Test with two user accounts to confirm isolation

---

## 7. Mass Assignment / Overposting

**OWASP:** A01:2021 – Broken Access Control

**Description:** Client-supplied data updates sensitive fields unintentionally (e.g., `isAdmin`, `role`).

**Detection Patterns:**

```bash
# Destructuring entire request body into model
rg -n "\.create\(.*req\.body|\.update\(.*req\.body" --type ts --type js

# Prisma: update with spread
rg -n "update\(.*\{\.\.\.data\}" --type ts

# No allowlist of updatable fields
rg -n "allowedFields|updatableFields" --type ts --type js --invert-match
```

**Manual Checks:**
- Use explicit field allowlists (e.g., `role: false` in Prisma)
- Never trust `req.body` directly in update/create operations
- Verify sensitive fields (`role`, `isAdmin`, `emailVerified`) are never client-updatable

---

## 8. NoSQL Injection

**OWASP:** A03:2021 – Injection

**Description:** User input manipulates NoSQL queries (MongoDB, etc.) to bypass authentication or extract data.

**Detection Patterns:**

```bash
# MongoDB with user input directly
rg -n "\.find\(.*req\.(body|query)|\.findOne\(.*req\." --type ts --type js

# $where or $ne operator usage
rg -n '\$where|\$ne|\$gt|\$lt' --type ts --type js

# Mongoose queries with raw JSON from client
rg -n "\.find(One)?\(JSON\.parse" --type ts --type js
```

**Manual Checks:**
- Use Mongoose schemas with type validation
- Never pass `req.body` directly to `find()` or `findOne()`
- Sanitize inputs with `mongo-sanitize` or similar

---

## 9. Insecure CORS Configuration

**OWASP:** A05:2021 – Security Misconfiguration

**Description:** CORS allows unauthorized origins, credentials from any source, or exposes sensitive headers.

**Detection Patterns:**

```bash
# Wildcard origin with credentials
rg -n "origin:\s*\*|Access-Control-Allow-Origin:\s*\*" --type ts --type js --type py

# CORS config with credentials: true
rg -n "credentials:\s*true" --type ts --type js | grep -B3 -A3 "origin"

# Next.js: CORS headers set manually without allowlist
rg -n "Access-Control-Allow-Origin" --type ts --type js | grep -v "whitelist\|allowedOrigins"
```

**Manual Checks:**
- `Access-Control-Allow-Origin` must never be `*` with `credentials: true`
- Origins must be explicitly allowlisted
- Verify `Access-Control-Allow-Credentials` is only set when needed

---

## 10. Server-Side Request Forgery (SSRF)

**OWASP:** A10:2021 – Server-Side Request Forgery

**Description:** Server makes HTTP requests to attacker-controlled URLs, enabling internal network access.

**Detection Patterns:**

```bash
# Fetch/axios with user-provided URLs
rg -n "fetch\(.*req\.(body|query)|axios\.get\(.*req\." --type ts --type js

# Webhook fetchers without URL validation
rg -n "fetch\(|axios\." --type ts --type js | grep -v "localhost|127.0.0.1"

# Unvalidated redirects
rg -n "res\.redirect\(.*req\.(query|body)" --type ts --type js
```

**Manual Checks:**
- All user-supplied URLs must be validated against a blocklist (internal IPs, metadata endpoints)
- Use allowlist of permitted domains when possible
- Never allow `http://169.254.169.254` (cloud metadata) or `localhost` in production

---

## 11. Path Traversal / Directory Traversal

**OWASP:** A01:2021 – Broken Access Control

**Description:** User input manipulates file paths to read/write files outside intended directories.

**Detection Patterns:**

```bash
# User input in file paths
rg -n "path\.join\(.*req\.(body|query)|readFile\(.*req\." --type ts --type js --type py

# Unrestricted file uploads
rg -n "upload|multer|formidable" --type ts --type js --type py

# Path without sanitization
rg -n "\.\.\/|\.\.\\\\" --type ts --type js --type py
```

**Manual Checks:**
- Use `path.resolve` and verify resolved path starts with expected base directory
- Generate random filenames for uploads, never use user-provided filenames directly
- Validate file extensions and MIME types server-side

---

## 12. XML External Entity (XXE)

**OWASP:** A05:2021 – Security Misconfiguration

**Description:** XML parsers process external entities, enabling file disclosure, SSRF, or DoS.

**Detection Patterns:**

```bash
# XML parsing without disabling external entities
rg -n "xml2js|DOMParser|xml\.parse\(|sax\.parse" --type ts --type js --type py

# Disabled entity check (negative match)
rg -n "disableExternalEntities\|processExternalEntities\|externalEntity" --type ts --type js --type py | grep -v "false\|disable"

# Python: lxml without secure config
rg -n "lxml\.etree\.parse|XMLParser\(" --type py
```

**Manual Checks:**
- Disable external entity processing in all XML parsers
- Use `exslt` or `defusedxml` in Python
- Set `{ dtds: false, entities: false }` in JavaScript XML parsers

---

## 13. Insecure Direct Object References (IDOR) — Advanced

**OWASP:** A01:2021 – Broken Access Control

**Description:** UUIDs, sequential IDs, or predictable references allow horizontal/vertical privilege escalation.

**Detection Patterns:**

```bash
# Exposing internal IDs
rg -n "select\s+\*|find(Unique|One)\(.*id" --type ts --type sql

# GraphQL: returning IDs without scoping
rg -n "@Query\(.*\)\s*\{" --type ts | grep -v "return.*where.*userId"

# API responses with raw database IDs
rg -n "res\.json\(\{.*id:" --type ts --type js
```

**Manual Checks:**
- Use ULIDs or UUIDs instead of sequential integers
- Always scope queries by authenticated user ID
- Check if admin-only fields leak in normal user responses

---

## 14. Security Misconfiguration / Verbose Errors

**OWASP:** A05:2021 – Security Misconfiguration

**Description:** Debug mode, stack traces, or internal details leak to clients in production.

**Detection Patterns:**

```bash
# Debug mode enabled
rg -n "debug:\s*true|DEBUG\s*=\s*true|NODE_ENV\s*!=\s*production" --type ts --type js --type py

# Stack trace exposure
rg -n "stack:|err\.stack|traceback" --type ts --type js --type py | grep -v "console\.error"

# Verbose error responses
rg -n "res\.json\(\{error:\s*err\)|JSON\.stringify\(err" --type ts --type js

# Missing security headers
rg -n "helmet|Security Headers|x-frame-options|x-content-type-options" --type ts --type js --invert-match
```

**Manual Checks:**
- Verify `process.env.NODE_ENV === 'production'` before enabling debug features
- Ensure error responses are generic (no stack traces, SQL queries, or internal paths)
- Set security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options

---

## 15. Insecure Session Management

**OWASP:** A02:2021 – Cryptographic Failures

**Description:** Session tokens are predictable, not rotated, or transmitted insecurely.

**Detection Patterns:**

```bash
# Insecure session config
rg -n "cookie.*secure.*false|cookie.*httponly.*false|cookie.*samesite.*none" --type ts --type js

# Session without expiration
rg -n "maxAge.*undefined|expires.*null" --type ts --type js

# JWT without expiration
rg -n "jwt\.sign\(.*expiresIn" --type ts --type js --invert-match

# Weak session store (default MemoryStore)
rg -n "MemoryStore|express-session" --type ts --type js | grep -v "Redis\|connect-redis"
```

**Manual Checks:**
- All cookies must have `secure: true`, `httpOnly: true`, `sameSite: 'strict'` (or 'lax')
- JWTs must have short `expiresIn` and be signed with strong algorithms (RS256, not HS256)
- Sessions must be invalidated on logout and password change
- Use Redis or database-backed session store, not in-memory

---

## Quick Reference Summary

| # | Threat | Primary rg Pattern | Severity |
|---|--------|-------------------|----------|
| 1 | SQL Injection | `query\s*\+\s*`, `` `[^`]*\$\{ `` | Critical |
| 2 | XSS | `dangerouslySetInnerHTML`, `\.innerHTML\s*=` | High |
| 3 | CSRF | Missing CSRF on `post/put/delete` | High |
| 4 | Insecure Deserialization | `pickle\.loads`, `unserialize\(`, `readObject` | Critical |
| 5 | Broken Authentication | Routes without auth middleware | Critical |
| 6 | IDOR / Auth Bypass | `find(Unique|One)\(.*params\.id` | Critical |
| 7 | Mass Assignment | `\.create\(.*req\.body`, `\.update\(.*req\.body` | High |
| 8 | NoSQL Injection | `\.find\(.*req\.`, `\$where` | Critical |
| 9 | Insecure CORS | `origin:\s*\*`, `credentials:\s*true` | High |
| 10 | SSRF | `fetch\(.*req\.`, `res\.redirect\(.*req\.` | Critical |
| 11 | Path Traversal | `path\.join\(.*req\.`, `readFile\(.*req\.` | Critical |
| 12 | XXE | `xml\.parse\(`, `XMLParser\(` | High |
| 13 | IDOR (Advanced) | Exposed sequential IDs, unscoped queries | Critical |
| 14 | Verbose Errors / Misconfig | `debug:\s*true`, `err\.stack` | Medium |
| 15 | Insecure Sessions | `secure:\s*false`, `httponly:\s*false` | High |

---

## Usage Notes

- These patterns are starting points, not guarantees. Adjust language/type filters for your stack.
- Combine with manual review — automated grep catches obvious issues but misses context.
- Update patterns as your codebase evolves. Add false-positive exclusions with `--glob '!vendor/**'` etc.
- For comprehensive scanning, use dedicated SAST tools (Semgrep, CodeQL) in addition to these quick checks.
