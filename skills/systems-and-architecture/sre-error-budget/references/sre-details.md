# SRE / Error Budget — Checklist, Template & Anti-Patterns

## SLO design checklist

A well-designed SLO:
- is based on what users actually experience, not internal system metrics alone
- is measurable with current or achievable instrumentation
- is set at the right level — not aspirationally high, not acceptably low
- has a defined time window (30 days rolling is common)
- has a defined error budget that acts as a release gate
- is reviewed regularly and adjusted when user needs or system capabilities change

## Error budget policy template

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

## Common anti-patterns (with fixes)

### No SLO defined
"The service should be reliable" — no target, no budget to govern velocity. Fix: define a concrete SLO before making reliability-vs-velocity decisions.

### SLO set by convention rather than user need
"We set 99.9% because that's what everyone does." Fix: anchor the SLO to what would cause users to notice, complain, or leave.

### Error budget not enforced
Deployments continue regardless of budget state. Fix: follow the policy, not just document it.

### Toil as operational normal
On-call dominated by manual remediation that never gets automated. Fix: treat recurring toil as a defect in system design, not a normal condition.

## Failure modes this skill prevents

- Deploying into a fragile service without acknowledging the reliability risk
- Over-engineering reliability beyond what users require (at the cost of velocity)
- Under-engineering reliability in ways that create user harm without visibility
- Treating "the service is down" as an exception rather than a measurable, policy-governed event
- Burning out on-call engineers with unsustainable toil

## Pairing guide

- **Release It! Stability Patterns** — implements the patterns that make SLOs achievable; SRE governs the targets and change policy
- **Accelerate** — measures delivery performance (lead time, deploy frequency, MTTR); SRE measures and governs reliability; complementary
- **Theory of Constraints** — depleted budget: find what causes the most reliability failures (the constraint) before fixing everything
- **ETTO** — calibrate how much reliability investigation each deployment decision warrants

## Definition of done

Applied correctly when:
- the SLI is defined and measurable
- the SLO is set at the right level for user need
- the error budget is calculated and its current status is known
- a policy governs release decisions based on budget status
- toil sources are identified with automation targets
- the reliability-vs-velocity tradeoff is explicit and governed, not implicit and conflict-driven
