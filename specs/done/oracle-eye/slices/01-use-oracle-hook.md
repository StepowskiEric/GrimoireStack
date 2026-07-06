# Slice 1: Extract `useOracle` Hook

## Contract

Oracle state machine + API logic lives in one reusable hook, independent of any modal. The hook owns `query`, `results`, `loading`, `error`, `oracleState`, and `source` (ai | local).

## API Seam

**New file:** `app/src/hooks/useOracle.js`

```js
export function useOracle() {
  // Returns:
  //   query: string
  //   setQuery: (v: string) => void
  //   results: Array<{ skill, name, school, score, reason }>
  //   loading: boolean
  //   error: string | null
  //   oracleState: 'idle' | 'consulting' | 'answering' | 'error'
  //   source: 'ai' | 'local' | null
  //   askOracle: () => Promise<void>
  //   clear: () => void
}
```

**State transitions:**
- `idle → consulting → answering` (AI success)
- `idle → consulting → error → answering` (AI fails, local fallback runs)
- `idle → error` (immediate failure, no fallback)

**Local fallback:** On AI failure, call `grimoireIndex.matchProblem(query, { limit: 5 })` and set `source: 'local'` on each result.

## What the human can run/see

Nothing visible. `ProblemIntakeModal` is updated to use the hook internally so existing behavior is preserved.

## Verification

1. Existing `problemIntakeModal.test.jsx` oracle tests pass unchanged (modal delegates to hook)
2. New unit tests in `app/src/test/useOracle.test.js`:
   - Mock fetch success → results populated, `source='ai'`
   - Mock fetch failure → local fallback runs, `source='local'`
   - Empty query → no fetch called
   - `clear()` resets to idle with empty results
   - Loading state prevents re-entrant calls

## Dependencies

None — first slice.
