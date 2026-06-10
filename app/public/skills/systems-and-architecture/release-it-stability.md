# Skill: Release It! Stability Patterns for AI Agents

## Purpose

Use this skill when the agent must reason about whether a distributed system design is stable under failure conditions, not just under normal operation.

This skill is based on Michael Nygard's *Release It! Design and Deploy Production-Ready Software*.

The core insight: systems that work perfectly in development still fail in production because production has failure modes that development never exercises — cascading failures, resource exhaustion, slow dependencies, and death spirals that no amount of feature correctness prevents.

The patterns in this skill are the defensive structures that keep a failure in one component from becoming a failure of the whole system.

---

## Core Rule

Design for failure, not just for function.

A system that works when everything is healthy is not production-ready.
A system that degrades gracefully and recovers cleanly is.

---

## When to Use

Use this skill when:
- designing or reviewing a distributed system architecture
- recommending integration patterns between services
- evaluating an existing system's reliability posture
- debugging or post-morteming an incident involving cascading failure
- assessing whether a system is production-ready before launch
- the system depends on third-party APIs, databases, caches, queues, or other services that can fail or become slow

Do not use when:
- the system is simple enough that failure modes are obvious and already handled
- the problem is about domain logic rather than operational resilience
- the context is a prototype or proof of concept where stability is not the goal

---

## Key Stability Patterns

### Circuit Breaker
Wraps a call to a remote service.
When failures exceed a threshold, the circuit "opens" and fast-fails all subsequent calls without attempting the remote call.
Allows the remote service to recover before traffic resumes.

**Without it**: a slow or unavailable dependency blocks all caller threads, exhausting thread pools and cascading failure upstream.

**Ask**:
- Is there a circuit breaker on every integration point with a dependency that can become slow or unavailable?
- What is the open/half-open/closed threshold?
- What is the fallback behavior when the circuit is open?

### Bulkhead
Isolates resources (thread pools, connection pools, processing queues) by caller or function so that exhaustion in one partition does not exhaust resources for others.

**Without it**: a slow third-party API call exhausts the entire thread pool, making the service unresponsive to all requests, not just those needing that API.

**Ask**:
- Are different integration points using separate thread/connection pools?
- Is there any resource sharing that would allow one failure mode to exhaust shared capacity?

### Timeout
Every call to a remote service, database, or file system must have an explicit timeout.
The system must handle timeout as an expected outcome, not an exception.

**Without it**: a hung dependency causes all callers to block indefinitely, exhausting thread pools.

**Ask**:
- Does every integration call have an explicit timeout?
- Is the timeout value calibrated to real-world SLOs rather than set to a large default?
- Is timeout handled as an expected response, with defined fallback behavior?

### Fail Fast
A service that cannot fulfill a request correctly should fail immediately and loudly rather than processing the request partway and silently returning a wrong result.

**Without it**: partial failures produce corrupt data or misleading responses that are harder to debug than outright errors.

**Ask**:
- Does the service validate its preconditions at the start of processing?
- Does it fail with an explicit error rather than returning a degraded or wrong result?

### Steady State
No human intervention should be required to keep the system healthy over time.
Logs, queues, databases, caches, and files that grow unboundedly will eventually cause failure.

**Without it**: a system that runs fine for a week fails on week four because a log volume, queue depth, or cache size crossed a threshold that no one was watching.

**Ask**:
- Do all log files have rotation and retention limits?
- Do all queues have dead-letter handling and depth limits?
- Do all caches have eviction policies?
- Are there any unbounded accumulations in the system?

### Let It Crash / Supervisor Pattern
When a process encounters an unexpected state, it is often safer to terminate it and let a supervisor restart it than to attempt recovery from an unknown state.

**Without it**: processes accumulate corrupted state silently and produce unreliable behavior until a restart eventually fixes the symptom.

**Ask**:
- When a process encounters unexpected state, does it terminate cleanly or try to continue?
- Is there a supervisor (process manager, orchestrator, health check + restart) watching it?

### Handshaking
Services should be able to communicate capacity and health before a caller sends load.
Throttling, back-pressure, and health endpoints are handshaking mechanisms.

**Without it**: a caller sends full load to a degraded service, amplifying the failure rather than accommodating it.

