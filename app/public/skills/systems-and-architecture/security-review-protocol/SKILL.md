---
name: security-review-protocol
description: "4-phase security review fusing STRIDE, hazard analysis, LLM vuln audit, and expanded threat-modeling guidance (assets, boundaries, secrets, input validation, authz, failure modes, attacker perspective)."
triggers:
  - Need comprehensive security review
  - Need STRIDE threat modeling combined with hazard analysis
  - Need LLM-specific vulnerability audit
---


## Security Review Protocol

A comprehensive security review that combines three complementary lenses into a single 4-phase protocol. Covers attack surface analysis, hazardous operation checking, and LLM-specific vulnerability patterns.

### Phase 1: MODEL (STRIDE)

Map the attack surface using STRIDE threat modeling.

For each component/endpoint in the change:

| Threat | Question | Common Agent Mistakes | Check |
|--------|----------|----------------------|-------|
| **S**poofing | Can someone pretend to be someone else? | Missing authn, trusting client-provided IDs, hardcoded test credentials | Auth tokens validated? Session binding? |
| **T**ampering | Can someone modify data they shouldn't? | No integrity checks on webhooks, accepting unsigned JWTs, missing CSRF | Input validation? Integrity checks? |
| **R**epudiation | Can actions be denied? | No audit logs, shared service accounts, missing request IDs | Audit logs? Timestamped records? |
| **I**nformation Disclosure | Can someone see data they shouldn't? | Logging headers with tokens, verbose errors, stack traces to clients | RLS? Field-level access? Response filtering? |
| **D**enial of Service | Can someone overwhelm the system? | Unbounded query params, no rate limits, expensive ops without timeouts | Rate limiting? Query complexity bounds? |
| **E**levation of Privilege | Can someone gain unauthorized access levels? | Missing authz, trusting client-sent role fields, IDOR | Role checks? Permission escalation guards? |

**Minimum bar:** Address Spoofing, Tampering, and Elevation of Privilege before considering a feature secure.

**Output:** Threat table with identified risks and current mitigations.

### Phase 2: AUDIT (Unsafe Control Actions)

For each high-consequence action (data mutation, auth change, financial operation, admin action):

Check 4 hazard conditions:

1. **Not provided** — Is the action missing when it should be present?
   - Example: auth check omitted on a new route
2. **Provided incorrectly** — Is the action wrong when it executes?
   - Example: delete operation targets wrong resource
3. **Provided too early/too late** — Is timing wrong?
   - Example: sending notification before transaction commits
4. **Provided too long** — Is the action left on when it should stop?
   - Example: admin session never expires, temp token not revoked

**Output:** For each high-consequence action: hazard conditions met or not met.

### Phase 3: HARDCODE (LLM-Specific Vulnerabilities)

Check for vulnerabilities that LLMs systematically introduce:

- [ ] **Exposed secrets** — API keys, JWT secrets, DB passwords in source
- [ ] **Missing auth guards** — routes/mutations without identity verification
- [ ] **Missing RLS** — user-facing tables without row-level security
- [ ] **Injection vectors** — string interpolation in queries, unsanitized input
- [ ] **Overly permissive CORS** — wildcard `*` or unnecessary origins
- [ ] **Verbose error responses** — stack traces, internal state leaked to clients
- [ ] **Insecure defaults** — dev-mode settings in production configs
- [ ] **Missing rate limiting** — public endpoints without throttling
- [ ] **Stale dependencies** — packages with known CVEs

**Output:** Checklist with pass/fail for each item.

### Phase 4: VERIFY

Ground security claims in evidence, not assumptions.

| Claim | Verification |
|-------|-------------|
| "Auth is checked" | Grep for auth middleware on the route |
| "Input is validated" | Read the validation code for the endpoint |
| "RLS is enabled" | Check the migration/schema for RLS policies |
| "No secrets exposed" | Run `grep -rE '(api_key|secret|token|password)' --include='*.ts' --include='*.js'` |
| "Rate limiting is set" | Check middleware config for rate limiter |

**Rules:**
- Every security claim must have tool-grounded evidence
- If you can't verify, mark as UNVERIFIED (not "probably fine")
- Fix failures before deployment — no exceptions

