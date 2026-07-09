# Slice 06 — Chromatic aberration

**Visual variable judged:** COLOUR **FRINGE** only.

## Contract

Add void-edge chromatic-aberration ghosts: duplicate the pupil/void edge in
`#4a6cff` (cold blue) and `#b04a8a` (violet) at opacity <0.08, offset 1–2px. Appears
only at `gaze ≥ 0.4`, intensifies to cap at 1.0. Implement with duplicated
blurred copies or a cheap CSS `filter: drop-shadow` on the SVG group — **not**
per-frame DOM writes (perf).

## What the human can run / see

`/gaze-preview` at `gaze=0.3, 0.6, 1.0`. Below 0.4: no fringe. Above: cold/violet
ghosts at the void edge.

## Verification

- **screenshot-critique** at `gaze=1.0`: "Is the fringe subtle and cosmic, not a
  cheap RGB-split glitch?" Last check before accept.
- **compare-screenshots** against slice-05 (baseline in `assets/`). Judge **fringe
  presence/strength** only.
- Perf: no rAF cost added; aberration is static-offset CSS/filter.

## Stay green

- Slice 05 tests; `npm run lint`; `npm run build`.

## Human feedback that would change this slice

- Fringe too strong/weak → adjust cap opacity (target <0.08) and offset px.
- Wrong hue → swap ghost colours (keep cold/violet, never green).

## Verified (2026-07-09)

- **Lint/tests/build:** `eslint GrimoireEye.jsx` clean; `vitest run` 693 passed
  (no regression); `npm run build` exit 0, no `GazePreview` prod chunk.
- **Implementation:** cold-blue `#4a6cff` + violet `#b04a8a` `drop-shadow` pair on
  `#eye-pupil-group` (the void edge), opacity `<0.08`, offset 1–2px. Computed at
  render time from the `gaze` prop (re-renders only on gaze change — **no rAF
  cost**). `prefers-reduced-motion` disables it (`reducedMotion` guard).
- **Ramp:** `abT = gaze>=0.4 ? sqrt((gaze-0.4)/0.6) : 0` — off below 0.4, eased up
  to cap 0.08 at gaze 1.0. (Linear ramp made 0.6 sub-threshold; √ ramp gives a
  clearly visible-but-subtle fringe by 0.6 while keeping 1.0 at the 0.08 cap.)
- **screenshot-critique @0.3:** no fringe (below 0.4 threshold). ✓
- **screenshot-critique @0.6:** subtle cold-blue+violet fringe visible, not a
  glitch, no green — subtlety 3/5 (just right).
- **screenshot-critique @1.0:** subtle/cosmic fringe at cap, no green — subtlety
  3/5 (just right).
- **compare-screenshots vs slice05:** slice05 has no fringe; candidate is less
  wrong — required chromatic fringe now present at the void edge.
- **Reference assets:** `assets/slice06-gaze{0.3,0.6,1}.webp`.
