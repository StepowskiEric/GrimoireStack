/**
 * spellSearch — text search and filter over the spell catalog.
 *
 * Contains two families of functions:
 *
 * 1. Public API (operates on raw schools[]):
 *    searchSpells(schools, query), filterSpells(schools, opts)
 *    Used by the static site, tests, and any caller that has raw data.
 *
 * 2. Internal API (operates on flat {spell, school} entries):
 *    searchSpellsOnEntries(entries, query), filterSpellsOnEntries(entries, opts)
 *    Used by grimoireIndex, which already holds a validated flatEntries array.
 */

import { getSpellTier } from './data/tiers.js';

/**
 * Search spells by text query across all schools.
 * Returns which spells match and how many, grouped by school.
 *
 * @param {Array} schools - Array of school objects with spells arrays
 * @param {string} query  - Lowercase, trimmed search string
 * @returns {{ bySchool: Object<string, string[]>, total: number }}
 */
export function searchSpells(schools, query) {
  if (!query) return { bySchool: {}, total: 0 };

  const bySchool = {};
  let total = 0;

  for (const school of schools) {
    const q = query.toLowerCase();
    const matches = school.spells.filter(sp => {
      const searchable = `${sp.name} ${sp.skill} ${sp.effect}`.toLowerCase();
      return searchable.includes(q);
    });

    if (matches.length > 0) {
      bySchool[school.id] = matches.map(sp => sp.name + '\0' + sp.skill);
      total += matches.length;
    }
  }

  return { bySchool, total };
}

/**
 * Search over flat {spell, school} entries (used by grimoireIndex).
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
 * Re-export tier lookup for use in filter logic and tests.
 */
export function getSpellTierForFilter(spell) {
  return getSpellTier(spell);
}

/**
 * Filter spells by an optional text query plus optional school / tier / favorites filters.
 *
 * @param {Array} schools
 * @param {{
 *   query?: string,
 *   schoolFilter?: Set<string>,
 *   tierFilter?: Set<string>,
 *   favoritesOnly?: boolean,
 *   isFavorited?: (skill: string) => boolean,
 * }} opts
 * @returns {{ bySchool: Object<string, string[]>, total: number }}
 */
export function filterSpells(schools, opts = {}) {
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

  for (const school of schools) {
    if (schoolFilter && !schoolFilter.has(school.id)) continue;

    const matches = school.spells.filter((sp) => {
      if (q) {
        const searchable = `${sp.name} ${sp.skill} ${sp.effect}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (tierFilter && !tierFilter.has(getSpellTier(sp))) return false;
      if (favoritesOnly && !isFavorited(sp.skill)) return false;
      return true;
    });

    if (matches.length > 0) {
      bySchool[school.id] = matches.map((sp) => sp.name + '\0' + sp.skill);
      total += matches.length;
    }
  }

  return { bySchool, total };
}

/**
 * Filter over flat {spell, school} entries (used by grimoireIndex).
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
