---
name: reference-class-forecasting
description: "Anchor to similar past projects before reasoning from the specifics."
triggers:
  - timeline-estimation
  - success-probability
  - outside-view-before-inside
  - optimism-bias-risk
---

# Reference Class Forecasting

**Anchor to the base rate before reasoning from your plan.** The inside view — estimating from your specific task, imagining it going well — is systematically overoptimistic, especially for complex, novel, or long-horizon work. The outside view — what similar past projects actually achieved — is almost always more accurate. Your plan looks clean because you imagined the happy path; the reference class contains all the projects that looked just as clean and still took three times as long.

## When to Use
- Estimating duration, effort, or cost for any non-trivial task
- Predicting probability of success, on-time delivery, or adoption
- Making stakeholder commitments based on a plan
- Reviewing estimates built only from the inside view

Skip it: genuinely novel tasks with no comparable reference class (state the uncertainty explicitly instead), or trivially small tasks.

## The Move

### 1. Identify the reference class
Name the category of work this belongs to — specific enough to be useful, broad enough to have examples: "backend service migrations," "new auth integrations," "data pipeline refactors touching more than three stages."

### 2. Gather base rates
From the reference class, get the distribution, not just the average: typical duration/cost/success rate, p90, what percentage delivered on the initial estimate, what percentage overran by 2x or 3x, and what caused the overruns. Sources: historical records, post-mortems, team knowledge, DORA metrics, public research.

### 3. Anchor at the base rate
Anchor at the reference-class median or p75 — not the best case. For most complex software tasks this lands well above the initial inside-view estimate.

### 4. Apply inside-view adjustments — small and evidence-based
Now consider whether specific factors justify moving off the base rate: significantly simpler than typical (down), more novel or complex (up), known overrun risks present (up), team with deep experience in exactly this class (down modestly). A clean plan is not evidence of a faster outcome; the inside view created the original estimate and must not dominate the adjustment.

### 5. State the estimate as a range
"Based on reference class: 3–5 weeks, with 90% of similar tasks landing in this range. Adjusted for this situation: 4–6 weeks, because [specific factor]." Name the key risk that pushes to the high end and the assumption that must hold for the low end.

## Reference
For the full template, common reference-class data points, failure modes, and pairing guide, see [`references/forecasting-details.md`](references/forecasting-details.md).

## Rules
- **Do** establish the reference class before applying inside-view reasoning.
- **Do** anchor to the base rate, not the happy path.
- **Do** present estimates as ranges with explicit uncertainty.
- **Do** name the risk that drives the high end and the assumption behind the low end.
- **Do** adjust with evidence — a clean plan beats the base rate only when the evidence says so.
