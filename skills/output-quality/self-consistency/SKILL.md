---
name: self-consistency
description: "Generate independent reasoning paths and check whether they converge."
triggers:
  - conclusion-confirmation
  - reasoning-reliability
  - multi-path-convergence
disable-model-invocation: true
---

# Self-Consistency Check

**One fluent chain of thought is not enough.** An error at any step of a single reasoning chain propagates forward invisibly, producing a confident-looking wrong answer. Generate multiple genuinely independent reasoning paths to the same conclusion and check convergence: agreement justifies confidence; divergence reveals exactly where the reasoning is fragile — and must be investigated before committing.

## When to Use
- The answer depends on a chain of reasoning that could go wrong at any step
- A confident-sounding conclusion on a complex topic
- High-stakes decisions where correctness beats speed
- Quantitative estimates, logical deductions, or multi-step analyses to verify
- The first path was fast and fluent — a possible overconfidence signal

Skip it: creative tasks with no unique answer, simple facts verifiable directly, speed-constrained tasks where one strong pass suffices.

## The Move

### 1. Generate independent paths
Two or more genuinely independent reasoning chains (three for high-stakes): different decompositions, different approaches, different ordering of considerations. Paraphrases do not count — same path, different phrasing, is one path.

### 2. Extract each conclusion
What does each path conclude? Record the conclusion per path before comparing.

### 3. Check convergence
- **Full convergence** — all paths agree; confidence justified
- **Partial convergence** — most agree, one diverges; use the majority while investigating why
- **Divergence** — meaningfully different conclusions; the reasoning is uncertain

### 4. Investigate divergence points
Where exactly do the paths split — initial interpretation, a specific intermediate step, or the weighting of competing considerations? That point is the most uncertain part of the reasoning.

### 5. Resolve or acknowledge
Resolve each divergence with evidence or further analysis if possible; otherwise name the uncertainty explicitly in the output. State confidence from convergence, not from fluency.

## Reference
For the self-consistency template, the false-convergence check (correlated assumptions produce fake agreement), failure modes, and pairing guide, see [`references/consistency-details.md`](references/consistency-details.md).

## Rules
- **Do** generate genuinely independent paths — different approaches, not different phrasings.
- **Do** investigate divergence instead of ignoring it.
- **Do** base confidence on convergence, never on how fluent the reasoning sounds.
- **Do** check for false convergence — the same implicit assumption in every path is one path wearing disguises.
- **Do** commit only to a conclusion that survives the comparison.
