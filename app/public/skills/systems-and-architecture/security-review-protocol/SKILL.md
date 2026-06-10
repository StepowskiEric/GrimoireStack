---
name: Security Review Protocol
description: "Fuse of Security Threat Modeling (STRIDE) + Unsafe Control Actions + Vibe Coding Security Hardening. Three security lenses merged: attack surface analysis, hazardous operation checking, and LLM-specific vulnerability audit."
---


## Security Review Protocol

A comprehensive security review that combines three complementary lenses into a single 4-phase protocol. Covers attack surface analysis, hazardous operation checking, and LLM-specific vulnerability patterns.

### Phase 1: MODEL (STRIDE)

Map the attack surface using STRIDE threat modeling.

For each component/endpoint in the change:

| Threat | Question | Check |
|--------|----------|-------|
| **S**poofing | Can someone pretend to be someone else? | Auth tokens validated? Session binding? |
| **T**ampering | Can someone modify data they shouldn't? | Input validation? Integrity checks? |
| **R**epudiation | Can actions be denied? | Audit logs? Timestamped records? |
| **I**nformation Disclosure | Can someone see data they shouldn't? | RLS? Field-level access? Response filtering? |
| **D**enial of Service | Can someone overwhelm the system? | Rate limiting? Query complexity bounds? |
| **E**levation of Privilege | Can someone gain unauthorized access levels? | Role checks? Permission escalation guards? |

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
