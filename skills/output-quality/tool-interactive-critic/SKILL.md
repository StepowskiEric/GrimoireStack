---
name: tool-interactive-critic
description: "External tools critique the output before it is trusted."
triggers:
  - post-generation-verification
  - tool-grounded-critique
  - unverified-confidence
---

# Tool-Interactive Critic

**Draft first. Verify with the right tools. Critique from evidence. Revise only where needed.** When the agent's weakness is not generation but unverified confidence, do not trust the first output blindly: identify which parts need verification, choose tools that test the likely failure mode, let the tool output shape the critique, and revise only where the evidence says the draft is weak.

## When to Use
- Factual answers, technical explanations, plans depending on current facts
- Code changes that tests/lint/typecheck can validate
- Operational recommendations
- Any output where external verification materially improves trust

Skip it: brainstorming, highly subjective writing, trivial low-stakes tasks where verification costs more than it buys.

## The Move

### 1. Produce the initial output
The first answer, plan, patch, recommendation, or explanation — generated normally.

### 2. Identify what needs verification
Not everything deserves equal scrutiny. Targets: factual claims, current data, code correctness, API behavior, configuration assumptions, safety assumptions, dependency usage, edge cases, internal consistency. Verify the high-risk, high-value parts first.

### 3. Choose tools that match the failure mode
Web search for current facts; documentation for library/API behavior; tests/lint/typecheck for code; grep/search for codebase assumptions; calculators for numeric claims; schema inspection for data assumptions. The tool must test the likely failure mode — performative tool use verifies nothing.

### 4. Critique from tool feedback
Use the tool output to name: what is correct, what is weak, what is contradicted, what is still unverified, what needs revision. Hide nothing the tools found — a contradiction discovered is a claim saved.

### 5. Revise and stop
Revise only where the critique matters — do not rewrite everything because a tool was used. Stop when the key claims are verified, major issues corrected, remaining uncertainty is clearly stated, and another pass would have low value.

## Reference
For the critique template, invocation examples, and pairing guide, see [`references/critic-details.md`](references/critic-details.md).

## Rules
- **Do** verify the high-risk parts first — equal scrutiny is no scrutiny.
- **Do** choose tools that directly test the likely failure mode.
- **Do** let tool output shape the critique; report contradictions honestly.
- **Do** revise only where evidence supports revision.
- **Do** mark unverified parts explicitly and stop when the main risks are resolved.
