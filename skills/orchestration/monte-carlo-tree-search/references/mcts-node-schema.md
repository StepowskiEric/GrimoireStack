# MCTS Node Schema

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

# MCTS-lite Template

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
