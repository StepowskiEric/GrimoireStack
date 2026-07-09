# Tailwind Migration Plan — Component-by-Component

> Status: Phase A complete (82 % dead-CSS removed). Phase B outlined here.

---

## Goal

Continue the Tailwind migration per `AGENTS.md` and the user's plan: convert
remaining hand-rolled CSS into Tailwind utilities + `@layer components`,
**component-by-component**, with **no file exceeding 500 lines**.

Hard constraints:

- No CSS file (or JS/TS file) over 500 lines.
- Visual regression forbidden — capture a baseline screenshot before any
  component-cluster touch, compare after.
- Every keyframe still runs (cross-checks against `animation:` references).
- `npm run verify` (lint + typecheck + tests) green at every checkpoint.
- `npm run build` green at every checkpoint.

---

## Current State

After Phase A dead-code removal:

| File                                | Lines | Owner            |
|-------------------------------------|-------|------------------|
| `app/src/App.css`                   | 1 746 | global leftovers |
| `app/src/styles/tailwind.css`       |   180 | Tailwind v4 base |
| `app/src/components/LidlessEyeCast.css`   | 265   | eye cast visuals |
| `app/src/components/FamiliarWhisper.css`  | 124   | whisper visuals  |
| `app/src/components/consultation/TentacleSvg.css` | 83 | tentacle svg     |

App.css alone is **3.5 ×** the 500-line cap. It must be split.

Original (pre-cleanup) backup preserved at `/tmp/App.css.backup` (9 753 lines)
on this branch's working tree.

### Keyframes inventory (live, must be preserved)

```
orbPulse                     spellGlow               modalIn
modalStainIn                 tendrilGrip             sealBreak
ritualToastIn                overlayIn               notfoundSplash
resultFadeIn                 eyeTwinkle (×2)         tentacleWrithe
bgEyeBlink                   ritualSpin              ritualChoiceIn
wanderingFadeIn              wanderingNarrationIn    torchFlicker
torchGlowPulse               floodRipple             floodSubmerged
watcherPupil                 watcherBlink            creviceClose
creviceGlow                  revealGlowExpand        revealLightPulse
revealScrollIn               revealParticles
```

---

## Cluster Map (App.css by line range)

Each cluster corresponds to a logical component or feature grouping. The
target file column is the **proposed home** for the cluster after migration —
the new file is created per cluster, named after the component, and lives
alongside the component (or under `app/src/styles/components/` if the cluster
has no owning component).

| #  | Cluster                       | Source lines     | Est. lines | Target file (proposed)                          |
|----|-------------------------------|------------------|------------|--------------------------------------------------|
| 0  | :root tokens + html/body/::selection | L1-60          |     ~60    | `_globals.css` (or fold into `tailwind.css`)     |
| 1  | `.spell-card` system          | L65-179          |    ~115    | `app/src/components/SpellCard.css`               |
| 2  | `.modal-overlay` / `.modal` shell | L180-244      |     ~65    | `app/src/components/SpellModal.css`              |
| 3  | `.modal` content & close      | L245-526         |    ~280    | `app/src/components/SpellModal.css`              |
| 4  | `.modal-actions` + inscribe + share-half | L527-562 |   ~35    | `app/src/components/SpellModal.css`              |
| 5  | `.sigil-*` + `.spell-star`    | L574-595         |     ~22    | `app/src/components/SpellCard.css` (extend)      |
| 6  | `.notfound-*`                 | L596-665         |     ~70    | `app/src/styles/components/notfound.css`         |
| 7  | `.marginalia-*` + `.shortcuts-modal` | L668-721    |     ~55    | `app/src/components/Marginalia.css` (extend ?)   |
| 8  | `.install-toast` + `.tome-cluster.active` + `.welcome-pip.active` | L722-748 | ~25 | `app/src/components/InstallPrompt.css` (new file) |
| 9  | `.modal-view-toggle`          | L749-784         |     ~36    | `app/src/components/SpellModal.css`              |
| 10 | `.modal-wide` + `.modal-full-entry` + `.modal-md-*` (markdown content) | L785-952 | ~165 | `app/src/components/SpellModal.css` |
| 11 | `.index-alpha-btn.active` + `.intake-*` + oracle inline panel + signal + export toast + suspense fallback | L953-1029 | ~75 | split: intake → `IntakeOracle.css`; signal → already lives in components — extend that file; orphan ones (`export-toast`, `modal-suspense-fallback`) → keep in `App.css` for now |
| 12 | `.grimoire-error*` + `.abyss-background` + `.eye-ring` + `.bg-eyes-canvas` + `.great-eye-*` + `.eye-blink-overlay` + `.eye-tentacle` + `.bg-eye-group` + `.modal-eye--opened` | L1018-1199 | ~180 | `app/src/styles/components/grimoire-eye.css`    |
| 13 | `.seance*`                    | L1201-1287       |     ~90    | `app/src/components/RitualPanel.css` (extend)    |
| 14 | `.ritual-*` (panel, header, form, choice, etc.) | L1288-1336 | ~50    | `app/src/components/RitualPanel.css`            |
| 15 | `.gaze-veil`                  | L1337-1356       |     ~20    | `app/src/styles/components/gaze.css`             |
| 16 | `.gaze-tentacles`             | L1357-1372       |     ~15    | `app/src/styles/components/gaze.css`             |
| 17 | `.wandering-*`                | L1373-1417       |     ~45    | `app/src/components/WanderingAnimation.css` (new)|
| 18 | `.corridor-*` + `.torch-*` + `.flood-*` + `.watcher*` | L1418-1578 | ~165 | `app/src/styles/components/atmosphere-corridor.css` |
| 19 | `.crevice-*`                  | L1579-1630       |     ~55    | `app/src/styles/components/atmosphere-crevice.css` |
| 20 | `.reveal-*`                   | L1631-1703       |     ~75    | `app/src/styles/components/reveal.css`           |
| 21 | `.gaze-preview*`              | L1704-1747       |     ~45    | `app/src/styles/components/gaze-preview.css`    |

