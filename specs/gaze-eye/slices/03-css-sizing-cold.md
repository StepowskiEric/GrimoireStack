# Slice 03 — CSS sizing + cold base restyle

**Visual variable judged:** EYE **SIZE** + **BASE COLD PALETTE** (not the warp yet).
The eye currently has no CSS and uses browser-default SVG sizing — the "cheap" look.

## Contract

- `app/src/App.css` (or a new `GrimoireEye.css` co-located; match repo convention for
  component CSS): add the missing block:
  - `.grimoire-eye-wrapper` — explicit size (e.g. `width: min(420px, 80vw); aspect-ratio: 400/280;`).
  - `.great-eye-svg` — `width:100%; height:100%; display:block;`.
  - `.great-eye-container` — cold spectral `drop-shadow` glow (ice-blue, not green).
  - Retire `--eye-glow:rgba(138,154,106,.06)` → replace with cold
    `--eye-glow:rgba(120,150,255,.08)` (or scoped local var).
- In `GrimoireEye.jsx`: set sclera fill to `#05060c`; corpse-pale iris rim
  (`#c9d2e8` at low opacity); remove the green `#8a9a6a` pupil glow. Keep all
  existing structure; only recolor, do not add new warp elements yet.

## What the human can run / see

`/gaze-preview?gaze=0` (and the live front page). Eye is correctly sized, clearly
cold/eldritch, not cartoon, not green.

## Verification

- **screenshot-critique** on `/gaze-preview?gaze=0`: does it read "cold, eldritch,
  intentional" rather than "cartoon mascot"? Run as the LAST check before accept.
- **compare-screenshots** against a baseline capture of the *current* eye (capture
  it first into `specs/gaze-eye/assets/baseline-eye.png`). Judge the eye **size +
  palette only**; ignore the pupil/iris warp (those are later slices).
- Visible wrongness explicitly OUT of scope here: starfield, rings, aberration,
  veil, tentacles — all later slices.

## Stay green

- Existing eye render tests; `npm run lint`; `npm run build`.

## Human feedback that would change this slice

- Eye too large/small → adjust `.grimoire-eye-wrapper` width.
- Cold still feels "friendly" → deepen sclera to pure `#05060c` / reduce rim glow.
