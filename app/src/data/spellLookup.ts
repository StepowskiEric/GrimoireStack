/**
 * spellLookup — by-skill and by-name lookup adapters.
 *
 * Builds two Maps on top of the core substrate. Every lookup returns
 * a fresh {spell, school} object so callers cannot mutate the
 * internal indexes.
 */

import type { Spell, School } from './schema.ts';
import type { SpellCore } from './spellCore.ts';

export interface SpellLookup {
  resolveBySkill: (skill: string) => { spell: Spell; school: School } | null;
  resolveByName: (name: string) => { spell: Spell; school: School } | null;
  resolveComboSpells: (names: string[]) => { spell: Spell; school: School }[];
  getSchoolForSkill: (skill: string) => School | null;
  getSpellNameBySkill: (skill: string) => string | null;
}

export function createSpellLookup(core: SpellCore): SpellLookup {
  const { _validated } = core;

  const bySkill = new Map<string, { spell: Spell; school: School }>();
  const byName = new Map<string, { spell: Spell; school: School }>();
  for (const school of _validated) {
    for (const spell of school.spells) {
      bySkill.set(spell.skill, { spell, school });
      byName.set(spell.name, { spell, school });
    }
  }

  const resolveBySkill = (skill: string) => {
    const entry = bySkill.get(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  };

  const resolveByName = (name: string) => {
    const entry = byName.get(name);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  };

  const resolveComboSpells = (names: string[]) => {
    if (!Array.isArray(names)) return [];
    const out: { spell: Spell; school: School }[] = [];
    for (const name of names) {
      const entry = byName.get(name);
      if (entry) out.push({ spell: entry.spell, school: entry.school });
    }
    return out;
  };

  const getSchoolForSkill = (skill: string) => {
    const entry = bySkill.get(skill);
    return entry ? entry.school : null;
  };

  const getSpellNameBySkill = (skill: string) => {
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
