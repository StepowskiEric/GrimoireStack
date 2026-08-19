---
name: monte-carlo-tree-search
description: "Allocate search effort to branches that earn it through probes and scoring."
triggers:
  - competing-strategies
  - search-effort-allocation
  - bounded-probes
  - branch-scoring
---

# Monte Carlo Tree Search for Agents

**Let branches compete for effort.** Do not explore every branch equally, and do not commit to the first plausible one. Run cheap bounded probes — tests, tool calls, mini-patches, partial executions — score them against explicit criteria, and give more effort to the branches that earn it. This is the search-budget equivalent of Tree of Thoughts.

## When to Use
- Several plausible approaches compete for a limited reasoning budget
- A straight-line plan keeps failing and branch selection matters more than raw effort
- The task allows partial evaluation (tests, tool feedback, static analysis)
- Long-horizon work where early branch choices materially affect the outcome

Skip it: simple tasks with an obvious path, no way to score intermediate states, tiny branch counts (direct compare-and-choose is enough), or purely generative work.

## The Move

### 1. Define the root state and budget
Before branching, define: the objective, the constraints, the budgets (reasoning, tool, time, branch), and the stopping condition. The agent must know what counts as progress before allocating effort.

### 2. Branch — create genuinely different candidates
Generate a small set of distinct starting branches — e.g., for a bug: inspect data-flow first vs state-transition logic first vs add instrumentation vs attempt a local fix. Minimum two; typical three to five.

### 3. Select & expand — balance promise against exploration
Choose the next branch by **current promise** (evidence so far) balanced against **exploration value** (under-explored branches). Revisit strong branches more often; keep at least one less-explored branch alive unless it has failed hard; do not let one early good impression monopolize the search. Expand by one bounded step — inspect one file, run one targeted test, try one narrow patch. Small enough that failure is informative, not expensive.

### 4. Probe & score — the cheapest decisive test
Run the cheapest probe that reveals whether the branch is strengthening or weakening: unit test, typecheck, targeted reproduction, partial execution, static analysis. For reasoning tasks without executable tests, use a structured rubric and intermediate evidence check. Score on explicit dimensions — correctness evidence, progress, blast radius, reversibility, new risk, cost of continuing. The score need not be mathematical; it must be consistent.

### 5. Backpropagate & repeat
Update the branch and its ancestors: strong rollout → raise priority; weak or failed → lower priority, mutate, or prune if the failure is decisive. Repeat until: one branch clearly dominates on validated evidence, the rest are exhausted or inferior, the budget is spent, or it is time to switch to execution on the leader. Plain-language selection policy: prefer the strongest validated evidence; if close, prefer the less-explored; keep one exploratory alternative alive; prune only on real contradiction, unacceptable risk, or repeated non-progress.

## Reference
For the MCTS-lite node schema and template, the agent role split, coding-specific examples per domain, and failure modes, see [`references/mcts-node-schema.md`](references/mcts-node-schema.md) and [`references/mcts-details.md`](references/mcts-details.md).

## Rules
- **Do** set the budget and stop condition before branching.
- **Do** run a cheap validating probe before committing full effort to any branch.
- **Do** score with explicit evidence dimensions, not vibes.
- **Do** keep one exploratory alternative alive unless it has failed decisively.
- **Do** prune on real contradiction or repeated non-progress — not on sunk cost.
