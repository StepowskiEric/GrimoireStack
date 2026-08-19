---
name: step-level-verification-protocol
description: "Verify each step before proceeding so a wrong step doesn't cascade into a chain of unjustified conclusions."
triggers:
  - multi-step-reasoning
  - cascading-error-risk
  - long-reasoning-chain
  - step-checkpoints
---

# Step-Level Verification Protocol

**A wrong step cascades.** In multi-step reasoning, one unverified step compounds into a chain of unjustified conclusions — each later step built on the error looks plausible because it follows from the previous one. Verify every step before proceeding: draft one atomic step, check it, commit or backtrack, and never let a failure ride forward.

## When to Use
- Multi-step problems where errors compound
- Long reasoning chains (>3 steps)
- Accuracy matters more than speed
- Previous attempts produced cascading errors
- The task has clear intermediate checkpoints

## The Move

### 1. Plan — set the verification contract
Define what makes a step "correct," choose the verification method (self-check / consistency check / external validation), and set the limits: max backtracks (default 3) and a step budget. Write the plan as a `verification_plan` so the criteria exist before the first step.

### 2. Draft — one atomic step
Generate only the next step from the current state. It must be **atomic** (one logical operation), **verifiable** (checkable for correctness), and **necessary** (directly advances toward the solution). Never draft multiple steps ahead — the point is to check each link before building on it.

### 3. Verify — against the plan
Apply the chosen method. For self-check, ask four questions per step:
1. Does it follow logically from previous steps?
2. Does it advance toward the goal?
3. What assumptions does it contain that are not yet justified?
4. Are there logical flaws?

Verdict: **PASS** (confidence ≥ 0.8, no critical issues) or **FAIL** (confidence < 0.8 or critical issues found).

### 4. Commit or backtrack
- **PASS** → add the step to the verified list, update state, increment the counter, log confidence.
- **FAIL** → choose: **revise** the step (minor fix), **backtrack** to the previous step (assumption was wrong), or **restart** from the beginning (fundamental misunderstanding). Log the failure reason. When the backtrack counter exceeds the max, escalate to a human or abort.

### 5. Complete — assemble with traceability
When the state satisfies the goal and all constraints, assemble the verified steps into the final output with confidence scores and a verification summary — including any backtracks that occurred. The log is the deliverable's evidence.

## Reference
For the prompt templates per state, the verification checklist (soundness, grounding, assumptions, scope, consistency, completeness, redundancy), pitfalls, and research basis, see [`references/verification-checklist.md`](references/verification-checklist.md).

## Rules
- **Do** write the verification criteria before the first step.
- **Do** draft one atomic step at a time — multi-step drafting defeats the protocol.
- **Do** verify every step, including "obvious" ones — obvious errors are still errors.
- **Do** keep confidence scores conservative; inflation hides weak links.
- **Do** cap backtracks — an infinite repair loop is its own failure.
