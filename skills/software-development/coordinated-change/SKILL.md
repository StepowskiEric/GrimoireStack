---
name: coordinated-change
description: "Ensure consistency when a fix or feature requires touching 2+ files that must stay consistent."
triggers:
  - multi-file-change
  - api-contract-change
  - shared-type-update
  - schema-migration
disable-model-invocation: true
---

# Coordinated Change

**When one file changes, the others must change with it — missing one creates a worse bug than the original.** An organ transplant: you cannot just swap the heart; you reconnect the arteries, update the blood pressure, adjust the medications. Single-file patches work for single-file bugs, but real features and fixes span type + implementation + test, contract + client + server, schema + query + UI. Edit the whole change set atomically, then verify consistency, then commit as one unit.

## The Move

### 1. Map the change set — before editing anything
List every file that must change: the **core change** (primary fix/feature), the **ripple changes** (files that must update to stay consistent — because they use, implement, or test the core change), and the **verification targets** (tests that must still pass). Find ripples with `rg` for imports, usages, and related tests — do not discover them by breaking the build.

### 2. Order the changes
Dependency order prevents intermediate broken states: **types/interfaces first**, **core implementation second**, **consumers third**, **tests last**. Exception: narrowing a type → update consumers first (they are being restricted); widening → type first (consumers still work).

### 3. Edit atomically — then run tests
Edit all files in the change set before running anything. Running tests between partial edits produces expected failures that waste time and create confusion. Edit types → implement → consumers → tests, THEN run the checks.

### 4. Verify consistency
Run the full stack after all edits: type check (`tsc --noEmit`), lint, full test suite. Then confirm per file: type references match, imports used, API contract consistent (client sends what server expects), tests cover the new behavior, and `rg` confirms no orphan references to the old signature. Do not use `any` to "make it compile" during transition — it masks the mismatches this skill exists to catch.

### 5. Commit as one unit
One commit (or one PR with coherent stacked commits) for the whole set. Partial commits leave the codebase broken between them.

## Reference
For the expanded pattern catalog (new field, rename/re-signature, feature flag, data migration, refactor, deprecation) with file-level dependency order, see [`references/common-patterns.md`](references/common-patterns.md).

## Rules
- **Do** map the full change set before editing — ripple discovery by build failure is the failure mode.
- **Do** order changes: types → implementation → consumers → tests.
- **Do** edit atomically and run tests only after the set is complete.
- **Do** verify with the full check stack and an orphan-reference scan.
- **Do** commit the set as one unit.
