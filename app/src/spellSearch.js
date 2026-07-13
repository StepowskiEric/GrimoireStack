import { getSpellSearchableText } from './data/spellDisplay.js';
import { getSpellTier } from './data/tiers.js';

/**
 * spellSearch — text search and filter over the spell catalog.
 *
 * Canonical implementation: searchSpellsOnEntries / filterSpellsOnEntries
 * operate on flat {spell, school} entries. This eliminates the previous
 * duplication between the schools[] and entries[] code paths.
 */

/**
 * Search over flat {spell, school} entries (canonical).
 */
export function searchSpellsOnEntries(entries, query) {
  if (!query) return { bySchool: {}, total: 0 };

  const bySchool = {};
  let total = 0;
  const q = query.toLowerCase();

  for (const { spell, school } of entries) {
    if (!getSpellSearchableText(spell).includes(q)) continue;
    const list = bySchool[school.id] || [];
    list.push(`${spell.name}\0${spell.skill}`);
    bySchool[school.id] = list;
    total++;
  }

  return { bySchool, total };
}

/**
 * Filter over flat {spell, school} entries (canonical).
 */
export function filterSpellsOnEntries(entries, opts = {}) {
  const {
    query = '',
    schoolFilter = null,
    tierFilter = null,
    favoritesOnly = false,
    isFavorited = () => false,
  } = opts;

  if (schoolFilter && schoolFilter.size === 0) {
    return { bySchool: {}, total: 0 };
  }
  if (tierFilter && tierFilter.size === 0) {
    return { bySchool: {}, total: 0 };
  }

  const q = query.toLowerCase();
  const bySchool = {};
  let total = 0;

  for (const { spell, school } of entries) {
    if (schoolFilter && !schoolFilter.has(school.id)) continue;

    if (q) {
      if (!getSpellSearchableText(spell).includes(q)) continue;
    }
    if (tierFilter && !tierFilter.has(getSpellTier(spell))) continue;
    if (favoritesOnly && !isFavorited(spell.skill)) continue;

    const list = bySchool[school.id] || [];
    list.push(`${spell.name}\0${spell.skill}`);
    bySchool[school.id] = list;
    total++;
  }

  return { bySchool, total };
}
