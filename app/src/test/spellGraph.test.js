import { describe, expect, it } from 'vitest';
import { createGrimoireIndex } from '../data/grimoireIndex.ts';

/**
 * spellGraph tests — buildGraph edge construction and node resolution.
 *
 * Uses a synthetic corpus with known combo references so edge weights
 * and filtering behavior are deterministic.
 */

const GRAPH_SCHOOLS = [
  {
    id: 'debugging',
    name: 'School of Remediation',
    real: 'Debugging',
    desc: 'Bug fixes.',
    spells: [
      {
        name: 'Trace Sight',
        skill: 'trace',
        effect: 'Stack traces.',
        status: 'Proven',
        combos: ['Bisect Divination', 'Log Reader'],
      },
      {
        name: 'Bisect Divination',
        skill: 'bisect',
        effect: 'Binary search.',
        status: 'Proven',
        combos: ['Trace Sight', 'Commit Scry'],
      },
      {
        name: 'Commit Scry',
        skill: 'commit',
        effect: 'Read commits.',
        combos: ['Bisect Divination'],
      },
      { name: 'Log Reader', skill: 'logs', effect: 'Parse logs.', combos: ['Trace Sight'] },
      { name: 'Watcher', skill: 'watcher', effect: 'Watches.', combos: ['Trace Sight'] },
    ],
  },
  {
    id: 'testing',
    name: 'School of Validation',
    real: 'Testing',
    desc: 'Prove correctness.',
    spells: [
      {
        name: 'Jest Weave',
        skill: 'jest',
        effect: 'Write tests.',
        status: 'New',
        combos: ['Mock Shell'],
      },
      {
        name: 'Mock Shell',
        skill: 'mock',
        effect: 'Fake dependencies.',
        status: 'New',
        combos: ['Jest Weave'],
      },
    ],
  },
];

function makeIndex() {
  return createGrimoireIndex(GRAPH_SCHOOLS);
}

// ── buildGraph ─────────────────────────────────────────

describe('buildGraph', () => {
  it('includes all spells as nodes by default', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    expect(graph.nodes.length).toBe(7); // 5 debugging + 2 testing
  });

  it('returns one edge per unique combo reference pair', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    // Combo pairs: trace↔bisect, trace↔logs, bisect↔commit, jest↔mock, watcher↔trace = 5 unique undirected pairs
    expect(graph.edges.length).toBe(5);
  });

  it('weights edges by combo reference count', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    // trace↔bisect: trace lists bisect + bisect lists trace = weight 2
    const traceBisect = graph.edges.find(
      (e) =>
        (e.source === 'trace' && e.target === 'bisect') ||
        (e.source === 'bisect' && e.target === 'trace'),
    );
    expect(traceBisect).toBeDefined();
    expect(traceBisect.weight).toBe(2);
  });

  it('excludes self-loops', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    for (const edge of graph.edges) {
      expect(edge.source).not.toBe(edge.target);
    }
  });

  it('skips combo references to spells not in the corpus', () => {
    const schools = [
      ...GRAPH_SCHOOLS,
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
    const graph = idx.buildGraph();
    // ghost has a combo to a nonexistent spell — no edge should be created
    const ghostEdge = graph.edges.find((e) => e.source === 'ghost' || e.target === 'ghost');
    expect(ghostEdge).toBeUndefined();
  });

  it('filters nodes by skillFilter', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph({ skillFilter: new Set(['debugging']) });
    expect(graph.nodes.length).toBe(5);
    for (const node of graph.nodes) {
      expect(node.schoolId).toBe('debugging');
    }
  });

  it('drops edges whose targets are excluded by skillFilter', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph({ skillFilter: new Set(['debugging']) });
    // jest↔mock edge should be gone (both are testing)
    const jestMock = graph.edges.find(
      (e) =>
        (e.source === 'jest' && e.target === 'mock') ||
        (e.source === 'mock' && e.target === 'jest'),
    );
    expect(jestMock).toBeUndefined();
    // trace↔bisect should remain (both debugging)
    const traceBisect = graph.edges.find(
      (e) =>
        (e.source === 'trace' && e.target === 'bisect') ||
        (e.source === 'bisect' && e.target === 'trace'),
    );
    expect(traceBisect).toBeDefined();
  });

  it('sets schoolId and schoolName on nodes', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    const trace = graph.nodes.find((n) => n.id === 'trace');
    expect(trace).toBeDefined();
    expect(trace.schoolId).toBe('debugging');
    expect(trace.schoolName).toBe('School of Remediation');
  });

  it('computes comboCount from spell.combos', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    const trace = graph.nodes.find((n) => n.id === 'trace');
    expect(trace).toBeDefined();
    expect(trace.comboCount).toBe(2); // trace has 2 combos
    const commit = graph.nodes.find((n) => n.id === 'commit');
    expect(commit).toBeDefined();
    expect(commit.comboCount).toBe(1);
    const watcher = graph.nodes.find((n) => n.id === 'watcher');
    expect(watcher).toBeDefined();
    expect(watcher.comboCount).toBe(1);
  });

  it('derives tier from spell.status', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    const trace = graph.nodes.find((n) => n.id === 'trace');
    expect(trace.tier).toBe('Proven');
    const jest = graph.nodes.find((n) => n.id === 'jest');
    expect(jest.tier).toBe('New');
  });
});

// ── getNodeBySkill ────────────────────────────────────

describe('getNodeBySkill', () => {
  it('finds a node by skill id', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    const node = idx.getNodeBySkill(graph, 'trace');
    expect(node).toBeDefined();
    expect(node.label).toBe('Trace Sight');
  });

  it('returns null for missing skill', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph();
    expect(idx.getNodeBySkill(graph, 'nonexistent')).toBeNull();
  });

  it('works with filtered graph', () => {
    const idx = makeIndex();
    const graph = idx.buildGraph({ skillFilter: new Set(['debugging']) });
    expect(idx.getNodeBySkill(graph, 'trace')).toBeDefined();
    // testing spell should not be in the filtered graph
    expect(idx.getNodeBySkill(graph, 'jest')).toBeNull();
  });
});
