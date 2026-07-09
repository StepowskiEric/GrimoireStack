# Slice 05 — Non-Euclidean iris rings

**Visual variable judged:** IRIS **GEOMETRY** (rings), not colour or pupil.

## Contract

In `GrimoireEye.jsx`, replace the green radial fibers (`.eye-iris-ring` / iris group)
with 2–3 thin concentric arcs/ellipses at **conflicting angles** (e.g. one near-
circular, one skewed, one slightly rotated) — the "non-Euclidean" read. Add a
corpse-pale iris rim (`#c9d2e8`, low opacity). Ring count/contrast scales with
`gaze` (1 faint ring at 0.2 → 3 at 1.0).

## What the human can run / see

`/gaze-preview` at `gaze=0.2, 0.6, 1.0`. Rings multiply and skew as gaze rises.

## Verification

- **screenshot-critique** at `gaze=0.6`: "Do the iris rings read as impossible /
  non-Euclidean geometry rather than tidy cartoon lines?" Last check before accept.
- **compare-screenshots** against slice-04 iris (baseline in `assets/`). Judge
  **ring geometry / angle conflict** only.
- Out of scope: pupil void (04), aberration (06), veil (08).

## Stay green

- Slice 04 tests; `npm run lint`; `npm run build`.

## Human feedback that would change this slice

- Rings too busy → cap at 2, lower contrast.
- Want more "impossible" → increase angle skew / add a third rotated ellipse.

## Verified (2026-07-09)

- **Lint/tests/build:** `eslint GrimoireEye.jsx` clean; `vitest run` 693 passed
  (no regression); `npm run build` exit 0, no `GazePreview` prod chunk.
- **Rings geometry (sharpened after first pass):** 3 corpse-pale (`#c9d2e8`)
  ellipses at conflicting angles — A near-circular `rx72 ry66 rotate(0)`, B wide
  `rx112 ry42 rotate(24)`, C `rx84 ry60 rotate(-34)`. Count scales with `gaze`:
  A always, B when `gaze>=0.55`, C when `gaze>=0.8`.
- **screenshot-critique @0.2:** exactly 1 ring, calm/eldritch, no green.
- **screenshot-critique @0.6:** 2 rings at conflicting angles (crossing orbital
  paths), impossible-geometry read, no sickly green.
- **screenshot-critique @1.0:** 3 rings tilted each a different axis (Penrose
  impossible-object read), no sickly green.
- **compare-screenshots vs slice04:** slice04 baseline has no rings; candidate is
  less wrong — required non-Euclidean rings now present.
- **Reference assets:** `assets/slice05-gaze{0.2,0.6,1}.webp`.
