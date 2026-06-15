import { getSpellTier } from './data/tiers.js';

/**
 * spellSearch — text search and filter over the spell catalog.
 *
 * Canonical implementation: searchSpellsOnEntries / filterSpellsOnEntries
 * operate on flat {spell, school} entries. The public searchSpells /
 * filterSpells are thin adapters that normalize raw schools[] into
 * flat entries and delegate. This eliminates the previous duplication
 * between the schools[] and entries[] code paths.
 */

/**
 * Normalize raw schools[] into flat {spell, school} entries.
 */
function toFlatEntries(schools) {
  const out = [];
  for (const school of schools) {
    for (const spell of school.spells) {
      out.push({ spell, school });
    }
  }
  return out;
}

/**
 * Search spells by text query across all schools (adapter).
 * Normalizes raw schools[] to flat entries, then delegates to
 * searchSpellsOnEntries.
 */
export function searchSpells(schools, query) {
  return searchSpellsOnEntries(toFlatEntries(schools), query);
}

/**
 * Search over flat {spell, school} entries (canonical).
 */
export function searchSpellsOnEntries(entries, query) {
  if (!query) return { bySchool: {}, total: 0 };

  const bySchool = {};
  let total = 0;
  const q = query.toLowerCase();

  for (const { spell, school } of entries) {
    const searchable = `${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase();
    if (!searchable.includes(q)) continue;
    const list = bySchool[school.id] || [];
    list.push(spell.name + '\0' + spell.skill);
    bySchool[school.id] = list;
    total++;
  }

  return { bySchool, total };
}

/**
 * Filter spells by an optional text query plus optional school / tier / favorites filters (adapter).
 * Normalizes raw schools[] to flat entries, then delegates to
 * filterSpellsOnEntries.
 */
export function filterSpells(schools, opts = {}) {
  return filterSpellsOnEntries(toFlatEntries(schools), opts);
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
      const searchable = `${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase();
      if (!searchable.includes(q)) continue;
    }
    if (tierFilter && !tierFilter.has(getSpellTier(spell))) continue;
    if (favoritesOnly && !isFavorited(spell.skill)) continue;

    const list = bySchool[school.id] || [];
    list.push(spell.name + '\0' + spell.skill);
    bySchool[school.id] = list;
    total++;
  }

  return { bySchool, total };
}
