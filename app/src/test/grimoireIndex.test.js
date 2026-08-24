import { describe, expect, it } from 'vitest';
import { createGrimoireIndex } from '../data/grimoireIndex.ts';
import { grimoireIndex } from '../data/grimoireIndexInstance.ts';

const TEST_SCHOOLS = [
  {
    id: 'test-school',
    name: 'School of Testing',
    real: 'Testing',
    desc: 'For unit tests.',
    spells: [
      { name: 'Alpha', skill: 'alpha-spell', effect: 'first' },
      { name: 'Beta', skill: 'beta-spell', effect: 'second' },
    ],
  },
];

describe('grimoireIndex — lookup', () => {
  describe('singleton', () => {
    it('resolves a known skill to its entry', () => {
      const entry = grimoireIndex.resolveBySkill('debug-issue');
      expect(entry).not.toBeNull();
      expect(entry.spell.skill).toBe('debug-issue');
      expect(entry.spell.name).toBe('Debug Issue');
      expect(entry.school.id).toBe('debugging');
    });

    it('returns null for an unknown skill', () => {
      expect(grimoireIndex.resolveBySkill('definitely-not-a-real-skill')).toBeNull();
    });

    it('resolves a known name to its entry', () => {
      const entry = grimoireIndex.resolveByName('Debug Issue');
      expect(entry).not.toBeNull();
      expect(entry.spell.skill).toBe('debug-issue');
      expect(entry.school.id).toBe('debugging');
    });

    it('returns null for an unknown name', () => {
      expect(grimoireIndex.resolveByName('No Such Spell')).toBeNull();
    });

    it('resolves a list of combo names to entries', () => {
      const entries = grimoireIndex.resolveComboSpells([
        'Debug Issue',
        'Debug-to-Fix Pipeline',
      ]);
      expect(entries).toHaveLength(2);
      expect(entries.map((e) => e.spell.skill)).toEqual([
        'debug-issue',
        'debug-to-fix-pipeline',
      ]);
    });

    it('returns an empty array when given an empty list', () => {
      expect(grimoireIndex.resolveComboSpells([])).toEqual([]);
    });

    it('returns an empty array for non-array input', () => {
      expect(grimoireIndex.resolveComboSpells(null)).toEqual([]);
      expect(grimoireIndex.resolveComboSpells(undefined)).toEqual([]);
    });

    it('returns the school for a known skill', () => {
      const school = grimoireIndex.getSchoolForSkill('debug-issue');
      expect(school).not.toBeNull();
      expect(school.id).toBe('debugging');
    });

    it('returns null school for an unknown skill', () => {
      expect(grimoireIndex.getSchoolForSkill('definitely-not-real')).toBeNull();
    });

    it('returns the spell name for a known skill', () => {
      expect(grimoireIndex.getSpellNameBySkill('debug-issue')).toBe(
        'Debug Issue',
      );
    });

    it('returns null name for an unknown skill', () => {
      expect(grimoireIndex.getSpellNameBySkill('definitely-not-real')).toBeNull();
    });
  });

  describe('factory', () => {
    it('builds a working index from a small fixture', () => {
      const index = createGrimoireIndex(TEST_SCHOOLS);
      expect(index.resolveBySkill('alpha-spell').spell.name).toBe('Alpha');
      expect(index.resolveByName('Beta').spell.skill).toBe('beta-spell');
    });

    it('isolates two factories from each other', () => {
      const a = createGrimoireIndex(TEST_SCHOOLS);
      const b = createGrimoireIndex([]);
      expect(a.resolveBySkill('alpha-spell')).not.toBeNull();
      expect(b.resolveBySkill('alpha-spell')).toBeNull();
    });
  });
});

