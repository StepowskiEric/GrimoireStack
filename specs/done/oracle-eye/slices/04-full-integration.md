# Slice 4: Full Layout Integration — Oracle as Default View

## Contract

`GrimoireStackLayout` becomes the single owner of the oracle flow. The eye-stage column renders Eye → textarea → results. The right panel defaults to the school grid (The Spine) and stays visible as a library reference. A small Library icon near oracle results provides quick access back to the grid.

## API Seam

**`app/src/components/GrimoireStackLayout.jsx`:**
- Oracle state is internal via `useOracle()` — no new props from parent
- Right panel logic: when `activeTab === LIBRARY` (default) and `pageKey === 'home'`, render `SchoolCardGrid` in right panel regardless of oracle state
- Oracle results live in the eye-stage, not the right panel
- Pass `onBrowseLibrary={() => handleTabSelect(TABS.LIBRARY)}` to `OracleInlinePanel`

**`app/src/components/OracleInlinePanel.jsx`:**
- Add `onBrowseLibrary` prop
- Render a small Library icon button in the results header when results are present

**`app/src/components/OracleResults.jsx`:**
- Already created — add `onBrowseLibrary` prop support

## What the human can run/see

Load the app. Default view: eye centered at top, textarea below it, right panel shows the school grid. Type a problem, click Ask the Oracle — eye enters consulting state, then answering, results float below the textarea. Click the Library icon — right panel shows the school grid. Click The Spine in sidebar — same grid, confirming tab routing still works.

## Verification

1. Integration test: default render shows GrimoireEye + textarea + SchoolCardGrid in right panel
2. Integration test: Ask the Oracle populates results in eye-stage
3. Integration test: Library quick-access button switches right panel to grid
4. Integration test: switching to The Spine tab keeps school grid visible
5. Integration test: clicking a school card still opens school detail

## Dependencies

Slices 1–3 — hook, panel, and eye-state layout must be wired.
