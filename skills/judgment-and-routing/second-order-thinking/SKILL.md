---
name: second-order-thinking
description: "Chain consequences past first-order until the system-level outcome is clear."
triggers:
  - downstream-effects-matter
  - cascade-tracing
  - system-level-outcome
disable-model-invocation: true
---

# Second-Order Thinking

**The first consequence is what everyone sees; the second and third are where most surprises live.** Ask "and then what?" after the immediate effect — then again — until the reasoning reaches a stable outcome or a consequential risk is revealed. Most recommendations go wrong not at the obvious consequence but at the second and third-order effects: the system adapts, incentives shift, feedback loops activate, and the benefit erodes or reverses.

## When to Use
- A change affects multiple stakeholders, systems, or time horizons
- A tradeoff where the immediate benefit is clear but long-term effects are not
- Adopting a new pattern, tool, or process
- Performance improvements, architectural decisions, policy changes
- Simple-seeming requests touching a complex system

Skip it: trivial, bounded, easily reversible changes.

## The Move

### 1. Trace the first order
What is the immediate, direct consequence? Who or what is affected right now? This is the effect everyone sees — state it, then move past it.

### 2. Trace the second order
What does the system, environment, or stakeholders do *in response* to the first-order change? Which behaviors shift, incentives change, feedback loops activate, dependencies enter new states? The second order is adaptation — model it, do not assume the system stays still.

### 3. Trace the third order
What do the second-order changes compound into over time? Does the benefit hold, erode, or reverse? What new problems are created? Is the system less stable than before? Keep chaining until the outcome is stable or a consequential risk is visible.

### 4. Check the time horizons
At what horizon does each order become material — and is the decision being made at the right one? A short-term gain that produces a long-term regression is a time-horizon mismatch, the classic second-order failure.

### 5. Adjust the recommendation
If the analysis revealed a material risk, revise the recommendation. Do not use the analysis as a reason to never act — and do not add implausible hypothetical third-order effects: "this is possible" is not "this is likely."

## Reference
For the analysis template, common second-order traps (performance, process, standards, features), failure modes, and pairing guide, see [`references/second-order-details.md`](references/second-order-details.md).

## Rules
- **Do** ask "and then what?" at least twice after every first-order effect.
- **Do** trace effects through affected systems and stakeholders — not just the direct target.
- **Do** check whether the benefit holds, erodes, or reverses across time horizons.
- **Do** revise the recommendation when the analysis reveals a material risk.
- **Do** keep third-order speculation plausible — possibility is not likelihood.
