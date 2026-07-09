**Status:** Slices 01 (gaze plumbing), 02 (`/gaze-preview` fixture), 03 (cold cosmic eye recolor + ambient glow), 04 (void pupil + starfield), 05 (non-Euclidean iris rings), 06 (chromatic aberration), 07 (background eyes swarm), 08 (whole-page gaze veil), 09 (tentacles at peak gaze), 10 (page-agent void incantations — resident GUI agent at peak gaze) built & green. Last updated 2026-07-09.
**Next pickup:** All visual gaze slices (01–10) complete. Slice 10 promotes the research spike into the build: a peak-gaze (gaze ≥ 0.8) "The void listens…" panel reuses the existing single `useAgentMode` agent (no second competing agent) for in-grimoire-scoped incantations; honors `prefers-reduced-motion`; 701 tests green.
**Status:** Slices 01 (gaze plumbing), 02 (`/gaze-preview` fixture), 03 (cold cosmic eye recolor + ambient glow), 04 (void pupil + starfield), 05 (non-Euclidean iris rings), 06 (chromatic aberration), 07 (background eyes swarm), 08 (whole-page gaze veil), 09 (tentacles at peak gaze), 10 (page-agent void incantations — resident GUI agent at peak gaze) built & green. Last updated 2026-07-09.
**Owner:** Front-end / `app/` React app.
**Next pickup:** All visual gaze slices (01–10) complete. Slice 10 promotes the research spike into the build: a peak-gaze (gaze ≥ 0.8) "The void listens…" panel reuses the existing single `useAgentMode` agent (no second competing agent) for in-grimoire-scoped incantations; honors `prefers-reduced-motion`; 701 tests green.

---

## Goal

Make the main "Great Eye" on the GrimoireStack front page progressively warp into
something eldritch and *not of this world* as the user engages:

- **Dwell time** on the page slowly awakens the eye.
- Clicking **Begin the Ritual** and answering each consultation question warps it
  further, one step per answered question.
- At high gaze the **whole front-page screen** becomes stranger — a void vignette
  and cold desaturation, "as if you are gazing into the void and it is staring back."
- At peak gaze, **faint cosmic tendrils form** at the void's edge (subtle, ink-like,
  not fleshy/gory).

Palette: **cold cosmic** (Direction A). Abyssal blue-black, ice-blue stars, violet
chromatic aberration. **No sickly green** (`rgb(138,154,106)` is retired). No gore.

The single integration point is a continuous scalar `gaze` ∈ [0,1]. Everything
below maps that one number to visuals.

---

## Context (grounded in repo, not guessed)

- `app/src/components/GrimoireEye.jsx` — 100% inline SVG, `viewBox="0 0 400 280"`
  with **no width/height** (current "cheap" sizing). One rAF loop writes DOM
  directly via cached selectors (`.great-eye-container`, `#eye-iris-group`,
  `#eye-pupil-group`, `.eye-iris-ring`, `.eye-pupil-glow`, `.eye-vessel`).
  `mood` prop sets `data-mood`; new `gaze` prop (slice 01) sets `data-gaze`.
- `app/src/hooks/useEyeMood.js` — returns `{ mood, recordView, EYE_MOODS }` only.
  Mood is from viewed-skill count + idle time. **It does NOT know about the Ritual
  and emits no gaze value.** Left untouched.
- `app/src/hooks/useGaze.js` (slice 01, NEW) — `useGaze(ritual)` derives a banded
  `gaze` ∈ [0,1] from dwell time + `ritual.{state,round}`. This is the real seam.
- `app/src/utils/gaze.js` (slice 01, NEW) — pure helpers `clamp01`, `dwellRamp`,
  `ritualProgress`, `computeGaze`, `bandGaze`, `gazeStage`, `GAZE_BANDS`.
- `app/src/App.jsx` — renders `<GrimoireStackLayout eyeMood={mood} ritualOrch={ritualOrch} … />`;
  `eyeMood` comes from `useEyeMood`. **Gaze is NOT forwarded from here** — it is
  computed inside the layout where `ritualOrch.ritual` lives.
- `app/src/components/GrimoireStackLayout.jsx` — `ritualOrch = useRitualOrchestrator(…)`
  lives here (line ~127), so `ritualOrch.ritual.{state,round}` is in scope. Slice 01
  added `const { gaze } = useGaze(ritualOrch.ritual);`, set `data-gaze={gaze}` on the
  root div (line ~307), and forwards `gaze={gaze}` to `<GrimoireEye>` (line ~394).
- `app/src/App.css` — legacy `.eye-stage`/`.eye-container`/`.eye-sclera` (likely
  dead) and `--eye-glow:rgba(138,154,106,.06)`. **The eye's own classes
  (`.grimoire-eye-wrapper`, `.great-eye-svg`, `.eye-tentacle`, …) have NO CSS
  anywhere** — grep of `src --include=*.css` is empty. This is why it looks cheap.
