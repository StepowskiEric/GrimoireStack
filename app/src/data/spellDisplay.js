/**
 * spellDisplay — single source of truth for spell display-name rules.
 *
 * The grimoire has two name fields on a spell:
 *   - `name`        — required, always present, the canonical grimoire title
 *   - `trueName`    — optional, a hand-curated poetic 2–4 word handle
 *
 * When `trueName` is present and distinct from `name`, it becomes the
 * primary headline. Otherwise `name` stands alone. This module owns
 * that decision so SpellCard, SpellModal, and FamiliarWhisper can't
 * drift apart.
 */

/**
 * @param {{ name?: string, trueName?: unknown } | null | undefined} spell
 * @returns {boolean} true when the spell has a curated true name that
 *   differs from its canonical name.
 */
export function hasDistinctTrueName(spell) {
  if (!spell) return false;
  const tn = spell.trueName;
  return (
    typeof tn === 'string'
    && tn.trim().length > 0
    && tn !== spell.name
  );
}

/**
 * Resolve the headline name for a spell (trueName if distinct, else name).
 * Safe for spells missing either field — returns an empty string only as
 * a last resort.
 *
 * @param {{ name?: string, trueName?: string } | null | undefined} spell
 * @returns {string}
 */
export function getSpellHeadline(spell) {
  if (!spell) return '';
  return hasDistinctTrueName(spell) ? spell.trueName : (spell.name || '');
}

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
 * @param {{ name?: string, skill?: string, effect?: string, trueName?: string } | null | undefined} spell
 * @returns {string} lowercased searchable string; empty for empty spells
 */
export function getSpellSearchableText(spell) {
  if (!spell) return '';
  return [spell.name, spell.skill, spell.effect, spell.trueName]
    .filter(Boolean)
    .map(s => s.toLowerCase())
    .join(' ');
}
