---
name: release-it-stability
description: "Circuit breakers, bulkheads, timeouts, load shedding, steady-state hygiene for production failure modes."
triggers:
  - distributed-system-resilience
  - cascading-failure-prevention
  - production-readiness-review
  - stability-pattern-audit
---

# Release It! Stability Patterns

**Design for failure, not just for function.** Systems that work perfectly in development still fail in production, because production has failure modes development never exercises — cascading failures, resource exhaustion, slow dependencies, death spirals. A system that works when everything is healthy is not production-ready; a system that degrades gracefully and recovers cleanly is. The system will fail — the question is whether it fails gracefully or catastrophically.

## When to Use
- Designing or reviewing a distributed system architecture
- Recommending integration patterns between services
- Evaluating an existing system's reliability posture
- Post-morteming an incident involving cascading failure
- Assessing production-readiness before launch
- Any system depending on third-party APIs, databases, caches, queues

Skip it: simple systems with obvious handled failure modes, domain-logic problems, prototypes where stability is not the goal.

## The Move

### 1. Map integration points — timeout, breaker, bulkhead, fallback
For every integration point with a dependency that can become slow or unavailable, check the four patterns (details in Reference):
- **Timeout** — explicit, calibrated to real-world SLOs, handled as an expected outcome
- **Circuit breaker** — open/half-open/closed thresholds; fallback behavior when open
- **Bulkhead** — separate thread/connection pools per integration; no shared resource a single failure can exhaust
- **Fallback** — what the caller does when the dependency fails

Without these, one slow dependency blocks all caller threads and cascades upstream.

### 2. Check steady state — no unbounded accumulations
No human intervention should be needed to keep the system healthy over time. Check: log rotation and retention, queue depth limits and dead-letter handling, cache eviction policies, query result limits (no unbounded `SELECT *`). A system that runs fine for a week and fails on week four because a log volume crossed a threshold is a steady-state failure. Small today is not exempt — growth is the trigger.

### 3. Verify fail-fast and handshaking
- **Fail fast** — preconditions validated at entry; partial failures surface as explicit errors, not silently degraded results
- **Handshaking** — health/readiness endpoint exposed; back-pressure signaled when approaching capacity; callers respect those signals

### 4. Verify load shedding and supervision
- **Shed load** — concurrency or rate limits; graceful 429 above the limit instead of accepting everything and dying
- **Let it crash / supervisor** — unexpected state terminates cleanly and a supervisor (process manager, orchestrator, health check + restart) brings it back; no recovery from unknown state

### 5. Write the stability assessment
Fill the assessment template (in Reference): integration-point table (timeout/breaker/bulkhead/fallback per dependency), steady-state findings, fail-fast check, load shedding, supervisor, identified risks with the missing pattern and severity, and recommendations. Apply only the minimal patterns the identified risks warrant — not every pattern on every system.

## Reference
For the full pattern catalog with "without it" failure stories, the anti-patterns to identify and remove, and the stability assessment template, see [`references/stability-details.md`](references/stability-details.md).

For a full 4-phase system audit (system map, boundaries, data, stability), see `system-architecture-audit`.

## Rules
- **Do** check every integration point for timeout, circuit breaker, and fallback.
- **Do** hunt for unbounded accumulations — logs, queues, caches, result sets.
- **Do** identify where one component's failure can exhaust another's resources.
- **Do** recommend the minimal patterns the real risks warrant.
- **Do** check steady state even for small systems — growth is the trigger.
