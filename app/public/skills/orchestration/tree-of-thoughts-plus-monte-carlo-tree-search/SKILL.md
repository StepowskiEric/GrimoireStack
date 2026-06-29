---
name: tree-of-thoughts-plus-monte-carlo-tree-search
description: Branch, prune, commit — decide among competing strategies by evidence using Tree of Thoughts and Monte Carlo Tree Search. Use when the answer isn't obvious and probing cost differs by path.
triggers:
  - Decision among multiple competing strategies
  - Hard debugging with competing hypotheses
  - Architecture choice among multiple viable routes
  - Paths that differ in probing cost
---

# Tree of Thoughts + Monte Carlo Tree Search

Generate competing **branches**, then **prune** by **evidence** until one **survivor** earns commitment. Tree of Thoughts (ToT) generates; Monte Carlo Tree Search (MCTS) allocates effort.

## When to Use

- Decision among multiple competing strategies and probing cost differs by path
- Hard debugging with several competing hypotheses
- Architecture choice among multiple viable implementation routes
- Correctness-critical decisions where exploring the wrong path has high cost

## When NOT to Use

- **Single obvious answer.** The branch-and-prune loop wastes effort on alternatives that don't exist.
- **Cheap, reversible actions where trial-and-error beats reasoning.** Just try it.
- **Time pressure with a known good-enough default.** MCTS only earns its keep when probing is expensive.

## Phase 1 — Branch (ToT)

Generate 3-5 genuinely different strategies. Same strategy with different parameters is **one branch**, not two.

**1.1 Frame the problem.**

```
Problem:     <what is being solved>
Objective:   <what success looks like>
Constraints: <bullet list>
```

**1.2 Generate branches.**

For each branch, capture:

- **Strategy:** how this branch approaches the problem
- **First moves:** the initial 2-3 reasoning steps
- **Initial assessment:** promising / uncertain / weak

**1.3 Develop each branch to a checkpoint.**

Follow 2-3 reasoning steps per branch. Stop at the first checkpoint where you can name:

- Is this branch still viable?
- What evidence does it have so far?
- What observation would **prune** it?

**1.4 Evaluate and prune by evidence.**

```
| Branch | Assessment | Evidence | Status  |
|--------|------------|----------|---------|
| A      | promising  | medium   | KEEP    |
| B      | weak       | low      | PRUNED  |
| C      | promising  | high     | KEEP    |

Pruned: B — contradiction at checkpoint 2, cannot recover.
```

**Done when** at least 3 branches exist with distinct strategies, each at a checkpoint with explicit evidence and prune condition, and weak branches are pruned with reasoning.

## Phase 2 — Allocate (MCTS)

Expand branches by evidence strength, not equal effort.

**2.1 Define the budget and scoring dimensions.**

```
Expansion rounds:   <n>
Probes per branch:  <n>
Stop condition:     winner with confidence > 0.7, OR budget exhausted

Scoring dimensions (each low / medium / high):
  - correctness evidence
  - progress toward objective
  - blast radius
  - reversibility
```

**2.2 Run expansion rounds.**

For each round: pick the branch with the best evidence + exploration value (tie-break: less-explored), run a bounded probe, score the outcome, backpropagate to priorities.

Selection policy (plain-language UCT):

1. Prefer branch with strongest validated evidence.
2. If tied, prefer the less-explored branch.
3. Always keep at least one exploratory branch alive unless it failed decisively.
4. **Prune** only on real contradiction, unacceptable risk, or repeated non-progress.
5. Do NOT keep expanding a branch just because more effort was already spent on it.

**Stop when** one branch reaches confidence > 0.7, OR all live branches fall below 0.3 (model is wrong — restart Phase 1), OR budget is exhausted.

**Done when** a winner has emerged with confidence > 0.7, OR budget is exhausted and you've documented the best live branch with its evidence trail.

## Phase 3 — Commit

```
Final ranking:
| Branch | Evidence | Progress | Risk | Decision |
|--------|----------|----------|------|----------|
| A      | high     | high     | low  | WINNER   |
| C      | high     | medium   | low  | Reserve  |
| B      | —        | —        | —    | Pruned   |

Why A won:        <strongest validated evidence across scoring dimensions>
Why others lost:  <each pruned/reserve branch's specific failure>
Next:             <concrete action to execute the winning branch>
Confidence:       <0.0-1.0 — and what the residual uncertainty is>
```

**Done when** the winner is named with evidence, runners-up are reserved with their reason, and pruned branches are recorded with their prune trigger.

## What This Combo Prevents

- **First-branch lock-in** — ToT generates alternatives; MCTS allocates by evidence.
- **Equal-effort waste** — MCTS focuses on branches that earn the effort.
- **Premature full commitment** — bounded probes run before commit.
- **Missing good branches** — neither alone covers generation + allocation.
- **Sunk-cost branch loyalty** — pruning is on evidence, not effort already spent.

## Related Skills

- `monte-carlo-tree-search` — the MCTS component alone (branch allocation only)
- `tree-of-thoughts` — the ToT component alone (branch generation only)
- `specter` — abductive hypothesis generation; can feed branches into Phase 1
- `pre-mortem` — run before committing the winning branch to full execution
