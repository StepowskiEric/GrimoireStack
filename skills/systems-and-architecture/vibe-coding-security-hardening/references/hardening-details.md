# Vibe Coding Security Hardening — Phase Checklists

## Phase 1: Secrets & environment (critical)

AI tools reliably hardcode secrets into source code — the #1 exploit vector.

- [ ] All secrets in environment variables (never in source)
- [ ] No `NEXT_PUBLIC_` / `VITE_` / `REACT_APP_` prefix on sensitive keys
- [ ] `.env` in `.gitignore` (and `.env.local`, `.env.production`)
- [ ] Service role keys (Supabase admin, DB admin) never reach client
- [ ] Stripe secret key (`sk_`) never in frontend
- [ ] AI API keys (OpenAI, Anthropic) rotated and scoped
- [ ] JWT signing keys strong and rotated
- [ ] No secrets in error messages, logs, or browser dev tools
- [ ] No secrets pasted into AI prompts (they may be logged or trained on)

Common AI mistakes:

```javascript
// WRONG — AI often generates this: service role key in client
const supabase = createClient('https://xyz.supabase.co', 'eyJhbGc...');

// WRONG — hardcoded in frontend
const stripe = Stripe('sk_live_51H7...');

// RIGHT — environment variable
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
```

```bash
# Find secrets in code
gitleaks detect --source . --verbose
grep -rn "sk_\|pk_\|api_key\|password\|secret" --include="*.js" --include="*.ts" --include="*.py" src/ app/ components/ pages/

# Check for .env in git history
git log --all --full-history -- .env .env.local .env.production
```

## Phase 2: Database access control (critical)

AI tools create database tables without Row Level Security — the #2 exploit vector.

- [ ] RLS enabled on **every** table (Supabase, PostgREST)
- [ ] SELECT policies restrict to authenticated user's own data
- [ ] INSERT policies enforce ownership (`WITH CHECK (auth.uid() = user_id)`)
- [ ] UPDATE/DELETE policies restrict to resource owner
- [ ] Service role key used only in server-side code
- [ ] Storage bucket policies enforce per-user access
- [ ] No `WITH CHECK (true)` or `USING (true)` policies
- [ ] Firebase: rules are not `allow read, write: if true`
- [ ] MongoDB: authentication enabled; no open `bind_ip`
- [ ] Postgres: roles are least-privilege; no superuser in app

```bash
# If RLS is disabled on any table, this returns data without auth
curl -H "apikey: <anon-key>" https://<project>.supabase.co/rest/v1/<table>?select=*
```

## Phase 3: Authentication & authorization (critical)

- [ ] Every protected endpoint validates auth server-side (not just UI hiding)
- [ ] Session tokens have expiration and refresh mechanism
- [ ] Password reset links expire quickly (≤ 1 hour)
- [ ] Rate limiting on login, signup, password reset, magic link
- [ ] OAuth redirect URLs match exactly (no wildcards, no preview domains)
- [ ] JWT algorithm verified (`HS256` not `none`); strong signing secret
- [ ] Admin endpoints separately protected (not just "is logged in")
- [ ] IDOR prevented: users cannot reach other users' resources by changing IDs
- [ ] Logout invalidates session/token server-side

```bash
# Protected resource while logged out → expect 401
curl https://yourapp.com/api/users/123/orders

# Another user's resource while logged in as user A → expect 403
curl -H "Authorization: Bearer <user_A_token>" https://yourapp.com/api/users/456/orders
```

## Phase 4: Input validation & injection prevention (high)

- [ ] All user input validated server-side (client-side validation is UX, not security)
- [ ] SQL/NoSQL queries use parameterized statements (never string concatenation)
- [ ] No `eval()`, `exec()`, or `Function()` with user input
- [ ] File uploads: type verified (magic bytes), size limited, path sanitized
- [ ] No path traversal in file operations (`../`, absolute paths)
- [ ] HTML rendered from user input is sanitized (XSS prevention)
- [ ] JSON parsing handles unexpected types gracefully
- [ ] GraphQL queries have depth limiting and cost analysis
- [ ] Command execution uses allowlists, not shell interpolation

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

## Phase 5: API & endpoint security (high)

- [ ] CORS configured explicitly (not `*` in production)
- [ ] Security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`/`SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`
- [ ] Rate limiting on all public endpoints
- [ ] API returns consistent error shapes (no stack traces or internal details)
- [ ] Webhook endpoints verify signatures (Stripe, GitHub, etc.)
- [ ] Webhook raw body preserved for signature verification
- [ ] No sensitive operations via GET requests

## Phase 6: Infrastructure & deployment (high)

- [ ] HTTPS enforced (HSTS, no HTTP fallback)
- [ ] No public admin panels (Supabase dashboard, DB admin tools)
- [ ] Cloud storage buckets not publicly listable
- [ ] Serverless functions have timeout and memory limits
- [ ] Environment separation: dev/staging/prod keys are distinct
- [ ] No test credentials in production
- [ ] Backup and restore procedures tested
- [ ] Domain has DNSSEC if supported

## Phase 7: Dependencies & supply chain (medium)

- [ ] `npm audit` / `pip audit` / `cargo audit` run and issues resolved
- [ ] No unused dependencies (reduces attack surface)
- [ ] No known-vulnerable versions of auth, crypto, or networking libraries
- [ ] Lockfiles (`package-lock.json`, `Cargo.lock`) committed and reviewed
- [ ] No typosquatted packages (check names carefully)

## Phase 8: Logging & monitoring (medium)

- [ ] Auth events logged (login, logout, failed attempts, password changes)
- [ ] Sensitive data NOT logged (passwords, tokens, PII)
- [ ] Error logs do not reveal stack traces or internal paths to users
- [ ] Failed auth attempts trigger alerts
- [ ] Unusual access patterns monitored (geo, time, volume)

## Phase 9: AI-specific risks (medium)

- [ ] User input to AI prompts is sanitized (indirect prompt injection)
- [ ] AI-generated content is sanitized before rendering to users
- [ ] AI tool output is not executed as code without review
- [ ] MCP servers and AI tools run with least privilege
- [ ] No sensitive data sent to third-party AI APIs unnecessarily
- [ ] AI feature costs are rate-limited (prevent billing abuse)

## CI/CD pipeline template

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

## Research context

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

## Real-world incident patterns

| Incident | Root Cause | Prevented By |
|----------|-----------|--------------|
| Lovable 170 apps exposed | Missing RLS on Supabase | Phase 2 |
| Tea App 72K images leaked | Firebase storage open to all | Phase 2, Phase 6 |
| Moltbook 1.5M tokens leaked | Missing auth checks | Phase 3 |
| Nx supply chain | Token theft via AI-generated code | Phase 1 |
| Replit DB deleted | AI agent with excessive permissions | Phase 3, Phase 9 |
