# Step-Level Verification — Checklist, Templates & Research

## Verification checklist

For each step, verify:

- [ ] **Logical soundness** — the step follows from previous steps (entailment)
- [ ] **Evidence grounding** — claims are supported, not asserted
- [ ] **Assumption validity** — every assumption is justified or flagged
- [ ] **Scope containment** — the step does what the plan says, no more
- [ ] **Consistency** — no contradictions with earlier verified steps
- [ ] **Completeness** — the step fully covers its part of the problem
- [ ] **Redundancy** — no repeated or wasted operations
- [ ] **Certainty** — confidence score ≥ 0.8

## Prompt templates

### Draft

```
Given the problem state and previous verified steps, generate ONLY the next step.

Previous steps: {{verified_steps}}
Current state: {{current_state}}

Generate the next single step. This should be:
- Atomic (one logical operation)
- Verifiable (can be checked for correctness)
- Necessary (directly advances toward solution)
```

### Verify (self-check)

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

### Failure handling

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

## Verification methods

- **Self-check** — critically evaluate the step against the four questions
- **Consistency check** — generate the step 2–3 times independently; inconsistent results get investigated
- **External validation** — run the step through an external tool or validator; check against known constraints

## Pitfalls

1. **Over-verification** — verifying trivial steps wastes budget; verify unless precision is critical
2. **Verification loops** — max iterations prevent infinite backtracking
3. **Confidence inflation** — be conservative with self-assigned scores
4. **Premature commitment** — skipping verification for "obvious" steps; obvious errors are still errors

## Example usage

```markdown
Problem: Find the area of a triangle with sides 13, 14, 15.

[INIT] Plan: Use Heron's formula. Verify each calculation step.

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

## Integration

- `tree-of-thoughts` — apply step-level verification on each branch
- `cognitive-friction-governor` — budget verification effort
- `how-to-solve-it-state-machine` — decompose the problem before stepping

## Research basis

- Verified Critical Step Optimization (arXiv:2602.03412)
- Step-level Verifier-guided Hybrid Test-Time Scaling (arXiv:2507.15512)
- Process Reward Models for LLM Reasoning (arXiv:2504.18429)
