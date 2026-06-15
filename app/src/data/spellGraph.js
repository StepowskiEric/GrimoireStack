/**
 * spellGraph — combo-graph construction for the spell catalog.
 *
 * Produces nodes and edges for the graph visualization. Edge weights
 * are accumulated by the shared comboEdgeBuilder module so the
 * deduplication and filter semantics live in one place.
 */

import { buildComboEdges } from './comboEdgeBuilder.js';

export function createSpellGraph(core, lookup) {
  const { iterate } = core;

  const buildGraph = ({ skillFilter = null } = {}) => {
    const nodes = [];
    const { edges, schoolOfSkill } = buildComboEdges(core, lookup, { skillFilter });

    for (const { spell, school } of iterate()) {
      if (skillFilter && !skillFilter.has(school.id)) continue;
      nodes.push({
        id: spell.skill,
        label: spell.name,
        schoolId: school.id,
        schoolName: school.name,
        tier: spell.status || 'Common',
        comboCount: Array.isArray(spell.combos) ? spell.combos.length : 0,
      });
    }

    return { nodes, edges, schoolOfSkill };
  };

  const getNodeBySkill = (graph, skill) => {
    return graph.nodes.find((n) => n.id === skill) || null;
  };

  return { buildGraph, getNodeBySkill };
}
