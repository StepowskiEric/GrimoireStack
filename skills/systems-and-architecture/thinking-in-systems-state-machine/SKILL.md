---
name: thinking-in-systems-state-machine
description: "Model stocks, flows, delays, leverage points, and blast radius before touching the system."
triggers:
  - feedback-loops
  - delayed-effects
  - multi-step-cascades
  - system-boundary-mapping
---

# Thinking in Systems

**Model the behavior before touching the mechanism.** When the task involves feedback loops, delayed effects, or multi-step cascades, the agent must not touch the target system until it has mapped the system boundary, stocks and flows, reinforcing and balancing loops, delays, likely leverage points, early warning metrics, and unknowns with blast radius. A local fix without a system map is how "we fixed it but it came back."

## The Move

### 1. Intake — confirm it's a system-behavior problem
Trigger on: recurring incidents, retry storms, cascading failures, schema changes with downstream risk, queue buildup, cross-service regressions, "we fixed it but it came back." If the task is purely local, a deeper protocol is overhead — but when symptoms repeat, the loop is the suspect.

### 2. Map — boundary and loop recon
Create `system-feedback-map.md` (template in Reference): task, system boundary (what's in/out), main components, **stocks** (accumulations), **flows** (what changes the stocks), **reinforcing loops**, **balancing loops**, **delays**, likely leverage points, early warning metrics, unknowns, blast radius confidence. Inspect docs, configs, code, metrics, logs, tests — no writes yet. If the task touches shared contracts, schemas, retries, queues, caches, worker behavior, or cross-service flows, also create `unknowns-register.md`. No writes to operational targets until the map exists.

### 3. Evidence gate — ground the loop model
Connect the map to evidence: queue depth, latency progression, retries, cache hit/miss shifts, pool saturation, timeout trends, consumer lag, error-propagation timing. Weak evidence → narrow scope or state the intervention as explicitly exploratory. A loop model with no metrics is a story, not a map.

### 4. Intervene — smallest leverage-point change
Choose the smallest intervention at a named leverage point: backpressure, retry-policy correction, batching adjustment, queue ownership, concurrency limits, timeout budgets, idempotency, contract clarification, cache policy. Do not default to "scale it up," blind parallelism, or patching the nearest symptom. If blast-radius confidence is low and the intervention is high-risk, stop or narrow scope.

### 5. Verify & close — whole-system check
Check whether targeted metrics moved, the loop weakened as expected, a different part of the system now degrades, or a new bottleneck/loop activated. Stop when the target loop is materially weakened, key metrics stabilize, and no new dominant adverse loop appears. Escalate when the loop model stays too uncertain, blast radius is unknown, rival explanations remain strong, or verification contradicts the map.

## Reference
For the `system-feedback-map.md` and `unknowns-register.md` templates, tool gating, and circuit breakers, see [`references/systems-details.md`](references/systems-details.md).

## Rules
- **Do** map the system before changing it — the feedback map is the gate.
- **Do** tie every loop in the map to observable evidence.
- **Do** intervene at a named leverage point with the smallest change.
- **Do** verify whole-system behavior, not just the local metric.
- **Do** stop when verification contradicts the map — the map, not the fix, was wrong.
