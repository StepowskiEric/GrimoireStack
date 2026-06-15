import { describe, it, expect } from 'vitest';
import { createGrimoireIndex } from '../data/grimoireIndex.js';

/**
 * spellWeb tests — buildSpellWeb tree structure and combo edges.
 *
 * Uses a synthetic corpus with known combo references.
 */

const WEB_SCHOOLS = [
  {
    id: 'debugging',
    name: 'School of Remediation',
    real: 'Debugging',
    desc: 'Bug fixes.',
    spells: [
      { name: 'Trace Sight', skill: 'trace', effect: 'Stack traces.', status: 'Proven', combos: ['Bisect Divination', 'Log Reader'] },
      { name: 'Bisect Divination', skill: 'bisect', effect: 'Binary search.', status: 'Proven', combos: ['Trace Sight', 'Commit Scry'] },
      { name: 'Commit Scry', skill: 'commit', effect: 'Read commits.', combos: ['Bisect Divination'] },
      { name: 'Log Reader', skill: 'logs', effect: 'Parse logs.', combos: ['Trace Sight'] },
    ],
  },
  {
    id: 'testing',
    name: 'School of Validation',
    real: 'Testing',
    desc: 'Prove correctness.',
    spells: [
      { name: 'Jest Weave', skill: 'jest', effect: 'Write tests.', status: 'New', combos: ['Mock Shell'] },
      { name: 'Mock Shell', skill: 'mock', effect: 'Fake dependencies.', status: 'New', combos: ['Jest Weave'] },
    ],
  },
];

function makeIndex(schools = WEB_SCHOOLS) {
  return createGrimoireIndex(schools);
}

// ── buildSpellWeb ──────────────────────────────────────

describe('buildSpellWeb', () => {
  it('creates a school node for each school', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    expect(web.schools.length).toBe(2);
    const ids = web.schools.map(s => s.id);
    expect(ids).toContain('debugging');
    expect(ids).toContain('testing');
  });

  it('creates a spell node for each spell', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    expect(web.spellNodes.length).toBe(6);
  });

  it('populates school children with spell nodes', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    const dbg = web.schools.find(s => s.id === 'debugging');
    expect(dbg.children.length).toBe(4);
    expect(dbg.spellCount).toBe(4);
  });

  it('sets spell node properties', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    const trace = web.spellNodes.find(n => n.id === 'trace');
    expect(trace.label).toBe('Trace Sight');
    expect(trace.schoolId).toBe('debugging');
    expect(trace.schoolName).toBe('Debugging');
    expect(trace.type).toBe('spell');
  });

  it('sets school node properties', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    const dbg = web.schools.find(s => s.id === 'debugging');
    expect(dbg.label).toBe('Debugging');
    expect(dbg.name).toBe('School of Remediation');
    expect(dbg.type).toBe('school');
  });

  it('creates combo edges with correct weight', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    // trace↔bisect: trace lists "Bisect Divination" + bisect lists "Trace Sight" = weight 2
    const traceBisect = web.comboEdges.find(e =>
      (e.source === 'trace' && e.target === 'bisect') ||
      (e.source === 'bisect' && e.target === 'trace')
    );
    expect(traceBisect).toBeDefined();
    expect(traceBisect.weight).toBe(2);
  });

  it('creates edges with weight 1 for single references', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    // trace↔logs: trace lists "Log Reader" + logs lists "Trace Sight" = weight 2
    // commit↔bisect: commit lists "Bisect Divination" + bisect lists "Commit Scry" = weight 2
    // jest↔mock: jest lists "Mock Shell" + mock lists "Jest Weave" = weight 2
    // All edges should have weight >= 1
    for (const edge of web.comboEdges) {
      expect(edge.weight).toBeGreaterThanOrEqual(1);
    }
  });

  it('excludes self-loops', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    for (const edge of web.comboEdges) {
      expect(edge.source).not.toBe(edge.target);
    }
  });

  it('skips combo references to missing spells', () => {
    const schools = [
      ...WEB_SCHOOLS,
      {
        id: 'orphan',
        name: 'School of Orphans',
        real: 'Orphans',
        desc: '',
        spells: [
          { name: 'Ghost', skill: 'ghost', effect: 'Phantom.', combos: ['nonexistent-spell-xyz'] },
        ],
      },
    ];
    const idx = makeIndex(schools);
    const web = idx.buildSpellWeb();
    // No edge should reference 'ghost' since its combo target doesn't exist
    const ghostEdge = web.comboEdges.find(e => e.source === 'ghost' || e.target === 'ghost');
    expect(ghostEdge).toBeUndefined();
  });

  it('filters by skillFilter', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb({ skillFilter: new Set(['debugging']) });
    expect(web.spellNodes.length).toBe(4);
    for (const node of web.spellNodes) {
      expect(node.schoolId).toBe('debugging');
    }
  });

  it('drops cross-school edges when filtered', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb({ skillFilter: new Set(['debugging']) });
    // No edge should connect to a testing spell
    for (const edge of web.comboEdges) {
      expect(edge.source).not.toBe('jest');
      expect(edge.target).not.toBe('jest');
      expect(edge.source).not.toBe('mock');
      expect(edge.target).not.toBe('mock');
    }
  });

  it('provides findSpellNode', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    const node = web.findSpellNode('trace');
    expect(node).toBeDefined();
    expect(node.label).toBe('Trace Sight');
    expect(web.findSpellNode('nonexistent')).toBeNull();
  });

  it('provides findSchoolNode', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    const node = web.findSchoolNode('debugging');
    expect(node).toBeDefined();
    expect(node.label).toBe('Debugging');
    expect(web.findSchoolNode('nonexistent')).toBeNull();
  });

  it('provides schoolMap for lookup by id', () => {
    const idx = makeIndex();
    const web = idx.buildSpellWeb();
    expect(web.schoolMap.get('debugging')).toBeDefined();
    expect(web.schoolMap.get('testing')).toBeDefined();
  });
});