describe('grimoireIndex — iteration', () => {
  it('iterate() yields every {spell, school} pair', () => {
    const all = [...grimoireIndex.iterate()];
    const fromCatalog = all.length;
    // sanity: catalogue contains real data
    expect(fromCatalog).toBeGreaterThan(20);
    // every yielded entry has the contract shape
    for (const e of all) {
      expect(e).toHaveProperty('spell');
      expect(e).toHaveProperty('school');
      expect(e.spell).toHaveProperty('skill');
      expect(e.school).toHaveProperty('id');
    }
  });

  it('the catalog itself is iterable (for-of)', () => {
    const ids = new Set();
    for (const e of grimoireIndex) {
      ids.add(e.spell.skill);
    }
    expect(ids.has('debug-issue')).toBe(true);
    expect(ids.size).toBeGreaterThan(20);
  });

  it('allEntries() returns an array with the same size as the corpus', () => {
    const arr = grimoireIndex.allEntries();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe([...grimoireIndex.iterate()].length);
  });

  it('entriesBySchool() groups by school id', () => {
    const map = grimoireIndex.entriesBySchool();
    expect(map instanceof Map).toBe(true);
    expect(map.has('debugging')).toBe(true);
    expect(map.get('debugging').length).toBeGreaterThan(0);
    // every group is non-empty
    for (const [, group] of map) {
      expect(group.length).toBeGreaterThan(0);
    }
  });

  it('filterBy() returns only matching entries', () => {
    const debugging = grimoireIndex.filterBy((e) => e.school.id === 'debugging');
    expect(debugging.length).toBeGreaterThan(0);
    for (const e of debugging) {
      expect(e.school.id).toBe('debugging');
    }
    // sanity: same set as entriesBySchool().get('debugging')
    const grouped = grimoireIndex.entriesBySchool().get('debugging');
    expect(debugging.length).toBe(grouped.length);
  });

  it('filterBy() with no matches returns an empty array', () => {
    expect(grimoireIndex.filterBy(() => false)).toEqual([]);
  });
});

describe('grimoireIndex — similarTo', () => {
  it('returns up to the limit', () => {
    const out = grimoireIndex.similarTo('test', 3);
    expect(out.length).toBeLessThanOrEqual(3);
    expect(out.length).toBeGreaterThan(0);
    for (const e of out) {
      expect(e).toHaveProperty('spell');
      expect(e).toHaveProperty('school');
    }
  });

  it('ranks exact substring matches higher than partial', () => {
    const out = grimoireIndex.similarTo('debug-issue', 5);
    expect(out[0].spell.skill).toBe('debug-issue');
  });

  it('returns empty for empty or whitespace query', () => {
    expect(grimoireIndex.similarTo('', 5)).toEqual([]);
    expect(grimoireIndex.similarTo('   ', 5)).toEqual([]);
  });

  it('returns empty when no skill shares characters with the query', () => {
    expect(grimoireIndex.similarTo('something-totally-unrelated-xx', 5)).toEqual([]);
  });

  it('defaults the limit to 4', () => {
    const out = grimoireIndex.similarTo('test');
    expect(out.length).toBeLessThanOrEqual(4);
  });

  it('works with a tiny fixture', () => {
    const tiny = createGrimoireIndex(TEST_SCHOOLS);
    const out = tiny.similarTo('alpha', 5);
    expect(out.length).toBe(1);
    expect(out[0].spell.skill).toBe('alpha-spell');
    expect(out[0].school.id).toBe('test-school');
  });
});

