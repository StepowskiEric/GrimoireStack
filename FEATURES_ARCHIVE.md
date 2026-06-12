# GrimoireStack — Features Archive

A catalog of features that existed in earlier designs and were removed during the **eldritch refactor** (commit `d473513`, "eldritch theme refactor — lidless eye cast, GrimoireStack layout, themed modal"). Use this list when deciding what to reimplement.

Each entry records:
- **What** — the user-facing capability
- **Where it lived** — the component file and any related data
- **Why it was cut** — the reason it no longer ships
- **How to reimplement** — the smallest path to bring it back in the current theme

---

## Index, Graph, Ritual, Changelog, Wizard — the "Tab Bar" era

The previous layout had a top `TabBar` that exposed five utility "schools" alongside the real 16 skill schools: **Index** (alphabetical), **Graph** (relationship web), **Ritual** (install instructions), **Changelog** (recently updated), **Recipe Lab** (multi-spell composition). The new `GrimoireStackLayout` replaced the tab bar with three side-panel sections and an "Arcane Tools" tab that initially showed placeholders for the five. Those placeholders are now replaced by a single Bestiary Codex.

### Spell Index
- **What** — A flat alphabetical list of every spell across all schools, with A–Z jump buttons and a per-letter count.
- **Where it lived** — `app/src/components/SpellIndex.jsx`, sourced from `getAlphabeticalIndex()` in `data/spellMetadata.js`.
- **Why cut** — The Great Eye's pupil-search already provides a fast, type-as-you-go view. A separate index tab was redundant for the casual user.
- **Reimplement** — `getAlphabeticalIndex()` still returns the full sorted list. Wire it into a new tab in `GrimoireStackLayout` or as a "View all spells" link from the Bestiary Codex.

### Spell Graph
- **What** — An interactive force-directed graph of spell synergy edges, with school clustering, hover/click highlighting, and a tooltip.
- **Where it lived** — `app/src/components/SpellGraph.jsx` (660-line force-layout SVG with 60 relaxation passes), `data/spellGraph.js` (node/edge builder).
- **Why cut** — The graph rendered for all ~330 spells at once; performance and information density suffered on smaller viewports. The current "Synergistic Pairings" section inside `SpellModal` covers the same need at the per-spell level.
- **Reimplement** — The data and layout engine are intact. Gate it behind an opt-in "Relationship Web" toggle in the Bestiary Codex; lazily import the graph component; consider a `<canvas>` backend for >100 nodes.

### Ritual of Summoning
- **What** — A page listing install commands for every supported agent (`npx jerry-skills install`, `--agent codex`, `--skill foo`) with one-click copy buttons and a "GitHub source" seal.
- **Where it lived** — `app/src/components/RitualSection.jsx`.
- **Why cut** — Functionality still works via the install commands shown in the spell modal's "Inscribe to your Workshop" button. A full ritual page was overkill for what is mostly a clipboard copy.
- **Reimplement** — Re-mount `RitualSection` as a sub-section of the Bestiary Codex or a dedicated "Rituals" page. Drop the GitHub seal into a Settings page link.

### Changelog
- **What** — A grouped feed of recently updated spells with explicit curated `lastUpdated` dates and change notes.
- **Where it lived** — `app/src/components/ChangelogSection.jsx`, sourced from `getRecentlyUpdated()` in `data/spellMetadata.js`. The data is still enriched with explicit entries (`EXPLICIT` map) and deterministic hash-based fallback dates for the rest.
- **Why cut** — Used to be a tab; no longer has a clear home.
- **Reimplement** — Add it as a "Recent" sub-tab inside the Bestiary Codex, or surface it in a "What's New" toast on the Apprentice Welcome.

### Recipe Lab (the older version)
- **What** — A drag-and-drop multi-step ritual composer where you could pick 2–5 spells, name the ritual, and copy a sequence.
- **Where it lived** — `app/src/components/RecipeLab.jsx` (old), `data/schools.js` `WIZARD_DATA` (11 categories × 70 situations).
- **Why cut** — The "Rituals" tab in the new layout (`RecipeLabView.jsx`) is a simpler 2-spell comparator. The richer composer was rarely used and had a steep UI cost.
- **Reimplement** — `WIZARD_DATA` is still in `schools.js`; build a new "Ritual Composer" using the design language from the eldritch refactor. The current `RecipeLabView` covers the simple 2-spell case; the composer would handle 3+ spells with ordering.

