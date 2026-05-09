---
name: Legacy Rescue Protocol
description: Fuse of Working Effectively with Legacy Code + Refactoring State Machine. Characterize legacy behavior, create seams, then transform in bounded slices with anti-loop protection.
...



---

## Legacy Rescue Protocol

A fused protocol for safely changing legacy code. Combines characterization testing (Working Effectively with Legacy Code) with bounded refactoring (Refactoring State Machine) into a single pipeline that enforces "characterize before you change."

### Phase 1: CHARACTERIZE

Understand what the code actually does before touching it.

1. **Read the code** — trace the main execution paths. Do not modify anything.
2. **Identify inputs and outputs** — what goes in, what comes out, what side effects occur?
3. **Write characterization tests** — tests that capture current behavior, including bugs
   - These tests are NOT "correctness" tests — they document what the code does NOW
   - If the code has a bug, the test should reproduce the buggy behavior
   - Target: every public function has at least one characterization test
4. **Run characterization tests** — all must pass before proceeding

**Gate:** Characterization tests green. No code changes yet.

### Phase 2: SEAM

Find or create the point where you can make changes safely.

1. **Identify the seam** — where can you intercept behavior without touching the core?
   - Function parameters (inject behavior via arguments)
   - Inheritance/composition points
   - Interface boundaries
   - Configuration points
2. **Create the seam if it doesn't exist** — introduce a thin abstraction layer
   - Extract interface from concrete class
   - Wrap side effects in an injectable dependency
   - Add a configuration hook
3. **Verify** — characterization tests still pass after seam creation

**Gate:** Seam exists, characterization tests still green.

### Phase 3: TRANSFORM

Make the actual change in bounded slices.

1. **Define the target** — what should the behavior be after the change?
2. **Slice the transformation** — break into smallest possible steps
   - Each step should leave characterization tests green
   - Each step should be individually committable
3. **For each slice:**
   a. Write a failing test for the new behavior
   b. Make the change
   c. Run ALL tests (characterization + new)
   d. If characterization tests break → the change is wrong, revert
   e. If new test passes → commit this slice
4. **Anti-loop breaker** — if the same slice fails 3 times, stop. Re-enter Phase 2 (create a better seam).

**Gate:** All tests green (characterization + new). Target behavior achieved.

### Phase 4: CLEANUP

Remove characterization scaffolding (optional).

1. Remove tests that only document old buggy behavior (if the bug was the target of the change)
2. Keep tests that validate the new behavior
3. Remove seam scaffolding if it's no longer needed
4. Final test run — everything green

### Transformation Budget

Set a maximum scope before starting:
- Max files to touch: [set before starting]
- Max new lines: [set before starting]
- Max time: [set before starting]
- If budget exceeded, stop and reassess

### Anti-Patterns

- Skipping characterization and going straight to transformation (most common, most damaging)
- Writing "correctness" tests instead of characterization tests (you don't know what "correct" is yet)
- Making the seam too wide (if you're touching the core logic to create the seam, the seam is wrong)
- Transforming without slicing (big bang changes in legacy code = guaranteed regression)
- Ignoring characterization test failures ("I'll fix those later" = you won't)

### When to Use

- Any change to code without adequate test coverage
- Refactoring code you didn't write
- Fixing bugs in unfamiliar code
- Migrating legacy systems
