/**
 * GrimoireStack — Spell graph
 *
 * Builds nodes (one per spell) and edges (one per combo reference)
 * for visualization. Edges are weighted by reciprocal appearance —
 * if A lists B in its combos and B lists A, the edge is strong.
 */

import schools from './schools.js';
import { spellCatalog } from './spellCatalogInstance.js';

export function buildSpellGraph({ skillFilter = null } = {}) {
  const nodes = [];
  const edges = [];
  const includedSkills = new Set();
  const schoolOfSkill = new Map();

  for (const school of schools) {
    if (skillFilter && !skillFilter.has(school.id)) continue;
    for (const sp of school.spells) {
      includedSkills.add(sp.skill);
      schoolOfSkill.set(sp.skill, school);
    }
  }

  for (const school of schools) {
    if (skillFilter && !skillFilter.has(school.id)) continue;
    for (const sp of school.spells) {
      nodes.push({
        id: sp.skill,
        label: sp.name,
        schoolId: school.id,
        schoolName: school.name,
        schoolSymbol: school.symbol,
        tier: sp.status || 'Common',
        comboCount: Array.isArray(sp.combos) ? sp.combos.length : 0,
      });
    }
  }

  const edgeMap = new Map();
  function edgeKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  for (const school of schools) {
    if (skillFilter && !skillFilter.has(school.id)) continue;
    for (const sp of school.spells) {
      if (!Array.isArray(sp.combos)) continue;
      for (const comboName of sp.combos) {
        const target = spellCatalog.resolveByName(comboName);
        if (!target) continue;
        if (!includedSkills.has(target.spell.skill)) continue;
        if (target.spell.skill === sp.skill) continue;
        const key = edgeKey(sp.skill, target.spell.skill);
        const cur = edgeMap.get(key) || { source: sp.skill, target: target.spell.skill, weight: 0 };
        cur.weight += 1;
        edgeMap.set(key, cur);
      }
    }
  }

  for (const e of edgeMap.values()) {
    edges.push(e);
  }

  return { nodes, edges, schoolOfSkill };
}

export function getNodeBySkill(graph, skill) {
  return graph.nodes.find((n) => n.id === skill) || null;
}
