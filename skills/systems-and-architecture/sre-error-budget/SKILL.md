---
name: sre-error-budget
description: "SLOs, error budgets, toil budgets, and change-velocity governance. Spend the budget on speed when healthy; freeze changes when depleted."
triggers:
  - reliability-vs-velocity
  - error-budget-policy
  - change-freeze-decision
  - slo-design
---

# SRE / Error Budget Thinking

**Reliability is not a vague goal — it is a target with a budget.** Every service has an appropriate reliability target; when it is above target, the remaining margin (the **error budget**) is spent on velocity — features, experiments, deployments. When the budget is depleted, changes stop until reliability is restored. This converts "should we release?" from a judgment call into a data-driven policy.

## When to Use
- Recommending whether to accelerate or slow deployments for a service
- Evaluating whether an incident warrants a change freeze
- Designing or reviewing SLO commitments
- Advising on the right reliability target for a service
- Reasoning about on-call load, toil, and operational sustainability

Skip it: systems without meaningful reliability requirements, feature-correctness problems, greenfield designs where targets are not yet defined.

## The Move

### 1. Define the SLI
Pick the specific measurable signal that reflects whether users get what they need: availability (% 2xx), latency (p95 < threshold), error rate, or throughput relative to demand. Ask: is it measurable with current instrumentation? An unmeasurable SLI is not an SLI.

### 2. Set the SLO — at user need, not convention
Target value over a rolling window (e.g., 99.9% availability over 30 days). Too high (99.999%) creates brittleness and slows change; too low (90%) lets users suffer. Anchor it to what would make users notice, complain, or leave — not to "what everyone does." SLO is the internal engineering target; the SLA is the contractual one — do not confuse them.

### 3. Calculate the error budget
The allowed unreliability in the window: a 99.9% SLO over 30 days = 43.2 minutes of allowed downtime (0.1% × 43,200 minutes). The budget is the release gate.

### 4. Apply the policy by budget status
- **Healthy** (>50% remaining) — normal or accelerated release cadence, experiments allowed
- **At risk** (10–50% remaining) — reduced cadence, only high-value changes, reliability review before each deployment
- **Depleted** (<10% remaining or SLO missed) — freeze non-critical changes, no experiments, shift effort to reliability: incident review, root-cause address, postmortem

A depleted budget is a hard gate — recommending changes past it without acknowledging the violation is the failure mode.

### 5. Assess toil
Toil is manual, repetitive, automatable, tactical work — the enemy of sustainability; SRE targets keep it below 50% of engineer time. Identify the top toil sources and automation targets. Recurring on-call toil is a defect in system design, not a normal condition.

## Reference
For the SLO design checklist, the error-budget policy template, anti-patterns with fixes, and pairing guide, see [`references/sre-details.md`](references/sre-details.md).

## Rules
- **Do** check the current budget status before recommending any non-trivial deployment.
- **Do** treat a depleted budget as a hard gate on new deployments.
- **Do** set the SLO where users actually need it — not lower, not higher.
- **Do** enforce the policy once written — a documented but ignored budget governs nothing.
- **Do** include toil in any operational-sustainability recommendation.
