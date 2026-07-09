# Slice 07 — Background eyes swarm

**Visual variable judged:** BACKGROUND **EYE DENSITY**.

## Contract

The eye-stage already has a `bg-eyes-canvas` (20 static drifting dots). Make the
count/redness scale with `gaze`: more cold/red specks drift in as gaze rises,
capped for performance (e.g. ≤60). Keep motion subtle.

## What the human can run / see

`/gaze-preview` at `gaze=0, 0.5, 1.0`. Background fills with faint watching eyes.

## Verification

- **screenshot-critique** at `gaze=0.5`: "Do background eyes add dread without
  clutter or cartoon cuteness?" Last check before accept.
- **compare-screenshots** against slice-06 background (baseline in `assets/`). Judge
  **density / redness** only.
- Perf gate: rAF frame cost stays within budget at max density (measure; no
  layout thrash).

## Stay green

- Slice 06 tests; `npm run lint`; `npm run build`.

## Human feedback that would change this slice

- Too busy → lower cap / reduce opacity.
- Not enough "watched" feeling → raise count or add slow convergence drift.
## Verified (2026-07-09)

Gates passed:
- `npx eslint app/src/components/GrimoireEye.jsx app/src/App.css` → clean.
- `npx vitest run` → 693 passed, no regression.
- `npm run build` → exit 0, no GazePreview prod chunk.
- Perf: CSS opacity-only `.bg-eye-group` blink (7s, staggered `animationDelay`); no rAF, no layout thrash. Pool of 60 eyes generated once via `useRef`; render `slice(0, bgCount)` where `bgCount = min(60, round(20 + gaze*40))`.
- `prefers-reduced-motion` disables the blink (reduced-motion guard on the keyframes).

Reference captures: `specs/gaze-eye/assets/slice07-gaze{0.3,0.5,0.6,1.0}.webp`.

Visual gates (via `inspect_image` + an independent explorer sub-agent, `/gaze-preview` at gaze 0.3 / 0.5 / 0.6 / 1.0):
- **No sickly green** anywhere at any gaze (confirmed by both critiques).
- **No clutter, no cartoon cuteness** — specks are soft, low-contrast, widely dispersed; at mid gaze the field reads as faint distant observers, not a crowd.
- **Density / redness ramp confirmed**: the slice-06 baseline field shows ~20–30 mostly-neutral specks; slice-07 at gaze 0.6 ≈ 31 specks (≈10 red/rose + 13 ice-blue + 8 neutral); at gaze 1.0 ≈ 50–70 specks with ~35–40% in red/magenta/maroon. Clear escalation; the warm/cool alternation reads as unsettling.
- **No rendering defects** (clean edges, no clipping, no overlap/z-fighting artifacts).

Known limitation (recorded, not a contract break): the background "eyes" are subtle bokeh-like specks, not literal ocular shapes with pupils. This is intentional — giving them detailed mini-eyes risks the cartoonish read palette A explicitly forbids. The "being watched" dread is carried by density + red escalation at high gaze, which the critique found effective at gaze 1.0. If the human later wants a stronger ocular read, the cheapest lever is a slow convergence drift (see "Human feedback" above) rather than redrawing anatomy.
