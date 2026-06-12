---
name: unit-test-debugging
description: Systematic workflow for fixing failing unit tests by first determining whether the tests or the code under test are the source of truth. Use when fixing test failures, debugging test suites, resolving "tests are passing/failing unexpectedly," or when an agent keeps changing code to match failing tests without investigating root cause.
---

# Unit Test Debugging

## Core Principle

**Tests are NOT automatically the source of truth.** Code is NOT automatically the source of truth. Determine which is correct before changing either.

## The Problem This Skill Solves

Agents often:
- Assume tests are correct and change production code to make them pass
- Assume production code is correct and mark tests as "flaky"
- Loop between the same fixes without understanding the root cause
- Change one side without checking the other

This skill prevents those patterns by enforcing a diagnostic-first, zoom-out-then-zoom-in workflow.

---

## Workflow: Zoom Out → Diagnose → Fix

### Step 1: Zoom Out — Understand the Big Picture

**Before changing any code, gather context:**

1. **What does the test claim to verify?**
   - Read the test name, docstring, and assertions
   - Identify the expected behavior

2. **What does the code under test actually do?**
   - Read the full function/method/module being tested
   - Check for recent changes (git blame, recent commits)

3. **When did the failure start?**
   - Run `git bisect` or check CI history
   - Identify what changed recently: the code, the test, dependencies, or environment

4. **Who is the authority?**
   - Is there a specification, RFC, or design doc?
   - Are there integration tests or real usage that confirm the behavior?
   - What do code reviews or comments say about intent?

**Output**: Write a 1-2 sentence summary answering:
- "The test expects X because..."
- "The code currently does Y because..."
- "The source of truth should be Z because..."

### Step 2: Diagnose — Determine Which Side Is Wrong

Ask these questions **in order**:

#### Question 1: Is the test correctly written?

**Check:**
- [ ] Test setup is correct (mocks, fixtures, test data)?
- [ ] Test assertions match the expected behavior?
- [ ] Test isn't testing implementation details that changed?
- [ ] Test isn't affected by side effects (time, randomness, network)?

**Red flags:**
- Test uses hardcoded values that might have changed
- Test mocks something that shouldn't be mocked
- Test asserts on internal state, not observable behavior
- Test depends on execution order or shared state

#### Question 2: Is the code under test correct?

**Check:**
- [ ] Does the code match its specification?
- [ ] Does the code match how it's actually used in production?
- [ ] Are there integration tests that pass/fail with this code?
- [ ] Is there a bug report or user-facing issue related to this?

**Red flags:**
- Code has TODO/FIXME comments near the tested logic
- Code behavior changed recently without corresponding test updates
- Other tests that exercise similar paths also fail
- Production errors or user reports match the test failure

#### Question 3: Did both change and need reconciliation?

**Common scenarios:**
- Refactoring changed code signature but tests weren't updated
- Requirements changed, code was updated, but tests were missed
- Shared utilities changed, breaking multiple tests

### Step 3: Fix — Apply the Correct Change

#### If the TEST is wrong:
- **Do NOT change production code** to match the test
- Update the test to match the **actual correct behavior**
- Add a comment explaining why the test was wrong if it's non-obvious
- Check if other tests have the same issue

#### If the CODE is wrong:
- **Do NOT change the test** to match broken behavior
- Fix the code to match the expected behavior
- Verify the fix doesn't break other tests
- Add regression test if one doesn't exist

#### If BOTH are wrong:
- Fix the code first to match the specification
- Then fix the test to match the corrected code
- Document what the correct behavior should be

---

## Anti-Patterns to Avoid

### ❌ Loop: "Test fails → Change code → Test still fails → Change more code"
**Prevention**: Always complete Step 1 (Zoom Out) before making changes. If you've changed code twice without understanding the root cause, stop and re-read the test and code from scratch.

### ❌ Assumption: "Tests must be right because they're automated"
**Prevention**: Tests are written by humans and can be wrong, outdated, or testing the wrong thing. Always verify test intent against specifications or production behavior.

### ❌ Assumption: "Code must be right because it's in production"
**Prevention**: Production code can have bugs. Check issue trackers, user reports, and integration test results before assuming code is correct.

