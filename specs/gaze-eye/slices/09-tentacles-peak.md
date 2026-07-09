# Slice 09 — Tentacles at peak gaze

**Visual variable judged:** APPENDAGE **SILHOUETTE** at peak only.

## Contract

At `gaze ≥ 0.8`, faint **cosmic tendrils** form at the void's edge — ink-like,
cold, reaching slightly inward. Fade in with intensity; cap at a subtle, few-tendril
state at 1.0. **Not fleshy, not gory, not a tentacle cluster** (user allowed "some
tentacles forming could be kind of cool" — keep it subtle and otherworldly).

## What the human can run / see

`/gaze-preview` at `gaze=0.7, 0.85, 1.0`. Tendrils appear only near the top.

## Verification

- **screenshot-critique** at `gaze=1.0` with the explicit question: "Are the
  tendrils subtle and cosmic — clearly NOT gore or cartoon tentacles?" This is the
  decisive gate; reject if it reads fleshy/cute. Last check before accept.
- **compare-screenshots** against slice-08 (baseline in `assets/`). Judge
  **tendril silhouette / restraint** only.
- `prefers-reduced-motion`: tendrils static (no reach animation).

## Stay green

- Slice 08 tests; `npm run lint`; `npm run build`.

## Human feedback that would change this slice

- Too subtle → add 1–2 more tendrils / lengthen slightly.
- Too much → reduce count / opacity / reach.
- "Too tentacle-y" → pull back toward pure cosmic (fewer, more smoke-like).