### Target file sizes (under-cap check)

Largest target file after split:

- `app/src/components/SpellModal.css` ≈ 280 + 35 + 36 + 165 = ~480 lines ✓ (under 500)
- `app/src/styles/components/grimoire-eye.css` ≈ 180 lines ✓
- `app/src/styles/components/atmosphere-corridor.css` ≈ 165 lines ✓
- `app/src/styles/components/atmosphere-crevice.css` ≈ 55 lines ✓

All target files are under 500 lines.

### Tailwind utility candidates (per cluster)

For each cluster the migration classifies rules into three buckets:

| Bucket              | Action                                                      |
|---------------------|-------------------------------------------------------------|
| Pure utility        | Replace className string in JSX with Tailwind utilities     |
| Repeated pattern    | Promote to `@layer components` in `tailwind.css`            |
| Branded visual      | Keep in component CSS file (gradients, keyframes, pseudos)  |

Per the user's plan, **branded visuals with multi-property keyframes,
pseudo-elements, gradients, and animation choreography stay in CSS**. Only
spacing, typography, color, and layout-utility work moves to Tailwind classes.

---

## Migration Approach

For each cluster, follow this exact sequence:

1. **Capture baseline screenshot** of the relevant route via Playwright.
2. **Read JSX** to map each `.classname` to its current CSS rule (LSP for renames).
3. **For each rule**:
   - If 100 % Tailwind-replaceable → swap `className` string in JSX.
   - If repeated pattern → add to `tailwind.css` `@layer components`.
   - If complex/branded → preserve in the new component CSS file.
4. **Create component CSS file** (under 500 lines) with only branded-visual rules.
5. **Verify**:
   - `npm run verify` green.
   - Playwright screenshot of the route matches baseline (pixel-similar).
   - All keyframe references still resolve.
6. **Delete migrated rules from `App.css`.**

---

## Order of Execution

Phase B is ordered to **isolate risk early**:

