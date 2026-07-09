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

## Verified (2026-07-09)

DONE & verified. Implementation in `GrimoireEye.jsx`:
- `pupilGrad` changed to a true void (`#000` center → `#05060c` edge, 0.96 alpha).
- `#eye-pupil-group` keeps the void path + `.eye-pupil-glow`; the two old specular
  highlight ellipses were removed (cartoon read).
- New sibling `#eye-stars-group` (centered via initial `transform="translate(200,140)"`)
  containing `#eye-stars-inner` with two `voidBlur`-filtered nebula blooms
  (`#1b1f4a`, `#3a2a5a`) and 14 `useRef`-generated cold specks (`#aebfff`/`#cfd8ff`,
  opacity 0.04–0.12, varied r).
- rAF: `starsGroupEl` gets `translate(200,140) rotate(rot) translate(px,py)`;
  `rot = (Date.now()/1000) * (2 + gaze*26)` deg/s; parallax `px = -((mx-0.5)*18)*1.5`,
  `py = -((my-0.5)*12)*1.5` (opposite the iris); `starsInnerEl.style.opacity =
  0.25 + gaze*0.75`. Both rotation and parallax zeroed under `prefers-reduced-motion`.

Gates:
- `npx eslint` clean; `npx vitest run` 693 passed (no regression from 689);
  `npm run build` exit 0; no GazePreview chunk shipped to prod (DEV-only).
- `screenshot-critique` @ gaze 0.5: "depthless void containing faint cold-blue/white
  stars and soft nebula blooms… no cartoon artifacts… ZERO rgb(138,154,106)."
- gaze 0 (exact, via `0.00` band button — `?gaze=0` falls back to 0.25 in the
  fixture) → deep black void, stars near-invisible by design (brightness 0.25).
- gaze 1.0 → nebula/starfield clearly brighter and alive; ZERO green.
- Reference captures: `assets/slice04-gaze{0,0.5,1}.webp`.

Deviation: starfield is a sibling of `#eye-iris-group` (not nested in the pupil
group) so its transform is self-contained and the opposite-parallax math is exact.
Initial `translate(200,140)` keeps it centered before the first rAF tick (and in
jsdom tests where rAF is stubbed).
