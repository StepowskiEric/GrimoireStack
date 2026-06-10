/**
 * GrimoireStack — Spell catalog
 *
 * Builds derived lookup indexes from `schools` so callers can resolve spells
 * without reimplementing traversal rules inline. `schools[]` remains the
 * source of truth; this module only adds seam-oriented adapters.
 */

import { validateSchools } from './schema.js';

const UNKNOWN_SCHOOL_ID = 'unknown';
const UNKNOWN_SCHOOL_NAME = 'Unknown School';
const UNKNOWN_SYMBOL = '✦';

function buildIndexes(schools) {
  const bySkill = new Map();
  const byName = new Map();

  for (const school of schools) {
    for (const spell of school.spells) {
      bySkill.set(spell.skill, { spell, school });
      byName.set(spell.name, { spell, school });
    }
  }

  return { bySkill, byName };
}

export function createSpellCatalog(schools) {
  const normalizedSchools = validateSchools(schools);
  const indexes = buildIndexes(normalizedSchools);

  const resolveBySkill = (skill) => {
    const entry = indexes.bySkill.get(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  };

  const resolveByName = (name) => {
    const entry = indexes.byName.get(name);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  };

  const resolveComboSpells = (comboNames) => {
    if (!Array.isArray(comboNames)) return [];
    return comboNames
      .map((name) => resolveByName(name))
      .filter((entry) => entry !== null);
  };

  const getSchoolForSkill = (skill) => {
    const entry = indexes.bySkill.get(skill);
    return entry ? entry.school : null;
  };

  const getSpellNameBySkill = (skill) => {
    const entry = indexes.bySkill.get(skill);
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

export const SPELL_CATALOG_FALLBACK = {
  school: { id: UNKNOWN_SCHOOL_ID, name: UNKNOWN_SCHOOL_NAME, symbol: UNKNOWN_SYMBOL },
};
