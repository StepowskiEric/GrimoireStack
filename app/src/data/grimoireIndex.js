/**
 * GrimoireIndex — the only spell adapter.
 *
 * Built from `schools[]`, this module owns every lookup, every iteration,
 * and every match against the canonical spell data. Callers do not walk
 * `schools[]` directly; they go through this seam.
 *
 * The factory takes a schools array so tests can build small indexes
 * without importing the real corpus. The singleton (in
 * `grimoireIndexInstance.js`) is built from the canonical `schools.js`.
 */

import { validateSchools } from './schema.js';
import { getSpellTier } from './tiers.js';

const UNKNOWN_SCHOOL_ID = 'unknown';
const UNKNOWN_SCHOOL_NAME = 'Unknown School';

export function createGrimoireIndex(schools) {
  const validated = validateSchools(schools);
  const bySkill = new Map();
  const byName = new Map();

  for (const school of validated) {
    for (const spell of school.spells) {
      bySkill.set(spell.skill, { spell, school });
      byName.set(spell.name, { spell, school });
    }
  }

  // ── Pre-computed derived views ────────────────────────
  const schoolMap = new Map();
  let totalSpells = 0;
  for (const school of validated) {
    schoolMap.set(school.id, school);
    totalSpells += school.spells.length;
  }

  const flatEntriesArray = (() => {
    const out = [];
    for (const school of validated) {
      for (const spell of school.spells) {
        out.push({
          spell,
          school,
          _key: `${school.id}::${spell.skill}`,
        });
      }
    }
    out.sort((a, b) => a.spell.name.localeCompare(b.spell.name));
    return out;
  })();

  const flatEntries = () => flatEntriesArray;

  const getStats = () => ({
    totalSchools: validated.length,
    totalSpells,
  });

  const getSchoolMap = () => schoolMap;

  // ── Lookup ────────────────────────────────────────────
  // Every lookup returns a fresh {spell, school} object so callers can
  // not mutate the internal indexes. (Belt and braces; no current caller
  // mutates, but the seam should not invite it.)
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

  // ── Iteration ─────────────────────────────────────────
  // `iterate()` is the single source of truth. `allEntries()` and
  // `entriesBySchool()` derive from it. Materialising is cheap (the
  // corpus is small — under 200 spells) and gives callers the shape
  // they want without each caller re-implementing the walk.
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

  // ── Matchers ──────────────────────────────────────────
  // Scoring lives on the catalog because every matcher iterates the same
  // corpus and produces a {spell, school} entry shape. Keeping the score
  // rules next to the corpus means new ranking signals (tier, combos,
  // recency) become a one-line change here.

  // similarTo: substring + token overlap on skill id and spell name.
  // Substring hits are weighted 5x a single token hit so a complete
  // match outranks partials.
  const similarTo = (query, limit = 4) => {
    if (!query) return [];
    const q = String(query).toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/[\s\-_.]+/).filter(Boolean);

    const scored = [];
    for (const entry of iterate()) {
      const haystack = `${entry.spell.skill} ${entry.spell.name}`.toLowerCase();
      let score = 0;
      if (haystack.includes(q)) score += 5;
      for (const t of tokens) {
        if (haystack.includes(t)) score += 1;
      }
      if (score > 0) scored.push({ entry, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.entry);
  };

  // matchProblem: stopword-filtered token overlap against a broader
  // haystack (name + skill + effect + school name + real name + status).
  // Bonus weight for Proven status and existing combos — a richer signal
  // that the spell is production-tested.
  const PROBLEM_STOPWORDS = new Set([
    'a','an','the','i','im','ive','id','is','it','of','to','and','or','but',
    'my','in','on','for','with','this','that','those','these','be','been',
    'was','were','are','am','do','does','did','have','has','had','you','your',
    'me','we','us','our','so','just','very','really','about','what','how',
    'when','where','why','which','than','then','too','any','some','no','not',
  ]);

  const tokenizeProblem = (text) => {
    const out = new Set();
    const cleaned = String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ');
    for (const raw of cleaned.split(/\s+/)) {
      if (raw && !PROBLEM_STOPWORDS.has(raw) && raw.length > 1) {
        out.add(raw);
      }
    }
    return [...out];
  };

  const matchProblem = (query, { limit = 5 } = {}) => {
    const tokens = tokenizeProblem(query);
    if (!tokens.length) return [];

    const scored = [];
    for (const entry of iterate()) {
      const { spell, school } = entry;
      const haystack = (
        spell.name + ' ' +
        spell.skill + ' ' +
        spell.effect + ' ' +
        school.name + ' ' +
        school.real + ' ' +
        (spell.status || '')
      ).toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (haystack.includes(tok)) score += 2;
      }
      if (Array.isArray(spell.combos) && spell.combos.length) score += 0.5;
      if (spell.status === 'Proven') score += 0.5;
      if (score > 0) scored.push({ spell, school, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  };

  // ── Graph ─────────────────────────────────────────────
  // Builds a combo graph: one node per spell, one edge per unique
  // (source, target) pair weighted by the number of times the pair
  // is referenced. Uses `iterate()` for nodes and `resolveByName()`
  // for combo targets so the rest of the catalog is the single
  // dependency.
  const buildGraph = ({ skillFilter = null } = {}) => {
    const nodes = [];
    const edges = [];
    const includedSkills = new Set();
    const schoolOfSkill = new Map();

    for (const { spell, school } of iterate()) {
      if (skillFilter && !skillFilter.has(school.id)) continue;
      includedSkills.add(spell.skill);
      schoolOfSkill.set(spell.skill, school);
      nodes.push({
        id: spell.skill,
        label: spell.name,
        schoolId: school.id,
        schoolName: school.name,
        tier: spell.status || 'Common',
        comboCount: Array.isArray(spell.combos) ? spell.combos.length : 0,
      });
    }

    const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const edgeMap = new Map();
    for (const { spell } of iterate()) {
      if (!Array.isArray(spell.combos)) continue;
      if (skillFilter && !includedSkills.has(spell.skill)) continue;
      for (const comboName of spell.combos) {
        const target = resolveByName(comboName);
        if (!target) continue;
        if (!includedSkills.has(target.spell.skill)) continue;
        if (target.spell.skill === spell.skill) continue;
        const key = edgeKey(spell.skill, target.spell.skill);
        const cur = edgeMap.get(key) || {
          source: spell.skill,
          target: target.spell.skill,
          weight: 0,
        };
        cur.weight += 1;
        edgeMap.set(key, cur);
      }
    }
    for (const e of edgeMap.values()) edges.push(e);

    return { nodes, edges, schoolOfSkill };
  };

  // ── Spell Web (Hierarchical Tree) ─────────────────────
  // Builds a hierarchical tree: schools as branches, spells as leaves.
  // Includes combo edges for tentacle connections between spells.
  const buildSpellWeb = ({ skillFilter = null } = {}) => {
    const schoolNodes = [];
    const webSchoolMap = new Map();
    const spellNodes = [];
    const comboEdges = [];
    
    // First pass: create school branches
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
          // Position will be calculated later
          x: 0,
          y: 0,
        };
        webSchoolMap.set(school.id, schoolNode);
        schoolNodes.push(schoolNode);
      }
      
      const schoolNode = webSchoolMap.get(school.id);
      schoolNode.spellCount++;
      
      // Create spell leaf node
      const spellNode = {
        id: spell.skill,
        type: 'spell',
        label: spell.name,
        schoolId: school.id,
        schoolName: school.real,
        tier: spell.status || 'Common',
        comboCount: Array.isArray(spell.combos) ? spell.combos.length : 0,
        effect: spell.effect,
        // Position will be calculated later
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
      if (skillFilter && !skillFilter.has(spell.skill)) continue;
      
      for (const comboName of spell.combos) {
        const target = resolveByName(comboName);
        if (!target) continue;
        if (target.spell.skill === spell.skill) continue;
        
        const key = edgeKey(spell.skill, target.spell.skill);
        const cur = edgeMap.get(key) || {
          source: spell.skill,
          target: target.spell.skill,
          weight: 0,
          // Store school info for theming
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
      // Utility to find spell node by skill id
      findSpellNode: (skillId) => spellNodes.find(n => n.id === skillId) || null,
      // Utility to find school node by id
      findSchoolNode: (schoolId) => webSchoolMap.get(schoolId) || null,
    };
  };

  const getNodeBySkill = (graph, skill) => {
    return graph.nodes.find((n) => n.id === skill) || null;
  };

  // ── Search & filter (built on iterate / filterBy) ──
  // These replace the standalone search.js module by operating
  // through the canonical corpus seam. Callers pass schools[] only
  // for backward compat; the implementation uses iterate().
  const searchSpells = (schoolsIn, query) => {
    if (!query) return { bySchool: {}, total: 0 };
    const q = query.toLowerCase();
    const bySchool = {};
    let total = 0;
    for (const school of schoolsIn) {
      const matches = school.spells.filter(sp => {
        const searchable = `${sp.name} ${sp.skill} ${sp.effect}`.toLowerCase();
        return searchable.includes(q);
      });
      if (matches.length > 0) {
        bySchool[school.id] = matches.map(sp => sp.name + '\0' + sp.skill);
        total += matches.length;
      }
    }
    return { bySchool, total };
  };

  const filterSpells = (schoolsIn, opts = {}) => {
    const {
      query = '',
      schoolFilter = null,
      tierFilter = null,
      favoritesOnly = false,
      isFavorited = () => false,
    } = opts;

    if (schoolFilter && schoolFilter.size === 0) return { bySchool: {}, total: 0 };
    if (tierFilter && tierFilter.size === 0) return { bySchool: {}, total: 0 };

    const q = query.toLowerCase();
    const bySchool = {};
    let total = 0;

    for (const school of schoolsIn) {
      if (schoolFilter && !schoolFilter.has(school.id)) continue;

      const matches = school.spells.filter((sp) => {
        if (q) {
          const searchable = `${sp.name} ${sp.skill} ${sp.effect}`.toLowerCase();
          if (!searchable.includes(q)) return false;
        }
        if (tierFilter && !tierFilter.has(getSpellTier(sp))) return false;
        if (favoritesOnly && !isFavorited(sp.skill)) return false;
        return true;
      });

      if (matches.length > 0) {
        bySchool[school.id] = matches.map((sp) => sp.name + '\0' + sp.skill);
        total += matches.length;
      }
    }
    return { bySchool, total };
  };

  return {
    // Lookup
    resolveBySkill,
    resolveByName,
    resolveComboSpells,
    getSchoolForSkill,
    getSpellNameBySkill,
    // Iteration
    iterate,
    allEntries,
    entriesBySchool,
    filterBy,
    // Matchers
    similarTo,
    matchProblem,
    // Graph
    buildGraph,
    getNodeBySkill,
    // Spell Web (Hierarchical Tree)
    buildSpellWeb,
    // Derived views
    flatEntries,
    getStats,
    getSchoolMap,
    // Search & filter
    searchSpells,
    filterSpells,
    // Iterable protocol — `for (const e of index)` delegates to iterate()
    [Symbol.iterator]: iterate,
  };
}

export const GRIMOIRE_INDEX_FALLBACK = {
  school: { id: UNKNOWN_SCHOOL_ID, name: UNKNOWN_SCHOOL_NAME },
};
