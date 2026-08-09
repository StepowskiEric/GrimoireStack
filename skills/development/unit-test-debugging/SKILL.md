---
name: unit-test-debugging
description: Systematic workflow for fixing failing unit tests by first determining whether the tests or the code under test are the source of truth. Use when fixing test failures, debugging test suites, resolving "tests are passing/failing unexpectedly," or when an agent keeps changing code to match failing tests without investigating root cause. Also use when improving weak passing tests that do not actually prove correctness.
---

# Unit Test Debugging

## Core Principle

**Tests are NOT automatically the source of truth.** Code is NOT automatically the source of truth. Determine which is correct before changing either.

A passing test is only valuable if it actually verifies correct behavior. A failing test is only useful if it captures the right behavior. This skill prevents both kinds of false confidence.

**Tests are the formal specification.** When a test exists, treat it as the contract — the code must implement to the test, not the test to the code. If you need to change behavior, change the test first, then implement to match. Never modify a test to make broken code pass.

**Separate test generation from code generation.** Never let the same process iteratively refine both code and tests simultaneously. This is the primary mechanism of test overfitting (arXiv:2511.16858). Generate the test first, freeze it, then generate code to pass it.

## The Problem This Skill Solves

Agents often:
- Assume tests are correct and change production code to make them pass
- Assume production code is correct and mark tests as "flaky"
- Loop between the same fixes without understanding the root cause
- Change one side without checking the other
- "Fix" code to make a bad test pass, then claim correctness
- Leave passing tests that prove nothing because they assert implementation details or hide behavior behind mocks

This skill prevents those patterns by enforcing a diagnostic-first, zoom-out-then-zoom-in workflow, and by requiring tests to actually verify behavior rather than just pass.

## Research Basis

This skill is informed by recent research on LLM test overfitting and test-driven development:

- **Test Overfitting on SWE-bench** (arXiv:2511.16858, Apr 2026) — LLMs that iteratively refine code and tests jointly produce code that passes observed tests but misses important cases. The tests become a rubber stamp, not a correctness guarantee.
- **Tests as Prompt** (arXiv:2505.09027, May 2025) — Tests should serve as both prompt and verification. Instruction following and in-context learning matter more than general coding ability for TDD success.
- **TDD-Bench Verified** (arXiv:2412.02883, Dec 2024) — Introduces fail-to-pass as the primary metric. A test that doesn't fail before the fix is not proving the bug.
- **Rethinking Verification** (arXiv:2507.06920, Jul 2025) — Existing test suites are often too weak to verify LLM-generated code. Test thoroughness metrics (not just pass/fail) are needed.
- **TiCoder** (arXiv:2404.10100, IEEE TSE 2024) — Using tests as intent clarification before code generation improves pass@1 accuracy by 45.97%.
- **LLM Unit Test Generation Survey** (arXiv:2511.21382, Nov 2025) — Iterative validation loops improve pass rates but don't necessarily improve fault detection. Weak fault detection remains the core problem.
- **Meta Mutation-Guided Testing** (arXiv:2501.12862, Jan 2025) — Mutation testing (generating small code changes and verifying tests catch them) is the strongest technique for proving tests detect real faults.

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

5. **Authority tiebreaker chain** — When no single authority is obvious, resolve in this order:
   - **Production behavior + integration tests** — what the system actually does when real users hit it
   - **Spec, RFC, or design doc** — what was explicitly agreed upon
   - **Code comments** — what the author intended at the time
   - **Test assertions** — what the test claims should happen
   - **Git history** — what changed and when

   If two levels conflict, the higher level wins until proven otherwise.

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

---

## Fix — Apply the Correct Change

### Step 3: Verify Before Changing Code

Before changing production code, **confirm the test catches the bug**:

- If the code is wrong and no existing test covers the correct behavior, **write a new failing test first**.
- If a test already exists but is wrong, fix it to assert the correct behavior.
- **Run the test and confirm it fails on the current code.** If it passes before the fix, it is not proving the bug.

If the test passes before your fix, stop. Either the test is not testing what you think it tests, or the code is not actually broken. Diagnose before proceeding.

### Step 4: Make the Change

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

### Step 5: Post-Fix Verification

After making the change, confirm correctness:

- [ ] Run the fixed test in isolation — it should pass
- [ ] If you wrote a new test, **run it on the pre-fix code** — it should fail. If it passes, the test is not proving the bug and needs rework.
- [ ] Run the full test suite — no regressions
- [ ] If the fix was in production code, check whether other tests in the same area need updating

