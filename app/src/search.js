/* ══════════════════════════════════════════════════════════════
   GrimoireStack — Shared search function
   Re-exports from spellSearch.js so the static site and tests
   can import from a single source of truth.
   ══════════════════════════════════════════════════════════════ */

export { searchSpells, filterSpells, searchSpellsOnEntries, filterSpellsOnEntries } from './spellSearch.js';
