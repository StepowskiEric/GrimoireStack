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
