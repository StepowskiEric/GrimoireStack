---
name: feynman-technique
description: "Explain from scratch in plain language and identify where the explanation breaks."
triggers:
  - understanding-verification
  - explanation-gap-hunting
  - ground-up-explanation
  - mechanism-check
---

# Feynman Technique

**If you cannot explain it simply, you do not understand it yet.** Understanding is not the ability to reproduce correct-sounding language — it is the ability to explain from the ground up, answer simple questions about it, and identify the edges where the explanation breaks. If the explanation needs jargon to avoid its gaps, the gaps exist. Find them, close them, and if they cannot be closed, say so.

## When to Use
- Generating an explanation, tutorial, or documentation and verifying the reasoning is sound
- Reviewing a generated plan, architecture, or design — did the agent understand what it produced?
- Answering a complex question
- Verifying a proposed solution at the mechanism level
- Finding the underspecified parts of a recommendation

Skip it: producing technical output (code/config) rather than explanation, expert audiences where simplification would condescend, trivial concepts.

## The Move

### 1. Write the simple explanation
Explain as if teaching someone with no background: no jargon unless defined immediately, no appeals to authority without the mechanism, no circular definitions, and explain the mechanism — not just the outcome.

### 2. Find the gaps
Hunt where the explanation: becomes vague or hand-wavy; relies on terms not themselves explained; claims something without explaining why; skips a mechanism ("and then it works"); produces a correct-sounding phrase without conveying the process. Each gap is an incomplete understanding. Common patterns: circular definitions, mechanism skips, jargon placeholders, correct-but-shallow statements.

### 3. Close the gaps
For each gap, go back to the source — documentation, code, reasoning, facts — and revise the explanation to fill it. If the gap cannot be closed because the information genuinely does not exist, state that explicitly. Confident-sounding filler is not a resolution.

### 4. Simplify and test
After the gaps close, make it shorter without losing accuracy: accurate without being incomplete, specific without jargon-density, clear to a smart non-expert, honest about what is unknown.

## Reference
For the Feynman template, the common gap patterns with examples, using the technique on your own outputs, the compression-as-understanding variant with its measurable ≥80% reconstruction target, and pairing guide, see [`references/feynman-details.md`](references/feynman-details.md).

## Rules
- **Do** explain the mechanism, not just the outcome.
- **Do** hunt for vague language and unexamined jargon — that is where understanding ends.
- **Do** close gaps with evidence; state unknowns explicitly when they cannot be closed.
- **Do** apply the technique to your own outputs — fluent text is not evidence of understanding.
- **Do** simplify until clear, not clever.