| Order | Cluster                             | Why first                                                  |
|-------|-------------------------------------|-----------------------------------------------------------|
|   1   | 0 — globals (`:root` + body)        | Touches every page; safest, smallest diff                 |
|   2   | 1 — `.spell-card` system            | High-traffic list (Schools page); large visible delta     |
|   3   | 2 — modal shell                     | Modal is used 30+ times; isolate shell first              |
|   4   | 3 + 4 + 9 + 10 — modal interior     | Once shell stable, migrate modal interior as one sweep    |
|   5   | 5 — sigil & spell-star              | Tiny cluster; quick win                                   |
|   6   | 6 — not-found                       | Low-traffic page; safe to migrate late                    |
|   7   | 7 — marginalia & shortcuts          | Modal-adjacent; migrate with modal interior               |
|   8   | 8 — install-toast + welcome-pip     | Tiny, low-risk                                            |
|   9   | 11 — signal, intake, inline-oracle  | Atom UI; moderate complexity                              |
|  10   | 12 — grimoire-eye visuals           | Largest single cluster; isolated to its CSS file          |
|  11   | 13 + 14 — seance + ritual-panel     | Migration together (related components)                   |
|  12   | 15 + 16 — gaze-veil + gaze-tentacles | Atmosphere layer; tied to WanderingAnimation             |
|  13   | 17 — wandering-overlay              | Mood atmosphere component                                 |
|  14   | 18 + 19 + 20 — corridor/crevice/reveal | Atmosphere + reveal cluster; together because they share `wandering-overlay` |
|  15   | 21 — gaze-preview                   | Dev-only fixture; lowest priority                         |

This order is sequenced so smaller low-risk clusters go first; atmosphere
clusters (12, 17, 18, 19, 20) cluster together so they share visual context.

---

## Cluster Detail (per-cluster specifications)

### Cluster 0 — `:root` tokens + html/body/::selection

**Source:** L1-60 (60 lines).

**Goal:** Move tokens to `tailwind.css` `@theme` (already partly done —
`tailwind.css` declares `--color-abyss` etc. as `@theme` tokens). The
non-color tokens (`--ease-out`, `--ease-in-out`, etc.) need adding to `@theme`.

**Action:**
- Audit existing `@theme` declarations in `tailwind.css`.
- Add missing tokens (ease curves only; colors are already present).
- Delete the `:root` block from `App.css`.
- Move `html`, `body`, `::selection`, `:focus-visible` into `tailwind.css`
  `@layer base` (already partly done — duplicate-check first).

**Acceptance:**
- Visual smoke test on landing page: same look as before.
- `var(--ease-out)` references in extracted CSS resolve to the new theme token.
- App.css loses lines 1-60.

---

### Cluster 1 — `.spell-card` system

**Source:** L65-179 (115 lines). Uses `@keyframes spellGlow`, `@keyframes orbPulse`.

**Goal:** Inline most utility rules; keep the magical `::before`/`::after`
glyph shimmer and hover lift in `SpellCard.css`. Promote `.spell-card`
visual to a `@layer components` class in `tailwind.css` because it is the
"card primitive" used across multiple components.

**Action:**
- Add `.spell-card` to `tailwind.css` `@layer components` with full visual rules.
- Move compound selectors `.spell-card .spell-tier`, `.spell-card .spell-name`,
  etc. into the same component rule (preserve cascade specificity).
- Move `.spell-status.proven/.new/.framework/.hybrid/.includes` colorways to
  separate `@layer components` rules in `tailwind.css`.
- Delete L65-179 from `App.css`.

**Acceptance:**
- `/schools` route renders identical to baseline.
- Spell card hover lift and `::before` glow continue to animate.
- `npm run verify` green.

---

### Cluster 2 — `.modal-overlay` + `.modal` shell

**Source:** L180-244 (65 lines). Includes `.modal-bg-eyes` + `@keyframes modalIn`.

**Goal:** The overlay uses `position:fixed; inset:0; backdrop-filter:blur(6px)`.
This can mostly be Tailwind utilities. Keep `.modal-bg-eyes` (decorative eye
layer with anchored keyframes) as branded visual.

**Action:**
- Replace `.modal-overlay` rules with a `@layer components` class.
- Move `.modal-bg-eyes` rules and `@keyframes modalIn/modalStainIn` into
  `SpellModal.css`.
- Delete L180-244 from `App.css`.

**Acceptance:**
- Opening any modal triggers the same fade-in animation.
- Backdrop blur effect identical.

---

### Cluster 3 — `.modal` interior (whisper, title, effect, detail, synergies)

**Source:** L245-526 (280 lines). Includes `@keyframes tendrilGrip, sealBreak`,
`@keyframes ritualToastIn`.

**Goal:** Modal typography (whisper, title, effect, etc.) is mostly Tailwind-
friendly. Tendril imagery and seal-break animations stay as branded visuals.

**Action:**
- Move typography utilities (`font-family`, `text-color` cascades) to Tailwind.
- Keep `.modal-title-carved`, `.modal-tendril`, `.modal-tendril--l/--r`,
  `.modal-goo-seal`, `.modal-synergies .syn-chip` in `SpellModal.css`.