This step separates "test passes" from "test proves correctness."

### Step 6: Mutation Testing (for correctness-critical code)

For code where correctness matters (payment, auth, data integrity), verify that the test actually catches faults by running a lightweight mutation check:

1. Make a small intentional change to the code that should break the behavior (change `>` to `>=`, swap arguments, return `null` instead of the result, remove a validation check)
2. Run the test — it should **fail** on the mutated code
3. Revert the mutation

If the test passes on mutated code, it is not proving correctness. Either the test is too weak (asserts on the wrong thing) or it doesn't exercise the code path you think it does.

This is a lightweight version of formal mutation testing (Meta's ACH system, arXiv:2501.12862). You don't need a full mutation framework — one targeted mutation is enough to check whether the test is real.

---

## Failure Modes

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
Authority tiebreaker: what is the source of truth?
    │
    ▼
Is the test correctly written?
    │ NO → Fix test (do NOT change code to match bad test)
    │ YES ↓
    │
Is the code behavior correct?
    │ NO → Write failing test first → Fix code
    │ YES ↓
    │
Both wrong? → Fix code first, then test
    │
    ▼
POST-FIX: Run test on pre-fix code — does it fail?
    │ NO → Test is not proving the bug. Redesign test.
    │ YES ↓
    │
MUTATION CHECK (for critical code): Does test fail on mutated code?
    │ NO → Test is too weak. Strengthen assertions.
    │ YES ↓
    │
Test proves correctness.
```

---

## Test Quality Audit

Before claiming a test proves correctness, check whether it actually does:

**Does the test assert on observable behavior?**
- Return value, side effects, public state, or external effects
- NOT internal state, private fields, error message strings, or call counts

**Does the test exercise real code paths?**
- The code under test should run actual logic, not return a mocked value
- If everything is mocked, the test proves nothing about the implementation

**Does the test cover failure modes?**
- Empty input, null, boundary values, error conditions
- A test that only covers the happy path is not proving correctness

**Would the test fail on mutated code?**
- Change one operator, swap an argument, or remove a validation
- If the test still passes, it is not detecting the fault it should

**Does the test have a clear failure message?**
- When it fails, can you tell what went wrong and why?
- Tests with no assertion message or generic "expect(x).toEqual(y)" are harder to debug

A test that fails all five checks is passing trivially. It exists but proves nothing.

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

### Scenario 6: "The test passes because everything is mocked"
**Diagnosis**: Test asserts nothing real — mocks hide the actual behavior. The test passes trivially because it never hits the real code path.
**Fix**: Replace mocks with real implementations (or spy on calls) for the parts under test. The test should exercise actual logic, not a mock that returns a hardcoded value.

### Scenario 7: "The test asserts on internal state or error message format"
**Diagnosis**: Test is testing implementation details, not behavior. When internals change, the test breaks even though behavior is correct.
**Fix**: Rewrite the test to assert on observable behavior (return value, side effects, public state) instead of internal structure.

### Scenario 8: "The test is flaky — passes sometimes, fails sometimes"
**Diagnosis**: Test depends on non-deterministic factors: timing, execution order, shared mutable state, or external services.
**Fix**: Make the test deterministic. Mock time, isolate state, remove shared fixtures, and ensure the test passes the same way every run.

### Scenario 9: "The test passes but doesn't cover edge cases"
**Diagnosis**: Test covers the happy path only. No tests for empty input, null, boundary values, error conditions, or concurrent access.
**Fix**: Add cases for empty/null, min/max, off-by-one, error paths, and any boundary where behavior could silently break. A passing test that only covers the easy path is not proving correctness.

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

### When to Route Elsewhere

- **3+ tests in the same area are wrong or weak**: This is likely a spec/contract gap, not individual test bugs. Route to `requirement-crystallization-protocol` to clarify what the behavior should be, or `review-ladder-plus` for a broader correctness review.
- **Tests pass but you suspect the code is still wrong**: The tests may be testing the wrong thing entirely. Route to `critical-system-interrogation` or `llm-pre-push-review` for a deeper correctness and security review.
- **The test is correct, the code is correct, but you don't trust either**: Route to `verified-synthesize` if mathematical proof is needed, or `pre-deployment-gate` if this is a production-readiness concern.
- **You need to verify tests catch real faults**: Run a mutation check (Step 6). If the test doesn't kill the mutant, the test is too weak. Consider `review-ladder-plus` for forced test generation with adversarial review.
