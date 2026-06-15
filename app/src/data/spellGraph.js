/**
 * spellGraph — combo-graph construction for the spell catalog.
 *
 * Produces nodes and edges for the graph visualization. Edge weights
 * count how many times a combo pair is referenced across the corpus.
 */

export function createSpellGraph(core, lookup) {
  const { iterate } = core;
  const { resolveByName } = lookup;

  const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const buildGraph = ({ skillFilter = null } = {}) => {
    const nodes = [];
    const edges = [];
    const includedSkills = new Set();
    const schoolOfSkill = new Map();

    for (const { spell, school } of iterate()) {
      if (skillFilter && !skillFilter.has(school.id)) continue;
      includedSkills.add(spell.skill);
      schoolOfSkill.set(spell.skill, school);
      nodes.push({
        id: spell.skill,
        label: spell.name,
        schoolId: school.id,
        schoolName: school.name,
        tier: spell.status || 'Common',
        comboCount: Array.isArray(spell.combos) ? spell.combos.length : 0,
      });
    }

    const edgeMap = new Map();
    for (const { spell } of iterate()) {
      if (!Array.isArray(spell.combos)) continue;
      if (skillFilter && !includedSkills.has(spell.skill)) continue;
      for (const comboName of spell.combos) {
        const target = resolveByName(comboName);
        if (!target) continue;
        if (!includedSkills.has(target.spell.skill)) continue;
        if (target.spell.skill === spell.skill) continue;
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
    for (const e of edgeMap.values()) edges.push(e);

    return { nodes, edges, schoolOfSkill };
  };

  const getNodeBySkill = (graph, skill) => {
    return graph.nodes.find((n) => n.id === skill) || null;
  };

  return { buildGraph, getNodeBySkill };
}