- **Precedent to mirror, NOT modify:** `CommuneView` + `useConsultation` already
  drive a progressive `seance--sanity-N` vignette/desat from a `sanity` value.
  The global gaze veil reuses that *pattern* (opacity-driven overlay), but is a
  separate system.

---

## Slice graph

| # | Slice | Unlocks | Visual variable | Depends on |
|---|-------|---------|-----------------|------------|
| 01 | Gaze intensity plumbing | `gaze` prop + `bandGaze()` + real-app wiring | — (seam) | — |
| 02 | Fixture preview page `/gaze-preview` | live scrubber 0→1 for all later slices | — (harness) | 01 |
| 03 | CSS sizing + cold base restyle | correct size, cold sclera/glow | size + base palette | 01 |
| 04 | Void pupil + starfield | rotating cold specks, nebula | pupil void texture | 03 |
| 05 | Non-Euclidean iris rings | conflicting-angle arcs, pale rim | iris geometry | 03 |
| 06 | Chromatic aberration | cold/violet edge ghosts | colour fringe | 04,05 |
| 07 | Background eyes swarm | multiply/redden with gaze | bg density | 03 |
| 08 | Whole-page gaze veil | void vignette + desat on shell | global strangeness | 01 |
| 09 | Tentacles at peak gaze | faint cosmic tendrils ≥0.8 | appendage silhouette | 04,08 |
| 10 | page-agent "void incantations" | resident GUI agent at peak gaze (≥0.8), in-grimoire-scoped DOM actions | void panel + agent seam | 09 |

Each visual slice (03–09) is judged **on the `/gaze-preview` fixture** at
`gaze = 0, 0.25, 0.5, 0.75, 1.0` via `screenshot-critique` (standing gate) and,
where a prior band exists, `compare-screenshots`.

---

## API seam (single owner)

- **`gaze` (number, 0..1)** is the one concept. Owned by `useGaze(ritualOrch.ritual)`
  in `GrimoireStackLayout` (derivation) + `app/src/utils/gaze.js` (pure helpers
  `bandGaze`, `gazeStage`). `useEyeMood` is unrelated and untouched.
- `GrimoireEye` **consumes** `gaze` (new prop, default `0.25`). It does NOT compute
  gaze.
- `GrimoireStackLayout` sets `data-gaze={gaze}` on its root div (already banded by
  the hook) and forwards `gaze` to `GrimoireEye`. CSS reads `data-gaze` for the veil.
- The fixture page owns its own slider state and passes `gaze` straight to
  `GrimoireEye` — it does NOT go through `useGaze`/`useEyeMood`; it calls the pure
  helpers directly. This keeps the seam single (one prop) while giving a clean
  workbench.
- **No parallel abstraction:** `bandGaze` lives in one util, imported by both the
  layout and the tests. `mood` stays for the existing pulse logic; it is not
  redefined.

---

## Firewalls (non-goals)

- **Do NOT touch** `CommuneView` / `useConsultation` / the `seance--sanity-*`
  system. It works independently; the gaze veil only *mirrors its pattern*.
- **No gore / body-horror / fleshy tentacles.** Tentacles (slice 09) are ink-like
  cosmic tendrils, faint, at peak gaze only.
- **No sickly green.** Palette is cold cosmic. `--eye-glow` green value is retired.
- **No new runtime deps.** Slice 10 reuses the already-present `page-agent` dependency
  (in `app/package.json`) via `useAgentMode`; no new dependency was added. The agent runs
  server-side through `groq-proxy`, so no API key reaches the client.
- **`prefers-reduced-motion`** must disable all warp/rotation/aberration; static
  cold eye remains.

---

## Known unknowns

- Exact dwell-ramp rate is a taste knob (default in slice 01 is a starting point;
  the fixture page lets the user retune live).
- Real visual target is aesthetic, not a library. No external research required.
  If the user later supplies Call-of-Cthulhu / Bloodborne reference stills, drop
  them in `assets/` and the `compare-screenshots` gate will use them as targets.
- page-agent (slice 10) is a research-captured future option; whether to build it
  is an open Phase-2 decision (see slice 10 for the hard realities).

---

## Methodology note

The `write-spec` workflow suggests fanning out three independent subagents to draft
the slice graph. I did **not**: this is a single tightly-scoped front-end change
with one clear seam (`gaze` prop), and the recon each draft would redo is already
done above. Consolidating avoids a speculative parallel abstraction the repo's
simplicity-first guidance would reject. If the feature later grows (e.g. a second
corruption axis), revisit fan-out.

---

## Slice 10 — page-agent "void incantations" (BUILT — promoted from research spike)