### Tome of Ailments
- **What** — A "what ails you?" picker with four cluster buttons (Fix it / Build it / Check it / Figure it out) that mapped to `WIZARD_DATA` situations and surfaced the right spell.
- **Where it lived** — `app/src/components/TomeOfAilments.jsx`.
- **Why cut** — Replaced by `ProblemIntakeModal` (free-text problem matcher) and `WitchDoctorModal` (guided category flow). Both are modal-only entry points from the sidebar.
- **Reimplement** — `WIZARD_DATA` is intact. Re-mount `TomeOfAilments` as a third entry button next to "What Ails You?" in the sidebar, or rebuild the cluster picker as a Settings or Bestiary sub-section.

---

## Bookmark of First Rites
- **What** — A first-time-visitor "bookmark" panel with quick CTAs: try a sample problem, browse by school, open the witch doctor.
- **Where it lived** — `app/src/components/BookmarkOfFirstRites.jsx`, `data/bookmark.js`.
- **Why cut** — The Apprentice Welcome modal now handles first-visit guidance; the bookmark was redundant.
- **Reimplement** — Mount as a small floating action button after the welcome is dismissed, or as a sub-section of the eye stage.

---

## Stale Link Banner
- **What** — When someone deep-links to `/s/typo`, a banner explains the spell was not found and offers to dismiss.
- **Where it lived** — `app/src/components/StaleLinkBanner.jsx`. The `useSpellInteraction` hook still exposes `notFoundSkill` and `dismissNotFound`; only the banner itself is gone.
- **Why cut** — Visual polish gap; the hook is still wired but no UI surfaces the state.
- **Reimplement** — Mount the banner in `App.jsx` adjacent to the spell modal block, gated on `notFoundSkill`. A small piece of work; everything else is already in place.

---

## Two-Page Book Layout
- **What** — The original `BookLayout` that rendered a 2-page grimoire with a left nav page and a right content page, with a "page turn" animation between states.
- **Where it lived** — `app/src/components/BookLayout.jsx`, `LeftPage.jsx`, `RightPage.jsx`.
- **Why cut** — The eldritch refactor moved to a three-pane sidebar/eye/panel layout. The book metaphor was too literal for the new "Great Eye" concept.
- **Reimplement** — Keep as a toggleable "Codex mode" view in Settings. The component is intact and could be reintroduced as a per-school detail page if a more book-like reading view is wanted.

---

## Custom Ritual Composer (planned)
- **What** — A multi-step ritual builder with ordering, naming, and copy-as-script.
- **Status** — Never shipped; was a planned successor to the older Recipe Lab.
- **Reimplement** — Build on `WIZARD_DATA` (situations carry `alt` suggestions) plus the combo network from `spellGraph.js`. Allow a user to chain 3+ spells into a named ritual and copy the full invocation.

---

## Dead code in `App.jsx` from the school-id routing era
- **What** — Six computed flags (`isLab`, `isRitual`, `isIndex`, `isGraph`, `isChangelog`, `isSpecial`) and a `spellTier` callback that the old `TabBar`-based routing used. After the refactor they were computed but never read.
- **Where** — `app/src/App.jsx` lines 72–77 (flags) and 249 (`spellTier` callback).
- **Status** — Removed during this cleanup.
- **Reimplement** — N/A. The new routing is tab-based, not school-id based.

## `tomeOpen` state
- **What** — A `tomeOpen` state in `App.jsx` for the legacy "Tome" view; the Esc handler checked it but nothing ever set it to `true`.
- **Status** — Removed.

## Featured-schools localStorage double-load
- **What** — `useState` initializer AND a `useEffect` both read `localStorage['grimoire-featured-schools']`; the second was redundant.
- **Status** — Removed.

## `SchoolCardGrid` Customize button
- **What** — The "Customize" picker in `SchoolCardGrid` wrote to `localStorage` but did not call `onFeaturedSchoolsChange` to lift state to the parent, so the eye kept showing the old featured set.
- **Status** — Fixed: the Save button now calls `onFeaturedSchoolsChange` so the eye re-renders with the new selection immediately.

## `WitchDoctorModal` and `ShortcutsModal` missing imports
- **What** — `App.jsx` rendered `<WitchDoctorModal>` and `<ShortcutsModal>` in modal blocks but did not import them; clicking the sidebar's Witch Doctor or Shortcuts button would throw at render time.
- **Status** — Fixed: imports added.

## `RecipeLabView` 20-spell cap and broken compare
- **What** — The Rituals tab only showed the first 20 spells, had no search, and the "Compare Spells" button opened the compare modal with both slots empty.
- **Status** — Fixed: search filter added, all spells now browsable, selected spells passed to the compare modal so both slots are pre-filled.

## `SpellDetailView` favorite key mismatch
- **What** — `SpellDetailView` called `isFavorited(name)` and `onToggleFavorite(name)` while the canonical hook signature is `(name, skill)`. The school-detail favorite button would create a separate favorite record from the spell-modal favorite.
- **Status** — Fixed: `SpellDetailView` now passes `spell.skill` along with `spell.name`, matching the hook.
