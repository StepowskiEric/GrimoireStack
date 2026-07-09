# Slice 01 — Gaze plumbing

**Status:** ✅ DONE (2026-07-09). Implemented, lint clean, 689 tests pass, build green.

**Contract unlocked:** A single continuous `gaze` ∈ [0,1] is computed in the layout,
owned by a new `useGaze` hook, and distributed to the eye (`gaze` prop) and the page
shell (`data-gaze` attribute on the layout root). This is the seam every later slice
consumes; nothing visual happens here yet.

> **Foundation correction (reconciliation with prior notes):** earlier drafts
> assumed `useEyeMood` already emitted a continuous `intensity` wired to the Ritual
> via `useRitualContext`, and that `App.jsx` forwarded it. **That is false.** In the
> actual repo `useEyeMood` returns only `{ mood, recordView, EYE_MOODS }` (viewed-skill
> count + idle time — unrelated to gaze) and `ritualOrch` (hence `ritual.{round,state}`)
> lives **inside `GrimoireStackLayout`**, not `App.jsx`. Gaze is therefore derived in
> the layout, not forwarded from `App.jsx`.

## API seam (as built)

- `app/src/utils/gaze.js` (new) — pure helpers, no React:
  - `clamp01(n)` — bounds to [0,1], coerces non-numbers to 0.
  - `dwellRamp(tSec)` — `clamp01(0.45 * (1 - exp(-t / 40)))`, asymptotes to 0.45.
  - `ritualProgress(state, round)` — `0` when idle; else
    `0.05 + 0.14*round + (state==='converged' ? 0.1 : 0)`.
  - `computeGaze({ dwellSec, state, round })` — `clamp01(dwellRamp + ritualProgress)`.
  - `bandGaze(gaze)` — rounds to nearest of `[0,0.2,0.4,0.6,0.8,1]` (used for
    `data-gaze` so CSS transitions, not rAF, drive the global veil).
  - `gazeStage(band)` — integer 0..5; `GAZE_BANDS` constant.
- `app/src/hooks/useGaze.js` (new) — `useGaze(ritual)` tracks dwell via `Date.now()`
  and derives a **banded** `gaze` from `ritual.{state,round}`. Re-renders only when
  the band changes (interval tick debounced by equality check). Returns `{ gaze }`.
- `app/src/components/GrimoireStackLayout.jsx`:
  - `import { useGaze } from '../hooks/useGaze.js';`
  - `const { gaze } = useGaze(ritualOrch.ritual);` (line ~129).
  - Root div (line ~307): `data-gaze={gaze}`.
  - `<GrimoireEye mood={eyeMood} gaze={gaze} />` (line ~394).
- `app/src/components/GrimoireEye.jsx`:
  - `export default function GrimoireEye({ mood = 'neutral', gaze = 0.25 } = {})`.
  - `gazeRef` kept in sync via the prop-sync effect; wrapper gets
    `data-gaze={String(gaze)}` (alongside existing `data-mood`). The rAF loop can read
    `gazeRef.current` in later slices. No visual change in this slice.

## Gaze curve (default; tunable via fixture in slice 02)

```
dwellRamp(t)    = clamp01(0.45 * (1 - exp(-t / 40)))   // ~0.24 at 30s, crawls to 0.45
ritualProgress  = state==='idle' ? 0
                : 0.05 (on openRitual click)
                + 0.14 * round                            // each answered question
                + (state==='converged' ? 0.1 : 0)
gaze            = clamp01(dwellRamp + ritualProgress)
```

## Verification (closed)

- `app/src/utils/gaze.test.js` — `clamp01`, `dwellRamp`, `ritualProgress`,
  `computeGaze`, `bandGaze`, `gazeStage`, `GAZE_BANDS` all asserted.
- `app/src/hooks/useGaze.test.js` — idle=0, dwell climbs to band 0.2 by ~30s,
  `converged`+round 3 → band 0.6 (fake timers).
- `app/src/components/GrimoireEye.gaze.test.jsx` — eye reflects `data-gaze` (default
  0.25) and `data-mood`.
- `npm run lint` clean; `npm test` → 689 passed; `npm run build` green.

## Stay green

- Existing `GrimoireEye` / `useEyeMood` behaviour untouched; `gaze` propagates without
  remounting the eye (effect deps `[]` for rAF, `[gaze]` for the ref sync).

## Human feedback that would change this slice

- Dwell rate too fast/slow → retune `dwellRamp` constants.
- Want gaze to also respond to scroll/search activity → add a driver inside
  `useGaze` (later slice, not here).
