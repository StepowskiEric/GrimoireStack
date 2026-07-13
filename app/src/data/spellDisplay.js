/**
 * spellDisplay — single source of truth for spell display-name rules.
 *
 * This module owns the canonical name and searchable text for a spell.
 * Every spell has a `name` field; this module provides helpers to
 * resolve it consistently across components.
 */

/**
 * Concatenate every field a user might search for on a single spell.
 * Single source of truth — `spellSearch.js` and `AllSchoolsView.jsx` both
 * call this so a new search field (aliases, tags, …) only needs to be
 * added here.
 *
 * Empty / missing fields are dropped entirely (no leading or trailing
 * spaces, no doubled separators) so a partial spell produces a clean
 * searchable string.
 *
 * @param {{ name?: string, skill?: string, effect?: string } | null | undefined} spell
 * @returns {string} lowercased searchable string; empty for empty spells
 */
export function getSpellSearchableText(spell) {
  if (!spell) return '';
  return [spell.name, spell.skill, spell.effect]
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join(' ');
}