- Move all keyframes (`tendrilGrip, sealBreak, ritualToastIn`) into
  `tailwind.css` `@keyframes` block (or keep in `SpellModal.css` if cluster-
  scoped).

**Acceptance:**
- Spell modal in three schools renders identical.
- Tendril grip animation continues.
- Modal `notfound-suggestions`, etc. unaffected.

---

### Cluster 4 — `.modal-actions`, `.modal-inscribe`, `.modal-share-half`

**Source:** L527-562 (35 lines). All utility-class candidates.

**Goal:** Convert entirely to Tailwind utilities + `@layer components`.

**Action:**
- Convert `.modal-inscribe` button styles to a `@layer components` recipe.
- Delete L527-562 from `App.css`.

**Acceptance:**
- Modal "Mark as known" + "Share" buttons identical.

---

### Cluster 5 — `.sigil-*`, `.spell-star`

**Source:** L574-595 (22 lines).

**Goal:** Tiny; promote to `@layer components` in `tailwind.css`. The
`.spell-star.favorited` modifier can be a Tailwind variant.

**Action:**
- Add both rules to `tailwind.css` `@layer components`.
- Delete L574-595.

---

### Cluster 6 — `.notfound-*`

**Source:** L596-665 (70 lines). Includes `@keyframes notfoundSplash`.

**Goal:** Isolated feature; lift out into `app/src/styles/components/notfound.css`.

**Acceptance:**
- Visit `/s/no-match` URL renders identical splash animation.

---

### Cluster 7 — `.marginalia-*`, `.shortcuts-modal`

**Source:** L668-721 (55 lines).

**Goal:** Marginalia is its own component; lift out.

---

### Cluster 8 — `.install-toast`, `.tome-cluster.active`, `.welcome-pip.active`

**Source:** L722-748 (25 lines).

**Goal:** Promote `.install-toast` to its own CSS file.`.tome-cluster.active`
and `.welcome-pip.active` are one-line `.active` state rules → Tailwind
`data-[active]:` variants or `@layer components`.

---

### Cluster 9 — `.modal-view-toggle`

**Source:** L749-784 (36 lines).

**Goal:** Promote to `@layer components`.

---

### Cluster 10 — `.modal-wide`, `.modal-full-entry`, `.modal-md-content*`

**Source:** L785-952 (165 lines). Markdown content rendering with `h1-h6`, `p`,
`ol/ul`, `code`, `pre`, `table`, `blockquote` selectors.

**Goal:** Markdown content is best handled by a **markdown CSS component**
class reused by anything that renders user markdown. Move into
`SpellModal.css` (or extract to `MarkdownContent.css` if reused elsewhere).

---

### Cluster 11 — `.intake-*`, `.oracle-inline-*`, `.signal-*`, `.export-toast`,
            `.modal-suspense-fallback`, `.index-alpha-btn.active`,
            `.spell-card .spell-name--secondary`, `.index-alpha-btn.active`

**Source:** L954-1029 (75 lines) + a few scattered.

**Goal:** Each sub-cluster has its own owner component. Move into the
respective component's CSS file.

---

### Cluster 12 — Grimoire eye visuals

**Source:** L1018-1199 (180 lines). The largest themed cluster.

**Goal:** Lift to `app/src/styles/components/grimoire-eye.css`. Reason for a
shared file: `GrimoireEye.jsx`, `LidlessEyeCast.css`, and `FamiliarWhisper.css`
all reference parts of this system. Maybe later collapse into the same
namespace.

---

### Cluster 13 + 14 — Seance + Ritual Panel

**Source:** L1201-1287 (87 lines, seance) + L1288-1336 (49 lines, ritual).

**Goal:** Combine into `app/src/components/RitualPanel.css` (rename to
`SeanceAndRitual.css` if it exceeds cap).

---

### Cluster 15 + 16 — Gaze veil + gaze tentacles

**Source:** L1337-1372 (35 lines).

**Goal:** Lift to `gaze.css`.

---

### Cluster 17 — Wandering overlay

**Source:** L1373-1417 (45 lines). Includes `@keyframes wanderingFadeIn,
wanderingNarrationIn`.

**Goal:** Owned by `WanderingAnimation.jsx`; create sibling CSS file.

---

### Cluster 18 — Corridor / flood / watcher

