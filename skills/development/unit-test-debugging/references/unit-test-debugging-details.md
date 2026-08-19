# Unit Test Debugging — Reference Details

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

---

## Loop Prevention

If you catch yourself:
- Changing the same file more than twice without a clear diagnosis → **STOP. Zoom out.**
- Saying "let me just try changing X" → **STOP. Diagnose first.**
- Running the same test 5+ times in a row → **STOP. Read the code, don't just rerun.**

**Rule**: Every change must be traceable to a diagnosis. If you can't explain WHY a change will fix the test, you're guessing.

---

---

