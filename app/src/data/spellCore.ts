/**
 * spellCore — shared substrate for all spell index facets.
 *
 * Owns iteration, derived views, and the validated school data.
 * Other factories (lookup, search, matcher, graph, web) build on
 * top of this seam. The _validated field is internal — used only
 * by sibling factories during construction, stripped from the
 * public interface.
 */

import { validateSchools, type School, type Spell } from './schema.ts';

export interface SpellEntry {
  spell: Spell;
  school: School;
  _key?: string;
}

export interface SpellCore {
  iterate: () => Generator<{ spell: Spell; school: School }, void, undefined>;
  allEntries: () => { spell: Spell; school: School }[];
  entriesBySchool: () => Map<string, { spell: Spell; school: School }[]>;
  filterBy: (predicate: (e: { spell: Spell; school: School }) => boolean) => { spell: Spell; school: School }[];
  getStats: () => { totalSchools: number; totalSpells: number };
  getSchoolMap: () => Map<string, School>;
  flatEntries: () => SpellEntry[];
  _validated: School[];
}

/** Normalize raw schools[] into flat { spell, school } entries. */
export function toFlatEntries(schools: School[]): { spell: Spell; school: School }[] {
  const out: { spell: Spell; school: School }[] = [];
  for (const school of schools) {
    for (const spell of school.spells) {
      out.push({ spell, school });
    }
  }
  return out;
}

export function createSpellCore(schools: School[]): SpellCore {
  const validated = validateSchools(schools);

  const schoolMap = new Map<string, School>();
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

  function* iterate(): Generator<{ spell: Spell; school: School }, void, undefined> {
    for (const school of validated) {
      for (const spell of school.spells) {
        yield { spell, school };
      }
    }
  }

  const allEntries = () => {
    const out: { spell: Spell; school: School }[] = [];
    for (const e of iterate()) out.push(e);
    return out;
  };

  const entriesBySchool = () => {
    const map = new Map<string, { spell: Spell; school: School }[]>();
    for (const e of iterate()) {
      const list = map.get(e.school.id);
      if (list) list.push(e);
      else map.set(e.school.id, [e]);
    }
    return map;
  };

  const filterBy = (predicate: (e: { spell: Spell; school: School }) => boolean) => {
    const out: { spell: Spell; school: School }[] = [];
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
