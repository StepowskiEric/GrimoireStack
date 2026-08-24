---
name: cognitive-bias-checklist
description: "Explicit checklist to catch bias contamination before finalizing slow-mode recommendations."
triggers:
  - slow-mode-bias-audit
  - pre-delivery-recommendation
  - estimate-calibration
  - high-consequence-decision
disable-model-invocation: true
---

# Cognitive Bias Checklist

**Reasoning carefully is not the same as reasoning correctly.** Slow mode is only valuable if the biases that corrupt it are explicitly checked — the most confident-sounding outputs are often the most contaminated. After completing any important analysis, recommendation, estimate, or architecture decision — especially when it feels obviously correct — run the high-consequence bias checklist before finalizing.

## When to Use
- The agent has committed to a hypothesis, diagnosis, or recommendation
- An estimate has been produced
- An architectural or design decision has been made
- A plan with significant scope has been finalized
- The output feels obviously correct — a strong signal bias is at work

## The Move

### 1. State the output being reviewed
One sentence: the recommendation, estimate, or decision. The checklist audits this specific output — vague targets get vague passes.

### 2. Run the 8 bias checks
For each, apply the check honestly (full descriptions and corrections in Reference):

| Bias | Check question | Correction |
|------|---------------|------------|
| **Anchoring** | Was an alternative generated that did not start from the first anchor? | Generate one alternative that deliberately ignores the anchor and compare |
| **Availability** | Was a less familiar but equally plausible explanation considered? | Actively consider less common explanations before finalizing |
| **Confirmation** | Was the cheapest disconfirming test run? | Run the cheapest falsifying test before finalizing |
| **Planning fallacy** | Was a reference-class estimate applied, not the inside view? | Apply Reference Class Forecasting immediately |
| **Scope insensitivity** | Is the analysis and risk scaled to the actual scope? | Scale assessment proportionately to the surface area |
| **Overconfidence** | Is uncertainty stated explicitly, or smoothed over? | State confidence and name the top uncertainty that could invalidate it |
| **Substitution** | Does the output answer the actual question, not an easier one? | Restate the original question and verify the output answers it |
| **Narrative fallacy** | Is fact vs inference vs guess labeled at each step? | Label the chain; do not present inferences as facts |

### 3. Correct every failure
A failing check produces a specific correction — not acknowledgment. Apply Reference Class Forecasting when Planning Fallacy fails; run the disconfirming test when Confirmation fails; generate the anchor-free alternative when Anchoring fails. A corrected output that merely rephrases the biased one is not a correction.

### 4. (Assisted) run the automated auditor
When the companion script is available, run `scripts/cognitive_bias_auditor.py check --decision "<description>" --bias all` for a 9-bias automated scan (adds sunk cost, loss aversion, framing, conjunction, representativeness).

### 5. State final confidence
Deliver the output with an explicit confidence level and the primary residual uncertainty. The audit is not a ritual that produces "passed" for every check — honesty about contamination beats a clean-looking table.

## Reference
For the full bias descriptions with checks and corrections, the bias checklist template, the automated auditor's bias table, and the pairing guide, see [`references/bias-checklist-details.md`](references/bias-checklist-details.md).

## Rules
- **Do** apply the checklist after slow-mode reasoning — it is the second half of it.
- **Do** correct what failed before delivering; acknowledgment alone is not correction.
- **Do** run the disconfirming test even when inconvenient.
- **Do** state uncertainty explicitly in the final output.
- **Do** apply Reference Class Forecasting the moment Planning Fallacy fails.
