/**
 * spellLookup — by-skill and by-name lookup adapters.
 *
 * Builds two Maps on top of the core substrate. Every lookup returns
 * a fresh {spell, school} object so callers cannot mutate the
 * internal indexes.
 */

export function createSpellLookup(core) {
  const { _validated } = core;

  const bySkill = new Map();
  const byName = new Map();
  for (const school of _validated) {
    for (const spell of school.spells) {
      bySkill.set(spell.skill, { spell, school });
      byName.set(spell.name, { spell, school });
    }
  }

  const resolveBySkill = (skill) => {
    const entry = bySkill.get(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  };

  const resolveByName = (name) => {
    const entry = byName.get(name);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  };

  const resolveComboSpells = (names) => {
    if (!Array.isArray(names)) return [];
    const out = [];
    for (const name of names) {
      const entry = byName.get(name);
      if (entry) out.push({ spell: entry.spell, school: entry.school });
    }
    return out;
  };

  const getSchoolForSkill = (skill) => {
    const entry = bySkill.get(skill);
    return entry ? entry.school : null;
  };

  const getSpellNameBySkill = (skill) => {
    const entry = bySkill.get(skill);
    return entry ? entry.spell.name : null;
  };

  return {
    resolveBySkill,
    resolveByName,
    resolveComboSpells,
    getSchoolForSkill,
    getSpellNameBySkill,
  };
}
