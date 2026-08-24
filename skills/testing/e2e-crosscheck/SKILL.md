---
name: e2e-crosscheck
description: "Bidirectional audit between E2E test selectors/assertions and source code. Reconciles every test identifier, text assertion, and navigation route."
triggers:
  - post-refactor-e2e-audit
  - pre-release-test-reconciliation
  - test-selector-drift
  - untested-ui-states
disable-model-invocation: true
---

# E2E Cross-Check Protocol

**Reconcile every test claim against the source — and every source state against the tests.** Tests silently drift: accessibility IDs die, UI text changes, routes reorganize, new states appear untested. The cross-check runs six passes in both directions — test → code (do the claims still resolve?) and code → test (is every state covered?) — and reports findings by severity.

## The six passes

| Pass | Direction | What it catches |
|------|-----------|-----------------|
| CC1 | Test → Code, identifiers | dead accessibility IDs |
| CC2 | Test → Code, text | drifted UI text strings |
| CC3 | Test → Code, navigation | stale routes + deep links |
| CC4 | Code → Test, states | untested UI states |
| CC5 | Code → Test, errors | untested error handlers |
| CC6 | Structural | unjustified waits, orphans, annotation drift |

## The Move

### 1. CC1 — reconcile identifiers
Collect every test selector value (`testID=`, `data-testid=`, `accessibilityLabel=`, `testId=`, `nativeID=`). Grep the source for each. Zero matches → **DEAD_IDENTIFIER** (blocker: the step verifies nothing). Matches in multiple files → **AMBIGUOUS_IDENTIFIER** (major: the test may verify the wrong element). Verify the matched element accepts the action the test implies — an element that exists but is disabled can still false-pass a visibility assertion.

### 2. CC2 — reconcile text
Collect every expected text and text selector from assertions. For each, find its source: a **direct literal** in the code (still exists?) or an **i18n key** (exists in ALL locale files and still matches?). Unfindable → **DRIFTED_TEXT** (blocker: the test asserts the wrong text and false-passes). Matching multiple elements on one screen → **AMBIGUOUS_TEXT**.

### 3. CC3 — reconcile routes
Extract every URL, route path, and navigation target from tests. Categorize as framework route (map to the routing tree), deep link (scheme + path still configured), or external URL (still resolves). Route gone or restructured without test updates → **STALE_ROUTE** (blocker: the test navigates nowhere).

### 4. CC4 & CC5 — reconcile states and errors
Map every conditional rendering branch in the source (`{condition && ...}`, ternaries, `if/else` JSX, switches, modals, loading spinners, empty states). Every unasserted user-visible state → **UNVERIFIED_STATE** (blocker if user-visible, major if transitional). Then map every error path with visible UI (error state variables, `try/catch` with UI, validation messages, mutation `onError`, toasts) — every unreproduced error path → **UNTESTED_ERROR** (major).

### 5. CC6 — structural integrity, then report
Check static waits over threshold (1000ms): unjustified → **UNJUSTIFIED_WAIT** (minor). Test files whose source feature is gone → **ORPHANED_TEST** (major — verify removal intent via git log first). Comments naming screens/states the assertions don't match → **ANNOTATION_MISMATCH** (info). Resolve scope (all / changed / feature), run the passes in order, and synthesize the report sorted by severity with file paths and line ranges.

## Reference
For the full finding catalog with procedures per pass and the report format, see [`references/crosscheck-details.md`](references/crosscheck-details.md).

## Rules
- **Do** run test → code passes (CC1–3) and code → test passes (CC4–5) — one direction alone misses half the drift.
- **Do** treat dead identifiers and stale routes as blockers — they verify nothing.
- **Do** check i18n keys across ALL locale files, not just the default.
- **Do** verify a test file's source feature is truly gone before flagging it orphaned.
- **Do** run the cross-check after refactors, text changes, navigation restructuring, and before major releases.
