# Skill: Monte Carlo Tree Search for AI Agents

## Purpose

Use this skill when the agent faces a problem with multiple plausible strategies and must decide where to spend additional reasoning, testing, or tool-use budget.

Monte Carlo Tree Search (MCTS) is a disciplined branch-allocation method.
It does not treat all branches equally.
It does not commit to the first good-looking path.

Instead, it repeatedly:
- selects a promising branch
- expands it
- runs a bounded probe or mini-simulation
- scores what happened
- propagates that signal upward
- decides what deserves the next unit of effort

For AI agents, this is usually best implemented as **MCTS-lite**:
not random rollouts, but bounded reasoning steps, cheap tests, tool calls, mini-patches, or partial executions scored against explicit criteria.

This is the search-budget equivalent of what Tree of Thoughts does for branch generation.

---

## Core Rule

Do not explore every branch equally.
Do not commit to the first plausible branch.

Allocate more effort to branches that earn it.
Preserve limited exploration so the agent does not lock into an early favorite too soon.

---

## When to Use

Use this skill when:
- there are multiple plausible approaches and the agent must decide which one deserves more compute
- a straight-line plan keeps failing and branch selection matters more than raw effort
- the task allows partial evaluation through tests, tool feedback, static analysis, or intermediate evidence
- the cost of deeper exploration is justified by correctness, risk, or complexity
- the work is long-horizon enough that early branch choices materially affect the outcome

Best for:
- hard debugging with several competing hypotheses
- refactor-path selection
- architecture decisions with multiple viable implementation routes
- repo-scale investigations where some probes are cheap and others are expensive
- tool-using agents that can gather real feedback between reasoning steps

Do not use when:
- the task is simple and the correct path is already obvious
- there is no meaningful way to score intermediate states
- the branch count is tiny and a direct compare-and-choose is enough
- the work is mostly generative and does not benefit from branch scoring

---

## The Core Mechanics

### Step 1: Define the root state and budget
Before branching, define:
- the objective
- the constraints
- the available budget
  - reasoning budget
  - tool budget
  - time budget
  - branch budget
- the stopping condition

The agent must know what counts as progress before it starts allocating search effort.

### Step 2: Create initial candidate branches
Generate a small set of genuinely different starting branches.

Examples:
- inspect the data-flow path first
- inspect the state-transition logic first
- add instrumentation before patching
- attempt a local fix
- refactor the seam instead of patching the symptom

Minimum: two branches.
Typical: three to five.

### Step 3: Select the next branch to expand
Choose the next branch by balancing:
- **current promise** — how strong the evidence is so far
- **exploration value** — whether the branch has been under-explored

In practice:
- revisit strong branches more often
- keep at least one less-explored branch alive unless it has failed hard
- do not let one early good impression monopolize the search

### Step 4: Expand the chosen branch
Take one bounded next step on that branch.

Examples:
- inspect one more file or interface
- run one targeted test
- try one narrow patch
- execute one partial plan step
- gather one decisive piece of evidence

Expansion should be small enough that failure is informative rather than expensive.

### Step 5: Run a bounded rollout or mini-simulation
Do not fully commit yet.
Run the cheapest probe that reveals whether this branch is getting stronger or weaker.

Examples:
- unit test
- typecheck or lint
- targeted reproduction
- partial execution
- static analysis
- compare changed behavior against expected behavior

For reasoning tasks without executable tests, use a structured rubric and intermediate evidence check.

### Step 6: Score the outcome
Score the branch using explicit evidence, not vibes.

Typical dimensions:
- correctness evidence
- progress toward objective
- blast radius
- reversibility
- architectural cleanliness
- new risk introduced
- cost of continuing this branch

The score does not need to be mathematical.
It does need to be consistent.

### Step 7: Backpropagate what was learned
Update the branch and its ancestors based on the latest evidence.

If the rollout was strong:
- increase the branch's priority for future expansion

If the rollout was weak or failed:
- lower priority
- mutate the branch
- or prune it if the failure is decisive

### Step 8: Repeat until a winner or stop condition emerges
Continue selecting, expanding, evaluating, and updating until:
- one branch clearly dominates on validated evidence
- the remaining branches are exhausted or inferior
- the search budget is spent
- the task should switch to execution mode on the leading branch

---

## Agent Role Split

### Root / Coordinator
Owns:
- objective
- constraints
- budget
- stop condition
- final decision

### Explorer
Proposes candidate branches or mutations of existing branches.

### Executor
Runs the bounded next step or mini-simulation.

### Evaluator
Scores the resulting state with a fixed rubric.

### Critic (optional)
Explains why a branch weakened, what assumption failed, and what mutation might rescue it.

Use the smallest useful role split.
Do not spawn multiple roles unless the task benefits from it.

---

## Node Schema

Represent each branch/node with the same structure.

