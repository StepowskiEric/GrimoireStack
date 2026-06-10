# Skill: Vibe Coding Security Hardening

## Purpose

Use this skill before deploying any AI-generated ("vibe-coded") application to production. AI coding tools optimize for functionality, not security — studies consistently show 45%+ of AI-generated code contains OWASP Top 10 vulnerabilities, with a 1.5–2.74× higher vulnerability rate than human-written code.

This skill provides a systematic hardening checklist and remediation pattern specifically targeting the vulnerabilities AI tools reliably introduce: exposed secrets, missing database access controls, broken authentication, injection flaws, and insecure defaults.

---

## When to Apply

- Before deploying any AI-generated app to production
- After importing AI-generated code into an existing codebase
- Before exposing an app to public users, payment processing, or sensitive data
- When onboarding an AI-built MVP to a real engineering team
- During security review of any app built with Bolt.new, Lovable, v0.dev, Cursor, Replit, Copilot, or similar tools

---

## Research Context

| Finding | Source |
|---------|--------|
| 45% of AI-generated code introduces OWASP vulnerabilities | Veracode / BaxBench 2025 |
| 2.74× higher vulnerability rate vs human code | CodeRabbit 2025 |
| 100% of AI-built apps lacked CSRF protection | Tenzai 2025 |
| 100% of AI-built apps had SSRF vulnerabilities | Tenzai 2025 |
| 20% of vibe-coded apps have serious vulnerabilities | Wiz Research 2025 |
| 170 production apps exposed via missing RLS | CVE-2025-48757 (Lovable/Supabase) |
| 72,000 user images + 1.1M messages leaked | Tea Dating App (Firebase) |
| 1.5M auth tokens leaked | Moltbook (missing auth checks) |

---

## The Hardening Pattern

### Phase 0: Immediate Triage (5 Minutes)

Run these checks before anything else. If any fail, do not deploy.

```
□ No API keys, passwords, or tokens in source code
□ No .env files committed to git
□ Database has access controls enabled (RLS / auth rules)
□ No admin interfaces publicly accessible without auth
□ No debug/test endpoints exposed
```

Quick commands:
```bash
# Find secrets in code
gitleaks detect --source . --verbose

# Find hardcoded keys
grep -rn "sk_\|pk_\|api_key\|password\|secret" --include="*.js" --include="*.ts" --include="*.py" src/ app/ components/ pages/

# Check for .env in git
git log --all --full-history -- .env .env.local .env.production
```

### Phase 1: Secrets & Environment (Critical)

AI tools reliably hardcode secrets into source code. This is the #1 exploit vector.

**Checks:**
- [ ] All secrets in environment variables (never in source)
- [ ] No `NEXT_PUBLIC_` / `VITE_` / `REACT_APP_` prefix on sensitive keys
- [ ] `.env` in `.gitignore` (and `.env.local`, `.env.production`)
- [ ] Service role keys (Supabase admin, DB admin) never reach client
- [ ] Stripe secret key (`sk_`) never in frontend
- [ ] AI API keys (OpenAI, Anthropic) rotated and scoped
- [ ] JWT signing keys strong and rotated
- [ ] No secrets in error messages, logs, or browser dev tools
- [ ] No secrets pasted into AI prompts (they may be logged or trained on)

**Common AI mistakes:**
```javascript
// WRONG — AI often generates this
const supabase = createClient(
  'https://xyz.supabase.co',
  'eyJhbGc...' // anon key is OK, but service role key is NOT
);

// WRONG — hardcoded in frontend
const stripe = Stripe('sk_live_51H7...');

// RIGHT — environment variable
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
```

### Phase 2: Database Access Control (Critical)

AI tools create database tables without Row Level Security (RLS) or security rules. This is the #2 exploit vector.

