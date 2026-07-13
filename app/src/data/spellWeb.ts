/**
 * spellWeb — hierarchical tree construction for the spell catalog.
 *
 * Produces a tree: schools as branches, spells as leaves, with
 * combo edges as tentacle connections between spells.
 *
 * Edge accumulation is delegated to the shared comboEdgeBuilder
 * so deduplication and filter semantics live in one place.
 */

import { buildComboEdges } from './comboEdgeBuilder.js';
import type { SpellCore } from './spellCore.js';
import type { SpellLookup } from './spellLookup.js';

export interface SpellWebSchoolNode {
  id: string;
  type: 'school';
  label: string;
  name: string;
  spellCount: number;
  children: SpellWebSpellNode[];
  x: number;
  y: number;
}

export interface SpellWebSpellNode {
  id: string;
  type: 'spell';
  label: string;
  schoolId: string;
  schoolName: string;
  tier: string;
  comboCount: number;
  effect: string;
  x: number;
  y: number;
}

export interface SpellWebResult {
  schools: SpellWebSchoolNode[];
  spellNodes: SpellWebSpellNode[];
  comboEdges: { source: string; target: string; weight: number }[];
  schoolMap: Map<string, SpellWebSchoolNode>;
  findSpellNode: (skillId: string) => SpellWebSpellNode | null;
  findSchoolNode: (schoolId: string) => SpellWebSchoolNode | null;
}

export function createSpellWeb(core: SpellCore, lookup: SpellLookup) {
  const { iterate } = core;

  const buildSpellWeb = ({ skillFilter = null }: { skillFilter?: Set<string> | null } = {}): SpellWebResult => {
    const schoolNodes: SpellWebSchoolNode[] = [];
    const webSchoolMap = new Map<string, SpellWebSchoolNode>();
    const spellNodes: SpellWebSpellNode[] = [];
    const { edges: comboEdges } = buildComboEdges(core, lookup, { skillFilter });

    for (const { spell, school } of iterate()) {
      if (skillFilter && !skillFilter.has(school.id)) continue;

      if (!webSchoolMap.has(school.id)) {
        const schoolNode: SpellWebSchoolNode = {
          id: school.id,
          type: 'school',
          label: school.real,
          name: school.name,
          spellCount: 0,
          children: [],
          x: 0,
          y: 0,
        };
        webSchoolMap.set(school.id, schoolNode);
        schoolNodes.push(schoolNode);
      }

      const schoolNode = webSchoolMap.get(school.id)!;
      schoolNode.spellCount++;

      const spellNode: SpellWebSpellNode = {
        id: spell.skill,
        type: 'spell',
        label: spell.name,
        schoolId: school.id,
        schoolName: school.real,
        tier: spell.status || 'Common',
        comboCount: Array.isArray(spell.combos) ? spell.combos.length : 0,
        effect: spell.effect,
        x: 0,
        y: 0,
      };

      schoolNode.children.push(spellNode);
      spellNodes.push(spellNode);
    }

    return {
      schools: schoolNodes,
      spellNodes,
      comboEdges,
      schoolMap: webSchoolMap,
      findSpellNode: (skillId: string) => spellNodes.find((n) => n.id === skillId) || null,
      findSchoolNode: (schoolId: string) => webSchoolMap.get(schoolId) || null,
    };
  };

  return { buildSpellWeb };
}
