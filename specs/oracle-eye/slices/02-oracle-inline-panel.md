# Slice 2: Create `OracleInlinePanel` Component

## Contract

Presentational component that owns the textarea, category chips, oracle button, results list, and error display. Eliminates the modal wrapper while preserving every user-facing behavior.

## API Seam

**New file:** `app/src/components/OracleInlinePanel.jsx`

```jsx
export default function OracleInlinePanel({
  query,
  onQueryChange,
  onAskOracle,
  results,
  loading,
  error,
  onSelectSpell,
  source,        // 'ai' | 'local' | null
  activeCategory,
  onCategoryChange,
  categories,    // WIZARD_DATA
  examples,      // EXAMPLE_KEYS
  t,             // i18n translate function
})
```

**Data flow:** Controlled component — `GrimoireStackLayout` owns state via `useOracle`; panel only dispatches events.

**Layout:**
```
┌─────────────────────────────┐
│  [category chips]           │
│                             │
│  [textarea]                 │
│                             │
│  [Ask the Oracle] [Clear]   │
│                             │
│  [error message]            │
│                             │
│  ┌───┐ ┌───┐ ┌───┐        │
│  │ #1│ │ #2│ │ #3│        │  ← results cards
│  └───┘ └───┘ └───┘        │
└─────────────────────────────┘
```

## What the human can run/see

Render `OracleInlinePanel` in isolation. Type in the textarea, click chips, see results cards appear. Error state shows "The Oracle is silent" with a local-reading badge when `source='local'`.

## Verification

1. Component test: textarea changes call `onQueryChange`
2. Component test: chip click toggles `activeCategory`
3. Component test: Ask button disabled when query is empty
4. Component test: results render with rank, sigil, name, reason, school, score
5. Component test: error view shows fallback label when `source='local'`
6. Component test: example chips populate textarea

## Dependencies

Slice 1 — `useOracle` hook provides the state shape.
