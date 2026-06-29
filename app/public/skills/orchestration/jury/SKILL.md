---
name: jury
description: Argue, then structure the disagreement — spawn parallel perspectives with conflicting goals, force them to engage, output a conflict graph that reveals what actually matters. Use when reasonable options exist and the choice isn't obvious.
triggers:
  - Multiple reasonable options, choice not obvious
  - Stakeholders would prioritize different things
  - Suspected hidden assumption causing disagreement
  - Want to pressure-test a decision before committing
---

# Jury

Perspectives don't vote — they **argue**, and the conflict graph is the output. Disagreement reveals what matters most.

## When to Use

- Two or more reasonable options exist and the choice isn't obvious
- Different stakeholders would prioritize different things
- You suspect a hidden assumption causing disagreement but can't name it
- You need to make a decision but want to pressure-test it first

## When NOT to Use

- **Single-option decisions.** There's nothing to argue.
- **Pure fact-finding.** Jury is for value conflict, not information gathering.
- **Time pressure with a clear default.** Argument costs time; skip when the default is good enough.

## Phase 1 — Assemble the Jury

Assign each juror a distinct perspective with explicit goals and constraints:

```
Juror 1 — "Speed": Prioritize time-to-market.
  Assumptions: ship now, fix later; technical debt is cheap.
  Stress: what are we losing by waiting?

Juror 2 — "Correctness": Prioritize robustness.
  Assumptions: bugs are expensive; edge cases matter.
  Stress: what could go wrong if we go fast?

Juror 3 — "Scope": Prioritize minimal scope and clarity.
  Assumptions: simpler is safer; fewer features = fewer bugs.
  Stress: what is actually required?

Juror 4 — "Growth": Prioritize long-term maintainability.
  Assumptions: code quality compounds; today's debt is tomorrow's crisis.
  Stress: what will we regret in 6 months?
```

Rules:
- Each juror argues FOR their position, never neutrally
- Jurors must engage with each other's arguments, not just state their own
- Each juror must name the specific assumption driving their disagreement

**Done when** at least 3 jurors exist with distinct goals, and each has stated one load-bearing assumption.

## Phase 2 — Deliberate

Each round:

```
Round N:
- Juror X claims:    <specific claim>
- Juror Y responds:  <specific counter or concession>
- Conflict:          <what they actually disagree about>
```

**Done when** at least 2 rounds of explicit claim-and-response have occurred, and at least one disagreement is named with its underlying assumption.

## Phase 3 — Build the Conflict Graph

```
Nodes: [claims or positions]
Edges: [disagreements between jurors]

Example:
[Ship v2]   --disagree:risk--     [Wait for v2.1]
            --disagree:scope--    [Only ship auth, defer UI]
            --disagree:techdebt-- [Accept debt] --vs-- [No debt]
```

The graph reveals:
- Which disagreements are fundamental (different values) vs tactical (different facts)
- Whether concession is possible (shared nodes)
- What evidence would resolve each edge

**Done when** the graph has ≥3 edges, each edge names its disagreement type, and at least one fundamental-value edge is identified.

## Phase 4 — Verdict

```
Decision:                 <what the main agent decides>
Confidence:               <0-100%>
Disagreement resolved:    <which edges collapsed and why>
Remaining conflict:       <which edges persist and why they don't matter here>
Most-useful argument:     <which juror changed the thinking most>
```

**Done when** a decision is named with confidence, resolved and persistent edges are listed separately, and one juror's specific argument is credited as the thinking-changer.

## Anti-Patterns

- **False consensus:** everyone agrees but no one examined alternatives
- **Debate theater:** loud arguments with no resolution
- **Average judgment:** taking the mean of all perspectives
- **Authority capture:** one juror dominates and others concede

## Integration

Pair with `counterfactual-policy-testing` after the verdict to ensure alternatives are tested. Pair with `pre-mortem` to stress-test from competing risk perspectives. Pair with `prism` to compress the conflict graph into a decision rationale.
