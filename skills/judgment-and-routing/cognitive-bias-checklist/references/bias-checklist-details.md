# Cognitive Bias Checklist — Descriptions, Template & Auditor

## The 8 high-consequence biases

### 1. Anchoring
The first piece of information encountered (first error message, first solution, first estimate) dominates subsequent reasoning disproportionately. Check: what was the first answer or hypothesis? Has the final recommendation been materially shaped by it? Has an alternative been generated that did not start from it? Correction: generate one alternative that deliberately ignores the anchor and compare.

### 2. Availability heuristic
Familiar, recent, or vivid error types and solution patterns are overweighted because they come to mind easily. Check: is this over-indexing on the most recent failure mode or solution pattern? Would an agent without that memory reach the same conclusion? Is a less common but equally plausible explanation underweighted? Correction: actively consider less common explanations.

### 3. Confirmation bias
Evidence supporting the current hypothesis is sought and weighted more heavily; disconfirming evidence is discounted. Check: has the agent looked for evidence that would disprove the leader? What result would falsify it — has that test been run? Was any evidence rationalized away? Correction: run the cheapest disconfirming test.

### 4. Planning fallacy
Estimates are built from the inside view (imagining the task going well) rather than the outside view (reference class of similar past tasks) — systematically optimistic. Check: is the estimate a mental model of this task going well? What is the reference class and typical duration? Does it account for validation, review, rollback, unexpected dependencies? Correction: apply Reference Class Forecasting.

### 5. Scope insensitivity
The size, breadth, or magnitude of the problem does not scale the assessment of effort, risk, or impact. Check: does the recommendation account for the full scope? Would a twice-as-large change require proportionately more risk analysis? Is impact calibrated to the actual surface area? Correction: scale analysis effort and risk assessment to the actual scope.

### 6. Overconfidence
Subjective confidence exceeds actual reliability — strongest in fluent, well-structured outputs. Check: does the confidence match the evidence? Is uncertainty stated or smoothed over? Are genuine unknowns treated as resolved? Correction: state confidence and name the top uncertainty that could invalidate the recommendation.

### 7. Substitution (attribute substitution)
The agent answers an easier question than the one asked, often without noticing. Check: what was the actual question? Does the output answer it, or a simpler related one? Is it fixing the symptom rather than the cause? Correction: restate the original question and verify the output answers it.

### 8. Narrative fallacy
A coherent story is constructed from limited evidence — correlation treated as causation, an explanation that feels complete but is under-evidenced. Check: is the chain labeled fact/inference/guess? Is causation asserted where only correlation exists? Is the explanation more coherent than the evidence supports? Correction: label the chain explicitly; do not present inferences as facts.

## Bias checklist template

```md
## Output Being Reviewed
<one-sentence description of the recommendation, estimate, or decision>

## Bias Checks

| Bias | Check Question | Passed? | Finding / Action |
|------|---------------|---------|-----------------|
| Anchoring | Was an alternative generated that did not start from the first anchor? | yes/no | |
| Availability | Was a less familiar but equally plausible explanation considered? | yes/no | |
| Confirmation | Was the cheapest disconfirming test run? | yes/no | |
| Planning Fallacy | Was a reference class estimate applied? | yes/no | |
| Scope Insensitivity | Is the analysis scaled to the actual scope? | yes/no | |
| Overconfidence | Is uncertainty stated explicitly? | yes/no | |
| Substitution | Does the output answer the actual question? | yes/no | |
| Narrative Fallacy | Is fact vs. inference vs. guess labeled? | yes/no | |

## Biases That Require Correction
- <bias>: <what changes before output is finalized>

## Final Confidence Assessment
<high / medium / low — and primary uncertainty that remains>
```

## Automated auditor (assisted check)

`scripts/cognitive_bias_auditor.py check --decision "<description>" --bias all` evaluates 9 biases (arXiv:2410.02820):

| Bias | Flag if… |
|------|----------|
| Anchoring | Decision shaped by first answer encountered |
| Confirmation bias | No disconfirming test was run |
| Sunk cost fallacy | Decision justified by time already spent |
| Loss aversion | Status quo preferred despite better alternative |
| Framing effects | Same facts presented differently would flip the decision |
| Conjunction fallacy | Composite explanation favored over simple one |
| Overconfidence | Confidence high relative to evidence quality |
| Availability heuristic | Recent/vivid example drives the decision |
| Representativeness | Pattern match dominates statistical evidence |

## Failure modes this skill prevents

- Anchor-locked recommendations that ignore better alternatives
- Estimates consistently optimistic across every project
- Diagnoses that stop at the first plausible explanation
- Analyses that answer the easy question instead of the real one
- Confident-sounding outputs with hidden, unacknowledged uncertainty

## Pairing guide

- **Kahneman Fast/Slow** — this skill runs after slow mode is triggered; it makes slow mode bias-corrected
- **Reference Class Forecasting** — the mandatory correction for Planning Fallacy
- **Bayesian Updating** — prevents Confirmation and Narrative biases from accumulating across observations
- **Steelmanning** — the correction for Anchoring and Confirmation in recommendation contexts
- **Bounded Self-Revision** — correct and refine the output after the checklist identifies contamination

## Definition of done

Applied correctly when:
- the checklist was completed after the slow-mode output was generated
- each bias was checked honestly
- failing checks resulted in specific corrections, not just acknowledgment
- the final output states confidence and residual uncertainty explicitly