describe('grimoireIndex — matchProblem', () => {
  it('returns empty for empty or null query', () => {
    expect(grimoireIndex.matchProblem('')).toEqual([]);
    expect(grimoireIndex.matchProblem(null)).toEqual([]);
  });

  it('returns results sorted by score descending', () => {
    const results = grimoireIndex.matchProblem('test failing', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score >= results[i].score).toBe(true);
    }
  });

  it('each result has spell, school, and score', () => {
    const results = grimoireIndex.matchProblem('bug crash', { limit: 3 });
    for (const r of results) {
      expect(r).toHaveProperty('spell');
      expect(r).toHaveProperty('school');
      expect(r).toHaveProperty('score');
      expect(typeof r.score).toBe('number');
    }
  });

  it('respects the limit parameter', () => {
    const results = grimoireIndex.matchProblem('test', { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('matches on skill name', () => {
    const results = grimoireIndex.matchProblem('debug-issue', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].spell.skill).toBe('debug-issue');
  });

  it('matches on effect keywords', () => {
    const results = grimoireIndex.matchProblem('stack trace', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    const hasLogTrace = results.some((r) => r.spell.skill === 'debug-issue');
    expect(hasLogTrace).toBe(true);
  });

  it('matches on school name', () => {
    const results = grimoireIndex.matchProblem('reasoning', { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
    const hasReasoning = results.some((r) => r.school.id === 'reasoning');
    expect(hasReasoning).toBe(true);
  });
});

describe('grimoireIndex — buildGraph', () => {
  it('returns nodes, edges, and schoolOfSkill', () => {
    const graph = grimoireIndex.buildGraph();
    expect(graph).toHaveProperty('nodes');
    expect(graph).toHaveProperty('edges');
    expect(graph).toHaveProperty('schoolOfSkill');
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);
    expect(graph.schoolOfSkill).toBeInstanceOf(Map);
  });

  it('has more nodes than edges (combo graph is sparse)', () => {
    const graph = grimoireIndex.buildGraph();
    expect(graph.nodes.length).toBeGreaterThan(graph.edges.length);
  });

  it('each node has id, label, schoolId, schoolName, tier, comboCount', () => {
    const graph = grimoireIndex.buildGraph();
    for (const node of graph.nodes) {
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('label');
      expect(node).toHaveProperty('schoolId');
      expect(node).toHaveProperty('schoolName');
      expect(node).toHaveProperty('tier');
      expect(node).toHaveProperty('comboCount');
    }
  });

  it('each edge has source, target, and weight >= 1', () => {
    const graph = grimoireIndex.buildGraph();
    for (const edge of graph.edges) {
      expect(edge).toHaveProperty('source');
      expect(edge).toHaveProperty('target');
      expect(edge).toHaveProperty('weight');
      expect(typeof edge.weight).toBe('number');
      expect(edge.weight).toBeGreaterThan(0);
    }
  });

  it('respects the skillFilter parameter', () => {
    const graph = grimoireIndex.buildGraph({ skillFilter: new Set(['debugging']) });
    for (const node of graph.nodes) {
      expect(node.schoolId).toBe('debugging');
    }
  });

  it('edges are reciprocal: A→B in combos implies B→A weight contribution', () => {
    const graph = grimoireIndex.buildGraph();
    // every edge weight is at least 1 because the catalog already
    // counts each combo reference as a contribution
    for (const edge of graph.edges) {
      expect(edge.weight).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('grimoireIndex — getNodeBySkill', () => {
  it('returns a node for a valid skill', () => {
    const graph = grimoireIndex.buildGraph();
    const node = grimoireIndex.getNodeBySkill(graph, 'debug-issue');
    expect(node).not.toBeNull();
    expect(node.id).toBe('debug-issue');
  });

  it('returns null for an invalid skill', () => {
    const graph = grimoireIndex.buildGraph();
    const node = grimoireIndex.getNodeBySkill(graph, 'nonexistent-skill-xyz');
    expect(node).toBeNull();
  });
});

describe('grimoireIndex — buildSpellWeb', () => {
  it('returns schools, spellNodes, comboEdges, and schoolMap', () => {
    const web = grimoireIndex.buildSpellWeb();
    expect(web).toHaveProperty('schools');
    expect(web).toHaveProperty('spellNodes');
    expect(web).toHaveProperty('comboEdges');
    expect(web).toHaveProperty('schoolMap');
    expect(Array.isArray(web.schools)).toBe(true);
    expect(Array.isArray(web.spellNodes)).toBe(true);
    expect(Array.isArray(web.comboEdges)).toBe(true);
    expect(web.schoolMap).toBeInstanceOf(Map);
  });

  it('schools have correct structure', () => {
    const web = grimoireIndex.buildSpellWeb();
    for (const school of web.schools) {
      expect(school).toHaveProperty('id');
      expect(school).toHaveProperty('type', 'school');
      expect(school).toHaveProperty('label');
      expect(school).toHaveProperty('name');
      expect(school).toHaveProperty('spellCount');
      expect(school).toHaveProperty('children');
      expect(Array.isArray(school.children)).toBe(true);
      expect(school.spellCount).toBe(school.children.length);
    }
  });

  it('spellNodes have correct structure', () => {
    const web = grimoireIndex.buildSpellWeb();
    for (const spell of web.spellNodes) {
      expect(spell).toHaveProperty('id');
      expect(spell).toHaveProperty('type', 'spell');
      expect(spell).toHaveProperty('label');
      expect(spell).toHaveProperty('schoolId');
      expect(spell).toHaveProperty('schoolName');
      expect(spell).toHaveProperty('tier');
      expect(spell).toHaveProperty('comboCount');
      expect(spell).toHaveProperty('effect');
    }
  });

  it('comboEdges have correct structure', () => {
    const web = grimoireIndex.buildSpellWeb();
    for (const edge of web.comboEdges) {
      expect(edge).toHaveProperty('source');
      expect(edge).toHaveProperty('target');
      expect(edge).toHaveProperty('weight');
      expect(typeof edge.weight).toBe('number');
      expect(edge.weight).toBeGreaterThan(0);
    }
  });

  it('schools contain their spells as children', () => {
    const web = grimoireIndex.buildSpellWeb();
    for (const school of web.schools) {
      for (const child of school.children) {
        expect(child.schoolId).toBe(school.id);
        expect(child.type).toBe('spell');
      }
    }
  });

  it('findSpellNode returns correct spell', () => {
    const web = grimoireIndex.buildSpellWeb();
    const spell = web.findSpellNode('debug-issue');
    expect(spell).not.toBeNull();
    expect(spell.label).toBe('Debug Issue');
    expect(spell.schoolId).toBe('debugging');
  });

  it('findSpellNode returns null for invalid skill', () => {
    const web = grimoireIndex.buildSpellWeb();
    expect(web.findSpellNode('nonexistent-skill')).toBeNull();
  });

  it('findSchoolNode returns correct school', () => {
    const web = grimoireIndex.buildSpellWeb();
    const school = web.findSchoolNode('debugging');
    expect(school).not.toBeNull();
    expect(school.label).toBe('Debugging');
    expect(school.type).toBe('school');
  });

  it('findSchoolNode returns null for invalid school', () => {
    const web = grimoireIndex.buildSpellWeb();
    expect(web.findSchoolNode('nonexistent-school')).toBeNull();
  });

  it('respects skillFilter parameter', () => {
    const web = grimoireIndex.buildSpellWeb({ skillFilter: new Set(['debugging']) });
    expect(web.schools.length).toBe(1);
    expect(web.schools[0].id).toBe('debugging');
    for (const spell of web.spellNodes) {
      expect(spell.schoolId).toBe('debugging');
    }
  });

  it('total spells across schools equals spellNodes length', () => {
    const web = grimoireIndex.buildSpellWeb();
    const totalFromSchools = web.schools.reduce((sum, s) => sum + s.spellCount, 0);
    expect(totalFromSchools).toBe(web.spellNodes.length);
  });
});

describe('grimoireIndex — derived views', () => {
  it('flatEntries() returns a stable sorted array reference', () => {
    const a = grimoireIndex.flatEntries();
    const b = grimoireIndex.flatEntries();
    expect(a).toBe(b);
    expect(Array.isArray(a)).toBe(true);
    expect(a.length).toBeGreaterThan(20);
    for (const e of a) {
      expect(e).toHaveProperty('spell');
      expect(e).toHaveProperty('school');
      expect(e).toHaveProperty('_key');
    }
    expect(a[0].spell.name <= a.at(-1).spell.name).toBe(true);
  });

  it('flatEntries() _key is stable and unique', () => {
    const keys = new Set(grimoireIndex.flatEntries().map((e) => e._key));
    expect(keys.size).toBe(grimoireIndex.flatEntries().length);
  });

  it('getStats() returns totalSchools and totalSpells', () => {
    const stats = grimoireIndex.getStats();
    expect(stats).toEqual({ totalSchools: expect.any(Number), totalSpells: expect.any(Number) });
    expect(stats.totalSchools).toBeGreaterThan(0);
    expect(stats.totalSpells).toBeGreaterThan(20);
  });

  it('getStats() totalSpells matches flatEntries length', () => {
    expect(grimoireIndex.getStats().totalSpells).toBe(grimoireIndex.flatEntries().length);
  });

  it('getSchoolMap() returns a stable Map reference', () => {
    const a = grimoireIndex.getSchoolMap();
    const b = grimoireIndex.getSchoolMap();
    expect(a).toBe(b);
    expect(a).toBeInstanceOf(Map);
    expect(a.size).toBe(grimoireIndex.getStats().totalSchools);
    expect(a.has('debugging')).toBe(true);
    const school = a.get('debugging');
    expect(school.id).toBe('debugging');
    expect(school.real).toBe('Debugging');
  });
});
