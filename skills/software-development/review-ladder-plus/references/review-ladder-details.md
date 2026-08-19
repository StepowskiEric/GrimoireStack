# Review Ladder Plus — Severities, Audit Trail & Related Skills

## Severity definitions

| Severity | Definition | Gate behavior |
|----------|------------|---------------|
| **Critical** | data loss, security breach, crash, irreversible harm | must be fixed or have a passing proof |
| **High** | incorrect behavior that is hard to detect, customer-facing bugs | must be fixed or have a passing proof |
| **Medium** | noticeable quality issue, correctable with refactor | fix or document as accepted debt |
| **Low** | minor quality concern, cosmetic | optional — document if desired |

## Audit trail

Each issue records its outcome: `FIXED` (patched), `REJECTED` (passing proof), `PARTIAL` (partial fix + partial proof), `DEBT` (accepted technical debt, Medium/Low only). Keep the log as a diff comment or `review-log.jsonl` beside the code.

## Anti-patterns prevented

| Anti-pattern | What this skill does |
|--------------|---------------------|
| Reviewer writes code "to show the fix" | reviewers diagnose only |
| Main agent dismisses issues as "nitpicky" | Critical/High requires formal proof |
| Tests added after the fact | test generation is mandatory |
| Reviewer anchors on prior issues | fresh-context reviewer sees only diff + spec |
| "Looks fine to me" self-review | dual reviewers force perspective diversity |
| Edge cases deemed "theoretically impossible" | Beta reviewer hunts boundary conditions |

## Related skills

- `llm-pre-push-review` — pre-push checklist based on LLM coding failure research
- `pre-deployment-gate` — full pre-deploy security and quality checklist
- `verified-synthesize` — formal verification (Dafny) for correctness-critical code
- `security-review-protocol` — STRIDE-based security review
- `vibe-coding-security-hardening` — OWASP hardening for AI-generated code
- `debug-to-fix-pipeline` — systematic debugging when issues are found
