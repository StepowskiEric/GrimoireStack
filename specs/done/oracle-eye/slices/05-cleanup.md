# Slice 5: Remove ProblemIntakeModal + Sidebar Button + Test Migration

## Contract

Delete the modal and its trigger. Move oracle-specific i18n keys into the main messages namespace (they already exist). Update tests to target the inline flow.

## API Seam

**Removals:**
- `app/src/components/ProblemIntakeModal.jsx` — delete file
- `app/src/test/problemIntakeModal.test.jsx` — delete file
- `App.jsx`:
  - Remove `import ProblemIntakeModal`
  - Remove `const [intakeOpen, setIntakeOpen] = useState(false)`
  - Remove `onIntakeOpen` prop passed to `GrimoireStackLayout`
  - Remove `{intakeOpen && <ProblemIntakeModal ... />}` block
- `GrimoireStackLayout.jsx`:
  - Remove `onIntakeOpen` from destructured props
  - Remove "Skill Finder" button from sidebar footer

**New test files:**
- `app/src/test/useOracle.test.js` — unit tests for the hook
- `app/src/test/oracleInlinePanel.test.jsx` — component tests for the inline panel
- `app/src/test/grimoireStackLayout.oracle.test.jsx` — integration tests

**i18n:** All `intake*` keys stay in `messages.js`. The inline textarea and button reuse the same keys. No keys are deleted. Modal-only keys like `intakeClose` become unused (harmless to keep).

## What the human can run/see

No "Skill Finder" button in sidebar footer. Pressing Escape or clicking outside never opens a modal for the oracle. All oracle behavior happens inline. Test suite passes.

## Verification

1. `grep -r "ProblemIntakeModal" app/src` returns 0 hits
2. `grep -r "intakeOpen" app/src` returns 0 hits
3. `grep -r "Skill Finder" app/src` returns 0 hits
4. `grep -r "onIntakeOpen" app/src` returns 0 hits
5. `vitest run` passes
6. Manual QA: verify no broken links or missing icons in sidebar footer

## Dependencies

Slice 4 — inline oracle must be fully functional before the modal is deleted.
