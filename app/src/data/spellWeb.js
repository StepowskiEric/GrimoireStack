/**
 * spellWeb — hierarchical tree construction for the spell catalog.
 *
 * Produces a tree: schools as branches, spells as leaves, with
 * combo edges as tentacle connections between spells.
 */

export function createSpellWeb(core, lookup) {
  const { iterate } = core;
  const { resolveByName } = lookup;

  const buildSpellWeb = ({ skillFilter = null } = {}) => {
    const schoolNodes = [];
    const webSchoolMap = new Map();
    const spellNodes = [];
    const comboEdges = [];
    const includedSkills = new Set();

    // First pass: create school branches and collect included spell skills
    for (const { spell, school } of iterate()) {
      if (skillFilter && !skillFilter.has(school.id)) continue;
      includedSkills.add(spell.skill);

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

    // Second pass: create combo edges (tentacle connections)
    const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
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
          sourceSchool: spell.skill,
          targetSchool: target.spell.skill,
        };
        cur.weight += 1;
        edgeMap.set(key, cur);
      }
    }

    for (const e of edgeMap.values()) comboEdges.push(e);

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
