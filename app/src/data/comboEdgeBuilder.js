/**
 * comboEdgeBuilder — shared combo-edge accumulation for spell visualizations.
 *
 * Owns the algorithm: iterate the catalog, resolve combo targets,
 * deduplicate undirected pairs, accumulate weights. Both spellGraph
 * and spellWeb delegate edge construction here so the edge semantics
 * (deduplication, weight, filtering) live in one place.
 *
 * Seam parameters: core (iteration substrate), lookup (name resolution),
 * { skillFilter } (optional Set of school ids to include).
 *
 * Returns Array<{ source: string, target: string, weight: number }>.
 */

export function buildComboEdges(core, lookup, { skillFilter = null } = {}) {
  const { iterate } = core;
  const { resolveByName } = lookup;

  const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const includedSkills = new Set();
  const schoolOfSkill = new Map();

  // First pass: collect the skill set that passes the filter,
  // and map each skill to its school. This is the same pass both
  // graph and web were doing independently.
  for (const { spell, school } of iterate()) {
    if (skillFilter && !skillFilter.has(school.id)) continue;
    includedSkills.add(spell.skill);
    schoolOfSkill.set(spell.skill, school);
  }

  // Second pass: accumulate edges from combo references.
  // Self-loops are excluded; targets outside the corpus or
  // outside the skillFilter are skipped.
  const edgeMap = new Map();
  for (const { spell } of iterate()) {
    if (!Array.isArray(spell.combos)) continue;
    if (skillFilter && !includedSkills.has(spell.skill)) continue;

    for (const comboName of spell.combos) {
      const target = resolveByName(comboName);
      if (!target) continue;
      if (target.spell.skill === spell.skill) continue;
      if (skillFilter && !includedSkills.has(target.spell.skill)) continue;

      const key = edgeKey(spell.skill, target.spell.skill);
      const cur = edgeMap.get(key) || {
        source: spell.skill,
        target: target.spell.skill,
        weight: 0,
      };
      cur.weight += 1;
      edgeMap.set(key, cur);
    }
  }

  return {
    edges: [...edgeMap.values()],
    includedSkills,
    schoolOfSkill,
  };
}