```md
## Node
- Node ID: <id>
- Parent: <parent id or root>
- Hypothesis: <what this branch believes>
- Next action: <bounded next move>
- Evidence so far:
  - <evidence 1>
  - <evidence 2>
- Score:
  - correctness evidence: low / medium / high
  - progress: low / medium / high
  - blast radius: low / medium / high
  - reversibility: low / medium / high
  - cleanliness: low / medium / high
- Visits: <rough count>
- Status: unexpanded / expanded / promising / weak / pruned / leading / winner
- Why this status: <brief reason>
```

---

## MCTS-lite Template

```md
## Objective
<what is being solved>

## Constraints
- <constraint>
- <constraint>

## Budget
- Branch budget: <n>
- Expansion budget: <n>
- Tool/test budget: <n>
- Stop condition: <what ends search>

## Initial Branches

### Branch A
- Hypothesis:
- First action:
- Why it might work:
- Initial risks:

### Branch B
- Hypothesis:
- First action:
- Why it might work:
- Initial risks:

### Branch C
- Hypothesis:
- First action:
- Why it might work:
- Initial risks:

## Search Log

### Round 1
- Selected branch:
- Reason selected:
- Expansion performed:
- Rollout / mini-sim:
- Evidence observed:
- Score update:
- Keep / mutate / prune:

### Round 2
(repeat)

## Final Branch Ranking
| Branch | Evidence | Risk | Progress | Decision |
|--------|----------|------|----------|----------|

## Winning Branch
- Why it won:
- Why the others lost:
- What should be done next:

## Confidence
<how strong the winner is and what residual uncertainty remains>
```

---

## Practical Selection Rules for Agents

If the agent is not implementing a real numeric UCT formula, use this plain-language policy:

1. Prefer the branch with the strongest validated evidence.
2. If two branches are close, prefer the one explored less.
3. Always keep one exploratory alternative alive unless it has failed decisively.
4. Prune only on real contradiction, unacceptable risk, or repeated non-progress.
5. Do not keep expanding a branch just because more effort has already been spent on it.

This gives the spirit of MCTS without requiring mathematical machinery.

---

## Coding-Specific Examples

### Debugging
Root objective: find the real source of the bug.

Candidate branches:
- the fault is in input normalization
- the fault is in state mutation
- the fault is in async timing or race behavior
- the observed bug is downstream of bad cached data

Each expansion should run the cheapest probe that can strengthen or weaken one hypothesis.

### Refactoring
Root objective: improve structure without breaking behavior.

Candidate branches:
- local extraction only
- seam introduction first
- consumer-first interface adaptation
- characterization tests first, then refactor

Do not fully refactor every branch.
Run one bounded probe on each and invest more only in the branches proving safer or cleaner.

### Architecture choice
Root objective: choose the strongest path.

Candidate branches:
- keep monolith and deepen module boundaries
- extract one service
- introduce an event-driven seam
- defer decomposition and fix ownership first

Mini-sims can be:
- impact analysis
- interface mapping
- migration-risk scoring
- operational-failure analysis

---

## Failure Modes This Skill Prevents

### 1) First-branch lock-in
The agent commits to the first plausible path and keeps spending effort there even after better alternatives exist.

### 2) Equal-effort waste
The agent explores every branch equally even when some are clearly earning more investment than others.

### 3) Sunk-cost branch loyalty
The agent keeps expanding a weak branch because a lot of effort was already invested in it.

### 4) Judge-by-vibes
The agent picks a branch because it sounds smart rather than because it has stronger evidence.

### 5) Full-commit too early
The agent turns a promising branch into a full execution plan before running a cheap validating probe.

---

## Pairing Guide

- **Tree of Thoughts** — Tree of Thoughts helps generate distinct branches; MCTS decides where additional effort should go after the branches exist
- **Bounded Self-Revision** — use Self-Revision inside a branch to improve one candidate before rescoring it
- **Bayesian Updating** — use Bayesian Updating to revise confidence in competing branches as evidence arrives
- **Pre-Mortem** — use Pre-Mortem before committing the winning branch to full execution
- **Explore vs. Exploit** — Explore vs. Exploit is the general tradeoff; MCTS is a concrete branch-allocation method for enacting it
- **Recognition-Primed Triage** — use fast triage to pick the initial candidate set, then MCTS to govern deeper search where needed

---

## Definition of Done

MCTS was applied correctly when:
- at least two genuinely different branches existed
- branch expansion was bounded rather than all-in
- branch priority changed based on evidence, not intuition alone
- weak branches were pruned or de-emphasized for explicit reasons
- one winning branch emerged because it earned more investment through stronger evidence
- the search budget was spent more intelligently than equal exploration or first-branch commitment

---

## Final Instruction

Do not search blindly.
Do not commit blindly.

Let branches compete for effort.
Give more effort to what earns it.
Keep enough exploration to avoid early lock-in.
Commit only when a branch has evidence strong enough to deserve the win.
