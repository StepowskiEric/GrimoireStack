---
name: step-level-verification-protocol
description: Verify each reasoning step before proceeding to prevent error propagation in multi-step tasks. Based on verified critical step optimization research (arXiv:2602.03412, 2507.15512).
category: execution
tags: [verification, reasoning, step-by-step, error-prevention, state-machine]
author: Research synthesis
date: 2026-04-20
version: 1.0.0
...



---

# Step-Level Verification Protocol

## When to Use

Use this skill when:
- Solving multi-step problems where errors compound
- Working with long reasoning chains (>3 steps)
- Accuracy is more important than speed
- Previous attempts produced cascading errors
- The task has clear intermediate checkpoints

## State Machine Protocol

```
┌─────────────┐
│    INIT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   DRAFT     │────▶│   VERIFY    │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │    PASS     │           │    FAIL     │
       └──────┬──────┘           └──────┬──────┘
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   COMMIT    │           │  BACKTRACK  │
       └──────┬──────┘           └──────┬──────┘
              │                           │
              │                 ┌─────────┴─────────┐
              │                 │                   │
              │                 ▼                   ▼
              │          ┌─────────────┐     ┌─────────────┐
              │          │   REVISE    │     │   RESTART   │
              │          └──────┬──────┘     └──────┬──────┘
              │                 │                   │
              │                 └─────────┬─────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  COMPLETE?  │
                     └──────┬──────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │   FINAL     │       │   DRAFT     │
          └──────┬──────┘       └─────────────┘
                 │
                 ▼
          ┌─────────────┐
          │    DONE     │
          └─────────────┘
```

## States

### INIT
**Purpose:** Establish verification criteria and step budget

**Entry Actions:**
- Define what makes a step "correct"
- Set maximum backtracks allowed (default: 3)
- Identify verification method (self-check, external validation, consistency check)
- Initialize step counter

**Exit Conditions:** Always → DRAFT

**Output Format:**
```yaml
verification_plan:
  criteria: "What constitutes a valid step"
  method: "self_check|external|consistency"
  max_backtracks: 3
  step_budget: 10
```

___


### DRAFT
**Purpose:** Generate the next reasoning step

**Entry Actions:**
- Based on current state, generate next step
- Do NOT generate multiple steps ahead
- Keep step atomic and verifiable

**Prompt Template:**
```
Given the problem state and previous verified steps, generate ONLY the next step.

Previous steps: {{verified_steps}}
Current state: {{current_state}}

Generate the next single step. This should be:
- Atomic (one logical operation)
- Verifiable (can be checked for correctness)
- Necessary (directly advances toward solution)

Next step:
```

**Exit Conditions:** Always → VERIFY

___


### VERIFY
**Purpose:** Check if the drafted step is correct

**Entry Actions:**
Apply verification method chosen in INIT:

**Option A: Self-Check**
```
Critically evaluate this step:
"{{drafted_step}}"

Does this step:
1. Follow logically from previous steps? (yes/no + why)
2. Advance toward the goal? (yes/no + why)
3. Contain any assumptions not yet justified? (list them)
4. Have any logical flaws? (describe)

Verdict: PASS / FAIL
Confidence: 0-1
```

**Option B: Consistency Check**
- Generate the step 2-3 times independently
- Check if results are consistent
- If inconsistent, investigate why

**Option C: External Validation**
- Run the step through external tool/validator
- Check against known constraints

**Exit Conditions:**
- Confidence ≥ 0.8 and no critical issues → PASS
- Confidence < 0.8 or critical issues found → FAIL

___


### PASS
**Purpose:** Commit the verified step

**Entry Actions:**
- Add step to verified_steps list
- Update current_state with step result
- Increment step counter
- Log verification confidence

**Exit Conditions:** Always → COMPLETE?

___


### FAIL
**Purpose:** Handle verification failure

**Entry Actions:**
- Log failure reason
- Increment backtrack counter
- Analyze what went wrong

**Prompt Template:**
```
Step failed verification: {{drafted_step}}
Failure reason: {{failure_reason}}

Options:
1. Revise the step (minor fix needed)
2. Backtrack to previous step (assumption was wrong)
3. Restart from beginning (fundamental misunderstanding)

Recommended action: {{action}}
Explanation: {{why}}
```

**Exit Conditions:** Always → BACKTRACK

___


### BACKTRACK
**Purpose:** Return to a valid state and retry

**Entry Actions:**
- If action is "revise": Return to DRAFT with feedback
- If action is "backtrack": Remove last verified step, return to DRAFT
- If action is "restart": Clear all steps, return to INIT
- If backtrack counter > max: Escalate to human or abort

**Exit Conditions:** Always → DRAFT (or INIT if restarting)

___


### COMMIT
**Purpose:** Finalize the verified step chain

**Entry Actions:**
- Assemble all verified steps into final output
- Include confidence scores for traceability
- Add verification summary

**Exit Conditions:** Always → DONE

___


### COMPLETE?
**Purpose:** Check if problem is solved

**Entry Actions:**
- Evaluate if current state satisfies goal
- Check if all constraints are met
- Verify solution completeness

**Exit Conditions:**
- Solution complete → COMMIT
- More steps needed → DRAFT

___


### DONE
**Purpose:** Terminate with verified solution

**Entry Actions:**
- Return final answer
- Include step-by-step verification log
- Note any backtracks that occurred

## Verification Checklist

For each step, verify:

- [ ] Step follows from previous steps (entailment)
- [ ] Step advances toward goal (progress)
- [ ] Step has no unjustified assumptions (soundness)
- [ ] Step is clearly stated (clarity)
- [ ] Confidence score ≥ 0.8 (certainty)

## Example Usage

```markdown
Problem: Find the area of a triangle with sides 13, 14, 15.

[INIT]
Plan: Use Heron's formula. Verify each calculation step.

[DRAFT] Step 1: Calculate semi-perimeter s = (13+14+15)/2 = 21
[VERIFY] Check: 13+14+15=42, 42/2=21 ✓ PASS (confidence: 1.0)

[DRAFT] Step 2: Calculate area = sqrt(s(s-a)(s-b)(s-c))
[VERIFY] Check: Formula is correct ✓ PASS (confidence: 1.0)

[DRAFT] Step 3: Compute s-a=8, s-b=7, s-c=6
[VERIFY] Check: 21-13=8, 21-14=7, 21-15=6 ✓ PASS (confidence: 1.0)

[DRAFT] Step 4: Area = sqrt(21*8*7*6) = sqrt(7056) = 84
[VERIFY] Check: 21*8=168, 168*7=1176, 1176*6=7056, sqrt(7056)=84 ✓ PASS

[COMPLETE?] Yes, area calculated.
[DONE] Area = 84 square units
```

## Pitfalls

1. **Over-verification:** Don't verify trivial steps (e.g., simple arithmetic) unless precision is critical
2. **Verification loops:** Set max iterations to prevent infinite backtracking
3. **Confidence inflation:** Be conservative with self-assigned confidence scores
4. **Premature commitment:** Don't skip verification for "obvious" steps — obvious errors are still errors

## Integration

Combine with:
- `tree-of-thoughts`: Use step-level verification on each branch
- `cognitive-friction-governor`: Budget verification effort
- `how-to-solve-it-state-machine`: For problem decomposition before stepping

## Research Basis

- Verified Critical Step Optimization (arXiv:2602.03412)
- Step-level Verifier-guided Hybrid Test-Time Scaling (arXiv:2507.15512)
- Process Reward Models for LLM Reasoning (arXiv:2504.18429)
