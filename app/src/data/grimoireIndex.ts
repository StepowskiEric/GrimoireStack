/**
 * GrimoireIndex — the only spell adapter facade.
 *
 * Composes focused sub-factories into the singleton interface that
 * callers know. Each method below is a one-liner delegation — the
 * real logic lives in the facet modules.
 */

import { filterSpellsOnEntries, searchSpellsOnEntries } from '../spellSearch.js';
import { createSpellCore } from './spellCore.js';
import { createSpellGraph } from './spellGraph.js';
import { createSpellLookup } from './spellLookup.js';
import { createSpellMatcher } from './spellMatcher.js';
import { createSpellWeb } from './spellWeb.js';
import type { School, Spell } from './schema.js';
import type { SpellCore } from './spellCore.js';
import type { SpellLookup } from './spellLookup.js';
import type { SpellMatcher } from './spellMatcher.js';

export interface SearchResult {
  bySchool: Record<string, unknown>;
  total: number;
}

export interface GrimoireIndex {
  resolveBySkill: SpellLookup['resolveBySkill'];
  resolveByName: SpellLookup['resolveByName'];
  resolveComboSpells: SpellLookup['resolveComboSpells'];
  getSchoolForSkill: SpellLookup['getSchoolForSkill'];
  getSpellNameBySkill: SpellLookup['getSpellNameBySkill'];
  iterate: SpellCore['iterate'];
  allEntries: SpellCore['allEntries'];
  entriesBySchool: SpellCore['entriesBySchool'];
  filterBy: SpellCore['filterBy'];
  similarTo: SpellMatcher['similarTo'];
  matchProblem: SpellMatcher['matchProblem'];
  buildGraph: ReturnType<typeof createSpellGraph>['buildGraph'];
  getNodeBySkill: ReturnType<typeof createSpellGraph>['getNodeBySkill'];
  buildSpellWeb: ReturnType<typeof createSpellWeb>['buildSpellWeb'];
  flatEntries: SpellCore['flatEntries'];
  getStats: SpellCore['getStats'];
  getSchoolMap: SpellCore['getSchoolMap'];
  searchSpells: (query: string) => SearchResult;
  filterSpells: (opts: Record<string, unknown>) => SearchResult;
  [Symbol.iterator]: SpellCore['iterate'];
}

export function createGrimoireIndex(schools: School[]): GrimoireIndex {
  const core = createSpellCore(schools);
  const lookup = createSpellLookup(core);
  const matcher = createSpellMatcher(core);
  const graph = createSpellGraph(core, lookup);
  const web = createSpellWeb(core, lookup);

  const entries = core.flatEntries();

  return {
    // Lookup
    resolveBySkill: lookup.resolveBySkill,
    resolveByName: lookup.resolveByName,
    resolveComboSpells: lookup.resolveComboSpells,
    getSchoolForSkill: lookup.getSchoolForSkill,
    getSpellNameBySkill: lookup.getSpellNameBySkill,
    // Iteration
    iterate: core.iterate,
    allEntries: core.allEntries,
    entriesBySchool: core.entriesBySchool,
    filterBy: core.filterBy,
    // Matchers
    similarTo: matcher.similarTo,
    matchProblem: matcher.matchProblem,
    // Graph
    buildGraph: graph.buildGraph,
    getNodeBySkill: graph.getNodeBySkill,
    // Spell Web
    buildSpellWeb: web.buildSpellWeb,
    // Derived views
    flatEntries: core.flatEntries,
    getStats: core.getStats,
    getSchoolMap: core.getSchoolMap,
    // Search & filter
    searchSpells: (query: string) => searchSpellsOnEntries(entries, query),
    filterSpells: (opts: Record<string, unknown>) => filterSpellsOnEntries(entries, opts),
    // Iterable protocol
    [Symbol.iterator]: core.iterate,
  };
}
