---
name: iterative-patch-repair
description: "Loop of generate patch → run test → capture runtime state → refine patch. Max N iterations with patch augmentation to avoid overfitting. Use when first patch attempt failed, bug has multiple plausible fixes, or test feedback reveals the fix was close but not quite right."
triggers:
  - First patch attempt failed or only partially fixed the issue
  - Bug has multiple plausible fixes (different files, different approaches)
  - Test feedback reveals the fix was close but not quite right
  - High stakes: need confidence the fix is correct, not just plausible
category: debugging
priority: high
tags: [debugging, iterative-repair, patch-augmentation, program-repair]
---

## Overview

Most agents generate one patch and hope it works. **Iterative Patch Repair** treats patch generation as a search process:
1. Generate candidate patch
2. Run tests to verify
3. Capture runtime feedback (pass/fail + state)
4. Refine or generate variants
5. Repeat until fix confirmed or budget exhausted

This is especially powerful for bugs where the first plausible fix is wrong — a common failure mode where the agent "fixes" the symptom but not the root cause.

Research shows patch augmentation (generating variants) alone provides a **+19.9%** correctness improvement.

## Core protocol

Iterate with bounded refinement.

For each iteration:
1. Use `simulate-instrumentation` only when runtime state is needed.
2. Run the test and capture purified output with `purify-test-output`.
3. Generate the next patch from that concrete failure state.

**Done when:** the current iteration's patch has been generated and tested. If it passes, the loop is done. If it fails, advance to the next iteration.

If the patch is close but not complete, generate **variants** for the next attempt:
- Same root cause, different fix location
- Same location, different implementation approach
- Add null-check, change default, or refactor data flow

Pick the variant that passes all tests with the smallest diff.

**Done when:** either a variant passes all tests, or all variants are exhausted and the iteration budget is consumed.

### Iteration budget

| Complexity | Max iterations | Typical tokens |
|------------|---------------|----------------|
| Simple (single file, obvious fix) | 2 | +20% vs baseline |
| Medium (multi-file, unclear root cause) | 3-4 | +50% vs baseline |
| Complex (subtle logic, edge cases) | 5 | +100% vs baseline |

### Exhaustion

If the budget is exhausted without a confirmed fix, stop patching and escalate.

**Done when:** the escalation path has been chosen and the evidence log has been transferred to the next skill or user.

## State tracking

Maintain a running log across iterations:

```markdown
## Repair Log

### Iteration 1
- Patch: Changed `customer["id"]` to `customer["customer_id"]` in payments.py
- Result: FAIL — test still fails, but error moved to different assertion
- Runtime state: `totalPrice` is still wrong (100 instead of 85)
- Analysis: Fixed the KeyError but missed that `customerId` is stringified upstream

### Iteration 2
- Patch: Removed `String()` wrapper in validators.py, preserved original type
- Result: PASS
- Verification: All 3 tests pass, string IDs still get no discount
```

## Research basis

- **DebugRepair** (arXiv:2604.19305): Hierarchical iterative process with outer (instrumentation) and inner (patch refinement) loops.
- **Patch augmentation**: Generating variants of plausible patches improves correctness by **+19.9%**.
- **Feedback integration**: Using negative feedback from failed patches to guide subsequent repairs is critical — without it, agents repeat the same wrong fix.

## Anti-patterns

- **Same patch, different iteration**: If iteration N produces the same diff as iteration N-1, stop. The agent is stuck in a loop.
- **Fixing tests instead of code**: If the patch modifies test expectations, that's a red flag. The bug is in the code, not the test.
- **Overfitting to test suite**: A patch that makes tests pass but introduces regressions elsewhere is worse than no fix. Run broader test suite before finalizing.

## Example

```
Iteration 1: patch symptom → tests still fail, but error moved
Iteration 2: use runtime state → patch root cause → tests pass
Iteration 3: run broader suite → confirm no regressions
```

## Integration

- Use with `simulate-instrumentation` to capture runtime state per iteration
- Use with `purify-test-output` to keep feedback focused
- Use with `debug-subagent` to offload diagnosis when the agent is stuck
- If unsure whether test or code is wrong, run `unit-test-debugging` first, then resume this skill
