# MCTS — Roles, Examples & Failure Modes

## Agent role split

- **Root / Coordinator** — owns objective, constraints, budget, stop condition, final decision
- **Explorer** — proposes candidate branches or mutations
- **Executor** — runs the bounded next step or mini-simulation
- **Evaluator** — scores the resulting state with a fixed rubric
- **Critic** (optional) — explains why a branch weakened, what assumption failed, what mutation might rescue it

Use the smallest useful role split; do not spawn roles unless the task benefits.

## Coding-specific examples

### Debugging
Root: find the real source of the bug. Branches: input normalization, state mutation, async timing/race, downstream of bad cached data. Each expansion runs the cheapest probe that strengthens or weakens one hypothesis.

### Refactoring
Root: improve structure without breaking behavior. Branches: local extraction only, seam introduction first, consumer-first interface adaptation, characterization tests first. Do not fully refactor every branch — run one bounded probe each and invest only in the branches proving safer or cleaner.

### Architecture choice
Root: choose the strongest path. Branches: deepen module boundaries, extract one service, introduce an event-driven seam, defer decomposition and fix ownership first. Mini-sims: impact analysis, interface mapping, migration-risk scoring, operational-failure analysis.

## Failure modes this skill prevents

1. **First-branch lock-in** — committing to the first plausible path and spending effort there despite better alternatives
2. **Equal-effort waste** — exploring every branch equally when some clearly earn more investment
3. **Sunk-cost branch loyalty** — expanding a weak branch because effort was already invested
4. **Judge-by-vibes** — picking a branch because it sounds smart rather than because evidence supports it
5. **Full-commit too early** — turning a promising branch into a full execution plan before a cheap validating probe

## Pairing guide

- **Tree of Thoughts** — generates distinct branches; MCTS decides where effort goes after they exist
- **Bounded Self-Revision** — use inside a branch to improve one candidate before rescoring
- **Bayesian Updating** — revise confidence in competing branches as evidence arrives
- **Pre-Mortem** — before committing the winning branch to full execution
- **Explore vs. Exploit** — the general tradeoff; MCTS is a concrete branch-allocation method
- **Recognition-Primed Triage** — fast triage picks the initial candidate set; MCTS governs deeper search
