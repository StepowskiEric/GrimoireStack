import schools from '../data/schools.js';

const ALL_SKILLS = (() => {
  const out = [];
  for (const s of schools) {
    for (const sp of s.spells) {
      out.push({ skill: sp.skill, name: sp.name, school: s });
    }
  }
  return out;
})();

/**
 * Find up to `limit` skills whose id or name shares characters with the query.
 * Cheap substring + token overlap scorer.
 */
export function findSimilarSkills(query, limit = 4) {
  if (!query) return [];
  const q = String(query).toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/[\s\-_.]+/).filter(Boolean);

  const scored = [];
  for (const entry of ALL_SKILLS) {
    const haystack = `${entry.skill} ${entry.name}`.toLowerCase();
    let score = 0;
    if (haystack.includes(q)) score += 5;
    for (const t of tokens) {
      if (haystack.includes(t)) score += 1;
    }
    if (score > 0) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}
