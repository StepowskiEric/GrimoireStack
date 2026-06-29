---
source: "GrimoireStack"
name: minimal-reproduction
description: "Write the smallest possible test that demonstrates the bug, then use it as ammunition for debugging."
triggers:
  - Bug manifests at runtime but no test covers the buggy path
  - Agent is debugging by repeatedly running the full app instead of a targeted test
  - "I can see the bug in the UI but I can't isolate it in a test"
  - Agent is about to patch code without a test that verifies the fix
  - Test suite passes but the feature still doesn't work (untested path)
  - Agent wants to use debug-to-fix-pipeline but has no failing test to start Phase 3
---

# Minimal Reproduction

## Why This Skill Exists

Every structured debugging skill (debug-to-fix-pipeline, iterative-patch-repair, specter) assumes you have a failing test to work with. But the most common debugging scenario is:

1. Bug visible at runtime
2. No existing test covers the buggy code path
3. Agent guesses at a fix, applies it, runs the full app, checks manually
4. Can't tell if fix worked or just shifted the symptom

This skill creates the failing test first, THEN hands off to other debugging skills.

## The MR Protocol (Minimal Reproduction)

### Step 1: Describe the Bug Precisely

Write down the exact observable behavior, not your interpretation:

```markdown
Bug: [exact behavior, not interpretation]
Expected: [what should happen instead]
When: [exact conditions to trigger it]
Scope: [files/functions likely involved]
```

**Bad:** "The login button doesn't work"
**Good:** "Tapping the login button on the auth screen shows no visual feedback and does not navigate to the home screen. Console shows no errors. The button's onPress handler fires but `signInAsync` promise never resolves."

**Done when:** the bug description is specific enough that someone else could confirm whether the bug is present without seeing what you see.

### Step 2: Find the Minimal Trigger

Reduce the trigger to the smallest possible input/condition:

| Full trigger | Minimal trigger |
|-------------|----------------|
| Login with email, password, on iOS, slow network | `signInAsync(credentials)` with valid creds |
| Bug happens after scrolling through 100 items then tapping one | Bug happens on item tap after list render |
| Crash when form has special chars in name field | `submitForm({ name: '<script>' })` |

**Questions to ask:**
- Does it happen with the simplest possible input?
- Does it happen on the first attempt or only after specific actions?
- Does it happen in isolation or only combined with other features?

**Done when:** the trigger is reduced to the simplest input/condition that you believe produces the bug. If multiple triggers are possible, start with the simplest one.

### Step 3: Write the Reproduction Test

Template for a minimal reproduction test:

```typescript
// test/minimal-reproduction.test.ts

import { describe, it, expect } from "test-framework";

describe("Bug: [one-line description]", () => {
  it("demonstrates [exact behavior]", async () => {
    // ARRANGE: minimal setup to trigger the bug
    const input = minimalInput;

    // ACT: the smallest action that produces the bug
    const result = await functionUnderTest(input);

    // ASSERT: what should happen (currently doesn't)
    expect(result).toBe(expectedValue);
    // NOT: expect(result).toBe(actualBuggyValue) — that papers over the bug
  });
});
```

**Rules:**
- The test must FAIL with current code (proves you reproduced the bug)
- The test must PASS when the bug is fixed (proves your fix actually works)
- No mocking unless the dependency makes the test non-deterministic
- No setup that isn't directly required to trigger the bug
- One assertion that directly tests the buggy behavior

**Done when:** the test file exists, follows the rules above, and asserts the expected (not current buggy) behavior.

### Step 4: Verify the Test Fails

Run the test in isolation:

```bash
# Run just the reproduction test
npx jest test/minimal-reproduction.test.ts --no-coverage

# Confirm it fails with the expected failure
# If it PASSES → you haven't reproduced the bug, go back to Step 2
# If it FAILS for a DIFFERENT reason → fix the test setup, not the bug
```

**Done when:** the test fails with the expected error. If it passes, you haven't reproduced the bug — go back to Step 2. If it fails for a different reason, the test setup is wrong — fix the test, not the code.

**Critical:** If the test passes, you haven't reproduced the bug. This means one of:
- Your hypothesis about which code path triggers it is wrong
- The bug requires conditions you didn't include (timing, state, network)
- The bug is in a different layer than you think

