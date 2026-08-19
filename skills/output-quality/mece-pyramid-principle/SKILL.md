---
name: mece-pyramid-principle
description: "Enforce mutually exclusive, collectively exhaustive categories under a single governing thought."
triggers:
  - complex-output-structuring
  - completeness-and-non-redundancy
  - recommendation-memo
  - analysis-organization
---

# MECE / Pyramid Principle

**Start with the answer, then support it — nothing missing, nothing overlapping.** MECE (Mutually Exclusive, Collectively Exhaustive) guarantees complete, non-redundant structure; the Pyramid Principle orders it: the governing thought at the top, supporting arguments below, evidence at the base. The reader finds what matters without wading through overlap — and the hierarchy reveals the logic.

## When to Use
- Plans, strategy memos, architecture decision records, recommendations
- Analyses covering multiple dimensions (performance, security, cost, maintainability)
- Complex questions where several considerations apply
- Reviewing generated output for redundancy or coverage gaps

Skip it: short single-point responses, casual replies, code (language conventions dictate its structure).

## The Move

### 1. State the governing thought — first, as a claim
The single most important thing the output communicates: the answer, recommendation, or core insight. A claim, not a topic — "PostgreSQL is the right choice given the consistency and scaling requirements," not "this memo addresses database choices." Patterns: Recommendation, Diagnosis, Assessment, Decision. Do not bury it after a preamble.

### 2. Build MECE supporting arguments
Level 2 arguments each support the governing thought from a distinct dimension: "Why true" (independent reasons), "How to do it" (phases), or "Problem → solution". Each argument is mutually exclusive with the others — latency is not a separate argument from performance — and collectively they fully support the thought with no missing dimension.

### 3. Ground each argument in evidence
Each piece of evidence supports exactly one Level 2 argument. Evidence relevant to multiple arguments means the arguments are not truly distinct — reassign or redraw the boundaries.

### 4. Run the MECE test
- **Mutually exclusive:** take any item — does it fit exactly one category? If it fits two naturally, the categories overlap.
- **Collectively exhaustive:** are there items in the domain that fit no category? If yes, a category is missing — add it even if the answer is "this does not apply."

### 5. Fix violations before publishing
Overlap → merge or redraw distinct dimensions. Gap → add the missing dimension. Redundant evidence → assign to exactly one argument. Everything-in-one-bucket → decompose into distinct sub-categories. Apply the test again until it passes.

## Reference
For the pyramid template, the violation catalog with fixes, governing-thought patterns, failure modes, and pairing guide, see [`references/mece-details.md`](references/mece-details.md).

## Rules
- **Do** state the governing thought first — the answer is not a surprise ending.
- **Do** make Level 2 arguments genuinely distinct — overlap is the most common violation.
- **Do** cover the full relevant space, even when the answer is "does not apply."
- **Do** assign every piece of evidence to exactly one argument.
- **Do** run the MECE test after drafting — fix before publishing.
