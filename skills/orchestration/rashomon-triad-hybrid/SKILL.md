---
name: rashomon-triad-hybrid
description: "Parallel perspectives with conflicting goals run independent abductive-deductive-inductive cycles, then argue via attack graph."
triggers:
  - conflicting-stakeholder-goals
  - tradeoff-decision
  - alternative-rejection-audit
  - premature-consensus-risk
---

# Rashomon-Triad Hybrid

**When goals genuinely conflict, no perspective decides alone.** Combine Rashomon Memory (parallel perspectives with conflicting goals) and Triad Reasoning (abduction → deduction → induction per perspective). The output is an **attack graph** that names which conclusions survive cross-perspective critique — and which conflicts need a human.

## When to Use
- Stakeholders have genuinely conflicting goals (not miscommunication)
- No single correct answer — only trade-offs
- You must document why alternatives were rejected
- Premature consensus would hide real risks

Skip it: single clear objective (use `triad-reasoning`), speed matters more than thoroughness, or the decision is reversible and low-cost.

## The Move

### 1. Configure — name the perspectives
Define each perspective with a distinct id, goal, priority (0.0–1.0), and vocabulary. Set convergence parameters (max triad iterations, argumentation rounds, min confidence to attack) and the output mode: `selection` (pick a winner), `composition` (merge), or `conflict_surfacing` (escalate). Template in Reference. Done when every perspective has a distinct goal and vocabulary.

### 2. Triad — each perspective reasons independently
For each perspective, run the cycle on the same situation:
1. **Abduce** — generate hypotheses from its goal and vocabulary
2. **Deduce** — validate each hypothesis against evidence; tag every hypothesis with evidence (and counter-measures where relevant)
3. **Induce** — converge on a pattern with explicit boundaries and a confidence score

Exit: every perspective has confidence-scored, evidence-tagged conclusions.

### 3. Argue — perspectives attack each other
Each perspective proposes its conclusions, then attacks the others':
- **direct_attack** — "Your solution fails my goal"
- **undercut** — "Your evidence doesn't support your conclusion"
- **rebuttal** — "My goal overrides yours in this context"

Record every attack with attacker, target, type, rationale (in the attacker's own vocabulary), and confidence. Apply Dung's semantics: a conclusion survives when its attacks defeat the attacks against it.

### 4. Resolve — by output mode
- **Selection:** name the winning perspective and conclusion, and why each defeated perspective lost.
- **Composition:** merge non-conflicting aspects across perspectives; name remaining conflicts and their accepted resolutions.
- **Conflict surfacing (recommended for high-stakes):** report the irreducible disagreement with each position and confidence, and give the human decision criteria.

Always include the full attack graph for auditability.

### 5. Jury (lightweight) — when time is short
Skip the triad cycles: assign 3–4 jurors with distinct perspectives, run claim/counter rounds, and build a **conflict graph** — nodes are claims, edges are disagreements. Verdict: decision with confidence, resolved vs persistent edges, most-useful argument credited. Trades depth for speed.

## Reference
- [`references/rashomon-details.md`](references/rashomon-details.md) — config template, triad cycle template, attack graph format, confidence formulas, full walkthrough.
- [`references/perspective-selection.md`](references/perspective-selection.md) — choosing and weighting perspectives (optimist vs pessimist vs pragmatist, weighting by task type).

## Rules
- **Do** give every perspective a distinct goal and vocabulary before reasoning starts.
- **Do** tag every hypothesis with evidence and a confidence score.
- **Do** record the attack graph in the output — traceability is the point.
- **Do** surface genuine conflict for human judgment instead of forcing consensus.
- **Do** let evidence defeat a high-priority perspective when the attacks warrant it.
