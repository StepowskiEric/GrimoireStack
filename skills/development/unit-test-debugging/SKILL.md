---
name: unit-test-debugging
description: "Systematic workflow for fixing failing unit tests by first determining whether the tests or the code under test are the source of truth."
triggers:
  - test-failure-debugging
  - source-of-truth-diagnosis
  - test-overfitting-prevention
  - flaky-test-investigation
disable-model-invocation: true
---

# Unit Test Debugging

**Tests are NOT automatically the source of truth.** Code is NOT automatically the source of truth. Determine which is correct before changing either. This skill prevents the "loop" of changing code to match bad tests or vice versa.

## The Move

### 1. Zoom Out
Before changing any code, gather context:
- What does the test claim to verify?
- What does the code under test actually do?
- When did the failure start? (Check `git blame`)
- Who is the authority? (Spec, RFC, production behavior, or test assertions)

### 2. Diagnose
Determine which side is wrong:
- **Test wrong?** (Setup issues, testing implementation details, side effects)
- **Code wrong?** (Bug, missing spec, outdated behavior)
- **Both wrong?** (Refactoring changed signature but tests weren't updated)

### 3. Fix
- If **Test** is wrong: Fix the test to match correct behavior.
- If **Code** is wrong: Write a failing test first, then fix the code.
- **Verify**: Run the test on pre-fix code to confirm it fails. If it passes, it's not proving the bug.

## Reference
For the research basis, decision tree, failure modes, and common scenarios, see [`references/unit-test-debugging-details.md`](references/unit-test-debugging-details.md).

## Rules
- **Do** use the **Authority tiebreaker chain**: Production behavior > Spec > Code comments > Test assertions > Git history.
- **Do** run mutation checks (change one operator/argument) to verify tests catch faults.
- **Do not** change production code to match a bad test.
- **Do not** let the same process iteratively refine both code and tests simultaneously.
