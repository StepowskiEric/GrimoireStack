# Witch Doctor Wizard — Design Decisions

## Metadata
- **Date:** 2026-05-22
- **Source:** grill-me session
- **Files affected:** `app/src/components/WizardModal.jsx`, `app/src/data/schools.js`, `app/src/App.css`, `app/src/App.jsx`, `app/src/components/SpellCast.tsx` (as reference), `app/remotion/src/` (new compositions)

## Structural Changes

### Rename: "Wizard" → "Witch Doctor"
- All references: `WizardModal` → `WitchDoctorModal`, `wizard-` CSS classes → `wd-`, `wizardOpen`/`setWizardOpen` → `witchDoctorOpen`/`setWitchDoctorOpen`
- Text: "Consult the Grimoire" link text, modal aria-label, progress pips

### Remove categories from WIZARD_DATA
- Delete `expo` category object (lines ~363-371)
- Delete `supabase` category object (lines ~373-381)
- Delete `surrealdb` category object (lines ~384-395)
- Clean up API/Network alt-text references to Expo

### Rename residual category
- `id:'reasoning'` → label changed from `"🔍 Reasoning / Decision / Planning"` → `"🔮 Planning & Decisions"`

## UI Architecture

### Category layout (Step 0)
- **Desktop:** Flat list with rune dividers between groups
  - `ᚦ ᛖ ᛒ` between "Fix it" (Bug, API/Network) and "Build it" (Architecture, Refactoring)
  - `ᛟ ᚲ ᛉ` between "Build it" and "Check it" (Code Review, Testing, Output Quality)
  - `ᚠ ᛗ ᚱ` between "Check it" and "Figure it out" (Planning & Decisions, Agent Collaboration, Cognitive Load, Other)
- **Mobile:** 4 tag pills at top — "Fix it / Build it / Check it / Figure it out" — scroll-to-group on tap

### Entrance animation
- Page-peal from center crease (CSS 3D perspective transform)
- Fade-in + scale from vertical center line, like a book page opening
- Click-to-skip on overlay (same pattern as SpellCast)

### Step transitions
- 300ms 3D Y-axis page flip
- Progress pip animates during flip
- Background gradient shifts: Step 0 dark violet → Step 1 warm amber → Step 2 deep gold (1-2s transition)
- `pageCreak()` sound from sounds.js fires on each transition
- `prefers-reduced-motion` fallback: instant transitions, no sound

## Witch Doctor Character

### Image
- `/witch_doctor.png` — 1024×1536, full-body portrait
- Displayed at top of modal, ~180px height on desktop

### Remotion clips (2 total)
**1. WitchDoctorIdle** (5s, ~150 frames, loopable)
- Gentle floating bob (±3px y-oscillation over 6s)
- Skull pendant area: slow amber pulse glow
- Head feathers: subtle sway
- Rope tension pulse on raised arm
- Basket of heads sways with body
- Render at 400×600 to keep file size small

**2. WitchDoctorReveal** (3s, ~90 frames, one-shot)
- Golden burst from behind character (scale 1→1.15, settle)
- Eye flash: bright gold radiance from eye area (2 frames)
- Expanding ring of golden runes outward
- Feather headdress gold highlight sweep
- Shrunken heads brief colored glow
- Bone necklaces/skull shimmer

### Video implementation
- Single `<video>` element, swaps `src` on step change
- CSS fade-in entrance, crossfade between clips
- Preload both clips on modal open

## Micro-Atmosphere

### Floating dust motes
- 6-8 gold-tinted CSS particles inside modal
- Drift slowly upward, 8-12s cycle
- Opacity 0.15-0.3, 2-3px diameter
- Same aesthetic as Scrying Orb mist, smaller scale

### Sounds
- `pageCreak()` on step transition (already in codebase)
- No separate ambience track (would clash with `startAmbience()`)

## Result Panel (Step 2) — 5 Enhancements

1. **Skill name burn-in** — gold scale-up (1.3→1.0) + opacity fade, 500ms, matches SpellCast.tsx animation language
2. **School symbol badge** — school symbol (⚔ ◇ ⚙ ◈ 🏛 etc.) in gold ring above skill name
3. **Parchment reason block** — feTurbulence texture (same SVG filter as main backdrop), rune corner accents, soft amber glow on hover
4. **Rune progress pips** — thin bars replaced with Elder Futhark runes: ᚦ (problem) → ᛖ (transition) → ᛟ (answer/result). Completed runes glow gold
5. **"More like this" worm** — tiny inline link: "Not quite right? Try searching [keyword]" that fills scrying orb input when clicked

## Category → Cluster Mapping

| Group | Category ID | Label |
|---|---|---|
| 🐛 **Fix it** | bug | Bug / Failure / Regression |
| | api-data | API, Network & Data Fetching |
| 🛠 **Build it** | architecture | Architecture & Design |
| | refactoring | Refactoring & Code Improvement |
| ✅ **Check it** | code-review | Code Review & Quality |
| | testing-skill | Testing & Evaluation |
| | output-quality | Output Quality & Verification |
| 🎯 **Figure it out** | reasoning | 🔮 Planning & Decisions |
| | collaboration | Agent Collaboration & Memory |
| | cognition | Cognitive Load & Metacognition |
| | other | Other & Edge Cases |

## Data Changes
- `schools.js`: Delete 3 WIZARD_DATA categories (expo, supabase, surrealdb), rename reasoning label
- `WizardModal.jsx` → rename to `WitchDoctorModal.jsx`, all CSS classes renamed `wd-*`
- `App.jsx`: state renames, import renames
- `App.css`: all `.wizard-*` → `.wd-*`, new styles for rune dividers, tag pills, dust motes, enhanced result panel, page-peal animation, video container
