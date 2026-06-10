# Skill: Tree of Thoughts for AI Agents

## Purpose

Use this skill when the agent must solve a problem where the correct reasoning path is not immediately clear and committing to one line of thinking too early risks missing a better solution.

Tree of Thoughts (ToT) deliberately generates multiple candidate reasoning branches, evaluates their intermediate states, prunes weak branches, and pursues only the most promising paths — rather than following the first plausible reasoning thread to its conclusion.

This is the reasoning-step equivalent of what Explore vs. Exploit does at the task level.

Source: *Tree of Thoughts: Deliberate Problem Solving with Large Language Models* (Yao et al., 2023, NeurIPS).

---

## Core Rule

Do not follow the first plausible reasoning path to completion.

Generate multiple reasoning branches.
Evaluate their intermediate quality.
Prune the weak ones.
Pursue only the branches that remain promising.

---

## When to Use

Use this skill when:
- the problem has multiple plausible solution strategies and it is not obvious which is better
- previous reasoning passes have produced correct-looking but ultimately flawed conclusions
- the task requires a sequence of reasoning steps where an early wrong turn produces a cascade of confident-but-wrong downstream conclusions
- the solution space is large enough that a single path misses good alternatives
- the problem benefits from comparison across approaches before commitment
- correctness matters more than generation speed

Do not use when:
- the correct reasoning path is well-established and the problem is simple
- speed is critical and the cost of exploration is too high
- the task is generative rather than problem-solving (e.g., pure creative writing with no correctness criterion)

---

## The Core Mechanics

### Step 1: Generate candidate branches
Before following any single reasoning path, generate multiple starting approaches:
- What are the different ways to approach this problem?
- What are the different framings or decompositions?
- What are the first moves in each approach?

Minimum: two branches. For complex problems: three to five.

### Step 2: Develop each branch to an intermediate checkpoint
Follow each branch for a few reasoning steps — enough to evaluate whether it is heading toward a good solution — without going all the way to a conclusion.

An intermediate checkpoint is a point where the agent can assess:
- Is this branch still plausible?
- Is it making progress toward the goal?
- Are there signs of a dead end?

### Step 3: Evaluate the branches at the checkpoint
For each branch, ask:
- How promising does this path look at this intermediate point?
- What is the estimated quality of the conclusion this branch is heading toward?
- Has this branch revealed a problem (contradiction, invalid assumption, circular reasoning)?
- Compared to the other branches, is this one ahead, behind, or equal?

### Step 4: Prune weak branches
Eliminate branches that:
- have encountered a contradiction or invalid assumption
- are heading toward a solution that is clearly worse than another branch
- have revealed a dead end

### Step 5: Pursue the surviving branches
Continue reasoning along the promising branches until the problem is solved or another checkpoint is warranted.

If only one branch survives, commit to it.
If multiple survive, either continue both in parallel or select the strongest.

---

## Tree of Thoughts Template

```md
## Problem
<what is being solved>

## Candidate Branches

### Branch 1: <approach name>
- Strategy: <how this branch approaches the problem>
- First moves:
  - <step 1>
  - <step 2>
- Intermediate checkpoint:
  - Current state: <where this branch has arrived>
  - Assessment: promising / uncertain / weak / dead end
  - Reason: <why>

### Branch 2: <approach name>
- Strategy: <how this branch approaches the problem>
- First moves:
  - <step 1>
  - <step 2>
- Intermediate checkpoint:
  - Current state: <where this branch has arrived>
  - Assessment: promising / uncertain / weak / dead end
  - Reason: <why>

### Branch 3: <approach name> (if warranted)
(repeat structure)

## Branch Evaluation
| Branch | Assessment | Why | Continue? |
|--------|-----------|-----|-----------|

## Pruned Branches
- Branch N pruned because: <reason>

## Surviving Branches
<which branches continue and why>

## Solution Path
<conclusion drawn from pursuing the surviving branches>

## Confidence
<how confident is the conclusion based on the branch comparison>
```

---

## Agent Rules

### Do
- generate at least two branches before developing any of them to conclusion
- evaluate branches at intermediate checkpoints, not just at the end
- prune explicitly and state the reason
- commit to the best surviving branch and explain why it is stronger than the alternatives

### Do Not
- generate token alternatives that are not genuinely explored
- prune branches because they are harder, not because they are weaker
- commit to the first plausible branch without evaluation
- treat Tree of Thoughts as a justification for the answer already decided

---

## Common Problem Types That Benefit From Tree of Thoughts

### Debugging with multiple plausible hypotheses
Branch 1: the bug is in the input validation layer
Branch 2: the bug is in the state management layer
Develop each, run the cheapest test for each, prune the one that fails the test.

### Architecture decision with multiple viable approaches
Branch 1: event-driven architecture
Branch 2: synchronous RPC with retry
Branch 3: eventual consistency with compensating transactions
Develop each to the point where the key tradeoff becomes visible, then evaluate and prune.

### Planning with multiple sequencing options
Branch 1: migrate the data layer first, then the API layer
Branch 2: build the parallel API first, then cut traffic over
Develop each to the point where the first implementation risk appears, then compare.

---

## Failure Modes This Skill Prevents

### 1) First-branch lock-in
The agent follows the first plausible reasoning path to completion without generating alternatives, then discovers it was wrong.

### 2) Confident cascades
An early wrong step in a linear reasoning chain produces confident-sounding but incorrect downstream conclusions.

### 3) Comparison without exploration
The agent names alternatives without genuinely developing them, producing a false sense of having considered the options.

### 4) Late pruning
The agent develops all branches fully and then compares — wasting effort on branches that would have been prunable at an early checkpoint.

---

## Pairing Guide

- **Explore vs. Exploit** — Explore vs. Exploit governs when to generate options versus when to commit; Tree of Thoughts is the mechanism for doing the generation and intermediate evaluation
- **Bayesian Updating** — use Bayesian Updating to update confidence in each branch as evidence arrives at each checkpoint
- **Bounded Self-Revision** — use Tree of Thoughts to find the better reasoning path; use Bounded Self-Revision to refine the output once the path is chosen
- **Self-Consistency Check** — Tree of Thoughts generates multiple paths to choose from; Self-Consistency generates multiple independent paths and checks if they converge

---

## Definition of Done

Tree of Thoughts was applied correctly when:
- at least two reasoning branches were genuinely developed, not just named
- each branch was evaluated at an intermediate checkpoint
- weak branches were pruned with explicit reasoning
- the surviving branch was pursued to a conclusion
- the final answer is more reliable because it survived comparison with alternatives

---

## Final Instruction

Do not follow the first plausible thread.

Grow the tree.
Prune what is weak.
Follow what is strong.