### ❌ Scope creep: Fixing one test reveals 10 more failures, leading to massive rewrites
**Prevention**: Stick to the scope of the failing test. If multiple tests are broken, they may share a root cause — diagnose that first, then fix systematically. Don't rewrite untested code.

---

## Decision Tree

```
Test failing?
    │
    ▼
ZOOM OUT: Understand context (Step 1)
    │
    ▼
Is the test setup correct?
    │ NO → Fix test setup
    │ YES ↓
    │
Is the test assertion correct?
    │ NO → Fix test assertion
    │ YES ↓
    │
Is the code behavior correct?
    │ NO → Fix code
    │ YES ↓
    │
Both wrong? → Fix code first, then test
```

---

## When to Add Tests vs. Fix Tests

**Fix existing tests when:**
- The test is testing correct behavior but has a bug
- The test setup is wrong (bad mock, wrong fixture)
- The test is testing implementation details that legitimately changed

**Add new tests when:**
- No test exists for the correct behavior
- The existing test coverage is insufficient
- You're adding a new edge case that should be covered

**Do NOT:**
- Delete tests that verify correct behavior
- Comment out tests "to make them pass"
- Skip investigating why a test fails

---

## Zoom Out Checklist

Use this before making ANY change to a failing test:

- [ ] Read the test name and docstring
- [ ] Read the full code under test
- [ ] Check git history for recent changes to either
- [ ] Identify what specification or behavior is the source of truth
- [ ] Run the test in isolation (not the whole suite)
- [ ] Check if other tests in the same file/module also fail
- [ ] Check if there's an issue tracker entry for this behavior

**If you can't answer "what should this code do?" in one sentence, you haven't zoomed out enough.**

---

## Debugging Commands

```bash
# Run just the failing test
npm test -- --testNamePattern="test name"
pytest path/to/test.py::test_name

# See test output with full stack trace
npm test -- --verbose
pytest -vv

# Run tests in isolation (no parallel execution)
npm test -- --runInBand
pytest -x

# Check git blame for recent changes
git blame path/to/file.ts
git log --oneline -20 -- path/to/file.ts

# Find when test started failing
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-commit>
```

---

## Common Scenarios

### Scenario 1: "The test uses a hardcoded date that's now in the past"
**Diagnosis**: Test setup is wrong (uses static date)
**Fix**: Update test to use relative dates or mock the clock

### Scenario 2: "The test expects `user.id` but code returns `user.userId`"
**Diagnosis**: Test assertion is wrong OR code has a bug
**Fix**: Check the data model/spec. If `userId` is correct, fix test. If `id` is correct, fix code.

### Scenario 3: "The test was written for v1 API, but code now uses v2"
**Diagnosis**: Test wasn't updated when API changed
**Fix**: Update test to match v2 behavior (code is correct, test is outdated)

### Scenario 4: "The test passes locally but fails in CI"
**Diagnosis**: Environment difference or flaky test
**Fix**: Check for environment dependencies, timing issues, or missing setup. Fix root cause, don't just skip the test.

### Scenario 5: "The test mocks a dependency that changed its API"
**Diagnosis**: Mock is outdated
**Fix**: Update the mock to match the current dependency API

---

## Loop Prevention

If you catch yourself:
- Changing the same file more than twice without a clear diagnosis → **STOP. Zoom out.**
- Saying "let me just try changing X" → **STOP. Diagnose first.**
- Running the same test 5+ times in a row → **STOP. Read the code, don't just rerun.**

**Rule**: Every change must be traceable to a diagnosis. If you can't explain WHY a change will fix the test, you're guessing.

---

## Escalation

If you're stuck in a loop:
1. **Stop and summarize**: What does the test expect? What does the code do? What have you tried?
2. **Check for missing context**: Is there a spec, design doc, or RFC you haven't read?
3. **Search for external knowledge**: Use `web_search` to find official documentation, GitHub issues, Stack Overflow, or blog posts about the failing test, library, or framework. Search for error messages, library versions, and framework-specific testing patterns.
4. **Ask the user**: "I'm going in circles. The test expects X, the code does Y. Which is correct, and where is that documented?"
5. **Call the advisor**: If you've exhausted the above and still don't understand the root cause, call `advisor()` before making any more changes. Explain the situation clearly — what the test expects, what the code does, what you've tried, and why you're stuck. The advisor may spot something you missed or suggest a different angle.
