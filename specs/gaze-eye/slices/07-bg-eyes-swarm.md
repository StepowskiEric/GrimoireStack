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
