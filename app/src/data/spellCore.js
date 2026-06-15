/**
 * spellCore — shared substrate for all spell index facets.
 *
 * Owns iteration, derived views, and the validated school data.
 * Other factories (lookup, search, matcher, graph, web) build on
 * top of this seam. The _validated field is internal — used only
 * by sibling factories during construction, stripped from the
 * public interface.
 */

import { validateSchools } from './schema.js';

/** Normalize raw schools[] into flat { spell, school } entries. */
export function toFlatEntries(schools) {
  const out = [];
  for (const school of schools) {
    for (const spell of school.spells) {
      out.push({ spell, school });
    }
  }
  return out;
}

export function createSpellCore(schools) {
  const validated = validateSchools(schools);

  const schoolMap = new Map();
  let totalSpells = 0;
  for (const school of validated) {
    schoolMap.set(school.id, school);
    totalSpells += school.spells.length;
  }

  const flatEntriesArray = (() => {
    const entries = toFlatEntries(validated);
    entries.sort((a, b) => a.spell.name.localeCompare(b.spell.name));
    return entries.map((e) => ({ ...e, _key: `${e.school.id}::${e.spell.skill}` }));
  })();

  function* iterate() {
    for (const school of validated) {
      for (const spell of school.spells) {
        yield { spell, school };
      }
    }
  }

  const allEntries = () => {
    const out = [];
    for (const e of iterate()) out.push(e);
    return out;
  };

  const entriesBySchool = () => {
    const map = new Map();
    for (const e of iterate()) {
      const list = map.get(e.school.id);
      if (list) list.push(e);
      else map.set(e.school.id, [e]);
    }
    return map;
  };

  const filterBy = (predicate) => {
    const out = [];
    for (const e of iterate()) {
      if (predicate(e)) out.push(e);
    }
    return out;
  };

  const getStats = () => ({
    totalSchools: validated.length,
    totalSpells,
  });

  const getSchoolMap = () => schoolMap;

  const flatEntries = () => flatEntriesArray;

  return {
    iterate,
    allEntries,
    entriesBySchool,
    filterBy,
    getStats,
    getSchoolMap,
    flatEntries,
    _validated: validated,
  };
}
