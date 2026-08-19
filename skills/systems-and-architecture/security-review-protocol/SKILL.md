---
name: security-review-protocol
description: "4-phase security review fusing STRIDE, hazard analysis, LLM vuln audit, and expanded threat-modeling guidance."
triggers:
  - comprehensive-security-review
  - stride-threat-modeling
  - llm-vulnerability-audit
---

# Security Review Protocol

**Four lenses, one verdict — and every claim grounded in evidence, not assumption.** A comprehensive security review combines three complementary perspectives into a 4-phase protocol: STRIDE threat modeling, hazardous-operation checking, and LLM-specific vulnerability patterns. Run all four phases — each lens catches what the others miss — and verify every security claim with tools before calling anything secure.

## The Move

### 1. Model — STRIDE the attack surface
For each component and endpoint in the change, walk the STRIDE table (details in Reference): **S**poofing (auth tokens validated? session binding?), **T**ampering (integrity checks on webhooks? unsigned JWTs? CSRF?), **R**epudiation (audit logs? request IDs?), **I**nformation disclosure (RLS? field-level access? verbose errors?), **D**enial of service (rate limits? query bounds? timeouts?), **E**levation of privilege (role checks? IDOR? client-sent role fields?). **Minimum bar:** Spoofing, Tampering, and Elevation of Privilege must be addressed before the feature is secure. Output the threat table with risks and current mitigations.

### 2. Audit — unsafe control actions
For each high-consequence action (data mutation, auth change, financial operation, admin action), check the four hazard conditions: **not provided** (auth check omitted on a new route), **provided incorrectly** (delete targets the wrong resource), **provided too early/too late** (notification before the transaction commits), **provided too long** (admin session never expires, temp token not revoked). Output which conditions each action meets.

### 3. Hardcode — LLM-specific vulnerabilities
Run the checklist for what LLMs systematically introduce: exposed secrets, missing auth guards, missing RLS, injection vectors, overly permissive CORS, verbose error responses, insecure defaults (dev mode in prod configs), missing rate limiting, stale dependencies with known CVEs. Pass/fail each item.

### 4. Verify — claims become evidence
Every security claim gets tool-grounded proof: grep for auth middleware on the route; read the validation code; check the migration for RLS policies; run `grep -rE '(api_key|secret|token|password)'`; inspect the rate-limiter config. If you cannot verify, mark **UNVERIFIED** — not "probably fine." Fix failures before deployment, no exceptions. Then rate each finding: **Critical** (exploitable in production — block deployment), **High** (exploitable with conditions — fix before next release), **Medium** (potential with mitigating factors — track), **Low** (theoretical — document).

## Reference
For the full STRIDE table with common agent mistakes, the expanded guidance (assets and trust boundaries, secrets hygiene, input-validation doctrine, authorization checklist, failure-mode analysis, attacker perspective), and the threat catalog, see [`references/threat-catalog.md`](references/threat-catalog.md).

## Rules
- **Do** run all four phases — one lens alone is not a review.
- **Do** give every STRIDE threat a concrete check — paperwork STRIDE catches nothing.
- **Do** verify every security claim with tools; assumption is not evidence.
- **Do** make security features fail closed or loudly — silent failures become bypasses.
- **Do** review existing code too — a change can break the security of what was already there.
