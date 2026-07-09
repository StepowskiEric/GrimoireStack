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
