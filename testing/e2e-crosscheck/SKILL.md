---
name: e2e-crosscheck
category: testing
description: "Bidirectional cross-reference between E2E test selectors/assertions and source code. Verifies every test identifier still matches the code, every text assertion still renders, every navigation route still resolves, and every UI state/error path has test coverage. Catches silent failures: dead identifiers, drifted UI text, stale routes, orphaned tests, and ambiguous selectors. Run after refactoring, UI text changes, navigation restructuring, or any time E2E tests may have diverged from the code they test."
version: 1.0
---

# E2E Cross-Check Protocol

A bidirectional audit between E2E tests and source code. Run all six passes in order.

```
┌──────────────────────────────────────────────────────────────┐
│                      CROSS-CHECK MATRIX                       │
├─────────────────────────────────┬────────────────────────────┤
│ Direction                       │ What it catches             │
├─────────────────────────────────┼────────────────────────────┤
│ CC1: Test → Code (identifiers) │ Dead accessibility IDs       │
│ CC2: Test → Code (text)        │ Drifted UI text strings      │
│ CC3: Test → Code (navigation)  │ Stale routes + deep links    │
│ CC4: Code → Test (states)      │ Untested UI states           │
│ CC5: Code → Test (errors)      │ Untested error handlers      │
│ CC6: Structural integrity       │ Unjustified waits, orphans  │
└─────────────────────────────────┴────────────────────────────┘
```

---

## CC1: Test → Code — Identifier Verification

Every test selector that references an accessibility ID, test ID, or data-testid must resolve to a real prop in the source.

**Procedure:**
1. Collect every identifier value from test files (grep pattern depends on framework: `testID=`, `data-testid=`, `accessibilityLabel=`, `testId=`, `nativeID=`, `tabBarButtonTestID=`).
2. For each identifier, grep the source code for matching props.
3. If zero matches → **DEAD_IDENTIFIER** finding. The test references an ID no component exposes. The assertion silently does nothing meaningful.
4. If >1 match across different files → **AMBIGUOUS_IDENTIFIER** finding. The ID appears on multiple components. The test may verify the wrong element depending on screen state.
5. Verify the matching element accepts the action implied by the test step. An element that exists but is disabled or hidden may still match a visibility assertion.

**Finding category:** DEAD_IDENTIFIER or AMBIGUOUS_IDENTIFIER
**Severity:** blocker (dead identifier = step verifies nothing), major (ambiguous identifier)

---

## CC2: Test → Code — Text Drift

Every text assertion in tests must match what the app actually renders.

**Procedure:**
1. Collect every text string from test files:
   - Expected text in assertions (`toHaveTextContent`, `expect(element).toHaveText`, `expectedText`)
   - Selector text values (`getByText`, `findByText`, `selector: { text: }`)
2. For each text string, determine its source:
   - **Direct literal**: Source code contains the literal string → verify it still exists
   - **i18n key**: Source calls a translation function → verify the key exists in ALL locale files and the value still matches what the test expects
3. If the text can't be found anywhere → **DRIFTED_TEXT** finding.
4. If the text is found but in a different component or screen than the test expects → **DRIFTED_TEXT** with location mismatch noted.
5. If the text could match multiple elements on the same screen → flag as **AMBIGUOUS_TEXT**.

**Finding category:** DRIFTED_TEXT or AMBIGUOUS_TEXT
**Severity:** blocker (test asserts wrong text = false pass), major (ambiguous match)

---

## CC3: Test → Code — Route & Navigation Drift

Every navigation route, deep link, or URL in tests must resolve to a valid route in the current routing tree.

**Procedure:**
1. Extract every URL, route path, or navigation target from test files.
2. Categorize each:
   - **Framework route** — map path segments to the routing file tree (e.g. `app/` for Expo Router, `pages/` for Next.js, `src/routes/` for React Router)
   - **Deep link** — verify the scheme and path are still configured
   - **External URL** — verify it still resolves
3. Cross-reference against the routing file tree.
4. If a test references a route that doesn't exist → **STALE_ROUTE** finding.
5. If the route structure was reorganized and tests weren't updated → **STALE_ROUTE** finding.

**Finding category:** STALE_ROUTE
**Severity:** blocker (test navigates to non-existent route = test broken)

---

## CC4: Code → Test — UI State Coverage

Every distinct UI state defined in the source must be asserted in at least one test.

**Procedure:**
1. For each source file in scope, map every conditional rendering branch:
   - `{condition && <Component>}` patterns
   - Ternary `condition ? <A> : <B>`
   - `if/else` returning different JSX
   - `switch` over state values rendering different screens
   - Modal show/hide logic
   - Loading spinners (`isLoading`, `isFetching`, `isPending`)
   - Empty state components (lists with zero items)
2. For each distinct state, check if any test asserts it (visibility, text content, presence/absence).
3. Every unasserted state → **UNVERIFIED_STATE** finding.

**Finding category:** UNVERIFIED_STATE
**Severity:** blocker if user-visible (empty state, error screen, permission denied), major if transitional (loading spinner)

---

## CC5: Code → Test — Error & Validation Path Coverage

Every error state, validation failure, or API error path with visible UI must have at least one test that reproduces it.

**Procedure:**
1. Search source for error patterns:
   - Error state variables (`error`, `handleError`, `avatarError`)
   - `try/catch` blocks that set visible error state
   - Form validation logic showing error messages
   - API error handling (React Query `onError`, mutation error callbacks)
   - `setError`, `set*Error` calls
   - Toast/notification triggers for error cases
