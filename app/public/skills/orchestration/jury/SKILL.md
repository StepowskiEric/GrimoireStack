---
name: jury
description: Spawn parallel perspectives with conflicting goals, let them argue, surface the conflict graph as the explanation.
triggers:
  - Decision with multiple plausible options
  - Trade-off between competing values
  - Need to understand why different people see the same situation differently
  - Want to find blind spots systematically
---

# Jury

**Biological analog:** A jury deliberates not by averaging opinions but by exposing conflict — the structure of disagreement reveals what matters most.

## When to Use

- Two or more reasonable options exist and the choice isn't obvious
- Different stakeholders would prioritize different things
- You suspect there's a hidden assumption causing disagreement but can't name it
- You need to make a decision but want to pressure-test it first

## How It Works

### Phase 1 — Jury Assembly

Assign each "juror" a distinct perspective with explicit goals and constraints:

```
Juror 1 — "Speed": Prioritize time-to-market. Argue for the fastest path.
  - Assumptions: Ship now, fix later is acceptable; technical debt is cheap
  - Stress: What are we losing by waiting?

Juror 2 — "Correctness": Prioritize correctness and robustness.
  - Assumptions: Bugs are expensive; edge cases matter
  - Stress: What could go wrong if we go fast?

Juror 3 — "Scope": Prioritize minimal scope and clarity.
  - Assumptions: Simpler is safer; fewer features means fewer bugs
  - Stress: What is actually required?

Juror 4 — "Growth": Prioritize long-term maintainability.
  - Assumptions: Code quality compounds; today's debt is tomorrow's crisis
  - Stress: What will we regret in 6 months?
```

Rules:
- Each juror must argue FOR their position, not neutrally describe it
- Jurors must engage with each other's arguments, not just state their own
- Jurors must identify the specific assumption that drives their disagreement

### Phase 2 — Deliberation

Each round, jurors present:

```
Round N:
- Juror X claims: [specific claim]
- Juror Y responds: [specific counter or concession]
- Conflict identified: [what they actually disagree about]
```

The conflict graph is the real output — not a vote.

### Phase 3 — Conflict Graph

Structure the disagreements:

```
Nodes: [claims or positions]
Edges: [disagreements between jurors]

Example:
[Ship v2] --disagree:risk-- [Wait for v2.1]
           --disagree:scope-- [Only ship auth, defer UI]
           --disagree:techdebt-- [Accept debt] --vs-- [No debt]
```

The graph structure reveals:
- Which disagreements are fundamental (different values) vs tactical (different facts)
- Whether concession is possible (shared nodes)
- What evidence would resolve each edge

### Phase 4 — Verdict

```
Decision: [what the main agent decides, informed by but not bound by jury]
Confidence: [0-100%]
Disagreement resolved: [which edges collapsed and why]
Remaining conflict: [which edges persist and why they don't matter for this decision]
What was most useful: [which juror's argument changed the thinking most]
```

## Anti-Patterns (what Jury prevents)

- **False consensus:** everyone agrees but no one examined alternatives
- **Debate theater:** loud arguments with no resolution
- **Average judgment:** taking the mean of all perspectives
- **Authority capture:** one juror dominates and others concede

## Sub-Agent Contracts

### Juror
- **Inputs:** the decision question, their assigned perspective, competing arguments
- **Outputs:** structured claims with evidence, responses to other jurors, identified assumptions
- **Limits:** Must argue for their assigned position; cannot be neutral

### Conflict Synthesizer
- **Inputs:** all juror outputs
- **Outputs:** conflict graph (nodes + edges), structured verdict
- **Limits:** If all jurors agree, flag it as suspicious — maybe assumptions weren't challenged

## Integration

Use before `counterfactual-policy-testing` to ensure alternatives explored from different angles. Use after `pre-mortem` to stress-test from competing risk perspectives. Use with `prism` to compress the conflict graph into a decision rationale.

## Fallback Mode

If no sub-agents available, simulate the jury manually: spend 5 minutes writing arguments for each perspective. Structure the disagreements explicitly. Force yourself to identify the specific assumption behind each disagreement.