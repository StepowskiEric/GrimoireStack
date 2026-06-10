# Skill: Second-Order Thinking for AI Agents

## Purpose

Use this skill when the agent needs to reason past the immediate, obvious consequence of an action and consider what happens next.

Second-order thinking means:
- after identifying the first-order effect, asking "and then what?"
- after that, asking "and then what?" again
- continuing until the reasoning reaches a stable outcome or a consequential risk is revealed

This skill prevents the agent from stopping at the obvious consequence and producing a recommendation that is correct for the moment but wrong for the system.

Sources: Howard Marks' *The Most Important Thing*, Charlie Munger's latticework of mental models, systems dynamics literature.

---

## Core Rule

The first-order effect is usually obvious.
The second and third-order effects are where most recommendations go wrong.

Do not stop at the first consequence.

---

## When to Use

Use this skill when:
- recommending a change that affects multiple stakeholders, systems, or time horizons
- evaluating a tradeoff where the immediate benefit is clear but long-term effects are not
- deciding whether to adopt a new pattern, tool, or process
- analyzing a performance improvement, architectural decision, or policy change
- reviewing a plan where the obvious path may produce unintended downstream effects
- the request seems simple but involves a complex system

Do not use this as the primary reasoning mode for trivial, bounded, easily reversible changes.

---

## The Core Framework

### Order 1: Immediate and obvious effect
What happens directly and predictably as a result of this action?
This is the consequence most people see.

### Order 2: What happens as a result of the first-order effect?
The system, stakeholders, or environment now adapt to the first-order change.
What do they do?
What behaviors, incentives, or states shift?

### Order 3: What happens as a result of the second-order effects?
The adaptations from order 2 produce their own consequences.
Do they compound the benefit, erode it, or produce a new problem?

---

## Second-Order Thinking Questions

For each proposed action, work through:

**First order:**
- What is the immediate, direct consequence?
- Who or what is affected right now?

**Second order:**
- What does the system, environment, or stakeholder do in response to the first-order change?
- What behaviors shift?
- What incentives change?
- What feedback loops activate?
- What dependencies are now in a new state?

**Third order:**
- What do the second-order changes produce over time?
- Does the benefit compound or erode?
- Has a new problem been created?
- Is the system now in a less stable state than before?

**Time horizon check:**
- At what time horizon does the second-order effect become material?
- At what time horizon does the third-order effect arrive?
- Is the decision being made at the right time horizon?

---

## Second-Order Analysis Template

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

---

## Agent Rules

### Do
- ask "and then what?" at least twice after every first-order effect
- trace the second-order effect through affected systems and stakeholders
- check whether the benefit holds, erodes, or reverses across time horizons
- revise the recommendation if second-order analysis reveals a material risk

### Do Not
- stop at the obvious consequence and call the analysis complete
- treat second-order analysis as a reason to never act (analysis paralysis)
- add hypothetical third-order effects that are implausible in the real context
- confuse "this is possible" with "this is likely"

---

## Common Second-Order Traps

### Performance optimization
First order: latency drops.
Second order: lower latency → more requests → throughput ceiling hit.
Third order: the bottleneck moves but does not disappear.

### Process improvement
First order: the obvious inefficiency is removed.
Second order: team adapts, volume increases to fill the recovered capacity.
Third order: the team is now overloaded again at a different step.

### Technical standards adoption
First order: new standard is cleaner and more consistent.
Second order: migration cost distributes unevenly across teams.
Third order: some teams carry a disproportionate burden, creating political friction that slows adoption.

### Feature addition
First order: user request is satisfied.
Second order: new surface area increases maintenance burden.
Third order: maintenance burden crowds out future feature work.

---

## Failure Modes This Skill Prevents

### 1) First-order optimism
The agent sees the immediate benefit and recommends the action without tracing what happens next.

### 2) Time-horizon mismatch
The agent is optimizing for the wrong time horizon — a short-term gain that produces a long-term regression.

### 3) Stakeholder blindness
The agent models the first-order effect on one stakeholder but misses how other stakeholders adapt.

### 4) Feedback loop ignorance
The agent ignores how the system's own response to a change amplifies or counteracts the initial effect.

---

## Pairing Guide

- **Inversion** — inversion maps failure paths; second-order thinking maps downstream consequences; use both for high-stakes decisions
- **Thinking in Systems** — second-order thinking is a simplified version of systems feedback analysis; escalate to Thinking in Systems when loops and delays dominate
- **Pre-Mortem** — second-order analysis reveals risks in advance; Pre-Mortem imagines those risks having already materialized
- **Reference Class Forecasting** — use second-order thinking to identify what past projects failed to account for when estimating

---

## Definition of Done

Second-order thinking was applied correctly when:
- the first-order effect was identified
- the system's response to the first-order effect was traced (second order)
- the third-order consequence was considered
- time horizons were explicit
- the recommendation was either confirmed or adjusted based on what the analysis revealed

---

## Final Instruction

The first consequence is what everyone sees.
The second and third consequences are where most surprises live.

Ask "and then what?" until the answer is stable or the risk is visible.
