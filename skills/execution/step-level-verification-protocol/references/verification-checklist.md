---
name: verification-checklist
description: Per-step verification checklist for the step-level verification protocol. Apply all seven checks to every drafted reasoning step before it is committed.
skill: step-level-verification-protocol
---

# Step-Level Verification Checklist

Apply every check below to each drafted step before committing it.
Mark the step **FAIL** if any check produces a red flag; resolve before proceeding.

---

## 1. Logical Soundness

**Question:** Does this step follow validly from the previously verified steps?

**What to look for:**
- Entailment: the step must be derivable from established premises
- No gaps in reasoning; every transition must be justified
- Deductive steps must have true premises; inductive steps must have adequate support

**Red flags:**
- Conclusion not supported by the stated premises
- Syllogistic errors (affirming the consequent, denying the antecedent, etc.)
- Jumping to a result without showing the connecting inference

**Failure-mode example:**

> Previous step: *"All mammals are warm-blooded."*
> Drafted step: *"Therefore, every whale is a fish."*
> ❌ **FAIL** — whales are not fish; the conclusion does not follow from the premise. The step confuses classification levels (phylum vs. class).

---

## 2. Evidence Grounding

**Question:** Are the claims in this step supported by evidence that is currently available in the verified step chain or the problem statement?

**What to look for:**
- Numbers, facts, or assertions must trace to a cited or earlier-verified source
- Avoid introducing unsupported facts as if they were already established
- Distinguish between "known" (verified) and "assumed" (not yet verified)

**Red flags:**
- New facts appear with no origin
- A numeric value differs from the source without explanation
- External knowledge treated as problem-given when it is not

**Failure-mode example:**

> Problem statement: *"A train leaves at 10:00 AM and travels 240 km at 60 km/h."*
> Drafted step: *"The train arrives at 2:40 PM."*
> ❌ **FAIL** — the step adds a departure time and arrival time of 2:40 PM with no evidence; the problem states departure at 10:00 AM and the correct arrival is 14:00. The step grounds the arrival in an unverified assumption (wrong departure hour, or misread constraint).

---

## 3. Assumption Validity

**Question:** Are all assumptions implicit or explicit in this step justifiable given what is already verified?

**What to look for:**
- List any unstated assumptions; each must be traceable to a verified premise or a clearly labelled working hypothesis
- Assumptions that are necessary but not yet verified should be escalated to the next draft cycle with explicit labels
- Working hypotheses must be falsifiable and testable at the next step

**Red flags:**
- Critical assumption never stated or checked
- Assumption that contradicts a previously verified fact
- Over-reliance on a default or "common sense" belief that is domain-specific

**Failure-mode example:**

> Drafted step: *"Since the function is continuous on [0,1], it must attain its maximum."*
> ❌ **FAIL** — the step assumes the function is also defined on a closed interval. The Extreme Value Theorem requires both continuity and a closed, bounded domain; the step silently assumes "[0,1]" is closed (true here, but in another context e.g. "(0,1)" this would be a silent and fatal assumption gap). Always state the domain as an explicit, verified premise.

---

## 4. Scope Containment

**Question:** Is this step confined to the problem scope and not reaching beyond what was asked?

**What to look for:**
- The step must solve only the sub-problem it addresses
- No unrelated side-calculations or generalisations beyond the stated goal
- Introduced variables or intermediate results must serve the declared goal

**Red flags:**
- Solving a harder version of the problem than asked (over-engineering)
- Introducing quantities not mentioned in the problem and not later used
- Answering a different question than the one posed

**Failure-mode example:**

> Problem: *"Find the total cost of 5 notebooks at $3 each."*
> Drafted step: *"Notebook price after 10% discount = $2.70 each; total = $13.50."*
> ❌ **FAIL** — scope breach. The problem never stated there is a discount; the step introduces a discount rate and computes it without evidence. Stick to the stated cost per unit.

---

## 5. Consistency

**Question:** Does this step agree with all previously committed, verified steps?

**What to look for:**
- Re-derive or re-check any reused values from earlier steps
- Flag any symbol or number that has been reassigned without an explicit update
- If the step contradicts a previous step, determine whether the earlier step or the current one is wrong

**Red flags:**
- A value that changed between steps without explanation (variable drift)
- A conclusion that flatly contradicts a previously PASSed step
- Same variable used for two different quantities in one step

**Failure-mode example:**

> Verified Step 1: *"s = (a+b+c)/2 = (13+14+15)/2 = 21"*
> Drafted step: *"s = 22, so s-a = 9"*
> ❌ **FAIL** — inconsistency. s was verified as 21; the step silently redefines s as 22, violating scope containment and consistency with the verified step chain.

---

## 6. Completeness

**Question:** Does this step carry out its intended sub-goal fully, leaving no necessary follow-up unaddressed at this level?

**What to look for:**
- All required quantities for the sub-goal are computed or stated
- Edge cases (zero, undefined, boundary conditions) are handled or explicitly deferred
- The step produces a concrete result, not a partial expression that cannot yet be evaluated

**Red flags:**
- A formula is written but not evaluated when evaluation is possible
- A case distinction is introduced but one branch is left blank
- A dimension or unit is missing from the result

**Failure-mode example:**

> Sub-goal: *"Compute the area."*
> Drafted step: *"Area = √7056"*
> ❌ **FAIL** — incomplete. The expression √7056 is not simplified; the step should evaluate it to the final numeric value (84) before advancing. Leaving it as an unevaluated radical blocks the next step and obscures verification.

---

## 7. Redundancy

**Question:** Is this step adding new information, or is it repeating work already done in a verified step?

**What to look for:**
- A step that re-derives a result already committed to verified_steps is redundant
- Duplication wastes the step budget and obscures the chain of reasoning
- However: re-derivation for cross-check purposes (e.g., Option B consistency check) is permitted, and the result must be labelled as such

**Red flags:**
- Re-stating a previously verified result without added value
- Repeating a calculation that was already accepted at a higher confidence
- Adding a step whose only purpose is to reiterate the previous step

**Failure-mode example:**

> Verified Step 3: *"s-a = 21-13 = 8"* ✅ committed
> Drafted step: *"Compute 21-13 = 8."*
> ❌ **FAIL** — redundant. The value 8 is already in verified_steps; the step adds no new information and consumes budget needlessly. Advance to the next unverified quantity instead.

---

## Quick-Reference Table

| # | Check | Focus | Typical Failure |
|---|-------|-------|----------------|
| 1 | Logical Soundness | Valid inference | Non sequitur / fallacy |
| 2 | Evidence Grounding | Traceable source | Unsupported fact |
| 3 | Assumption Validity | Explicit, justified assumptions | Silent / contradictory assumption |
| 4 | Scope Containment | Within stated problem | Overreach / side problem |
| 5 | Consistency | Agreement with verified steps | Variable drift / contradiction |
| 6 | Completeness | Sub-goal fully achieved | Partial / unevaluated result |
| 7 | Redundancy | New information only | Duplicate work |

---

## Applying the Checklist in a Loop

```
FOR each drafted step:
  APPLY checks 1–7
  IF any check FAILS:
    LOG failure mode and check number
    RETURN to VERIFY → FAIL → BACKTRACK
  ELSE:
    LOG PASS with confidence score
    COMMIT step → advance to next sub-goal
```
