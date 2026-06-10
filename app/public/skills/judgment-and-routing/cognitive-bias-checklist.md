# Skill: Cognitive Bias Checklist for AI Agents

## Purpose

Use this skill when the agent is in slow-mode reasoning — making an important decision, recommendation, estimate, architecture choice, or analysis — and needs to check whether specific high-consequence cognitive biases have contaminated the output.

This skill is a companion to *Thinking Fast and Slow for Software Engineering Agents*.
That skill routes between fast mode and slow mode.
This skill enumerates the specific biases most dangerous to agents operating in slow mode and requires an explicit check before finalizing a slow-mode recommendation.

Source: Daniel Kahneman's *Thinking, Fast and Slow*, Kahneman, Sibony, and Sunstein's *Noise: A Flaw in Human Judgment*, and decades of behavioral economics research.

---

## Core Rule

Slow mode is only valuable if the biases that corrupt slow-mode reasoning are explicitly checked.

Reasoning carefully is not the same as reasoning correctly.
The most confident-sounding slow-mode outputs are often the ones most contaminated by bias.

---

## When to Use

Use this skill after completing a slow-mode analysis, recommendation, or estimate, before finalizing and delivering the output.

Apply when any of the following is true:
- the agent has committed to a hypothesis, diagnosis, or recommendation
- an estimate has been produced
- an architectural or design decision has been made
- a plan with significant scope has been finalized
- the output feels obviously correct (this is a strong signal that bias may be at work)

---

## The High-Consequence Bias Checklist

Work through each bias below. For each one, apply the check honestly.

---

### 1. Anchoring Bias
**What it is**: the first piece of information encountered (the first error message, the first proposed solution, the first estimate given) dominates subsequent reasoning disproportionately.

**Check**:
- What was the first answer, hypothesis, or suggestion the agent encountered?
- Has the final recommendation been materially shaped by that first anchor?
- Has at least one alternative been generated that did not start from that anchor?

**Correction**: if anchoring is suspected, generate one alternative that deliberately ignores the original anchor and compares it.

---

### 2. Availability Heuristic
**What it is**: familiar, recent, or vivid error types, failure modes, or solution patterns are overweighted because they come to mind easily.

**Check**:
- Is this recommendation over-indexing on the most recently seen failure mode or the most recently used solution pattern?
- Would an agent without memory of the recent context reach the same conclusion?
- Is there a less common but equally plausible explanation that is being underweighted?

**Correction**: actively consider less common explanations before finalizing the recommendation.

---

### 3. Confirmation Bias
**What it is**: evidence that supports the current hypothesis is sought and weighted more heavily; disconfirming evidence is discounted.

**Check**:
- Has the agent looked for evidence that would disprove the leading hypothesis?
- For the top hypothesis: what result would falsify it? Has that test been run?
- Was any evidence discounted or rationalized away?

**Correction**: run the cheapest disconfirming test before finalizing.

---

### 4. Planning Fallacy
**What it is**: estimates are built from the inside view (imagining the task going well) rather than from the outside view (reference class of similar past tasks). Estimates are systematically optimistic.

**Check**:
- Is the estimate based on a mental model of this specific task going well?
- What is the reference class for this type of work, and what is the typical duration?
- Has the estimate accounted for validation, review, rollback, and unexpected dependencies?

**Correction**: apply Reference Class Forecasting before committing to the estimate.

---

### 5. Scope Insensitivity
**What it is**: the size, breadth, or magnitude of a problem or solution does not appropriately scale the agent's assessment of effort, risk, or impact.

**Check**:
- Does the recommendation account for the full scope of what is being changed?
- Would a change twice as large require significantly more risk analysis? Has that been done proportionately?
- Is the impact assessment calibrated to the actual surface area?

**Correction**: scale the analysis effort and risk assessment in proportion to the actual scope.

---

### 6. Overconfidence Bias
**What it is**: subjective confidence in conclusions is higher than their actual reliability warrants. Agents that produce fluent, well-structured output often exhibit this most strongly.

**Check**:
- How confident does this output sound? Does that confidence match the actual evidence?
- Has uncertainty been stated explicitly, or has it been smoothed over?
- Are there genuine unknowns that have been treated as resolved?

**Correction**: explicitly state confidence level and name the top uncertainty that could invalidate the recommendation.

---

### 7. Substitution Bias (Attribute Substitution)
**What it is**: the agent answers an easier question than the one actually asked, often without noticing.

**Check**:
- What was the actual question asked?
- Has the output answered that question, or a simpler but related one?
- Is the output fixing the symptom rather than the cause?

**Correction**: restate the original question explicitly and verify the output answers it.

---

### 8. Narrative Fallacy
**What it is**: the agent constructs a coherent story from limited evidence, treating correlation as causation and producing an explanation that feels complete but is under-evidenced.

**Check**:
- Has the reasoning chain been labeled as fact / inference / guess at each step?
- Has causation been asserted where only correlation is established?
- Is the explanation more coherent than the evidence actually supports?

**Correction**: label the chain explicitly as facts, inferences, and guesses. Do not present inferences as facts.

---

## Bias Checklist Template

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

---

## Agent Rules

### Do
- apply this checklist after slow-mode reasoning, not instead of it
- be honest when a bias has likely contaminated the output — the correction is better than the contaminated result
- state uncertainty explicitly in the final output
- apply Reference Class Forecasting immediately if the Planning Fallacy check fails

### Do Not
- use this checklist as a ritual that produces "passed" for every check without genuine self-examination
- skip the disconfirming test because it would be inconvenient
- produce a corrected output that is actually just a rephrasing of the biased one

---

## Failure Modes This Skill Prevents

- anchor-locked recommendations that ignore better alternatives
- estimates that are consistently optimistic across every project
- diagnoses that stop at the first plausible explanation
- analyses that answer the easy question instead of the real one
- confident-sounding outputs that have hidden, unacknowledged uncertainty

---

## Pairing Guide

- **Kahneman Fast/Slow** — this skill is invoked after slow mode is triggered; it ensures slow mode is actually bias-corrected
- **Reference Class Forecasting** — the mandatory correction for Planning Fallacy
- **Bayesian Updating** — Bayesian Updating prevents the Confirmation and Narrative biases from accumulating across multiple observations
- **Steelmanning** — the correction for Anchoring and Confirmation biases in recommendation contexts
- **Bounded Self-Revision** — after the bias checklist identifies contamination, use Bounded Self-Revision to correct and refine the output

---

## Definition of Done

This skill was applied correctly when:
- the bias checklist was completed after the slow-mode output was generated
- each bias was checked honestly
- failing checks resulted in specific corrections, not just acknowledgment
- the final output states confidence and residual uncertainty explicitly

---

## Final Instruction

Reasoning carefully is not the same as reasoning correctly.

Check each bias.
Be honest.
Correct what failed.
State what remains uncertain.
