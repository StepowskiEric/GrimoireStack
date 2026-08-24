---
name: legacy-rescue-protocol
description: "Characterize legacy behavior, create seams, then transform in bounded slices with anti-loop protection."
triggers:
  - brittle-code-change
  - characterize-before-change
  - legacy-refactor-anti-loop
disable-model-invocation: true
---

# Legacy Rescue Protocol

**Characterize before you change — the code is the spec until proven otherwise.** When code is brittle, weakly tested, or unclear, do not transform it directly. Capture what it does today (bugs included) with characterization tests, find or create a seam, then transform in bounded slices with a gate at every phase and an anti-loop breaker.

## When to Use
- Changing brittle code with weak tests or unclear behavior
- Heavy coupling makes changes risky
- Any refactor where "characterize before you change" applies

## The Move

### 1. Characterize
Read the code and trace the main execution paths — modify nothing. Identify inputs, outputs, and side effects. Write characterization tests that capture **current** behavior, including bugs: these document what the code does now, not what "correct" is. Target: every public function has at least one test; all pass before proceeding. **Gate: characterization green, zero code changes.**

### 2. Create the seam
Find where you can intercept behavior without touching the core: function parameters, inheritance or composition points, interface boundaries, configuration points. Create a thin abstraction if none exists (extract an interface, wrap side effects, add a config hook). **Gate: seam exists, characterization tests still green.**

### 3. Transform in slices
Define the target behavior. Slice the transformation into the smallest committable steps. For each slice: write a failing test for the new behavior, make the change, run ALL tests — if characterization tests break, the change is wrong: revert. Commit when green. **Anti-loop breaker:** the same slice fails three times → stop and re-enter Phase 2 with a better seam. Set a transformation budget up front (max files, max new lines, max time) and stop to reassess when it is exceeded.

### 4. Clean up
Remove tests that only documented the old buggy behavior (if that bug was the change target), keep tests that validate the new behavior, remove seam scaffolding no longer needed. Final test run green.

## Reference
For the characterization-test checklist and patterns, see [`references/characterization-checklist.md`](references/characterization-checklist.md).

## Rules
- **Do** write characterization tests, not "correctness" tests — you do not know what correct is yet.
- **Do** keep every slice green and individually committable — big-bang changes guarantee regressions.
- **Do** treat characterization-test failures as the change being wrong: revert, then re-seam.
- **Do** set the transformation budget before starting and honor it.
- **Do** keep the seam thin — touching core logic to create the seam means the seam is wrong.