### Severity Rating

After all 4 phases, rate each finding:

| Severity | Criteria | Action |
|----------|----------|--------|
| **Critical** | Exploitable in production, data/security impact | Block deployment |
| **High** | Exploitable with specific conditions | Fix before next release |
| **Medium** | Potential risk, mitigating factors exist | Track, fix soon |
| **Low** | Theoretical risk, defense in depth | Document, fix when convenient |

---

### Expanded Guidance

#### Assets & Trust Boundaries

Before STRIDE, identify what is worth protecting and where trust changes.

**Assets:** User credentials, session tokens, API keys, PII, financial data, admin capabilities, infra credentials, source code. If losing it requires a breach notification, outage, or key rotation — it's an asset.

**Trust boundaries:** Draw lines between what you control and what you don't.

```
[Browser / Mobile App]  ← untrusted
       ↓ HTTPS
[Load Balancer]         ← semi-trusted (terminates TLS)
       ↓
[App Server]            ← trusted zone
       ↓
[Database]              ← trusted zone
       ↓
[Third-party API]       ← external trust boundary
```

Every arrow crossing a boundary is attack surface. Every hop inside trusted zone is lateral movement risk.

#### Secrets Hygiene Checklist

Run on every change:

- [ ] No secrets in source code, environment variables only
- [ ] No secrets logged at any log level (including debug)
- [ ] No secrets in error messages or stack traces
- [ ] No secrets in URL query params (they end up in access logs)
- [ ] Rotation plan exists (how fast to revoke and reissue?)
- [ ] Least-privilege: keys have only the permissions they need
- [ ] TTL/expiration on tokens and sessions
- [ ] Unique per-environment keys (dev ≠ staging ≠ prod)
- [ ] No secrets pasted into AI prompts (may be logged or trained on)

#### Input Validation Doctrine

Never trust input. Define what is allowed; reject everything else.

```
Whitelisting > Blacklisting
Strict schemas > Lenient parsing
Fail closed > Fail open
Validation at boundary > Validation deep inside
```

Checks at every entry point:
- Type and format (regex, JSON schema, struct validation)
- Length and size limits
- Charset restrictions (avoid Unicode normalization attacks)
- Range checks (timestamps, IDs, counts)
- File type verification (magic bytes, not just extensions)
- Rate limiting per user, per IP, per API key

#### Authorization Checklist

For every endpoint or function:

- [ ] Who is calling this? (authentication)
- [ ] Are they allowed to do this? (authorization)
- [ ] Are they allowed to do this *to this specific resource*? (resource-level authz)
- [ ] Can they escalate by changing a parameter? (IDOR check)
- [ ] Is the action idempotent and auditable?

#### Failure Mode Analysis

Ask: what happens when security controls fail?

- TLS fails → reject or fallback to HTTP? (Reject.)
- Auth token is expired → cache old identity? (No.)
- Rate limiter is down → allow all traffic? (Fail open is dangerous; use circuit breaker.)
- DB unreachable → error message reveals schema details? (Sanitize.)

**Rule:** Security features must fail closed or loudly. Silent failures become bypasses.

#### Attacker Perspective

Spend 2 minutes thinking as an attacker:

1. Easiest way to get unauthorized data?
2. What happens with malformed input?
3. Can I access another user's data by changing an ID?
4. Default passwords, test endpoints, or debug routes left enabled?
5. What do logs and error messages reveal?
6. Can I abuse a legitimate feature (bulk export, password reset)?

### When to Use

- Before deploying new API endpoints
- Before database schema changes affecting user data
- Before changes to auth/permission logic
- Before deploying AI-generated/vibe-coded applications
- During security-focused code reviews

### Anti-Patterns

- Running only one phase and calling it done (each lens catches different things)
- Treating STRIDE as a paperwork exercise (each threat must have a concrete check)
- Marking items as "secure" without tool verification (assumption, not evidence)
- Only checking new code (changes can break security of existing code)
- Skipping Phase 4 because Phases 1-3 "looked fine" (verification is the point)

## References

- `references/threat-catalog.md` — Curated threat catalog with STRIDE × attack-vector matrix, OWASP Top 10 mapping, and concrete exploit scenarios per entry.
