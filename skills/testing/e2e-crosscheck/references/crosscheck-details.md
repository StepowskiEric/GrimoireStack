# E2E Cross-Check — Finding Catalog & Report Format

## Finding categories

| Code | Meaning | Severity |
|------|---------|----------|
| DEAD_IDENTIFIER | test references an ID no component exposes | blocker |
| AMBIGUOUS_IDENTIFIER | ID appears on multiple components | major |
| DRIFTED_TEXT | asserted text not found in source or i18n | blocker |
| AMBIGUOUS_TEXT | text matches multiple elements on the screen | major |
| STALE_ROUTE | route/deep link no longer resolves | blocker |
| UNVERIFIED_STATE | UI state has no test coverage | blocker (user-visible) / major (transitional) |
| UNTESTED_ERROR | error path has no reproducing test | major |
| UNJUSTIFIED_WAIT | static wait over threshold with no comment | minor |
| ORPHANED_TEST | test file for a removed feature | major |
| ANNOTATION_MISMATCH | comment names a screen/state the assertion doesn't check | info |

## Pass procedures

### CC1 — identifiers
Collect every identifier value from test files (grep for `testID=`, `data-testid=`, `accessibilityLabel=`, `testId=`, `nativeID=`, `tabBarButtonTestID=`). Grep source for each. 0 matches → DEAD_IDENTIFIER; >1 match across files → AMBIGUOUS_IDENTIFIER. Verify the matching element accepts the action implied by the test step.

### CC2 — text
Collect expected text from assertions (`toHaveTextContent`, `toHaveText`, `expectedText`) and selector text (`getByText`, `findByText`). Determine source: direct literal (verify it exists) or i18n key (verify the key exists in ALL locale files and the value still matches). Unfindable → DRIFTED_TEXT; found in the wrong component/screen → DRIFTED_TEXT with location mismatch; multiple matches → AMBIGUOUS_TEXT.

### CC3 — routes
Extract URLs, route paths, navigation targets. Categorize: framework route (map segments to `app/`, `pages/`, `src/routes/`), deep link (scheme + path configured), external URL (still resolves). Gone or reorganized without test updates → STALE_ROUTE.

### CC4 — states
For each source file in scope, map conditional rendering: `{condition && <Component>}`, ternaries, `if/else` JSX, `switch` over states, modal show/hide, loading spinners (`isLoading`, `isFetching`, `isPending`), empty states. Every unasserted state → UNVERIFIED_STATE.

### CC5 — errors
Search for error patterns: error state variables, `try/catch` with visible UI, form validation messages, API error handling (`onError`, mutation error callbacks), toast triggers. For each, check a test reproduces it (invalid input, wrong credentials, network failure, empty response, permission denied). Unreproduced → UNTESTED_ERROR.

### CC6 — structural
- **Waits:** static waits over threshold (1000ms) need a justifying comment → else UNJUSTIFIED_WAIT
- **Orphans:** test file whose source directory is gone — check git log for intentional removal → else ORPHANED_TEST
- **Annotations:** descriptive comments should match the next assertion's actual check → else ANNOTATION_MISMATCH

## Report format

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

## When to run

- After refactoring component structure (renamed/moved files, changed prop names)
- After UI text changes (copy updates, i18n key changes)
- After navigation restructuring (route changes, routing-tree file moves)
- After adding new features (existing tests still cover the right things?)
- Before any major release (catch silent test drift)
