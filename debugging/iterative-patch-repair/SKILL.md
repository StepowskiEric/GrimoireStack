---
name: iterative-patch-repair
description: Loop of generate patch → run test → capture runtime state → refine patch. Max N iterations with patch augmentation to avoid overfitting. Based on DebugRepair research (+19.9% from patch augmentation alone).
category: debugging
priority: high
tags: [debugging, iterative-repair, patch-augmentation, program-repair]
...



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

## When to use

- First patch attempt failed or only partially fixed the issue
- The bug has multiple plausible fixes (different files, different approaches)
- Test feedback reveals the fix was close but not quite right
- High stakes: you need confidence the fix is correct, not just plausible

## When NOT to use

- First patch already passes all tests
- Token budget is severely constrained (iterations multiply cost)
- The bug is a one-line typo with an obvious fix

## Core protocol

### Outer loop: Instrumentation management

For each iteration:
1. Decide if runtime state is needed (use `simulate-instrumentation`)
2. Run the test with instrumentation
3. Collect purified output (use `purify-test-output`)

### Inner loop: Patch refinement

```
Iteration 1:
  Generate patch A based on failure symptoms
  Run tests → FAIL (or PASS with caveats)
  Collect runtime state

Iteration 2:
  Generate patch B based on runtime state from iteration 1
  Run tests → FAIL (different error? same error?)
  Collect updated runtime state

Iteration 3:
  Generate patch C — try different approach or file
  Run tests → PASS
  Done.
```

### Patch augmentation

When a patch is "close" (fixes some tests but not all, or looks plausible), generate **variants**:
- Same root cause, different fix location
- Same location, different implementation approach
- Add null-check vs change default value vs refactor data flow

Pick the variant that passes ALL tests with the smallest diff.

## Iteration budget

| Complexity | Max iterations | Typical tokens |
|------------|---------------|----------------|
| Simple (single file, obvious fix) | 2 | +20% vs baseline |
| Medium (multi-file, unclear root cause) | 3-4 | +50% vs baseline |
| Complex (subtle logic, edge cases) | 5 | +100% vs baseline |

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

**Bug:** Loyalty discounts not applied for numeric customer IDs.

**Iteration 1:** Agent patches `pricingService.js` to accept string IDs too.
- Tests pass for numeric IDs, but string IDs now incorrectly get discounts.
- Runtime state shows `customerId` is `"500"` (string) when it should be `500` (number).

**Iteration 2:** Agent traces upstream to `validators.js`, sees `String(raw.customerId)`.
- Removes stringification, preserves original type.
- All tests pass. Numeric IDs get discounts, string IDs don't.

**Iteration 3 (verification):** Runs full test suite to check for regressions.
- No regressions. Fix confirmed.

## Integration

- Use with `simulate-instrumentation` to capture runtime state per iteration
- Use with `purify-test-output` to keep feedback focused
- Use with `debug-subagent` to offload diagnosis when the agent is stuck
