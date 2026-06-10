# Skill: Steelmanning for AI Agents

## Purpose

Use this skill when the agent is about to commit to a recommendation and needs to genuinely test whether the opposing or alternative position is stronger than it appears.

Steelmanning means constructing the strongest possible version of the argument you are about to reject — not the weakest version, not a strawman, but the best case the other side has.

This prevents confirmation bias, overconfidence, and the failure mode of recommending something because the agent has already committed to it internally before the analysis was complete.

---

## Core Rule

Before committing to a recommendation, build the strongest case against it.

If you cannot produce a strong opposing argument, you do not fully understand the decision space.
If you can produce a strong opposing argument and still prefer your recommendation, your recommendation is now more credible.

---

## When to Use

Use this skill when:
- committing to a recommendation in a genuine tradeoff (two or more real options)
- the agent has already formed a preference and is tempted to confirm it through analysis
- a plan, architecture, or decision has significant long-term consequences
- the other side of the argument has been dismissed too quickly
- a stakeholder or user is advocating for a different approach
- review or critique is needed before finalizing output
- the agent wants to increase confidence in its own recommendation by surviving a genuine challenge

Do not use for:
- binary decisions where one option has no meaningful case
- routine operational tasks with a clear correct answer
- urgent situations where decision speed outweighs deliberation value

---

## How to Build a Steelman

### Step 1: State your current recommendation
Be explicit: what are you about to recommend, and why?

### Step 2: Identify the strongest opposing position
This is not the most common objection. It is the best version of the argument against your recommendation.
- What is the alternative?
- Who would advocate for it most intelligently?
- What is their most compelling reasoning?

### Step 3: Build the steelman
Construct the opposing argument at its strongest:
- What evidence supports the opposing position?
- What considerations does it weight more heavily?
- What failure mode of your recommendation does it best address?
- What would have to be true for the opposing position to be correct?

### Step 4: Honestly evaluate the steelman
Does the steelman reveal a genuine weakness in your recommendation?
- If yes: revise the recommendation, narrow the claim, or acknowledge the tradeoff explicitly
- If no: your recommendation has survived a genuine challenge and is more credible

### Step 5: State the residual tension
Even if you maintain your recommendation, name what the steelman is right about.
Acknowledge the tradeoff honestly rather than dismissing the opposing view.

---

## Steelmanning Template

```md
## My Current Recommendation
<what the agent is about to recommend and the primary reason>

## The Opposing Position
<what the alternative is and who would advocate for it>

## The Steelman (Strongest Case for the Opposition)
- Best evidence for the opposing position:
  - <evidence>
- Considerations it weights most heavily:
  - <consideration>
- Failure mode of my recommendation it best addresses:
  - <failure mode>
- What would have to be true for the opposing position to be correct:
  - <condition>

## Honest Evaluation
- Does the steelman reveal a genuine weakness?
  - yes / no / partially
- If yes, what changes?
  - <revision>
- If no, why does the steelman not overturn the recommendation?
  - <reasoning>

## Residual Tension
<what the opposing side is right about, even if the recommendation stands>

## Final Recommendation
<original / revised — and why>
```

---

## Agent Rules

### Do
- build the strongest version of the opposing argument, not the most convenient one
- be willing to revise the recommendation if the steelman reveals a genuine weakness
- name the residual tension honestly even when the recommendation stands
- treat steelmanning as a quality check, not an obstacle

### Do Not
- build a strawman and call it a steelman
- produce a token steelman with no genuine challenge
- use the steelman to justify the original recommendation if it revealed a real problem
- skip the steelman because the recommendation feels obvious

---

## The Strawman vs. the Steelman

A strawman is the weakest version of the opposing argument — easy to knock down.
A steelman is the strongest version — difficult to dismiss.

Examples of the difference:

**Topic: monolithic architecture vs. microservices**

Strawman for microservices: "Some teams like to have independent deployments."
Steelman for microservices: "For this specific system with N teams and distinct scaling profiles, the coordination overhead of a monolith creates a delivery bottleneck that will compound over time. The complexity of microservices is a tax paid upfront to avoid a larger tax later."

**Topic: reject a proposed refactoring**

Strawman for keeping the current code: "It works, so don't touch it."
Steelman for keeping the current code: "The refactoring touches a stable load-bearing component. The test coverage is insufficient to catch regressions with confidence. The risk of breakage outweighs the maintainability improvement given the next 90 days of planned features. The correct time to refactor is after the current delivery commitment completes."

---

## Failure Modes This Skill Prevents

### 1) Confirmation bias
The agent selects and weights evidence that supports its prior leaning and dismisses contrary evidence without engaging it.

Counter: a genuine steelman forces full engagement with the opposing evidence.

### 2) Overconfident recommendations
The agent commits to a recommendation before testing it against the strongest opposing view.

Counter: a steelman that survives challenge is more credible than one that was never tested.

### 3) Dismissing the other side
The agent acknowledges alternative positions exist but does not genuinely engage them.

Counter: steelmanning requires building the opposing case, not just naming it.

### 4) Missing the real tradeoff
The agent presents a recommendation as an obvious win when it is actually a genuine tradeoff with real costs.

Counter: the steelman surfaces what the recommendation is trading away.

---

## Pairing Guide

- **Inversion** — inversion finds failure modes; steelmanning finds the strongest alternative position; use both for high-stakes decisions
- **Six Thinking Hats** — the Black hat and Yellow hat together approximate steelmanning; use full steelmanning when a specific opposing position is present
- **Pre-Mortem** — pre-mortem tests the plan against failure scenarios; steelmanning tests the recommendation against the best alternative
- **Bayesian Updating** — after a steelman, use Bayesian thinking to update confidence in the recommendation based on how well it survived

---

## Definition of Done

Steelmanning was applied correctly when:
- the opposing position was stated at its strongest, not its weakest
- the steelman included evidence and conditions under which the opposition would be correct
- the evaluation was honest — the recommendation was revised if warranted
- the residual tension was named explicitly
- the final recommendation is more credible because it survived a genuine challenge

---

## Final Instruction

Do not knock down a strawman and call it analysis.

Build the strongest case against your recommendation.
If it survives, your recommendation is stronger.
If it does not, revise.
