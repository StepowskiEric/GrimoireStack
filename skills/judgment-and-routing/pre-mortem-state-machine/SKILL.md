---
name: pre-mortem-state-machine
description: "Validate a plan before execution: assume failure has already happened, generate specific failure narratives, rank them, and adjust the plan."
triggers:
  - plan-validation
  - failure-assumption
  - risk-ranking
  - pre-execution-gate
---

# Pre-Mortem

**The plan has already failed — you are explaining why.** Assume it is months from now and the plan failed clearly and materially, then work backward: generate specific failure narratives, rank them honestly, fix what can be fixed, name what cannot, and decide whether to proceed. Narrative failure ("what went wrong?") beats abstract risk listing ("what could go wrong?").

## When to Use
- The plan needs validation before execution
- Surface-level risk listing is insufficient
- Consensus-built plans need an optimism-bias check

## The Move

### 1. Assume failure
State it explicitly and unhedged in `pre-mortem-report.md` (template in Reference): *"It is [timeframe]. The plan was executed and it failed — clearly, materially, visibly. We are now looking back and explaining why."* Hedging ("what if it fails?") does not activate the same reasoning mode. First confirm the plan is specific enough to pre-mortem: defined sequence, identifiable dependencies, a clear definition of failure. A vague plan must be specified before continuing.

### 2. Generate failure stories
Write at least five specific narratives from the retrospective vantage point. Specific means "the data migration took three weeks instead of five days because the legacy schema had undocumented nullability constraints" — not "scope creep." Generate before ranking; do not filter for plausibility while writing. Cover multiple categories: execution, dependency, assumption, scope/complexity, human/coordination, timing, unknown unknowns. Five minimum; eight to ten for high-stakes plans.

### 3. Rank & profile
Rank stories by likelihood, severity, and early detectability. High-likelihood + high-severity + hard-to-detect = highest priority. Build a full profile for the top 3–5 risks, each with:
- **Root condition** — what must be true for this to occur
- **Early warning signal** — observable, monitorable
- **Prevention** — a real plan change, not "be careful"
- **Contingency** — pre-decided, not deferred

### 4. Adjust the plan
Three categories: **change the plan** (reduce a top risk's likelihood/severity), **add detection** (monitoring or checkpoints for early warning signals), **accept explicitly** (name owned tradeoffs with review triggers). At least one top risk must produce a change or monitoring addition; residual risks get owners and review triggers.

### 5. Verdict — gate execution
- **Proceed:** top risks have prevention or detection; residual risks accepted explicitly
- **Adjust and proceed:** list the required changes and who owns them
- **Do not proceed:** a top risk has no viable prevention/contingency, a dependency cannot be compensated, or assumptions are too uncertain

## Circuit breakers
- Fewer than five stories for a high-stakes plan
- All stories are generic categories without narrative specificity
- No top risk produced a plan change
- The failure assumption was hedged
- Verdict is "proceed" but no top risk has prevention or detection

## Reference
For the `pre-mortem-report.md` template, tool gating, failure modes, and pairing guide, see [`references/pre-mortem-details.md`](references/pre-mortem-details.md).

## Rules
- **Do** write the failure assumption unhedged before generating stories.
- **Do** generate before ranking — plausibility filtering happens after.
- **Do** give every top risk a root condition, warning signal, prevention, and contingency.
- **Do** convert at least one top risk into a plan change.
- **Do** name and own accepted risks instead of ignoring them.