**Ask**:
- Does the service expose a health or readiness endpoint?
- Does it signal back-pressure when approaching capacity?
- Does the caller respect those signals?

### Shed Load
When a service is overloaded, it should actively shed excess load — return 429 or similar — rather than accepting all requests and degrading.

**Without it**: a service under overload accepts all requests, processes them all slowly, queues them up, and eventually fails completely rather than serving some requests well.

**Ask**:
- Does the service have a concurrency limit or rate limit?
- When that limit is exceeded, does it shed gracefully?

---

## Stability Anti-Patterns (to Identify and Remove)

### Tight Coupling
Services call each other synchronously in chains. One slow service slows all of its callers.

Counter: introduce circuit breakers, timeouts, and where appropriate, asynchronous decoupling.

### Cascading Failures
A failure in one service causes failures in its callers, which cause failures in their callers.

Counter: bulkheads + circuit breakers + timeouts at each integration boundary.

### Integration Point Monoculture
All integration calls share a single thread pool or connection pool. One slow dependency exhausts the whole service.

Counter: bulkhead each integration point.

### Unbounded Result Sets
A query returns all rows without a LIMIT. When data volume grows, the response time grows unboundedly.

Counter: all queries must have explicit limits and pagination.

### Slow Response Chain
No timeout on a downstream call; the calling service blocks a thread waiting. Under load, threads exhaust.

Counter: explicit timeout on every integration call.

---

## Stability Assessment Template

```md
## System Being Assessed
<description>

## Integration Points
| Integration | Timeout? | Circuit Breaker? | Bulkhead? | Fallback? |
|-------------|---------|-----------------|----------|---------|

## Steady State Assessment
- Log rotation/retention: <present / absent / unknown>
- Queue depth limits + dead-letter: <present / absent / unknown>
- Cache eviction policy: <present / absent / unknown>
- Unbounded accumulations: <none found / identified: [list]>

## Fail-Fast Check
- Are preconditions validated at entry? <yes / partial / no>
- Are partial failures surfaced as explicit errors? <yes / partial / no>

## Load Shedding
- Concurrency or rate limits: <present / absent>
- Graceful 429 or back-pressure signaling: <present / absent>

## Supervisor / Restart Mechanism
- Process supervision: <present / absent / describe>
- Health check + automated restart: <present / absent>

## Identified Risks
| Risk | Pattern Missing | Severity | Recommendation |
|------|----------------|----------|---------------|

## Recommendations
1. <specific change>
2. <specific change>
```

---

## Agent Rules

### Do
- check every integration point for timeout, circuit breaker, and fallback behavior
- look for unbounded accumulations (logs, queues, caches, result sets)
- identify where a failure in one component can exhaust resources in another
- recommend the minimal patterns needed to address the identified risks

### Do Not
- recommend every pattern for every system — apply where the risk is real
- confuse application reliability with infrastructure reliability — address both
- skip the steady-state check because the system is small today

---

## Failure Modes This Skill Prevents

- cascading failures caused by missing circuit breakers or timeouts
- thread pool exhaustion caused by missing bulkheads
- unbounded growth causing time-deferred failures
- partially-processed requests causing data corruption
- load spikes causing complete service failure instead of graceful degradation

---

## Pairing Guide

- **Designing Data-Intensive Applications (DDIA)** — DDIA covers consistency and data correctness; Release It! covers operational resilience; they are complementary
- **SRE / Error Budget** — SRE governs reliability targets and error budgets; Release It! patterns are the implementation that makes those targets achievable
- **Unsafe Control Actions** — use Unsafe Control Actions to reason about what happens when these stability patterns are absent in high-consequence operations
- **Thinking in Systems** — cascading failure patterns are feedback loops; Thinking in Systems provides the framework for understanding them systemically

---

## Definition of Done

This skill was applied correctly when:
- every integration point was checked for timeout and circuit breaker
- bulkhead partitioning was evaluated for shared resource exhaustion risk
- steady-state accumulations were identified and addressed
- fail-fast behavior was verified for precondition violations
- load-shedding mechanisms were confirmed for overload scenarios
- the system's failure posture is explicitly better because of the changes recommended

---

## Final Instruction

The system will fail.
The question is whether it fails gracefully or catastrophically.

Apply the patterns that prevent one failure from becoming all failures.
