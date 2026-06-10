---
name: tree-of-thoughts-plus-monte-carlo-tree-search
description: Power combo — Tree of Thoughts generates diverse reasoning branches, Monte Carlo Tree Search allocates deeper effort to the branches that earn it through evidence.
triggers:
  - branch exploration
  - multi-strategy decisions
  - hard debugging with competing hypotheses
  - architecture decisions with multiple viable routes
category: orchestration
version: 1.0.0
---

# Tree of Thoughts + Monte Carlo Tree Search

## Purpose

This combo uses **Tree of Thoughts (ToT)** to *generate* diverse reasoning branches and **Monte Carlo Tree Search (MCTS)** to *allocate effort* among them — pruning weak branches early, deepening promising ones, and committing to a winner only when evidence earns it.

ToT handles the "what branches exist?" question.
MCTS handles the "where should I spend effort?" question.

Together they prevent two failure modes:
- **ToT without MCTS**: Generates branches but explores them equally — wastes effort on weak paths.
- **MCTS without ToT**: Allocates effort efficiently among whatever branches already exist — but might miss good branches that were never generated.

## When to Use

- Complex debugging with multiple plausible hypotheses
- Architecture decisions with multiple viable implementation routes
- Hard problems where straight-line planning keeps failing
- Situations where some paths are cheap to explore and others are expensive
- Correctness-critical decisions where exploring the wrong path has high cost

## How It Works

```
Phase 1: Tree of Thoughts
  → Generate candidate branches (3-5 genuinely different approaches)
  → Develop each to an intermediate checkpoint
  → Evaluate: which branches look promising?

Phase 2: Monte Carlo Tree Search
  → Select the next branch to expand (by evidence strength + exploration value)
  → Run a bounded probe/mini-simulation
  → Score the outcome
  → Backpropagate: update branch priorities
  → Repeat until a winner emerges or budget is spent
```

## Step-by-Step Protocol

### Phase 1: Branch Generation (ToT)

**Step 1.1 — Define the root problem**
```
## Problem
<what is being solved>

## Objective
<what success looks like>

## Constraints
- <constraint>
- <constraint>
```

**Step 1.2 — Generate candidate branches**
```
Minimum: 3 genuinely different approaches
Typical: 3-5

Each branch must differ in strategy, not just in parameters.

### Branch A: <name>
- Strategy: <how this branch approaches the problem>
- First moves: <initial reasoning steps>
- Initial assessment: promising / uncertain / weak

### Branch B: <name>
... (same structure)
```

**Step 1.3 — Develop each branch to a checkpoint**
```
For each branch, follow 2-3 reasoning steps.
Stop at an intermediate checkpoint where you can assess:
- Is this branch still viable?
- What evidence does it have so far?
- What would prove it wrong?
```

**Step 1.4 — Evaluate and prune**
```
Branch evaluation:
| Branch | Assessment | Evidence strength | Keep? |
|--------|------------|------------------|-------|
| A      | promising  | medium           | YES   |
| B      | weak       | low (contradiction) | NO  |
| C      | promising  | high             | YES   |

Pruned: B — contradiction at checkpoint 2, cannot recover.
```

### Phase 2: Effort Allocation (MCTS)

**Step 2.1 — Define search budget**
```
## Budget
- Expansion budget: <n> rounds
- Tool/test budget: <n> probes per branch
- Stop condition: winner with >0.7 confidence OR budget exhausted

## Scoring dimensions
- correctness evidence (low/medium/high)
- progress toward objective (low/medium/high)
- blast radius (low/medium/high)
- reversibility (low/medium/high)
```

**Step 2.2 — Run MCTS rounds**

For each expansion round:

```
### Round N
- Selected branch: A (exploration: medium, evidence: medium)
- Reason selected: tied with C on evidence but less explored
- Expansion performed: ran targeted test probe
- Evidence observed: test passed — branch A hypothesis confirmed
- Score update: evidence=high, progress=high
- Branch priority: A now leading

- Selected branch: C (exploration: low, evidence: high)
- Reason selected: strong evidence but under-explored
- Expansion performed: typecheck + lint probe
- Evidence observed: clean, no issues
- Score update: evidence=high, progress=medium, cleanliness=high
- Branch priority: C still strong but not deepening

- Selected branch: A (evidence: high, exploration: high — still best)
- Expansion performed: integration test probe
- Evidence observed: test passed, behavior matches expectation
- Score update: all dimensions high
- Decision: A is winner — stop search, commit
```

**Step 2.3 — Selection policy (plain-language UCT)**
```
1. Prefer branch with strongest validated evidence.
2. If tied, prefer the less-explored branch.
3. Always keep at least one exploratory branch alive unless it failed decisively.
4. Prune only on real contradiction, unacceptable risk, or repeated non-progress.
5. Do NOT keep expanding a branch just because more effort was already spent on it.
```

### Phase 3: Commit

```
## Final Branch Ranking
| Branch | Evidence | Progress | Risk | Decision |
|--------|----------|----------|------|----------|
| A      | high     | high     | low  | WINNER   |
| C      | high     | medium   | low  | Reserve  |
| B      | low      | —        | —    | Pruned   |

## Winning Branch
- Why it won: strongest validated evidence across all scoring dimensions
- Why others lost: C had high evidence but lower progress signal; B contradicted at checkpoint
- What to do next: execute branch A's plan

## Confidence
0.85 — high confidence in winner; residual uncertainty in how it behaves under full load
```

## Node Schema (for tracking)

```md
## Branch Node
- ID: <branch letter>
- Strategy: <what this branch does>
- Checkpoint assessment: promising / uncertain / weak / dead end
- Evidence: low / medium / high
- Progress: low / medium / high
- Exploration rounds: <count>
- Status: active / leading / reserved / pruned
- Why current status: <brief reason>
```

## What This Combo Prevents

| Failure Mode | ToT alone | MCTS alone | ToT + MCTS |
|---|---|---|---|
| First-branch lock-in | Partially (generates alternatives) | Yes (allocates by evidence) | Yes — generates AND allocates by evidence |
| Equal-effort waste | No | Partially (by evidence weighting) | Yes |
| Premature full commitment | Partially | Yes | Yes — bounded probes before full commit |
| Missing good branches | Partially | No (only explores given branches) | Yes — ToT generates, MCTS selects |
| Sunk-cost branch loyalty | No | Partially | Yes — evidence-based pruning |

## Definition of Done

The combo was applied correctly when:
- At least 3 genuinely different branches were generated (ToT)
- Each branch was evaluated at an intermediate checkpoint (ToT)
- MCTS expanded branches based on evidence strength, not equal effort
- Weak branches were pruned with explicit reasoning
- The winning branch was selected because it earned more investment, not because it was first
- Bounded probes were run before full commitment

## Related Skills

- `monte-carlo-tree-search` — the MCTS component skill (branch allocation)
- `tree-of-thoughts` — the ToT component skill (branch generation)
- `specter` — generates hypotheses via abduction with structural code location; ToT+MCTS can be used within the hypothesis evaluation phase
- `pre-mortem` — run before committing the winning branch to full execution