# Skill: Thinking in Systems — State Machine Protocol for AI Agents

## Purpose

Use this skill when the task involves interactions, feedback loops, delayed effects, or multi-step downstream consequences.

This version is not a mindset note. It is an execution protocol.

The agent must not touch the target system until it first maps:
- the system boundary
- stocks and flows
- reinforcing and balancing loops
- delays
- likely leverage points
- early warning metrics
- unknowns and blast radius

---

## Mandatory Diagnostic Artifacts

Before execution, the agent must create:

### `system-feedback-map.md`
```md
# System Feedback Map

## Task
<goal>

## System Boundary
<what is in / out>

## Main Components
- <component>

## Stocks
- <queued state / stored state / accumulations>

## Flows
- <what increases or decreases those stocks>

## Reinforcing Loops
- <loop>

## Balancing Loops
- <loop>

## Delays
- <time lags>

## Likely Leverage Points
- <point>

## Early Warning Metrics
- <metric>

## Unknowns
- <unknown>

## Blast Radius Confidence
<high / medium / low>
```

### `unknowns-register.md`
Required if the task touches shared contracts, schemas, retries, queues, caches, worker behavior, or cross-service flows.

---

## State Machine

## State 0 — Intake
Goal:
- identify whether this is actually a system-behavior problem

Trigger examples:
- recurring incidents
- retry storms
- cascading failures
- schema changes with downstream risk
- queue buildup
- cross-service regressions
- “we fixed it but it came back”

Exit condition:
- task is confirmed as system-dynamic, not purely local

---

## State 1 — Boundary and Loop Recon
Goal:
- map the system before changing it

Allowed actions:
- inspect docs, configs, code, metrics, logs, tests
- identify dependencies and timing
- create `system-feedback-map.md`

Disallowed actions:
- code changes
- config changes
- migrations
- parameter tuning
- rollout actions

Mandatory rule:
No writes to operational targets until the feedback map exists.

Exit condition:
- feedback map completed
- unknowns stated
- blast radius confidence rated

---

## State 2 — Evidence Gate
Goal:
- verify that the loop model is grounded enough to justify action

The agent must connect the loop model to evidence such as:
- queue depth
- latency progression
- retries
- cache hit/miss shifts
- pool saturation
- timeout trends
- consumer lag
- error propagation timing

If evidence is weak, the agent must narrow scope or state that the intervention is speculative.

Exit condition:
- loop model is tied to evidence
- or the intervention is explicitly framed as exploratory

---

## State 3 — Intervention Design
Goal:
- choose the smallest leverage-point intervention

Prefer:
- backpressure
- retry policy correction
- batching adjustment
- queue ownership fixes
- concurrency limits
- timeout budget changes
- idempotency improvements
- contract clarification
- cache policy correction

Do not default to:
- “scale it up”
- blind parallelism
- patching the nearest symptom

Exit condition:
- intervention targets a named leverage point

---

## State 4 — Execution Unlock
Goal:
- permit action only after system mapping and evidence gates pass

Allowed actions:
- bounded interventions consistent with the map

Disallowed actions:
- broad unbounded changes
- local optimization without system justification

If blast radius confidence is low and the intervention is high-risk, the agent must stop or narrow scope.

Exit condition:
- bounded intervention completed

---

## State 5 — Verification
Goal:
- verify whole-system behavior, not just local behavior

The agent must check:
- whether targeted metrics moved
- whether the loop weakened as expected
- whether a different part of the system now degrades
- whether a new bottleneck or loop was activated

Exit condition:
- result validated against system behavior

---

## State 6 — Stop / Escalate
Stop when:
- the target loop is materially weakened
- key metrics stabilize
- no new dominant adverse loop appears

Escalate when:
- loop model remains too uncertain
- blast radius is unknown
- multiple rival explanations remain strong
- verification contradicts the original system map

---

## Tool Gating

### Recon phase
Allowed:
- read/search/list/test/log/metric inspection
- artifact writing only

Disallowed:
- operational writes

### Execution phase
Allowed:
- only actions justified by the feedback map

---

## Circuit Breakers

Stop immediately if:
- new evidence reveals a different dominant loop
- the system boundary expands significantly
- a “local fix” is actually touching shared contracts or upstream/downstream control flow
- verification improves one metric while destabilizing another critical metric

---

## Definition of Done

This skill is correctly applied when:
- `system-feedback-map.md` exists
- the agent mapped loops before changing the system
- intervention targeted a named leverage point
- unknowns and blast radius were stated
- verification checked end-to-end behavior
- the agent stopped instead of stacking speculative tweaks

---

## Final Instruction

Model the behavior before touching the mechanism.
