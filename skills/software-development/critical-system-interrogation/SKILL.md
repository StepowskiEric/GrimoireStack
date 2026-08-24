---
name: critical-system-interrogation
description: "Stress-test critical system paths (auth pipelines, payment flows, data validation) for correctness, race conditions, security flaws, and architectural integrity."
triggers:
  - auth-pipeline-investigation
  - payment-flow-review
  - validation-layer-audit
  - session-management-review
  - crypto-implementation-review
disable-model-invocation: true
---

# Critical System Interrogation

**Treat critical paths like a prosecutor treats a witness.** Authentication pipelines, payment flows, validation layers, session management — any path where a bug means security breaches, data corruption, financial loss, or compliance violations — get the full interrogation: relentless questioning about the design, thermo-nuclear code-quality standards on the implementation, and a structured verdict with an explicit approval bar. If the code is making the codebase messier, say so clearly.

## The Move

### 1. Gather context — question the design
Interview relentlessly, one question at a time, walking each branch of the design tree and resolving dependencies between decisions. Provide your recommended answer for each. If a question can be answered by exploring the codebase, explore instead of asking. Cover: **system boundaries** (entry/exit points, external systems), **data flow** (transformations, corruption points), **state management** (shared state, concurrency, inconsistency), **error handling** (propagation, error-handling failures), **security** (auth checks, injection/bypass surfaces, sensitive data), **race conditions** (shared resources, synchronization, timing bugs).

### 2. Investigate the critical path
With the component mapped, hunt specifically for:
- **Correctness** — logic errors in branches, off-by-one, missing input validation, incorrect error propagation, stuck state-machine transitions
- **Race conditions** — shared mutable state without synchronization, TOCTOU, non-atomic operations, missing/improperly ordered locks, unawaited async
- **Security** — auth bypass, authorization gaps, injection, sensitive data in logs/errors, improper session management
- **Architecture** — logic leaking across layers, missing abstraction for cross-cutting concerns, inconsistent error handling, brittle coupling, missing idempotency for retries

### 3. Apply the standards
Hold the implementation to the non-negotiable standards (full list in Reference): ambitious structural simplification (the **code judo** move — delete complexity, don't rearrange it), no component past 1K lines without a strong reason, no random spaghetti growth, bias toward cleaning the design, direct boring maintainable code over hacky magic, type/boundary cleanliness, logic in the canonical layer reusing existing helpers, no avoidable serial orchestration or non-atomic updates.

### 4. Write the verdict
Produce: **Critical findings** (must fix before deploy: security, data-corrupting races, logic errors, validation gaps), **high-priority issues** (architecture, error handling, concurrency, type safety), **medium improvements** (simplification, abstraction, organization), **low observations**. Explicitly call out code-judo opportunities ("this entire branch could be eliminated by..."). Then the verification checklist and the approval decision against the bar (in Reference).

## Reference
For the full 8 standards, the approval bar with presumptive blockers, the verification checklist, and the review-tone phrasebook, see [`references/interrogation-details.md`](references/interrogation-details.md).

## Rules
- **Do** ask one question at a time and explore the codebase when it answers the question.
- **Do** hunt for the code-judo move — a reframe that makes whole branches disappear.
- **Do** call out spaghetti growth, file-size explosion, and magical abstractions as design problems, not nits.
- **Do** treat the approval bar as presumptive — the author must justify blockers.
- **Do** be direct and demanding; do not soften major maintainability issues into mild suggestions.
