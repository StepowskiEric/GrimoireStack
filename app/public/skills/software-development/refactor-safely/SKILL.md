---
name: refactor-safely
description: "Characterization testing to capture existing behavior, then bounded changes with immediate verification."
triggers:
  - Need to safely transform untested code
  - Need characterization testing before refactoring
  - Need bounded changes with immediate verification
---

# Safe Refactor

Characterization testing to capture existing behavior, then bounded changes with immediate verification. Safe transformation of untested code.

## Core Protocol

### Phase 1: Characterize

Write characterization tests that capture current behavior, including bugs. These tests document what the code does NOW, not what it should do.

**Done when:** every public function has at least one characterization test and all pass.

### Phase 2: Seam

Find or create the point where you can make changes safely. Create a thin abstraction layer if needed.

**Done when:** seam exists and characterization tests still pass.

### Phase 3: Transform

Make the actual change in bounded slices. Each slice should leave characterization tests green and be individually committable.

**Done when:** all tests pass (characterization + new) and target behavior is achieved.

### Phase 4: Cleanup

Remove characterization scaffolding. Keep tests that validate the new behavior.

**Done when:** final test run is green and scaffolding is removed.

## Failure Modes

- **Skipping characterization:** going straight to transformation is the most common mistake
- **Writing correctness tests instead of characterization tests:** you don't know what "correct" is yet
- **Making the seam too wide:** if you're touching core logic to create the seam, the seam is wrong
- **Transforming without slicing:** big bang changes in legacy code guarantee regression
