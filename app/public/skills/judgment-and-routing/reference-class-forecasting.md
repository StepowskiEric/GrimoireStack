# Skill: Reference Class Forecasting for AI Agents

## Purpose

Use this skill when the agent must estimate a timeline, cost, scope, or probability of success before beginning a plan.

Reference class forecasting means: before estimating from the specifics of your plan (the "inside view"), first establish what similar past projects actually achieved (the "outside view"), and anchor your estimate there.

This skill is grounded in extensive research by Daniel Kahneman, Amos Tversky, and Bent Flyvbjerg showing that inside-view estimates are systematically overoptimistic — especially for complex, novel, or long-horizon tasks.

The inside view asks: how long will this specific project take, given what I know about it?
The outside view asks: how long do projects like this usually take?

The outside view is almost always more accurate.

Sources: Kahneman's *Thinking, Fast and Slow*, Bent Flyvbjerg's research on megaproject overruns, Philip Tetlock's *Superforecasting*.

---

## Core Rule

Anchor your estimate to a reference class before reasoning from the inside.

Do not start from the inside view.
Start from the outside view and adjust only when there is specific evidence that this situation differs from the reference class.

---

## When to Use

Use this skill when:
- estimating duration, effort, or cost for any non-trivial task
- predicting probability of success, on-time delivery, or adoption
- making commitments to stakeholders based on a plan
- reviewing estimates produced by an agent or team that worked only from the inside view
- any planning activity where optimism bias is a known risk

Do not use when:
- the task is genuinely novel with no comparable reference class (acknowledge the uncertainty explicitly instead)
- the estimate is for a trivially small task with minimal uncertainty

---

## The Inside View vs. The Outside View

### Inside View
Estimates built from the details of the specific plan:
- "This migration involves five tables and three services. Each table should take about a day. Three services × two days each. Call it eleven days."

Problems with inside view:
- relies on imagining the happy path
- underweights exceptions, dependencies, and unknown unknowns
- ignores the base rate of how these tasks actually go

### Outside View
Estimates built from the historical record of similar work:
- "Migrations involving five to ten tables across multiple services in this codebase typically take three to four weeks, accounting for coordination, testing, and rollback rehearsal."

The outside view corrects for:
- optimism about one's own plan
- scope that expands after work begins
- dependencies that take longer than expected
- validation, review, and deployment overhead that is rarely counted upfront

---

## How to Apply Reference Class Forecasting

### Step 1: Identify the reference class
What is the category of work this belongs to?
Be specific enough to be useful but broad enough to have examples:
- "backend service migrations"
- "new feature implementations involving auth"
- "data pipeline refactors touching more than three stages"
- "infrastructure provisioning tasks requiring compliance review"

### Step 2: Gather base rates
From the reference class, what is the distribution of outcomes?
- What is the typical duration / cost / success rate?
- What is the distribution (not just the average — what is p90?)?
- What percentage of similar projects delivered on the initial estimate?
- What percentage exceeded estimate by 2x? By 3x?

Sources for base rates:
- historical project records, post-mortems, or team knowledge
- public research on similar tasks (Flyvbjerg's data, DORA metrics, etc.)
- prior incidents or delivery records in the same system

### Step 3: Establish the base rate estimate
Anchor at the reference class median or p75 (not the best case).

For most complex software tasks, the base rate estimate should be anchored well above the initial inside-view estimate.

### Step 4: Apply inside-view adjustments
Now consider whether specific factors about this situation justify moving above or below the base rate:
- Is this situation significantly simpler than the typical case? (move down)
- Is this situation significantly more novel or complex? (move up)
- Are known risks present that cause overruns in the reference class? (move up)
- Is the team more experienced with exactly this class of work than typical? (move down modestly)

Rules for adjustment:
- adjustments should be small and evidence-based
- do not adjust down just because the plan looks clean
- the inside view is the reason for the original estimate; do not let it dominate the adjustment

### Step 5: State the estimate with uncertainty
Present the estimate as a range, not a point:
- "Based on reference class: 3–5 weeks, with 90% of similar tasks landing in this range."
- "Adjusted for this situation: 4–6 weeks, because [specific factor]."

---

## Reference Class Forecasting Template

```md
## Task Being Estimated
<what is being estimated>

## Inside View Estimate
<what the plan analysis suggests>

## Reference Class
<what category of work this belongs to>

## Base Rate Evidence
- Typical outcome for this reference class:
  - <range>
- What percentage of similar tasks overran the initial estimate?
  - <percentage>
- What caused overruns in the reference class?
  - <cause>

## Base Rate Estimate (anchored)
<range anchored to reference class, not inside view>

## Inside-View Adjustments
- Factors that suggest this will be faster than typical:
  - <factor> — adjusts estimate down by <amount> — evidence: <evidence>
- Factors that suggest this will be slower than typical:
  - <factor> — adjusts estimate up by <amount> — evidence: <evidence>

## Final Estimate
- Range: <low> to <high>
- Confidence: <percentage>
- Key risk that could push to the high end:
  - <risk>
- Assumption that must hold for the low end to be achievable:
  - <assumption>
```

---

## Agent Rules

### Do
- establish the reference class before applying inside-view reasoning
- anchor to the base rate, not the happy path
- present estimates as ranges with explicit uncertainty
- note the risks that would push toward the high end

### Do Not
- start from the inside view and then search for a reference class to confirm it
- use a reference class that is too broad to be informative
- treat a clean plan as evidence that this task will beat the base rate
- present a point estimate without a range when the task has material uncertainty

---

## Common Reference Class Data Points

These are indicative patterns; verify against your own context:

| Task Type | Typical Inside-View | Typical Actual Outcome |
|-----------|--------------------|-----------------------|
| Schema migration | 1–2 days | 3–10 days |
| Service extraction | 1 week | 3–6 weeks |
| New auth integration | 3 days | 2–4 weeks |
| CI/CD pipeline rewrite | 1 week | 3–8 weeks |
| Dependency upgrade (major) | 1 day | 3–10 days |
| Performance optimization project | 2 weeks | 4–12 weeks |

These numbers are illustrative. Use actual historical data from your context when available.

---

## Failure Modes This Skill Prevents

### 1) Planning fallacy
Estimating from the inside view alone consistently produces optimistic outliers.

### 2) Best-case anchoring
The estimate is built from the best-case scenario without accounting for exceptions, dependencies, and validation overhead.

### 3) Point estimate commitment
Committing to a single number rather than a range hides the real uncertainty and creates false expectations.

### 4) Scope blindness
Inside-view estimates almost always undercount the surface area of the work because they are built from what is already visible.

---

## Pairing Guide

- **Kahneman Fast/Slow** — slow mode for estimation; Reference Class Forecasting is the specific outside-view technique Kahneman recommends
- **Pre-Mortem** — after generating a reference-class estimate, use a pre-mortem to identify what specific failure modes would push this toward the high end
- **Second-Order Thinking** — second-order analysis of the plan's execution can reveal the dependencies that make the high end of the estimate realistic
- **ETTO** — use to decide how much rigor to invest in the estimation before committing

---

## Definition of Done

Reference class forecasting was applied correctly when:
- a reference class was identified before inside-view reasoning began
- base rate evidence was gathered and documented
- the estimate was anchored to the reference class, not the inside view
- inside-view adjustments were evidence-based, not optimism-based
- the final estimate was a range with explicit uncertainty
- the key risk that would drive the high end was named

---

## Final Instruction

Your plan looks clean because you imagined the happy path.
The reference class contains all the projects that looked just as clean and still took three times as long.

Anchor there first.
Adjust with evidence.
Commit to a range, not a fantasy.
