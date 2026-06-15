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

export function createSpellWeb(core, lookup) {
  const { iterate } = core;

  const buildSpellWeb = ({ skillFilter = null } = {}) => {
    const schoolNodes = [];
    const webSchoolMap = new Map();
    const spellNodes = [];
    const { edges: comboEdges } = buildComboEdges(core, lookup, { skillFilter });

    for (const { spell, school } of iterate()) {
      if (skillFilter && !skillFilter.has(school.id)) continue;

      if (!webSchoolMap.has(school.id)) {
        const schoolNode = {
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

      const schoolNode = webSchoolMap.get(school.id);
      schoolNode.spellCount++;

      const spellNode = {
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
      findSpellNode: (skillId) => spellNodes.find(n => n.id === skillId) || null,
      findSchoolNode: (schoolId) => webSchoolMap.get(schoolId) || null,
    };
  };

  return { buildSpellWeb };
}
