---
name: how-to-solve-it-state-machine
description: "Frame the problem, gather evidence, explore via hypothesis, plan, reflect. Designed to prevent premature coding."
triggers:
  - hard-problem-under-uncertainty
  - premature-coding-risk
  - problem-framing-gate
disable-model-invocation: true
---

# How to Solve It

**Frame before you act, evidence before you write.** Solving a hard problem under uncertainty means enforcing the sequence: precise problem framing, read-only evidence gathering, hypothesis-driven exploration, a bounded plan, and reflection before closure. The protocol exists to prevent premature coding — the most expensive failure mode in engineering.

## The Move

### 1. Frame the problem
Convert the vague task into a precise statement in `problem-frame.md` (template in Reference): problem, expected vs observed behavior, known facts, unknowns, constraints, candidate hypotheses, and the cheapest evidence-rich next steps. A problem that cannot be stated precisely cannot be solved deliberately.

### 2. Recon — read-only evidence
Gather evidence before editing: grep/search/find, read files and docs, inspect tests, run non-destructive checks. Log every command and what it learned in `evidence-log.md`. No code modification, no config changes, no implementation drafts masquerading as recon — keep repo-modifying write permissions disabled until this state exits.

**Sub-technique — find an analog (Polya):** before declaring recon complete, ask whether a related problem was already solved in a different domain. Four questions: (1) Can you find a related problem with similar structure? (2) What is the structural mapping — what corresponds to what? (3) What transfers and what does not — if more does not transfer than transfers, drop it? (4) How must the transferred solution be adapted? Record a strong analog as a candidate approach — recon only, no commitment yet.

### 3. Rank hypotheses & plan
Rank explanations or solution paths by evidence. Distinguish fact from guess; keep alternatives alive until evidence narrows them; reject first-answer lock-in. Then write the bounded plan: objective, why this step follows from the evidence, what would falsify it, what counts as success, and whether the action is reversible.

### 4. Execute — bounded, justified
Act only on what the evidence and plan justify. No broad speculative edits, no unbounded trial-and-error. If the task touches a shared interface, the plan must include known consumers, unknown consumers, the search method used, and blast-radius confidence — or declare the blast radius unknown.

### 5. Look back — reflect before closure
Which hypothesis was right? What assumption was wrong? What evidence mattered most? What guardrail, test, or process should be added next time? Record the reflection concisely — closing without learning is how the same bug gets solved twice.

## Reference
For the `problem-frame.md` and `evidence-log.md` templates, tool gating, and circuit breakers, see [`references/solve-it-details.md`](references/solve-it-details.md).

## Rules
- **Do** frame the problem before any action — the frame is the gate.
- **Do** gather evidence read-only before writing code.
- **Do** keep alternatives alive until evidence narrows them.
- **Do** make every plan step state what would falsify it.
- **Do** reflect before closure — the lesson is the deliverable.
