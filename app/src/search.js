/* ══════════════════════════════════════════════════════════════
   GrimoireStack — Shared search function
   Pure function used by both React app and vanilla site JS.
   ══════════════════════════════════════════════════════════════ */

import { getSpellTier } from './data/tiers.js';

/**
 * Search spells by text query across all schools.
 * Returns which spells match and how many, grouped by school.
 *
 * @param {Array} schools - Array of school objects with spells arrays
 * @param {string} query  - Lowercase, trimmed search string
 * @returns {{ bySchool: Object<string, string[]>, total: number }}
 *   bySchool: schoolId → array of matching spell (name + skill + effect) concatenated keys
 *   total:    total number of matching spells across all schools
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
 * Re-export tier lookup for use in filter logic and tests.
 * Wraps getSpellTier so consumers don't need to import the tiers module directly.
 */
export function getSpellTierForFilter(spell) {
  return getSpellTier(spell);
}

/**
 * Filter spells by an optional text query plus optional school / tier / favorites filters.
 * Pure function — no DOM, no localStorage.
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

  // Empty school filter set means "show none" (intentional signal from UI)
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
