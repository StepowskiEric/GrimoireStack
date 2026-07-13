/**
 * comboEdgeBuilder — shared combo-edge accumulation for spell visualizations.
 *
 * Owns the algorithm: iterate the catalog, resolve combo targets,
 * deduplicate undirected pairs, accumulate weights. Both spellGraph
 * and spellWeb delegate edge construction here so the edge semantics
 * (deduplication, weight, filtering) live in one place.
 *
 * Returns { edges, includedSkills, schoolOfSkill }.
 */

export interface ComboEdge {
  source: string;
  target: string;
  weight: number;
}

export interface ComboEdgeResult {
  edges: ComboEdge[];
  includedSkills: Set<string>;
  schoolOfSkill: Map<string, { id: string }>;
}

export function buildComboEdges(
  core: { iterate: () => Iterable<{ spell: { skill: string; combos?: string[] }; school: { id: string } }> },
  lookup: { resolveByName: (name: string) => { spell: { skill: string }; school: { id: string } } | null },
  { skillFilter = null }: { skillFilter?: Set<string> | null } = {},
): ComboEdgeResult {
  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const includedSkills = new Set<string>();
  const schoolOfSkill = new Map<string, { id: string }>();

  // First pass: collect the skill set that passes the filter,
  // and map each skill to its school.
  for (const { spell, school } of core.iterate()) {
    if (skillFilter && !skillFilter.has(school.id)) continue;
    includedSkills.add(spell.skill);
    schoolOfSkill.set(spell.skill, school);
  }

  // Second pass: accumulate edges from combo references.
  const edgeMap = new Map<string, ComboEdge>();
  for (const { spell } of core.iterate()) {
    if (!Array.isArray(spell.combos)) continue;
    if (skillFilter && !includedSkills.has(spell.skill)) continue;

    for (const comboName of spell.combos) {
      const target = lookup.resolveByName(comboName);
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