**Checks:**
- [ ] RLS enabled on **every** table (Supabase, PostgREST)
- [ ] SELECT policies restrict to authenticated user's own data
- [ ] INSERT policies enforce ownership (`WITH CHECK (auth.uid() = user_id)`)
- [ ] UPDATE/DELETE policies restrict to resource owner
- [ ] Service role key used only in server-side code
- [ ] Storage bucket policies enforce per-user access
- [ ] No `WITH CHECK (true)` or `USING (true)` policies
- [ ] For Firebase: rules are not `allow read, write: if true`
- [ ] For MongoDB: authentication is enabled; no open `bind_ip`
- [ ] For Postgres: roles are least-privilege; no superuser in app

**Test this:**
```bash
# If RLS is disabled on any table, this returns data without auth
curl -H "apikey: <anon-key>" \
  https://<project>.supabase.co/rest/v1/<table>?select=*
```

### Phase 3: Authentication & Authorization (Critical)

AI tools generate auth flows that appear to work but lack security controls.

**Checks:**
- [ ] Every protected endpoint validates auth server-side (not just UI hiding)
- [ ] Session tokens have expiration and refresh mechanism
- [ ] Password reset links expire quickly (≤ 1 hour)
- [ ] Rate limiting on login, signup, password reset, magic link
- [ ] OAuth redirect URLs match exactly (no wildcards, no preview domains)
- [ ] JWT tokens signed with strong secret; algorithm verified (`HS256` not `none`)
- [ ] Admin endpoints separately protected (not just "is logged in")
- [ ] IDOR prevented: users cannot access other users' resources by changing IDs
- [ ] Logout invalidates session/token server-side

**Test this:**
```bash
# Access a protected resource while logged out
curl https://yourapp.com/api/users/123/orders
# Should return 401, not data

# Access another user's resource while logged in as user A
curl -H "Authorization: Bearer <user_A_token>" \
  https://yourapp.com/api/users/456/orders
# Should return 403, not data
```

### Phase 4: Input Validation & Injection Prevention (High)

AI tools pass user input directly to queries, commands, and renders.

**Checks:**
- [ ] All user input validated server-side (client-side validation is UX, not security)
- [ ] SQL/NoSQL queries use parameterized statements (never string concatenation)
- [ ] No `eval()`, `exec()`, or `Function()` with user input
- [ ] File uploads: type verified (magic bytes), size limited, path sanitized
- [ ] No path traversal in file operations (`../`, absolute paths)
- [ ] HTML rendered from user input is sanitized (XSS prevention)
- [ ] JSON parsing handles unexpected types gracefully
- [ ] GraphQL queries have depth limiting and cost analysis
- [ ] Command execution uses allowlists, not shell interpolation

**Common AI mistakes:**
```javascript
// WRONG — SQL injection
const result = await db.query(`SELECT * FROM users WHERE id = ${req.body.id}`);

// RIGHT — parameterized
const result = await db.query('SELECT * FROM users WHERE id = $1', [req.body.id]);

// WRONG — command injection
exec(`convert ${req.body.filename} output.png`);

// RIGHT — allowlist + spawn
const ALLOWED_FILES = ['logo.png', 'banner.jpg'];
if (!ALLOWED_FILES.includes(req.body.filename)) throw new Error('Invalid file');
```

### Phase 5: API & Endpoint Security (High)