### Step 5: Debug With Ammunition

Now you have what every other debugging skill needs: **a failing test**.

Hand off to the appropriate debugging skill:

| Situation | Skill to Use |
|-----------|-------------|
| Know where the bug is, need to find the fix | `iterative-patch-repair` |
| Bug has multiple possible causes | `specter` |
| Need full structured workflow | `debug-to-fix-pipeline` |
| Bug was introduced recently | `bisect-debugging` then this skill |
| Bug is in runtime behavior (async, state) | `simulate-instrumentation` |

**Done when:** the bug-fix skill has been selected and invoked with the failing test as input.

### Step 6: Verify the Fix

After applying a fix:

```bash
# 1. Run the reproduction test — must PASS
npx jest test/minimal-reproduction.test.ts

# 2. Run the full test suite — must have NO regressions
npm run check

# 3. The test should remain as a regression test
# (don't delete it — it prevents the bug from returning)
```

**Done when:** the reproduction test passes AND the full test suite passes with no regressions. If either fails, the fix is incomplete.

**Anti-pattern:** Removing the reproduction test after fixing the bug. This test is now a permanent regression guard.

---

## Common Reproduction Patterns

### Pattern: Async Timing Bug

Bug only appears when async operations complete in a specific order.

```typescript
it("demonstrates race condition in data fetch", async () => {
  // Use fake timers to control async timing precisely
  jest.useFakeTimers();

  const promise = fetchUserData(userId);
  // Advance past one network request but not the other
  jest.advanceTimersByTime(100);

  const result = await promise;
  expect(result.status).toBe("complete"); // currently "pending"
});
```

### Pattern: State-Dependent Bug

Bug only appears when app state is in a specific configuration.

```typescript
it("demonstrates crash when submitting form with stale session", async () => {
  // Set up the specific state that triggers the bug
  const staleSession = { token: "expired", userId: "123" };
  useAuthStore.setState({ session: staleSession });

  const result = await submitForm(validInput);
  expect(result.error).toBeUndefined(); // currently throws
});
```

### Pattern: Rendering Bug (React Native / Expo)

Bug only appears in UI rendering, no test covers it.

```typescript
it("renders user avatar when image URL is provided", () => {
  const { getByTestId } = render(
    <UserProfile user={{ name: "Test", avatarUrl: "https://img.test/1.jpg" }} />
  );
  expect(getByTestId("user-avatar")).toBeTruthy(); // currently null
});
```

### Pattern: Integration Bug (API → UI)

Bug is in the connection between layers.

```typescript
it("displays server error message when API returns 400", async () => {
  server.use(
    rest.post("/api/submit", (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ error: "Invalid input" }))
    )
  );

  const { getByText } = render(<SubmitForm />);
  await userEvent.press(getByText("Submit"));

  expect(getByText("Invalid input")).toBeTruthy(); // currently shows generic error
});
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Writing a test that asserts current buggy behavior | Tests the symptom, not the fix; will pass before bug is fixed |
| Mock-heavy reproduction test | Can't mock away the bug — you need the real code to fail |
| Reproduction test that requires full app startup | Too slow; makes the debug loop minutes instead of seconds |
| Skipping the "verify test fails" step | If the test passes, you're debugging code that isn't the bug |
| Deleting the reproduction test after fixing | Bug will return; the test is a permanent regression guard |
| Testing the fix instead of the bug | Write the test BEFORE the fix, based on expected behavior |

---

## Integration with Other Skills

- **Before `debug-to-fix-pipeline`:** Run this skill to create the failing test that Phase 3 needs.
- **Before `iterative-patch-repair`:** Run this skill first — patch repair needs a failing test to iterate on.
- **Before `specter`:** The reproduction test gives specter's hypotheses something concrete to falsify.
- **After `environment-recovery`:** If the env was broken, fix it first, then create a reproduction test before debugging.
- **With `escalation-ladder`:** If you can't create a minimal reproduction after Step 2, you're stuck at Level 1 — escalate to strategy change.

## References

- `references/test-templates.md` — Reproduction test templates by framework (Jest, Convex, React Native, Playwright, etc.) with boilerplate for each environment.