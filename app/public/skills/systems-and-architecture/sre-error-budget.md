# Skill: SRE / Error Budget Thinking for AI Agents

## Purpose

Use this skill when the agent must reason about the tradeoff between reliability and the velocity of change — and make that tradeoff explicit, evidence-based, and governed.

This skill is based on Google's *Site Reliability Engineering* book and the concept of Service Level Objectives (SLOs) and error budgets.

The core insight: reliability is not free and it is not infinite. Every service has an appropriate reliability target. When the service is above target, the remaining margin (the "error budget") should be spent on velocity — new features, experiments, deployments. When the service is below target, the budget is gone and changes should stop until reliability is restored.

This converts the eternal tension between "ship faster" and "keep it stable" into an explicit, measurable, governable policy.

---

## Core Rule

Reliability is not a vague goal.
It is a target with a budget.

When the budget is healthy, spend it on velocity.
When the budget is depleted, stop spending and repair.

---

## When to Use

Use this skill when:
- recommending whether to accelerate or slow down deployments for a service
- evaluating whether an incident response warrants a change freeze
- designing or reviewing SLO commitments for a new or existing service
- advising on the right reliability target for a service given its user and business context
- reasoning about on-call load, toil, and operational sustainability
- making the reliability-vs-velocity tradeoff explicit rather than leaving it implicit

Do not use when:
- the system has no meaningful reliability requirements
- the problem is about feature correctness rather than operational reliability
- the task is a greenfield design where reliability targets have not yet been defined

---

## Key Concepts

### Service Level Indicator (SLI)
A specific, measurable signal of service health.

Common SLIs:
- **Availability**: percentage of requests that succeed (200-class response vs. 5xx)
- **Latency**: percentage of requests served within a threshold (e.g., p95 < 200ms)
- **Error rate**: percentage of requests that return an error
- **Throughput**: requests served per second relative to demand

Questions:
- What is the SLI that best reflects whether users are getting what they need from this service?
- Is it measurable with current instrumentation?

### Service Level Objective (SLO)
The target value for an SLI, over a rolling time window.

Examples:
- 99.9% availability over 30 days
- p95 latency < 200ms, 99% of the time over 30 days

The SLO is not a contract with users — that is the SLA.
The SLO is an internal engineering target.

Setting the SLO:
- **Too high (e.g., 99.999%)**: unreachable in practice; creates brittleness and slows changes
- **Too low (e.g., 90%)**: allows too much degradation; users suffer
- **Right level**: matches what users actually need, accounts for what the system can realistically achieve, and leaves room for improvement

Questions:
- What SLO would a typical user find acceptable vs. frustrating?
- What SLO is actually achievable given current infrastructure and failure rates?

### Error Budget
The allowed unreliability within the SLO window.

A 99.9% availability SLO over 30 days means:
- 30 days × 24 hours × 60 minutes = 43,200 minutes
- 0.1% error budget = 43.2 minutes of allowed downtime per month

Error budget as a policy:
- **Budget is healthy**: the service is above target. Spend the remaining budget on velocity — releases, experiments, migrations.
- **Budget is at risk**: the service is approaching the target. Increase caution, slow non-critical releases, investigate the reliability trend.
- **Budget is depleted**: the service is below target. Freeze non-critical releases. Shift engineering effort to reliability improvement.

This converts "should we release?" from a judgment call into a data-driven policy.

### Toil
Operational work that is:
- manual
- repetitive
- automatable
- tactical rather than strategic

Toil is the enemy of SRE sustainability.
As toil grows, engineering time is consumed by firefighting instead of improvement.
SRE teams target keeping toil below 50% of engineer time.

Questions:
- What is the toil load on the team responsible for this service?
- What toil could be automated?
- Is the on-call load sustainable?

---

## SLO Design Checklist

A well-designed SLO:
- is based on what users actually experience, not internal system metrics alone
- is measurable with current or achievable instrumentation
- is set at the right level — not aspirationally high, not acceptably low
- has a defined time window (30 days rolling is common)
- has a defined error budget that acts as a release gate
- is reviewed regularly and adjusted when user needs or system capabilities change

