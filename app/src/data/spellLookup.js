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

  /**
   * Resolve a spell's hand-curated `kins` (array of skill IDs) into the
   * canonical {spell, school} entries the UI consumes. Skips ids that
   * don't resolve; caps results at `max` so the UI can't be overwhelmed
   * by a heavily-edited spell.
   *
   * Returns [] when the spell has no kins or the array is empty — the
   * caller should treat that as "no familiar" and render nothing.
   *
   * Cap is enforced independently of the curated-overlay warning at
   * registry build time (`validateRecords` in emit-schools.mjs). Both
   * `MAX_WHISPERS` here and `MAX_KINS_PER_SPELL` in derive.mjs share
   * the same value by convention.
   */
  const MAX_WHISPERS = 3;
  const resolveKinsForSpell = (spell, max = MAX_WHISPERS) => {
    if (!(spell && Array.isArray(spell.kins)) || spell.kins.length === 0) return [];
    return spell.kins
      .map((id) => bySkill.get(id))
      .filter(Boolean)
      .slice(0, max)
      .map((entry) => ({ spell: entry.spell, school: entry.school }));
  };

  return {
    resolveBySkill,
    resolveByName,
    resolveComboSpells,
    getSchoolForSkill,
    getSpellNameBySkill,
    resolveKinsForSpell,
  };
}
