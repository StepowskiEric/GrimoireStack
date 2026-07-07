# useFavoritesSync Debug Report

## Root Cause
The async tests timed out with `status` stuck at `'idle'` because the hook's `useEffect` (Effect 1) was blocked from ever firing: the custom `parse` passed to `useLocalStorageState` rejects any value that fails `isValidSyncCode`, which enforces a strict 16-character length. Several tests originally seeded `localStorage` with `'abcdefghjkmnpqrst'` (17 chars), so `code` resolved to `null` on mount and Effect 1 returned immediately. A secondary issue was the `sameBySkill` guard inside Effect 1, which prevented `setFavorites(merged)` from being called when a pull merge kept the same skill set but updated metadata such as `addedAt`.

## What Changed in `useFavoritesSync.js`
- **Effect 1 merge application**: removed the `sameBySkill(merged, currentFavorites)` guard so `setFavorites(merged)` is always called after a cloud pull, ensuring local state reflects merged metadata (earliest `addedAt`, cloud names, etc.).
- No other logic, effects, or dependencies were altered.

## What Changed in `useFavoritesSync.test.js`
- **Seed strings**: corrected the seeded sync codes from 17-character strings (e.g. `'abcdefghjkmnpqrst'`) to valid 16-character codes (e.g. `'abcdefghjkmnpqrs'`) so the parse fallback accepts them.
- The `debug: seeded code is parsed correctly on render` test was removed during the session, leaving 9 focused tests.

## Verification
- `npx vitest run src/test/useFavoritesSync.test.js` — 9 tests pass
- `npm test` from `app/` — 618 tests pass across 45 test files
- No `console.log` debug statements remain in `useFavoritesSync.js`
