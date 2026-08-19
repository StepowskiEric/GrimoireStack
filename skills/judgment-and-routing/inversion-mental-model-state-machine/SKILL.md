---
name: inversion-mental-model-state-machine
description: "Enforce failure-mode mapping and guardrail derivation before recommending success paths."
triggers:
  - defensive-risk-reasoning
  - failure-mode-mapping
  - guardrail-derivation
  - blind-spot-reveal
---

# Inversion

**Ask how you lose before you commit to how you win.** Instead of asking only "how do I succeed?", ask "how could this fail?" and "what would make this worse?" — then map the failure paths, rank them, and convert them into guardrails, detection, and recovery before recommending any path to success. Forward reasoning alone is not enough.

## When to Use
- Planning, launch reviews, risk analysis, system/process design
- Safety review, reliability strategy, agent guardrail design

Skip it — empirically proven harmful:
- **Debugging deterministic code bugs** — the failure-map artifact burns the tool-call budget on risk analysis instead of reading source (measured: 20 calls, unfixed bug, vs 5 calls baseline)
- **Any task with a tight tool-call budget (≤25 calls)** — the protocol needs 8–12 calls just for analysis

## The Move

### 1. Frame the goal
Define what success means operationally, not rhetorically. A goal precise enough to invert: "response time under 200ms at p95," not "improve things." Guardrails before a defined goal are noise.

### 2. Invert — enumerate the failure paths
State the opposite outcome, then list realistic ways to get there: how would this fail, how would we sabotage it unintentionally, what shortcuts create the opposite result, what hidden assumptions could collapse the plan. Cover structural, human, process, and timing failures. Generic risks don't count — name the specific paths.

### 3. Rank — decision-relevant, not longest
Rank failure paths by likelihood, severity, detectability, and reversibility. Merge duplicates, discard low-value noise. The best inversion work is the most decision-relevant ranked list, not the longest one.

### 4. Convert to guardrails
For each serious failure mode, define: **prevention** (control that stops it), **detection** (signal that reveals it starting), **containment** (limit blast radius), **recovery/rollback**. A failure mode that does not become a control is only a worry list.

### 5. Assemble the recommendation
Deliver the forward path with its defensive layer: preferred path, top inverted risks, the specific controls that make the path acceptable, and residual risks that remain. Name residual uncertainty — pretending all major risks are eliminated is the failure this skill exists to prevent.

## Reference
For the `failure-map.md` template, tool gating, the unknowns rule, and circuit breakers, see [`references/inversion-details.md`](references/inversion-details.md).

## Rules
- **Do** invert the goal concretely before recommending any success path.
- **Do** rank failure modes — equal-weight lists are risk-analysis theater.
- **Do** convert every serious failure mode into prevention, detection, containment, or recovery.
- **Do** deliver the defensive layer with the forward path.
- **Do** state residual unknowns, and recommend caution or narrower scope when unknowns and stakes are both high.
