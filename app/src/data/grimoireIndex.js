/**
 * GrimoireIndex — the only spell adapter facade.
 *
 * Composes focused sub-factories into the singleton interface that
 * callers know. Each method below is a one-liner delegation — the
 * real logic lives in the facet modules.
 *
 *   spellCore    — iteration, derived views, stats
 *   spellLookup  — by-skill, by-name resolution
 *   spellMatcher — similarTo, matchProblem
 *   spellGraph   — buildGraph, getNodeBySkill
 *   spellWeb     — buildSpellWeb
 *   spellSearch  — searchSpells, filterSpells
 *
 * The factory still takes a schools array so tests can build small
 * indexes. The singleton (in grimoireIndexInstance.js) is built
 * from the canonical schools.js.
 */

import { createSpellCore } from './spellCore.js';
import { createSpellLookup } from './spellLookup.js';
import { createSpellMatcher } from './spellMatcher.js';
import { createSpellGraph } from './spellGraph.js';
import { createSpellWeb } from './spellWeb.js';
import { searchSpells, filterSpells } from '../spellSearch.js';

export function createGrimoireIndex(schools) {
  const core = createSpellCore(schools);
  const lookup = createSpellLookup(core);
  const matcher = createSpellMatcher(core);
  const graph = createSpellGraph(core, lookup);
  const web = createSpellWeb(core, lookup);

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
    // Search & filter (delegated to the shared pure module)
    searchSpells,
    filterSpells,
    // Iterable protocol — `for (const e of index)` delegates to iterate()
    [Symbol.iterator]: core.iterate,
  };
}

export const GRIMOIRE_INDEX_FALLBACK = {
  school: { id: 'unknown', name: 'Unknown School' },
};
