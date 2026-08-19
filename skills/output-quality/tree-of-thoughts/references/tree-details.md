# Tree of Thoughts — Template, Problem Types & Pairings

## Template

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
(repeat structure)

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

## Problem types that benefit

### Debugging with multiple hypotheses
Branch 1: input validation layer. Branch 2: state management layer. Develop each, run the cheapest test for each, prune the one that fails.

### Architecture decision with multiple viable approaches
Branch 1: event-driven. Branch 2: synchronous RPC with retry. Branch 3: eventual consistency with compensating transactions. Develop each until the key tradeoff is visible, then evaluate and prune.

### Planning with multiple sequencing options
Branch 1: migrate data layer first, then API. Branch 2: build parallel API first, cut traffic over. Develop each until the first implementation risk appears, then compare.

## Failure modes this skill prevents

1. **First-branch lock-in** — following the first plausible path without generating alternatives
2. **Confident cascades** — an early wrong step producing confident-but-wrong downstream conclusions
3. **Comparison without exploration** — naming alternatives without developing them
4. **Late pruning** — fully developing all branches, wasting effort on early-prunable ones

## Pairing guide

- **Explore vs. Exploit** — governs when to generate vs commit; ToT is the mechanism for generation and intermediate evaluation
- **Bayesian Updating** — update branch confidence as evidence arrives at each checkpoint
- **Bounded Self-Revision** — ToT finds the better path; Bounded Self-Revision refines the output once chosen
- **Self-Consistency Check** — ToT generates multiple paths to choose from; Self-Consistency generates multiple independent paths and checks convergence

## Definition of done

Applied correctly when:
- at least two reasoning branches were genuinely developed, not just named
- each branch was evaluated at an intermediate checkpoint
- weak branches were pruned with explicit reasoning
- the surviving branch was pursued to a conclusion
- the final answer is more reliable because it survived comparison with alternatives