**Checks:**
- [ ] CORS configured explicitly (not `*` in production)
- [ ] Security headers present:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY` or `SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` (HSTS)
  - `Referrer-Policy`
- [ ] Rate limiting on all public endpoints
- [ ] API returns consistent error shapes (no stack traces or internal details)
- [ ] Webhook endpoints verify signatures (Stripe, GitHub, etc.)
- [ ] Webhook raw body preserved for signature verification
- [ ] No sensitive operations via GET requests

### Phase 6: Infrastructure & Deployment (High)

**Checks:**
- [ ] HTTPS enforced (HSTS, no HTTP fallback)
- [ ] No public admin panels (Supabase dashboard, DB admin tools)
- [ ] Cloud storage buckets not publicly listable
- [ ] Serverless functions have timeout and memory limits
- [ ] Environment separation: dev/staging/prod keys are distinct
- [ ] No test credentials in production
- [ ] Backup and restore procedures tested
- [ ] Domain has DNSSEC if supported

### Phase 7: Dependencies & Supply Chain (Medium)

**Checks:**
- [ ] `npm audit` / `pip audit` / `cargo audit` run and issues resolved
- [ ] No unused dependencies (reduces attack surface)
- [ ] No known-vulnerable versions of auth, crypto, or networking libraries
- [ ] Lockfiles (`package-lock.json`, `Cargo.lock`) committed and reviewed
- [ ] No typosquatted packages (check names carefully)

### Phase 8: Logging & Monitoring (Medium)

**Checks:**
- [ ] Auth events logged (login, logout, failed attempts, password changes)
- [ ] Sensitive data NOT logged (passwords, tokens, PII)
- [ ] Error logs do not reveal stack traces or internal paths to users
- [ ] Failed auth attempts trigger alerts
- [ ] Unusual access patterns monitored (geo, time, volume)

### Phase 9: AI-Specific Risks (Medium)

Apps that use AI features have additional attack surfaces:

**Checks:**
- [ ] User input to AI prompts is sanitized (indirect prompt injection)
- [ ] AI-generated content is sanitized before rendering to users
- [ ] AI tool output is not executed as code without review
- [ ] MCP servers and AI tools run with least privilege
- [ ] No sensitive data sent to third-party AI APIs unnecessarily
- [ ] AI feature costs are rate-limited (prevent billing abuse)

---

## Automated Scanning Pipeline

Add this to CI/CD before any deployment:

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Secret Scan
        uses: gitleaks/gitleaks-action@v2

      - name: SAST
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/cwe-top-25

      - name: Dependency Scan
        run: npm audit --audit-level=moderate
```

Minimum viable local scan:
```bash
gitleaks detect --source . --verbose
npm audit
npx semgrep --config=auto --error
```

---

## Real-World Incident Patterns

| Incident | Root Cause | Prevented By Phase |
|----------|-----------|-------------------|
| Lovable 170 apps exposed | Missing RLS on Supabase | Phase 2 |
| Tea App 72K images leaked | Firebase storage open to all | Phase 2, Phase 6 |
| Moltbook 1.5M tokens leaked | Missing auth checks | Phase 3 |
| Nx supply chain | Token theft via AI-generated code | Phase 1 |
| Replit DB deleted | AI agent with excessive permissions | Phase 3, Phase 9 |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|-------------|
| "It's just an MVP" | MVPs get real users and real data; security debt compounds |
| "I'll fix it later" | Later rarely happens before a breach |
| "The AI tool handles security" | AI tools optimize for compilation, not security |
| "It's an internal app" | Internal apps get exposed; zero trust everywhere |
| "I hide the admin UI" | Hiding UI ≠ protection; direct URL access bypasses it |
| "The framework is secure by default" | AI-generated config overrides defaults |
| "I tested it and it works" | Working ≠ secure; security requires adversarial thinking |

---

## Quick Reference

```
Phase 0: Triage     → secrets, RLS, auth, debug endpoints
Phase 1: Secrets    → env vars only, no client exposure, rotate
Phase 2: Database   → RLS on every table, per-user policies
Phase 3: Auth       → server-side validation, rate limits, IDOR checks
Phase 4: Input      → parameterized queries, no eval, sanitize uploads
Phase 5: API        → CORS, security headers, rate limits, webhooks
Phase 6: Infra      → HTTPS, no public admin, env separation
Phase 7: Deps       → audit, lockfiles, no typosquats
Phase 8: Logs       → auth events, no secrets, error sanitization
Phase 9: AI-Specific → prompt injection, MCP privileges, cost limits
```

---

## Related Skills

- `security-threat-modeling` — deep STRIDE analysis for new features
- `verify-before-integrate` — ensure security changes do not break behavior
- `api-design-backward-compatibility` — secure API evolution
- `root-cause-analysis` — investigate security incidents after they occur
