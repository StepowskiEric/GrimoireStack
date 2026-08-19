# Release It! — Pattern Catalog, Anti-Patterns & Template

## Stability patterns

### Circuit breaker
Wraps a call to a remote service. When failures exceed a threshold, the circuit opens and fast-fails all subsequent calls without attempting the remote call, letting it recover before traffic resumes. Without it: a slow or unavailable dependency blocks all caller threads, exhausting pools and cascading upstream. Ask: breaker on every integration point? Open/half-open/closed thresholds? Fallback when open?

### Bulkhead
Isolates resources (thread pools, connection pools, processing queues) by caller or function so exhaustion in one partition does not exhaust others. Without it: a slow third-party call exhausts the whole thread pool, making the service unresponsive to everyone. Ask: separate pools per integration point? Any shared resource one failure mode can exhaust?

### Timeout
Every call to a remote service, database, or file system has an explicit timeout, handled as an expected outcome — not an exception. Without it: a hung dependency blocks callers indefinitely. Ask: explicit timeout on every integration call? Calibrated to real SLOs, not a large default? Defined fallback behavior?

### Fail fast
A service that cannot fulfill a request correctly fails immediately and loudly rather than processing partway and silently returning a wrong result. Without it: partial failures produce corrupt data that is harder to debug than outright errors. Ask: preconditions validated at start? Explicit error rather than degraded or wrong result?

### Steady state
No human intervention required to keep the system healthy over time. Logs, queues, databases, caches, and files that grow unboundedly eventually cause failure. Without it: a system runs fine for a week, fails on week four when an unwatched threshold is crossed. Ask: log rotation and retention? Queue dead-letter and depth limits? Cache eviction? Any unbounded accumulations?

### Let it crash / supervisor
On unexpected state, terminate and let a supervisor restart rather than recovering from an unknown state. Without it: processes accumulate corrupted state and behave unreliably until a restart fixes the symptom. Ask: does unexpected state terminate cleanly? Is a supervisor (process manager, orchestrator, health check + restart) watching?

### Handshaking
Services communicate capacity and health before a caller sends load — throttling, back-pressure, health endpoints. Without it: a caller sends full load to a degraded service, amplifying the failure. Ask: health/readiness endpoint? Back-pressure signal near capacity? Does the caller respect it?

### Shed load
When overloaded, actively shed excess load (429) rather than accepting everything and degrading. Without it: an overloaded service accepts all requests, processes them slowly, queues them up, and dies completely instead of serving some requests well. Ask: concurrency or rate limit? Graceful shedding above it?

## Anti-patterns (to identify and remove)

- **Tight coupling** — synchronous call chains; one slow service slows all callers. Counter: circuit breakers, timeouts, asynchronous decoupling where appropriate.
- **Cascading failures** — failure in one service causes failures in its callers. Counter: bulkheads + circuit breakers + timeouts at each integration boundary.
- **Integration point monoculture** — all calls share one thread/connection pool; one slow dependency exhausts the whole service. Counter: bulkhead each integration point.
- **Unbounded result sets** — queries without LIMIT; response time grows with data volume. Counter: explicit limits and pagination on all queries.
- **Slow response chain** — no timeout on a downstream call; blocked threads exhaust under load. Counter: explicit timeout on every integration call.

## Stability assessment template

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

## Failure modes this skill prevents

- Cascading failures from missing circuit breakers or timeouts
- Thread-pool exhaustion from missing bulkheads
- Unbounded growth causing time-deferred failures
- Partially-processed requests causing data corruption
- Load spikes causing complete failure instead of graceful degradation

## Pairing guide

- **Designing Data-Intensive Applications** — DDIA covers consistency and data correctness; Release It! covers operational resilience; complementary
- **SRE / Error Budget** — SRE governs reliability targets; Release It! patterns are the implementation that makes them achievable
- **Unsafe Control Actions** — reason about what happens when these patterns are absent in high-consequence operations
- **Thinking in Systems** — cascading failures are feedback loops; use it for the systemic framework

## Definition of done

Applied correctly when:
- every integration point was checked for timeout and circuit breaker
- bulkhead partitioning was evaluated for shared-resource exhaustion risk
- steady-state accumulations were identified and addressed
- fail-fast behavior was verified for precondition violations
- load-shedding mechanisms were confirmed for overload scenarios
- the system's failure posture is explicitly better because of the recommended changes