2. For each error path, check if any test reproduces it:
   - **Invalid input + submit** → error text appears
   - **Wrong credentials** → auth error text appears
   - **Network failure** → offline error text or toast appears
   - **Empty response** → empty state text appears
   - **Permission denied** → fallback UI or guidance text appears
3. Every unreproduced error path → **UNTESTED_ERROR** finding.

**Finding category:** UNTESTED_ERROR
**Severity:** major

---

## CC6: Structural Integrity — Cross-Cutting Checks

### 6a. Unjustified Waits
Collect every static wait/sleep/delay in test files. For each wait over a reasonable threshold (e.g. 1000ms), check that a comment explains why. Unjustified waits are flakiness risks.

**Procedure:**
1. For each static wait over the threshold, read the preceding lines.
2. If no comment explains why → **UNJUSTIFIED_WAIT** finding.

**Finding category:** UNJUSTIFIED_WAIT
**Severity:** minor (over threshold without justification), info (under threshold or justified)

### 6b. Orphaned Test Files
For each test file, verify the feature it tests still exists in source. If the feature directory no longer exists → **ORPHANED_TEST** finding.

**Procedure:**
1. For each test file, check if the corresponding source directory still exists.
2. If not, check if the feature was removed intentionally (git log or PR history).
3. If the feature is gone → ORPHANED_TEST.

**Finding category:** ORPHANED_TEST
**Severity:** major (entire test exercises removed functionality)

### 6c. Test Annotation vs Assertion Mismatch
Comments or descriptions in tests should match what the subsequent assertions actually check. If a comment says "On login form" but the following assertion checks for a completely unrelated element, the annotation is misleading.

**Procedure:**
1. For each descriptive comment/annotation, look at the next assertion step.
2. If the comment names a screen or state that the assertion doesn't match → **ANNOTATION_MISMATCH**.

**Finding category:** ANNOTATION_MISMATCH
**Severity:** info (annotation drift, not a test failure)

---

## Procedure

```
1  Resolve scope ─────────────────────────── feature, 'all', or 'changed'
2  │  ┌─ 'all'     → glob all test files
3  │  ├─ 'changed'  → git diff --name-only against main, filter test files
4  │  └─ feature   → glob test files for that feature + matching source glob
5  │
6  Run CC1: Test→Code — Identifier resolution
7  │  For each test file:
8  │    Extract all identifier values
9  │    Grep source for matching testID/data-testid/accessibilityLabel
10 │    Flag DEAD_IDENTIFIER or AMBIGUOUS_IDENTIFIER
11 │
12 Run CC2: Test→Code — Text drift
13 │  For each test file:
14 │    Extract all expected text values
15 │    Resolve each to i18n key or literal
16 │    Verify existence in current source + locale files
17 │    Flag DRIFTED_TEXT or AMBIGUOUS_TEXT
18 │
19 Run CC3: Test→Code — Route / navigation drift
20 │  Extract all route/URL values from navigation steps
21 │  Cross-ref against routing file tree
22 │  Flag STALE_ROUTE
23 │
24 Run CC4: Code→Test — State coverage
25 │  Map all conditional rendering in source
26 │  Cross-ref against test assertions
27 │  Flag UNVERIFIED_STATE
28 │
29 Run CC5: Code→Test — Error coverage
30 │  Map all error/validation paths in source
31 │  Cross-ref against test error reproduction steps
32 │  Flag UNTESTED_ERROR
33 │
34 Run CC6: Structural integrity
35 │  CC6a: Collect all static waits — justify or flag
36 │  CC6b: Check test feature directory still exists
37 │  CC6c: Verify annotations match subsequent assertions
38 │
39 Synthesize report ─── sort by severity, group by category
40 Output structured findings with file paths and line ranges
```

---

## Output Format

```
# Cross-Check Report: <feature>

## Summary
- Tests reviewed: N
- Source files scanned: N
- Total findings: N
- Blocker: N | Major: N | Minor: N | Info: N

## Findings by Severity

### Blocker
- [DEAD_IDENTIFIER] `submit-button` in `tests/LoginFlow.yaml:42` — no component exposes testID="submit-button". Last match removed in commit abc123.
- [STALE_ROUTE] `footygoat:///(auth)/login` in `tests/LoginFlow.yaml:15` — route `app/(auth)/login/` no longer exists. Moved to `app/login/` in commit def456.

### Major
- [UNVERIFIED_STATE] `app/screens/Profile.tsx:88` — empty state for friend list has no test coverage.
- [ORPHANED_TEST] `tests/legacy/DeletedFeatureFlow.yaml` — feature `app/(tabs)/deleted/` was removed in commit 789abc.

### Minor
- [UNJUSTIFIED_WAIT] `tests/LoginFlow.yaml:33` — `delayMs: 2000` with no justification comment.

### Info
- [ANNOTATION_MISMATCH] `tests/PackFlow.yaml:12` — echo describes the pack opening screen, but the assertion checks for shop UI.
```

---

## When to Run

- After refactoring component structure (renamed/moved files, changed prop names)
- After UI text changes (copy updates, i18n key changes)
- After navigation restructuring (route changes, file moves in routing tree)
- After adding new features (verify existing tests still cover the right things)
- Before any major release (catch silent test drift)
- Any time E2E tests may have diverged from the code they test
