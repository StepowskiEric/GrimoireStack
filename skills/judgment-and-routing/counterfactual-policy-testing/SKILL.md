---
name: counterfactual-policy-testing
description: "Compare a decision against null, opposite, and partial counterfactuals before committing."
triggers:
  - decision-vs-alternatives
  - causation-fallacy-risk
  - high-stakes-decision
  - default-path-just-do-it
---

# Counterfactual Policy Testing

**A decision must beat its alternatives — not just look good alone.** Before committing to a change, test it against three explicit counterfactuals: null (do nothing), opposite (do the reverse), and partial (do half). Simulate each outcome, compare honestly, and proceed only when the proposal clearly beats all three. This prevents the "we did X, therefore X caused Y" fallacy by forcing comparison.

## When to Use
- Any significant code change (architecture, refactoring, feature)
- Multiple solutions seem plausible
- The default path is "just do it"
- High-stakes decisions where reversal is costly

Skip it: obvious bug fixes with a clear correct answer, zero-risk changes (typos, comments), time-critical emergencies.

## The Move

### 1. Define the proposed change
State it specifically enough to test: description, scope, expected benefit, expected cost, irreversibility (low/medium/high). Vague proposals cannot be tested against alternatives.

### 2. Generate the three counterfactuals
- **Null** — "What if we do nothing?" Establishes the baseline and verifies the change is needed at all
- **Opposite** — "What if we do the reverse?" Tests the directional assumption
- **Partial** — "What if we do 50%?" Finds the inflection point and tests proportionality

Each with a description, an implementation sketch, and predicted outcome. Make them genuinely viable — stacking the deck with obviously bad counterfactuals defeats the test.

### 3. Simulate outcomes
For each option including the proposal, project short-term, medium-term, and long-term consequences. Be honest — a partial solution that delivers 80% of the benefit at 40% of the complexity deserves to win.

### 4. Compare across dimensions
Score every option (null, opposite, partial, proposed) on the same weighted dimensions — e.g., performance, complexity, reliability, time-to-implement. Weighted totals make the comparison explicit instead of vibes.

### 5. Decide by the rule
- **PROCEED** — the proposal beats ALL counterfactuals clearly (≥10% margin)
- **RECONSIDER** — any counterfactual ties or beats the proposal; analyze why, and consider the winning alternative (often partial-first, expand later)
- **ESCALATE** — multiple counterfactuals beat the proposal; fundamental rethink needed

Document the decision even when proceeding despite a counterfactual challenge.

## Reference
For the YAML templates per state, the complete worked example (sessions → JWT), failure modes, and integration notes, see [`references/counterfactual-details.md`](references/counterfactual-details.md).

## Rules
- **Do** make the counterfactuals genuinely viable — a strawman null proves nothing.
- **Do** simulate outcomes before scoring; skip the simulation and the comparison is theater.
- **Do** take partial solutions seriously — proportionality is real information.
- **Do** proceed with a counterfactual challenge only when documented with the reason.
- **Do** track predictions vs actuals — counterfactual testing is a learning loop.