---

## Error Budget Policy Template

```md
## Service
<name>

## SLI
<what is measured: availability / latency / error rate / other>
<measurement definition: e.g., "percentage of HTTP requests returning 2xx, measured by load balancer, rolling 30 days">

## SLO Target
<e.g., 99.9% availability over 30 days>

## Error Budget
<e.g., 43.2 minutes of allowed downtime per 30-day window>

## Current Status
- Current SLI measurement: <value>
- Budget consumed this window: <minutes / percentage>
- Budget status: healthy / at risk / depleted

## Policy
### If budget is healthy (> 50% remaining)
- Release cadence: <normal / accelerated>
- Experiment permission: <yes>
- Risk tolerance: <standard>

### If budget is at risk (10–50% remaining)
- Release cadence: <reduced — only high-value changes>
- Experiment permission: <restricted>
- Risk tolerance: <elevated caution>
- Required: reliability review before each deployment

### If budget is depleted (< 10% remaining or SLO missed)
- Release cadence: <freeze non-critical changes>
- Experiment permission: <no>
- Risk tolerance: <reliability-only work>
- Required: incident review, root cause address, postmortem if applicable

## Toil Assessment
- Current toil level: <percentage of on-call time on toil>
- Top toil sources:
  - <source>
- Automation targets:
  - <what should be automated>

## Review Cadence
<how often this SLO and error budget are reviewed>
```

---

## Agent Rules

### Do
- ask what the current error budget status is before recommending any non-trivial deployment
- treat a depleted error budget as a hard gate on new deployments
- distinguish between acceptable reliability (matching user needs) and perfectionist reliability (higher than needed, consuming velocity)
- include toil assessment when advising on operational sustainability

### Do Not
- recommend changes when the error budget is depleted without acknowledging the policy violation
- set SLOs at 99.999% without evidence that users need and the system can achieve it
- confuse SLO (internal target) with SLA (contractual commitment)
- ignore toil as a driver of reliability failure over time

---

## Common SRE Anti-Patterns

### No SLO defined
"The service should be reliable" — with no specific target, there is no budget to govern change velocity.

Fix: define a concrete SLO before making reliability-vs-velocity tradeoff decisions.

### SLO set by convention rather than user need
"We set 99.9% because that's what everyone does."

Fix: anchor the SLO to what would actually cause users to notice, complain, or leave.

### Error budget not enforced
The error budget exists but deployments continue regardless of its state.

Fix: the error budget policy must be followed, not just documented.

### Toil as operational normal
The on-call rotation is dominated by manual remediation that never gets automated.

Fix: treat recurring on-call toil as a defect in the system design, not a normal operational condition.

---

## Failure Modes This Skill Prevents

- deploying into a fragile service without acknowledging the reliability risk
- over-engineering reliability beyond what users require (at the cost of velocity)
- under-engineering reliability in ways that create user harm without visibility
- treating "the service is down" as an exception rather than a measurable, policy-governed event
- burning out on-call engineers with unsustainable toil

---

## Pairing Guide

- **Release It! Stability Patterns** — Release It! implements the patterns that make SLOs achievable; SRE governs the targets and the change policy
- **Accelerate** — Accelerate measures delivery performance (lead time, deploy frequency, MTTR); SRE measures and governs reliability; they complement each other
- **Theory of Constraints** — if the error budget is depleted, use Theory of Constraints to identify what is causing the most reliability failures (the constraint) before fixing everything at once
- **ETTO** — use ETTO to calibrate how much reliability investigation is warranted before each deployment decision

---

## Definition of Done

This skill was applied correctly when:
- the SLI is defined and measurable
- the SLO is set at the right level for user need
- the error budget is calculated and its current status is known
- a policy governs release decisions based on budget status
- toil sources are identified with automation targets
- the reliability-vs-velocity tradeoff is explicit and governed rather than implicit and conflict-driven

---

## Final Instruction

Reliability is not a vague aspiration.
It is a target with a budget.

Spend the budget on velocity when it is healthy.
Repair the system when the budget is gone.
Set the target where users actually need it — not lower, not higher.
