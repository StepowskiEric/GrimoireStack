# The Gaze — progressive cosmic corruption of the front-page eye

**Status:** Slices 01 (gaze plumbing), 02 (`/gaze-preview` fixture), 03 (cold cosmic eye recolor + ambient glow) built & green. Slices 04–09 pending. Last updated 2026-07-09.
**Owner:** Front-end / `app/` React app.
**Next pickup:** Slice 04 (void pupil + starfield) — first warping slice, judged on `/gaze-preview` at gaze 0 / 0.25 / 0.5 / 0.75 / 1.0.

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
| 10 | page-agent "void incantations" | FUTURE / PHASE 2 (optional) | — (research spike) | — |

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
- **No new runtime deps.** Pure SVG + CSS + existing rAF. (Slice 10's page-agent is
  explicitly OUT of the current build and would be its own spec.)
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

## Future / Phase 2 — page-agent "void incantations" (OPTIONAL)

The eldritch eye could become a **resident GUI agent** via Alibaba's
[page-agent](https://github.com/alibaba/page-agent) (MIT, client-side, DOM-text
agent, bring-your-own-LLM). The unique angle: GrimoireStack would be a *horror-
themed* GUI agent — the void operates the grimoire via "incantations" (natural
language → scoped DOM actions), not a friendly SaaS copilot. At peak gaze the eye
"listens."

This is a **separate, larger effort** and is deliberately **NOT part of the current
Gaze build**. Grounded in the page-agent developer guide:
- Needs a backend LLM (API key / cost / latency) or page-agent's eval-only demo API
  (not production). The dev guide warns the key is **inlined in the client IIFE** if
  bundled — so real incantations need a **backend proxy** (architectural add for a
  static Cloudflare Pages app).
- `packages/page-controller` allows DOM actions **without an LLM** → a scripted,
  allowlisted "void acts on the page" path is possible cheaply/safely, just not
  natural-language.
- Security: an in-page natural-language DOM operator is a prompt-injection / XSS-
  adjacent surface → CSP + strict allowlist.
- No parallel agent: page-agent must *become* the eye's intelligence or a scoped
  accessibility layer, never a second competing agent.

Captured as speculative slice `10-page-agent-void-incantations.md` (research spike
only, no implementation). Fold into the build only after the Gaze eye ships and the
user approves Phase 2.

---

## Next Agent Prompt

You are resuming the **Gaze** feature for GrimoireStack (`app/`). Slices 01 (gaze
plumbing), 02 (`/gaze-preview` fixture), and 03 (cold cosmic eye recolor + ambient
glow) are **built and green**. The eye now reads cold/eldritch/cosmic with a
cyan-ice glow and no sickly green; reference captures are in
`specs/gaze-eye/assets/slice03-gaze{0,1}.webp`.

1. **Start at slice 04** (`specs/gaze-eye/slices/04-void-pupil-starfield.md`) — void
   pupil + starfield, the first warping slice. Judge live at gaze 0 / 0.25 / 0.5 /
   0.75 / 1.0.
2. Proceed slice-by-slice (03→09). Each visual slice: implement, run the fixture at
   the listed gaze bands, run `screenshot-critique` as the final gate, and (where a
   prior band exists) `compare-screenshots`.
3. Keep `prefers-reduced-motion` honored and the Séance system untouched.
4. Slice 10 (page-agent) is **out of scope** for this build — do not implement unless
   Phase 2 is explicitly approved later.
5. **Update this section** (status + next pickup) before ending your pass.

Global TODO (each points to its slice):
- [x] 01 gaze plumbing — `gaze` prop + `bandGaze` + wiring (DONE)
- [x] 02 `/gaze-preview` fixture + scrubber (DONE)
- [x] 03 CSS sizing + cold base restyle — recolor + ambient glow (DONE)
- [ ] 04 void pupil + starfield
- [ ] 05 non-Euclidean iris rings
- [ ] 06 chromatic aberration
- [ ] 07 background eyes swarm
- [ ] 08 whole-page gaze veil
- [ ] 09 tentacles at peak gaze
- [ ] 10 (future/optional) page-agent void incantations — Phase 2, not in current sequence
