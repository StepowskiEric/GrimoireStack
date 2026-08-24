---
name: first-principles
description: "Decompose to axiomatic foundations and reason upward from what must be true."
triggers:
  - conventional-solutions-failing
  - inherited-framing
  - ground-up-reasoning
  - received-wisdom-risk
disable-model-invocation: true
---

# First Principles Thinking

**Strip to what must be true, then build from there.** Do not inherit the problem as stated, do not inherit the constraints of prior solutions, do not inherit the vocabulary of the requester's framing. Decompose to the real foundations — what must actually be true — and reason upward. This prevents optimizing inside a bad framing, accepting a pattern because it is familiar, and treating soft constraints as physical laws.

## When to Use
- Every option has been "tried" and the problem feels intractable
- The solution space seems narrow and none of the options are good
- The framing is being imported unchanged from a prior context
- Reasoning by "this is how we do it" instead of "this is why we do it this way"
- You suspect the design itself is the problem, not its optimization
- Conventional approaches failed and their assumptions need questioning

Skip it: well-understood problems where the standard approach is correct, speed-critical work, incremental improvement within a known-good framework (use Toyota Kata / PDCA).

## The Move

### 1. Strip the goal of method assumptions
Not "add a caching layer" but "reduce response latency under load." Not "fix the bug" but "ensure this behavior is reliably correct." The goal as stated often smuggles in the solution's constraints.

### 2. Separate what we know from what we inherited
Classify into: established facts (measured, observed, proven), strong inferences (well-supported but unobserved), inherited assumptions (believed because it has always been done this way), and requirements from first principles (what must be true for the goal). Name each item's class explicitly.

### 3. Classify the constraints
- **Hard** — physical, mathematical, regulatory; truly non-negotiable
- **Soft** — organizational, conventional, historical; can be questioned
- **Assumed** — believed hard but never actually tested

For every assumed constraint, ask: has this been tested, or is it inherited? "We need a separate service for this," "we need a database for this," "this must be real-time," "this will take six weeks" — each is a candidate assumed constraint.

### 4. Build from the foundations up
Start from the real constraints and build upward — do not start from the existing solution and subtract. If the prior solution did not exist, what would emerge from what must be true?

### 5. Compare to the conventional approach
Where do they differ? Which differences come from legitimate constraints vs inherited assumptions? Is the conventional solution leaving value on the table — or is the first-principles solution just unfamiliar? Recommend: proceed with the first-principles approach, validate the conventional one as already optimal, or hybrid.

## Reference
For the analysis template, common inherited assumptions per domain (architecture, product, planning, debugging), failure modes, and pairing guide, see [`references/first-principles-details.md`](references/first-principles-details.md).

## Rules
- **Do** separate facts from inherited assumptions explicitly — the separation is the work.
- **Do** question every constraint that has never been tested.
- **Do** build from verified foundations up, not from the existing solution down.
- **Do** compare the first-principles result to the conventional one before recommending.
- **Do** name which constraints are genuinely hard and which are soft — do not mistake familiarity for correctness.
