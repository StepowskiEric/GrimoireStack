/* ══════════════════════════════════════════════════════════════
   GrimoireStack — Shared search function
   Pure function used by both React app and vanilla site JS.
   ══════════════════════════════════════════════════════════════ */

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
