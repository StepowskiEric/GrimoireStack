# Thinking in Systems — Templates, Gating & Breakers

## system-feedback-map.md template

Create before execution; complete before any operational writes.

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

## unknowns-register.md

Required when the task touches shared contracts, schemas, retries, queues, caches, worker behavior, or cross-service flows. Register every unknown that touches another team's or service's behavior, with the plan to resolve each before acting on it.

## Tool gating

### Recon phase
- **Allowed:** read/search/list/test/log/metric inspection; artifact writing only
- **Disallowed:** operational writes

### Execution phase
- **Allowed:** only actions justified by the feedback map

## Circuit breakers

Stop immediately if:
- new evidence reveals a different dominant loop
- the system boundary expands significantly
- a "local fix" is actually touching shared contracts or upstream/downstream control flow
- verification improves one metric while destabilizing another critical metric

## Definition of done

Correctly applied when:
- `system-feedback-map.md` exists
- the agent mapped loops before changing the system
- the intervention targeted a named leverage point
- unknowns and blast radius were stated
- verification checked end-to-end behavior
- the agent stopped instead of stacking speculative tweaks
