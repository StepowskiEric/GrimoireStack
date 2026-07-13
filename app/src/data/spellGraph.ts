/**
 * spellGraph — combo-graph construction for the spell catalog.
 *
 * Produces nodes and edges for the graph visualization. Edge weights
 * are accumulated by the shared comboEdgeBuilder module so the
 * deduplication and filter semantics live in one place.
 */

import { buildComboEdges } from './comboEdgeBuilder.ts';
import type { SpellCore } from './spellCore.ts';
import type { SpellLookup } from './spellLookup.ts';

export interface SpellGraphNode {
  id: string;
  label: string;
  schoolId: string;
  schoolName: string;
  tier: string;
  comboCount: number;
}

export interface SpellGraph {
  nodes: SpellGraphNode[];
  edges: { source: string; target: string; weight: number }[];
  schoolOfSkill: Map<string, { id: string }>;
}

export function createSpellGraph(core: SpellCore, lookup: SpellLookup) {
  const { iterate } = core;

  const buildGraph = ({ skillFilter = null }: { skillFilter?: Set<string> | null } = {}) => {
    const nodes: SpellGraphNode[] = [];
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

  const getNodeBySkill = (graph: SpellGraph, skill: string) => {
    return graph.nodes.find((n) => n.id === skill) || null;
  };

  return { buildGraph, getNodeBySkill };
}