**Source:** L1418-1578 (165 lines). Includes `@keyframes torchFlicker,
torchGlowPulse, floodRipple, floodSubmerged, watcherPupil, watcherBlink`.

**Goal:** Sibling CSS file.

---

### Cluster 19 — Crevice

**Source:** L1579-1630 (55 lines). `@keyframes creviceClose, creviceGlow`.

---

### Cluster 20 — Reveal animation

**Source:** L1631-1703 (75 lines). `@keyframes revealGlowExpand,
revealLightPulse, revealScrollIn, revealParticles`.

---

### Cluster 21 — Gaze preview fixture

**Source:** L1704-1747 (45 lines). Dev-only `<GazePreview />` fixture.

---

## Tailwind Theme Tokens Needed

Add to `tailwind.css` `@theme`:

```css
/* Easings — missing from existing theme */
--ease-out: cubic-bezier(.23, 1, .32, 1);
--ease-in-out: cubic-bezier(.77, 0, .175, 1);
```

Verify all `var(--*)` references in extracted CSS resolve after the move.

---

## Visual Regression Harness

Before Phase B begins, set up Playwright screenshots for these routes:

| Route                          | Purpose                                           |
|--------------------------------|---------------------------------------------------|
| `/` (home)                     | Landing visual baseline                            |
| `/s/some-known-spell`          | Spell detail modal baseline                       |
| `/s/no-such-spell`             | Not-found splash                                  |
| Modal: Favorites view          | Favorites modal baseline                          |
| Modal: Compare Spells          | Side-by-side spell diff                           |
| Settings view                  | Visual test for unrelated layout                 |
| Bestiary Codex view            | Long-page scroll baseline                         |

Use Playwright's `expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.02 })`.

---

## Verification Workflow (per cluster)

After each cluster migration:

```bash
cd app
npm run lint              # zero errors, zero warnings
npm test                  # 702 tests still green
npm run build             # build size delta acceptable
npm run dev &             # smoke test dev server
curl -s http://localhost:5173 | grep -E "ReferenceError|TypeError"  # empty
```

Plus the Playwright screenshot diff for the relevant route.

---

## Open Questions / Decisions Needed

1. **Where do `@keyframes` live?** Two options:
   - A) In `tailwind.css` `@keyframes` block (one global registry).
   - B) Co-located with the cluster CSS file (closer to consumer).
   - Recommendation: **A**, as long as they don't exceed the 500-line cap.

2. **Modular SCSS-style partials?** Vite supports `@import` of CSS files but
   each `@import` becomes a separate stylesheet. Recommendation: **inline**
   the cluster CSS into its named file; do not add `@import` chains.

3. **Component CSS file naming**: keep PascalCase matching the component file?
   - `SpellCard.jsx` + `SpellCard.css` → Yes.
   - Cluster 11 sub-components → match their owners.

---

## Files To Be Deleted Eventually

After Phase B completes:

- `app/src/App.css` should be empty or deleted entirely.
- Remove its `import './App.css'` from `app/src/main.jsx`.

---

## Estimated Effort

| Cluster | Lines | Approx. effort |
|---------|-------|----------------|
| 0       | 60    | low            |
| 1       | 115   | medium         |
| 2       | 65    | low            |
| 3       | 280   | medium         |
| 4       | 35    | low            |
| 5       | 22    | low            |
| 6       | 70    | low            |
| 7       | 55    | low            |
| 8       | 25    | low            |
| 9       | 36    | low            |
| 10      | 165   | medium         |
| 11      | 75    | low            |
| 12      | 180   | medium         |
| 13+14   | 136   | medium         |
| 15+16   | 35    | low            |
| 17      | 45    | low            |
| 18      | 165   | medium         |
| 19      | 55    | low            |
| 20      | 75    | low            |
| 21      | 45    | low            |

Total: ~1 745 lines to relocate across 16 new CSS files + the Tailwind theme.

---

## Resume Point

To resume Phase B:

1. Read this file.
2. Confirm scope with user (delete `App.css` entirely or keep as empty stub).
3. Capture baseline screenshots before touching any cluster.
4. Execute clusters in the order specified above.
5. Each cluster is a 4-step cell:
   - create target file
   - move rules
   - update JSX `className` references
   - delete migrated lines from `App.css`
6. After each cluster, run `npm run verify` + visual diff.
7. After all clusters, App.css should be 0 bytes; remove its import.
