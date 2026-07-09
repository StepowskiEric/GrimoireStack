# Slice 04 — Void pupil + starfield

**Visual variable judged:** PUPIL **VOID TEXTURE** + **STARFIELD MOTION** (not rings,
not aberration — those are later).

## Contract

In `GrimoireEye.jsx`, rebuild the pupil group (`#eye-pupil-group` / `.eye-pupil-glow`):
- Radial black gradient void (`#000` center → `#05060c` edge).
- A `<g>` of ~14 cold specks (`#aebfff` / `#cfd8ff`, opacity 0.04–0.12, varied r).
- 1–2 nebula blooms (`#1b1f4a`, `#3a2a5a`) as soft blurred ellipses drifting.
- rAF: rotate the speck group slowly; **speed and brightness scale with `gaze`**
  (near-still at 0, clearly turning at 1). Parallax: starfield shifts *opposite*
  the cursor-follow iris.
- All gated by `prefers-reduced-motion` (static void, no rotation).

## What the human can run / see

`/gaze-preview` at `gaze=0, 0.5, 1.0`. At 0 the void is calm; at 1 the starfield
turns and brightens; cursor parallax is visible.

## Verification

- **screenshot-critique** at `gaze=0.5`: "Does the pupil read as a depthless void
  with cold stars, not a cartoon dot?" Last check before accept.
- **compare-screenshots** against the slice-03 pupil (baseline in `assets/`). Judge
  **void depth + starfield presence** only.
- Out of scope here: iris rings (05), aberration (06), veil (08).
- Perf: rAF rotation keeps frame cost negligible (no layout thrash; transform-only).

## Stay green

- Slice 03 sizing/palette tests; `npm run lint`; `npm run build`.

## Human feedback that would change this slice

- Stars too sparse/bright → adjust speck count/opacity range.
- Rotation too fast at low gaze → lower the gaze→speed mapping floor.
