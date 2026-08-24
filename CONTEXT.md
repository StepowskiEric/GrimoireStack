# GrimoireStack — Domain Glossary

The app is themed as a **grimoire** (a wizard's book of spells). The
underlying domain is a catalog of agent skills, with this themed
vocabulary. Future architecture reviews should not re-litigate the
meanings of these terms.

## Core concepts

- **School** — a top-level category of related skills. The app groups
  spells by school (`debugging`, `reasoning`, `testing`, ...). Defined
  in `app/src/data/schools.js`.
- **Spell** — a single agent skill. Has a `skill` id, `name`, `effect`,
  optional `status` (`Proven`, `MCP`, `Hybrid`, `Framework`, `New`,
  `—`, or `Common`), optional `combos` (other spell names).
- **Sigil** — visual flourish for a school (`SchoolSigil.tsx`).
- **Embers** — ambient particles in the background (`Embers.jsx`).
- **Lidless Eye** — the cast-animation component (`LidlessEyeCast.tsx`,
  driven by `useEldritchCast`). "Casting" a spell triggers the eye.
- **Grimoire** — the whole tome. The user's local app instance.
- **Codex** — a section of the grimoire (e.g. `BestiaryCodex` is the
  tools/bestiary tab; the **Tombs of Ailments** is the problem-intake
  modal).
- **Marginalia** — user notes on individual spells (`useMarginalia`,
  persisted under `grimoire-marginalia`).
- **Inscribe** — install a skill locally with `npx skills add`
  (the standard skills CLI); the app's UI shows the incantation
  to copy.
- **Bind / Unbind** — add/remove a spell from the user's "summoning
  circle" (the compare set in `CompareSpellsModal`).
- **Forge, Crucible, Cauldron, Brew** — recipe/combo-building
  vocabulary in the Rituals tab (`RecipeLabView`).
- **Ritual** — a multi-spell combination output by the Crucible.
- **Featured schools** — the 6 schools the user has pinned on the Spine
  (`grimoire-featured-schools` localStorage key).
- **Favorites** — starred spells (`useFavorites`,
  `grimoire-favorites`).
- **Recently viewed** — last 20 spells opened (`useRecentlyViewed`,
  `grimoire-recent`).
- **Stale link** — a URL that points to a skill not in the current
  corpus; the app shows a "Did you mean..." banner
  (`StaleLinkBanner`).

## Architectural seams

These are the named, deep modules that own a single concern. Future
refactors should extend, not bypass, these seams.

- **`grimoireIndex`** (`app/src/data/grimoireIndex.js`,
  `app/src/data/grimoireIndexInstance.js`) — **the only spell
  adapter.** Owns lookup (`resolveBySkill`, `resolveByName`,
  `resolveComboSpells`, `getSchoolForSkill`, `getSpellNameBySkill`),
  iteration (`flatEntries`, `iterate`, `allEntries`, `entriesBySchool`,
  `filterBy`), derived views (`getSchoolMap`, `getStats`), matchers
  (`similarTo`, `matchProblem`), and graph
  (`buildGraph`, `getNodeBySkill`, `buildSpellWeb`). **Every spell
  query goes through this seam.** No component accepts a `schools`
  prop — all views consume `grimoireIndex` directly. Tests use
  `vi.mock` on `grimoireIndexInstance.js` to supply custom data.
  Factory `createGrimoireIndex(schools)` builds from any schools
  array; the singleton is built from the canonical `schools.js`.
  No module walks `schools[]` directly except
  `grimoireIndexInstance.js` itself.

- **`schoolSigils`** (`app/src/data/schoolSigils.jsx`) — visual
  mapping for school sigils. Owned by the data layer; consumed by
  components that show school identity.

- **`tiers`** (`app/src/data/tiers.js`) — spell status → tier mapping
  (`archmage`, `master`, `adept`, `apprentice`, `faded`). Canonical
  tier derivation. The status vocabulary (`Proven`, `MCP`, `Hybrid`,
  `Framework`, `New`, `—`) is owned by `schools.js` data and
  consumed here.

- **`spellMetadata`** (`app/src/data/spellMetadata.js`) — explicit
  per-spell `lastUpdated` dates and curated change notes, plus a
  deterministic hash-based fallback. Owns the metadata concept;
  delegates corpus iteration to `grimoireIndex.allEntries()`.

- **`search`** (`app/src/search.js`) — text-search and filter over
  spells. Pure function, shared with the static site. Independent of
  `grimoireIndex` because the static site is not a Vite/JS app.

- **`urlSpellSync`** (`app/src/utils/urlSpellSync.js`) — parse and
  build spell URLs (`/s/<skill>` canonical, `?s=<skill>` legacy).
  Owned by URL concerns.

## Cross-cutting principles

- **App.jsx is a thin shell.** It owns top-level state (welcome,
  school selection, modals, search, filters) and orchestrates
  callbacks. It does not own audio, storage, or spell lookup — those
  are modules.
- **Components do not walk `schools[]` directly.** They consume
  `grimoireIndex` for any spell query. No component accepts a
  `schools` prop for local iteration — the sole seam is
  `grimoireIndex`.
- **Hooks own their own storage.** Each persisted hook
  (`useFavorites`, `useRecentlyViewed`, `useMarginalia`,
  `useSignals`) reads and writes its own localStorage key; the
  `exporter` reads through the same keys but is not the storage
  adapter.

## Module naming conventions

- **`app/src/data/`** — pure data, factories, lookups, derived views.
- **`app/src/hooks/`** — React hooks; one per concern.
- **`app/src/components/`** — React components; the
  `app/src/components/LidlessEyeCast.tsx` file is `.tsx` because it
  uses a few type annotations; the rest is `.jsx`.
- **`app/src/utils/`** — small leaf utilities (no React, no app
  state). `exporter`, `markdownExport`, `schoolColors`, `urlSpellSync`.
- **`app/src/i18n/`** — language context and message bundles.
- **`app/src/audio/`** — sound triggers; consumed by components and
  the cast hook.