The eldritch eye could become a **resident GUI agent** via Alibaba's
[page-agent](https://github.com/alibaba/page-agent) (MIT, client-side, DOM-text
agent, bring-your-own-LLM). The unique angle: GrimoireStack would be a *horror-
themed* GUI agent — the void operates the grimoire via "incantations" (natural
language → scoped DOM actions), not a friendly SaaS copilot. At peak gaze the eye
"listens."

This was delivered as **Slice 10** (promoted from research spike per user direction). The
resident GUI agent reuses the existing `useAgentMode` hook — no second competing agent —
and runs server-side through `groq-proxy`, so no API key reaches the client. Incantations
are scoped to an in-grimoire allowlist (`buildIncantationPrompt`) for safety. Key realities
from the original spike still hold: a real LLM needs a backend proxy on a static Cloudflare
Pages app; page-agent's `page-controller` can also act on the DOM without an LLM (scripted,
allowlisted path); and an in-page NL DOM operator is a prompt-injection / XSS-adjacent
surface, so CSP + strict allowlist are required. Delivered as `app/src/components/VoidIncantations.jsx`
+ `useAgentMode.buildIncantationPrompt` (strict in-grimoire allowlist) + CSS `.void-incantations`.
See `slices/10-page-agent-void-incantations.md` for the built status and the Next Agent Prompt.

---

## Next Agent Prompt

You are resuming the **Gaze** feature for GrimoireStack (`app/`). Slices 01 (gaze
plumbing), 02 (`/gaze-preview` fixture), 03 (cold cosmic eye recolor + ambient
glow), 04 (void pupil + starfield), 05 (non-Euclidean iris rings), 06 (chromatic aberration),
07 (background eyes swarm), 08 (whole-page gaze veil), 09 (tentacles at peak gaze), and
10 (page-agent void incantations) are **built and green** (701 tests). The eye now
reads cold/eldritch/cosmic with a depthless void pupil, a slowly rotating cold starfield,
conflicting-angle iris rings, a subtle cold-blue/violet void-edge fringe, a multiplying/
reddening background-eyes swarm, a whole-page void vignette + cold desaturation veil at
higher gaze; and at peak gaze (≥0.8) a "The void listens…" incantation panel. No sickly green.
reference captures are in `specs/gaze-eye/assets/slice06-gaze{0.3,0.6,1}.webp`,
`specs/gaze-eye/assets/slice07-gaze{0.3,0.5,0.6,1.0}.webp`, and
`specs/gaze-eye/assets/slice08-gaze{0,0.25,0.5,0.75,1.0}.png`.
`specs/gaze-eye/assets/slice09-gaze{0.7,0.85,1.0}.png` (peak-gaze tendrils: none at 0.7, faint at 0.85, full at 1.0; plus `slice09-gaze1-reduced.png`).
1. **Slice 09 (tentacles at peak gaze) is DONE** — faint cosmic tendrils appear at the
   top edge only at gaze ≥ 0.8 (none at 0.7, faint at 0.85, full at 1.0), cold blue/violet,
   ink-like, otherworldly — not fleshy/gory/cartoon. Reference captures:
   `specs/gaze-eye/assets/slice09-gaze{0.7,0.85,1.0}.png`. **Slice 10 (page-agent void
   incantations) is also DONE** — at peak gaze (≥0.8) a "The void listens…" panel
   (`VoidIncantations.jsx`) reuses the single `useAgentMode` agent for in-grimoire-scoped
   incantations and honors `prefers-reduced-motion`. Reference captures:
   `specs/gaze-eye/assets/slice10-gaze{1.0,0.7,1-reduced}.png`. All gaze slices 01–10 complete.
2. Proceed slice-by-slice (03→09). Each visual slice: implement, run the fixture at
   the listed gaze bands, run `screenshot-critique` as the final gate, and (where a
   prior band exists) `compare-screenshots`.
3. Keep `prefers-reduced-motion` honored and the Séance system untouched.
4. Slice 10 is now **built** (resident GUI agent at peak gaze, scoped in-grimoire actions via `useAgentMode`). No further gaze slices remain; the Gaze feature is complete.
5. **Update this section** (status + next pickup) before ending your pass.

Global TODO (each points to its slice):
- [x] 01 gaze plumbing — `gaze` prop + `bandGaze` + wiring (DONE)
- [x] 02 `/gaze-preview` fixture + scrubber (DONE)
- [x] 03 CSS sizing + cold base restyle — recolor + ambient glow (DONE)
- [x] 04 void pupil + starfield (DONE)
- [x] 05 non-Euclidean iris rings
- [x] 06 chromatic aberration
- [x] 07 background eyes swarm
- [x] 08 whole-page gaze veil
- [x] 09 tentacles at peak gaze
- [x] 10 page-agent void incantations — built & green (resident GUI agent at peak gaze, reuses useAgentMode)
