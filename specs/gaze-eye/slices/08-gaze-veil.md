# Slice 08 — Whole-page gaze veil

**Visual variable judged:** GLOBAL **STRANGENESS** (whole front-page shell).

## Contract

Add a `.gaze-veil` overlay (e.g. `::after` on the layout root, or a fixed sibling)
driven by `data-gaze` bands:
- Radial void vignette (darkening edges) whose strength scales with band.
- Cold desaturation `filter` on a content wrapper at higher bands.
- At peak (1.0): a *subtle* page-wide chromatic split (reuse the slice-06 ghost
  technique at low opacity).

**Firewall:** mirror the existing `CommuneView` `seance--sanity-N` *pattern* (opacity-
driven overlay) but **DO NOT modify** `useConsultation` / `CommuneView`. Separate
system.

## What the human can run / see

Live front page (and `/gaze-preview` with `data-gaze` forced via the slider) at
`gaze=0.2, 0.6, 1.0`. The whole screen grows stranger.

## Verification

- **screenshot-critique** at `gaze=0.6` and `gaze=1.0`: "Does the whole page feel
  like it's succumbing to the void, restrained and cosmic — not a cheap filter?"
  Last check before accept.
- **compare-screenshots** against a no-veil capture (baseline in `assets/`). Judge
  **vignette + desat strength** only.
- Regression: `CommuneView` sanity visuals unchanged (separate system).

## Stay green

- Slice 07 tests; `npm run lint`; `npm run build`; existing Séance tests.

## Human feedback that would change this slice

- Veil too strong at low gaze → raise the band thresholds.
- Want it confined to eye-stage only → see firewall; would require re-scoping
  (user already chose whole-page).
