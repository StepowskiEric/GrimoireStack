# Skill: System Architecture Audit for AI Agents

## Purpose

Fuse four architecture disciplines into one sequential audit protocol. Each phase feeds the next — you cannot evaluate boundaries without mapping the system first, cannot judge data flow without understanding boundaries, and cannot assess stability without knowing the data and boundary model.

Fuses:
- Thinking in Systems — feedback loops, stocks/flows, emergent behavior, leverage points
- Domain-Driven Design — bounded contexts, aggregates, context maps, domain events
- Designing Data-Intensive Applications — data models, consistency, replication, partitioning, failure modes
- Release It — circuit breakers, bulkheads, timeouts, load shedding, steady state

## When to Use

Use this skill when:
- auditing an existing system for architectural weaknesses
- planning a major refactor or migration
- diagnosing recurring incidents with no clear root cause
- evaluating production-readiness before launch
- reviewing a system design that spans multiple services or teams
- the system exhibits symptoms: cascading failures, slow degradation, ownership ambiguity, or data correctness issues

Do not use when:
- the system is a small single-service prototype with no domain complexity
- the problem is purely local code quality (use other skills)
- the change is a small isolated feature addition

---

## Phase 1: SYSTEM MAP

Source: Thinking in Systems. Map the system before touching anything.

1. Define the system boundary — what is in scope, what is external
2. Identify main components (services, databases, queues, caches, workers)
3. Identify stocks — queues, caches, database accumulations, connection pools, file buffers
4. Identify flows — what increases or decreases each stock (requests, events, retries, consumers)
5. Identify reinforcing loops — retry storms, cache miss amplification, cascading overload
6. Identify balancing loops — rate limits, backpressure, autoscaling triggers, health checks
7. Identify delays — replication lag, queue processing latency, cache TTL, consumer lag
8. Identify likely leverage points — where a small change would produce large system-wide effect
9. Identify unknowns — unmeasured metrics, undocumented dependencies, assumed behaviors
10. Rate blast radius confidence: high / medium / low
11. Produce system-feedback-map artifact before proceeding

---

## Phase 2: BOUNDARY ANALYSIS

Source: DDD. Understand domain structure and ownership after you know the system shape.

1. Identify ubiquitous language — find terms used inconsistently between business and code
2. Identify bounded contexts — where does one domain model end and another begin
3. Map context relationships — shared kernel, customer-supplier, conformist, ACL, open host
4. Assess aggregate boundaries — consistency invariants, root access patterns, boundary violations
5. Identify domain events — significant occurrences, events missing or replaced by tight coupling
6. Check for ACL needs — foreign model vocabulary bleeding into domain logic
7. Produce context map and domain summary from Phase 1 + Phase 2 findings

---

## Phase 3: DATA EVALUATION

Source: DDIA. Evaluate data correctness, consistency, and flow after boundaries are understood.

1. Match storage model to access patterns — key lookups, range queries, aggregations, joins
2. Map replication paths — where truth is written, replica lag, stale read tolerance, failover behavior
3. Assess consistency requirements — which invariants need strong guarantees, where eventual is acceptable
4. Check for idempotency — duplicate event handling, concurrent write resolution, replay safety
5. Identify partitioning risks — hotspots, skew, ordering constraints, rebalance pain
6. Evaluate caches and derived state — source of truth, invalidation, staleness tolerance, accumulation
7. Assess failure modes — partial network, slow dependency, consumer lag, storage saturation, schema divergence
8. Identify migration and rollback concerns — schema evolution, backfill, compatibility across consumers
9. Produce data architecture assessment from Phase 1 + 2 + 3 findings

---

## Phase 4: STABILITY CHECK

Source: Release It. Stress-test the system against production failure conditions.

1. Check every integration point — does each have timeout, circuit breaker, and fallback behavior
2. Evaluate bulkhead isolation — are thread/connection pools partitioned by caller or function
3. Check steady state — log rotation, queue dead-letter, cache eviction, unbounded accumulations
4. Verify fail-fast behavior — precondition validation, explicit errors, no silent partial failures
5. Check load shedding — concurrency limits, rate limits, graceful 429 or back-pressure signaling
6. Evaluate supervisor patterns — process restart, health checks, crash recovery
7. Cross-reference with Phase 1 feedback loops — do stability gaps amplify the reinforcing loops identified earlier
8. Produce stability assessment with risk table (risk, missing pattern, severity, recommendation)

---

## Anti-Patterns

- System mapping without evidence (Phase 1 without metrics/logs/config grounding)
- Splitting boundaries by technical layer instead of domain responsibility
- Choosing storage by popularity instead of access pattern match
- Adding circuit breakers without understanding the feedback loops they interrupt
- Auditing stability without knowing domain boundaries (you miss cross-context coupling risks)
- Verifying data consistency without knowing what the system boundary actually is
- Treating audit as checklist completion instead of iterative discovery
- Ignoring unknowns register from Phase 1 when evaluating later phases

---

## Exit Criteria

System architecture audit is complete when:

- Phase 1: system-feedback-map exists with stocks, flows, loops, delays, unknowns, blast radius rated
- Phase 2: bounded contexts identified with clear responsibilities and boundaries, language gaps named, aggregates assessed
- Phase 3: data model matched to access patterns, consistency requirements explicit, failure modes described, migration concerns addressed
- Phase 4: every integration point checked for timeout/circuit breaker/bulkhead, steady-state assessed, stability risks documented with severity and recommendations
- Cross-phase: findings from each phase are consistent with findings from prior phases
- All unknowns are documented with plan to resolve or explicit acknowledgment of risk
