---
name: tree-of-thoughts
description: "Branch, evaluate, and prune candidate solutions before committing."
triggers:
  - first-path-may-be-wrong
  - unclear-reasoning-path
  - early-commitment-risk
---

# Tree of Thoughts

**Do not follow the first plausible thread — grow the tree, prune what is weak, follow what is strong.** When the correct reasoning path is not immediately clear, generate multiple candidate branches, develop each to an intermediate checkpoint, evaluate and prune the weak ones, and pursue only what remains promising. An early wrong turn in a linear chain produces a cascade of confident-but-wrong downstream conclusions; comparison across branches before commitment prevents it.

## When to Use
- Multiple plausible solution strategies, none obviously better
- Previous passes produced correct-looking but flawed conclusions
- Sequence-of-steps problems where an early wrong turn cascades
- Large solution spaces where a single path misses good alternatives
- Correctness matters more than generation speed

Skip it: well-established simple paths, speed-critical tasks where exploration costs too much, purely generative work with no correctness criterion.

## The Move

### 1. Branch — generate candidate approaches
Before following any single path, generate 2–5 genuinely different starting approaches: different framings, different decompositions, different first moves. Token alternatives that are never developed do not count.

### 2. Develop to an intermediate checkpoint
Follow each branch a few steps — enough to judge direction, not to conclusion. The checkpoint is where the agent can assess: still plausible? making progress? dead-end signs (contradiction, invalid assumption, circular reasoning)?

### 3. Evaluate at the checkpoint
Per branch: how promising does this path look now? What quality of conclusion is it heading toward? Has it revealed a problem? Compared to the others, is it ahead, behind, or equal? Evaluate at checkpoints — not only at the end — or effort is wasted on branches prunable early.

### 4. Prune weak branches
Eliminate branches that hit a contradiction or invalid assumption, head to a clearly worse solution, or reveal a dead end. Prune with an explicit reason — and never prune because a branch is harder, only because it is weaker.

### 5. Pursue the survivors
Continue the promising branches to solution or the next checkpoint. One survivor → commit. Multiple → continue in parallel or select the strongest, and explain why it beats the alternatives.

## Reference
For the ToT template, problem types that benefit (debugging, architecture, planning), failure modes, and pairing guide, see [`references/tree-details.md`](references/tree-details.md).

## Rules
- **Do** generate at least two branches before developing any to conclusion.
- **Do** evaluate at intermediate checkpoints, not just at the end.
- **Do** prune explicitly with the reason stated.
- **Do** commit to the best survivor and say why it beats the alternatives.
- **Do** treat the tree as genuine exploration — not as justification for an answer already decided.
