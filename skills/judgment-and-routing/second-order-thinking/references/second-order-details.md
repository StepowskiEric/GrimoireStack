# Second-Order Thinking — Template, Traps & Pairings

## Analysis template

```md
## Proposed Action
<what is being considered>

## First-Order Effect
<immediate, direct consequence>
- Who is affected:
- What changes immediately:

## Second-Order Effects
- What does the system/environment adapt or do in response to the first-order change?
  - <effect>
- What behaviors shift?
  - <behavior>
- What incentives or feedback loops activate?
  - <loop>

## Third-Order Effects
- What do the second-order changes compound into over time?
  - <effect>
- Does the benefit hold, erode, or reverse?
  - <assessment>
- What new problems are created?
  - <problem>

## Time Horizon Assessment
- First-order effects are felt at: <timeframe>
- Second-order effects emerge at: <timeframe>
- Third-order effects emerge at: <timeframe>
- The decision is being made at what time horizon: <timeframe>

## Consequential Risks Revealed
- <risk identified by second- or third-order analysis>

## Recommendation Adjustment
<how does this analysis change the recommendation, if at all?>
```

## Common second-order traps

### Performance optimization
First: latency drops. Second: lower latency → more requests → throughput ceiling. Third: the bottleneck moves but does not disappear.

### Process improvement
First: the obvious inefficiency is removed. Second: the team adapts and volume fills the recovered capacity. Third: overloaded again at a different step.

### Technical standards adoption
First: cleaner and more consistent. Second: migration cost distributes unevenly. Third: disproportionate burden on some teams creates friction that slows adoption.

### Feature addition
First: the user request is satisfied. Second: new surface area increases maintenance burden. Third: maintenance crowds out future feature work.

## Failure modes this skill prevents

1. **First-order optimism** — recommending on the immediate benefit without tracing what happens next
2. **Time-horizon mismatch** — optimizing the short term into a long-term regression
3. **Stakeholder blindness** — modeling one stakeholder's first-order effect, missing how others adapt
4. **Feedback-loop ignorance** — ignoring how the system's own response amplifies or counteracts the change

## Pairing guide

- **Inversion** — inversion maps failure paths; second-order maps downstream consequences; use both for high stakes
- **Thinking in Systems** — a simplified systems feedback analysis; escalate when loops and delays dominate
- **Pre-Mortem** — second-order reveals risks in advance; Pre-Mortem imagines them materialized
- **Reference Class Forecasting** — identify what past projects failed to account for when estimating

## Definition of done

Applied correctly when:
- the first-order effect was identified
- the system's response to it was traced (second order)
- the third-order consequence was considered
- time horizons were explicit
- the recommendation was confirmed or adjusted based on what the analysis revealed
