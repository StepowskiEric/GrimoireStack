# Skill: Security Threat Modeling for AI Agents

## Purpose

Use this skill when writing, reviewing, or operating code that handles authentication, authorization, user input, secrets, or sensitive data. Prevents the agent from shipping common vulnerabilities, leaking credentials in logs, or designing APIs that invite abuse.

Security threat modeling forces the agent to think like an attacker: identify assets, trust boundaries, and entry points before an adversary does.

---

## When to Apply

- Adding a new API endpoint, authentication flow, or permission check
- Handling user input of any kind (forms, query params, headers, file uploads)
- Storing, transmitting, or logging secrets (API keys, tokens, passwords)
- Integrating with third-party services or webhooks
- Reviewing code that touches PII, financial data, or admin capabilities
- Deploying to production or exposing a service to the internet
- Adding a feature that changes who can access what

---

## The Pattern

### Step 1: Identify Assets

What is worth protecting?

- User credentials and session tokens
- API keys and service-to-service auth
- PII, financial data, health records
- Admin capabilities, billing functions, data deletion
- Infrastructure credentials (DB passwords, cloud tokens, deploy keys)
- Source code and build pipelines

Rule: If losing it would require a breach notification, an outage, or a deploy-key rotation, it is an asset.

### Step 2: Map Trust Boundaries

Draw a line between what you control and what you do not.

```
[Browser / Mobile App]  ← untrusted
       ↓ HTTPS
[Load Balancer]         ← semi-trusted (terminates TLS)
       ↓
[Application Server]    ← trusted zone
       ↓
[Database]              ← trusted zone
       ↓
[Third-party API]       ← external trust boundary
```

Every arrow that crosses a boundary is an attack surface. Every hop inside the trusted zone is a lateral movement risk if the outer layer fails.

### Step 3: STRIDE Analysis

For each trust boundary crossing, check for these threat categories:

| Threat | Question | Common Agent Mistakes |
|--------|----------|----------------------|
| **S**poofing | Can an attacker impersonate a user or service? | Missing authn, trusting client-provided IDs, hardcoded test credentials left in production |
| **T**ampering | Can data be modified in transit or at rest? | No integrity checks on webhooks, accepting unsigned JWTs, missing CSRF tokens |
| **R**epudiation | Can actions be denied or untraceable? | No audit logs, shared service accounts, missing request IDs |
| **I**nformation Disclosure | Can sensitive data leak? | Logging headers with tokens, verbose error messages, returning full stack traces to clients |
| **D**enial of Service | Can the system be overloaded or crashed? | Unbounded query params, no rate limits, missing pagination, expensive operations without timeouts |
| **E**levation of Privilege | Can a user gain more access than intended? | Missing authz checks, trusting client-sent role fields, IDOR (Insecure Direct Object Reference) |

Minimum bar: Address Spoofing, Tampering, and Elevation of Privilege before considering a feature secure.

### Step 4: Secrets Hygiene Checklist

Run this on every change:

- [ ] No secrets in source code, environment variables only
- [ ] No secrets logged at any log level (including "debug")
- [ ] No secrets in error messages or stack traces
- [ ] No secrets in URL query params (they end up in access logs)
- [ ] Rotation plan exists (how fast can you revoke and reissue?)
- [ ] Least-privilege: keys have only the permissions they need
- [ ] TTL/expiration on tokens and sessions
- [ ] Unique per-environment keys (dev ≠ staging ≠ prod)

Anti-pattern: "I'll rotate it later." Later rarely happens before a leak.

### Step 5: Input Validation Doctrine

Never trust input. Define what is allowed; reject everything else.

```
Whitelisting > Blacklisting
Strict schemas > Lenient parsing
Fail closed > Fail open
Validation at boundary > Validation deep inside
```

Checks to apply at every entry point:
- Type and format (regex, JSON schema, struct validation)
- Length and size limits
- Charset restrictions (avoid Unicode normalization attacks)
- Range checks (timestamps, IDs, counts)
- File type verification (magic bytes, not just extensions)
- Rate limiting per user, per IP, per API key

Anti-pattern: Validating only in the frontend. The frontend is an adversary's convenience, not a security boundary.

### Step 6: Authorization Checklist

For every endpoint or function:

- [ ] Who is calling this? (authentication)
- [ ] Are they allowed to do this? (authorization)
- [ ] Are they allowed to do this *to this specific resource*? (resource-level authz)
- [ ] Can they escalate by changing a parameter? (IDOR check)
- [ ] Is the action idempotent and auditable?

Anti-pattern: Checking `if (user)` (authentication) but not `if (user.canAccess(resource))` (authorization).

### Step 7: Failure Mode Analysis

Ask: what happens when security controls fail?

- TLS fails → do you reject or fallback to HTTP? (Reject.)
- Auth token is expired → do you cache the old identity? (No.)
- Rate limiter is down → do you allow all traffic? (Fail open is dangerous; use a circuit breaker.)
- Database is unreachable → does the error message reveal schema details? (Sanitize.)

Rule: Security features must fail closed or loudly. Silent failures become bypasses.

### Step 8: Review from an Attacker's Perspective

Spend 2 minutes thinking as an attacker:

1. What is the easiest way to get unauthorized data?
2. What happens if I send malformed input?
3. Can I access another user's data by changing an ID?
4. Are there default passwords, test endpoints, or debug routes left enabled?
5. What do the logs and error messages reveal?
6. Can I abuse a legitimate feature to cause harm (e.g., bulk export, password reset)?

If you cannot think of an attack, ask the `security-threat-modeling` skill again after sleeping on it.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|-------------|
| "It's just an internal API" | Internal networks are breached; zero trust means verify everywhere |
| "We'll add auth later" | Later is after the first exploit; auth is architectural, not cosmetic |
| Hashing passwords with MD5/SHA1 | Rainbow tables exist; use bcrypt/Argon2/scrypt |
| Storing JWT secrets client-side | Client-side storage is readable by XSS; use httpOnly cookies |
| Relying on security through obscurity | Obscurity fails the moment the secret is discovered |
| Logging full request objects | Headers contain tokens; bodies contain PII |
| Returning 404 for unauthorized resources | Leaks existence information; return 403 uniformly or use 404 only when the resource genuinely does not exist for anyone |
| Trusting the `X-Forwarded-For` header blindly | Client-set; validate against a whitelist of proxies |

---

## Quick Reference

```
1. Assets        → what must be protected
2. Boundaries    → where trust changes
3. STRIDE        → Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation
4. Secrets       → never in code, never in logs, rotate fast
5. Input         → whitelist, strict schemas, fail closed
6. Authz         → per-resource, check parameters, prevent IDOR
7. Failures      → fail closed, sanitize errors
8. Attacker view → what is the easiest path to abuse?
```

---

## Related Skills

- `unsafe-control-actions-hazard-analysis` — safety-oriented hazard analysis (complements security)
- `verify-before-integrate` — ensure security changes do not break existing behavior
- `domain-driven-design` — boundaries and aggregates align with trust boundaries
- `thinking-in-systems` — understand how security controls interact with system dynamics
