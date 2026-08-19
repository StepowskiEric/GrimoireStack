---
name: pdca-deming
description: "Improve a process through a measurement-anchored cycle: plan with a measurable prediction, do, check actual vs predicted, then standardize or escalate. Standardize only what the check confirmed."
triggers:
  - process-improvement
  - measurement-cycle
  - verify-before-standardize
  - baseline-gap
---

# PDCA / Shewhart Cycle

**Standardize only what you measured.** Plan with a measurable prediction, do exactly the planned change, check the actual result against the prediction, then act on what the measurement says — not on how it feels. The cycle's power comes from refusing to skip Check.

## When to Use
- A process, system, or output underperforms against a measurable standard
- The correct change is not yet certain
- Previous changes were never validated before being standardized

Skip it: one-time incidents needing immediate containment, obvious verified fixes, or exploration-first problems (use Toyota Kata / Explore-vs-Exploit).

## The Move

### 1. Plan — baseline, target, hypothesis, prediction
Write the measurable current state (baseline), a specific target ("response time under 200ms on p95", not "make it better"), a root cause hypothesis, and a prediction of what the measurement will show if the change works. If the baseline cannot be measured, fix observability first. If the root cause is unknown, use a diagnostic skill first. One hypothesis per change.

### 2. Do — execute the planned change, bounded
Do exactly what was planned, within the defined scope. Document what was done and what was excluded. No scope expansion because adjacent problems are visible; no mid-execution plan changes without restarting from Plan.

### 3. Check — measure actual vs prediction
Measure using the check method defined in Plan, and compare against the **prediction**, not just the prior baseline. A mismatch is information, not failure — investigate the gap: was the hypothesis wrong? Was the change implemented as planned? Were there confounding factors? If the check method was inadequate, rebuild observability before the next cycle.

### 4. Act — standardize, modify, escalate, or abandon
- **Standardize:** prediction confirmed — update the process/procedure/config and set the new state as baseline.
- **Modify:** partial or directional improvement only — adjust and run another cycle; standardize only fully-confirmed changes.
- **Escalate:** no improvement or worse — the hypothesis was wrong; broader investigation or different expertise is needed.
- **Abandon:** the approach cannot deliver within acceptable cost/risk — name what was learned and redirect.

Document the decision and reasoning regardless of outcome.

## Circuit breakers
- The baseline was never measured — fix observability first
- The prediction was never written down — restart from Plan
- Check is being skipped or summarized ("it seemed better")
- The same cycle repeats without a hypothesis update
- The scope of the planned change grew during Do

## Reference
For the `pdca-cycle.md` template, tool gating per phase, failure modes, and pairing guide, see [`references/pdca-details.md`](references/pdca-details.md).

## Rules
- **Do** write the prediction before executing the change.
- **Do** check against the prediction, not just the baseline.
- **Do** update the hypothesis before repeating a cycle.
- **Do** standardize only what the Check confirmed.
