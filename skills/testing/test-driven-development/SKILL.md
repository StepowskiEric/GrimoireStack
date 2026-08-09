---
name: test-driven-development
description: "Red-green-refactor loop. Write the test first, watch it fail, write the minimal fix, then refactor."
triggers:
  - Need to add tests first before writing code
  - Need red-green-refactor discipline
  - Code has no tests and needs test coverage
---

# Test-Driven Development

Red-green-refactor loop. Write the test first, watch it fail, write the minimal fix, then refactor.

## Core Protocol

### Step 1: Red

Write a failing test that describes the desired behavior. The test should fail because the feature doesn't exist yet.

**Done when:** the test fails for the expected reason.

### Step 2: Green

Write the minimal code to make the test pass. Do not add features not covered by the test.

**Done when:** the test passes.

### Step 3: Refactor

Clean up the code while keeping tests green. Remove duplication, improve naming, simplify logic.

**Done when:** all tests still pass and the code is cleaner.

## Failure Modes

- **Writing too much code in the green phase:** the minimal code should be truly minimal
- **Skipping the refactor phase:** accumulating technical debt
- **Tests that don't fail first:** if the test passes before the fix, it's not proving the bug
- **Testing implementation details:** tests should verify behavior, not internal structure
