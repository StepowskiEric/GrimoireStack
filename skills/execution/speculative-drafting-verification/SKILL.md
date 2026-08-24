---
name: speculative-drafting-verification
description: "Generate multiple solution branches in parallel, verify each against hard constraints, select the best."
triggers:
  - solution-exploration
  - local-optima-escape
  - parallel-drafting
  - constraint-verification
disable-model-invocation: true
---

# Speculative Drafting with Verification

**Don't converge on the first viable solution.** Like speculative decoding in LLMs, this protocol drafts multiple candidate branches in parallel, verifies each against hard constraints, and selects the best.

## The Move

### 1. Branch
Analyze the problem and identify **N** (default: 3) qualitatively different solution approaches.

### 2. Draft
Generate a complete solution draft for each approach. Don't worry about perfection — we'll verify and refine later.

### 3. Verify
Check each candidate against your criteria (e.g., constraints, efficiency, robustness). Discard unacceptable candidates.

### 4. Score & Select
Rank the verified candidates. If the top score meets the threshold, **Commit**. If not, **Refine** the best candidate or **Reject** and restart with new branches.

## Reference
- [`references/speculative-drafting-details.md`](references/speculative-drafting-details.md) — full state machine, scoring formulas, prompt templates, and pitfalls.
- [`references/verification-checklist.md`](references/verification-checklist.md) — the per-candidate checklist to run during **Verify**.

## Rules
- **Do** keep N ≤ 5 to manage complexity.
- **Do** set a time limit for the exploration phase to avoid analysis paralysis.
- **Do** score objectively — the first candidate gets no preference.
- **Do** discard candidates that clearly lose to the winner.
