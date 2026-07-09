# Slice 02 — Fixture preview page `/gaze-preview`

**Contract unlocked:** A standalone, dev-only page that mounts `GrimoireEye` with a
slider + `?gaze=N` deep-link, so every later visual slice is judged at exact gaze
bands without waiting 60s or clicking through the ritual. This is the user-chosen
**checkpoint harness**.

## API seam

- New route (dev-only): `app/src/views/GazePreview.jsx` (or reuse the app's router
  pattern). Render ONLY when `import.meta.env.DEV` (keep prod surface clean).
- Local slider state `gaze` (0..1, step 0.05); also read `?gaze=` from URL on mount.
- Mount `<GrimoireEye gaze={gaze} mood="neutral" />` centered, on the app background.
- Add band buttons `0 / 0.25 / 0.5 / 0.75 / 1.0` for one-click jumps.
- Wire the route in the app's router/entry (dev guard) at path `/gaze-preview`.

Ownership: the fixture **passes `gaze` directly**; it does NOT call `useEyeMood`.
This keeps the seam single (`gaze` prop) while isolating the workbench.

## What the human can run / see

`npm run dev` → open `http://localhost:5173/gaze-preview?gaze=0.5`. Drag the slider
or click a band button; the eye updates live. This page is the screenshot source
for slices 03–09 (and the optional 10).

## Verification

- Page loads in DEV; `?gaze=0.75` sets slider to 0.75 on mount.
- Slider 0↔1 updates the eye without a full reload.
- `npm run build` does NOT include the route in prod (dev-guard verified), or the
  route is harmless/unlinked (state which you chose).
- No console errors; `npm run lint` clean.

## Stay green

- All existing routes/tests.
- `prefers-reduced-motion` still respected by the eye on this page.

## Human feedback that would change this slice

- Want it in prod too (e.g. as a shareable demo) → drop the DEV guard, add nav link.
- Prefer a different band set → adjust the band buttons.
