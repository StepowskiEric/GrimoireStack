import { describe, expect, it } from 'vitest';
import { buildComboEdges } from '../data/comboEdgeBuilder.ts';
import { createSpellCore } from '../data/spellCore.ts';
import { createSpellLookup } from '../data/spellLookup.ts';

const SCHOOLS = [
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

function makeBuilder() {
  const core = createSpellCore(SCHOOLS);
  const lookup = createSpellLookup(core);
  return { core, lookup, build: (opts) => buildComboEdges(core, lookup, opts) };
}

describe('buildComboEdges', () => {
  it('returns one edge per unique undirected combo pair', () => {
    const { build } = makeBuilder();
    const { edges } = build();
    expect(edges.length).toBe(5); // trace↔bisect, trace↔logs, bisect↔commit, jest↔mock, watcher↔trace
  });

  it('weights edges by mutual combo reference count', () => {
    const { build } = makeBuilder();
    const { edges } = build();
    // trace↔bisect: trace lists bisect + bisect lists trace = weight 2
    const traceBisect = edges.find(
      (e) =>
        (e.source === 'trace' && e.target === 'bisect') ||
        (e.source === 'bisect' && e.target === 'trace'),
    );
    expect(traceBisect).toBeDefined();
    expect(traceBisect.weight).toBe(2);
  });

  it('weights edges with weight 1 for single-direction references', () => {
    const { build } = makeBuilder();
    const { edges } = build();
    // watcher→trace: watcher lists trace, trace does not list watcher = weight 1
    const watcherTrace = edges.find(
      (e) =>
        (e.source === 'watcher' && e.target === 'trace') ||
        (e.source === 'trace' && e.target === 'watcher'),
    );
    expect(watcherTrace).toBeDefined();
    expect(watcherTrace.weight).toBe(1);
  });

  it('excludes self-loops', () => {
    const schools = [
      ...SCHOOLS,
      {
        id: 'self-loop',
        name: 'School of Loops',
        real: 'Loops',
        desc: '',
        spells: [{ name: 'Echo', skill: 'echo', effect: 'Loop.', combos: ['Echo'] }],
      },
    ];
    const core = createSpellCore(schools);
    const lookup = createSpellLookup(core);
    const { edges } = buildComboEdges(core, lookup);
    for (const edge of edges) {
      expect(edge.source).not.toBe(edge.target);
    }
    const echoEdge = edges.find((e) => e.source === 'echo' || e.target === 'echo');
    expect(echoEdge).toBeUndefined();
  });

  it('skips combo references to spells not in the corpus', () => {
    const schools = [
      ...SCHOOLS,
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
    const core = createSpellCore(schools);
    const lookup = createSpellLookup(core);
    const { edges } = buildComboEdges(core, lookup);
    const ghostEdge = edges.find((e) => e.source === 'ghost' || e.target === 'ghost');
    expect(ghostEdge).toBeUndefined();
  });

  it('filters edges whose source is excluded by skillFilter', () => {
    const { build } = makeBuilder();
    const { edges } = build({ skillFilter: new Set(['testing']) });
    // jest↔mock should remain (both testing)
    expect(edges.length).toBe(1);
    expect(edges[0].source).toBe('jest');
    expect(edges[0].target).toBe('mock');
  });

  it('filters edges whose target is excluded by skillFilter', () => {
    const { build } = makeBuilder();
    const { edges } = build({ skillFilter: new Set(['debugging']) });
    // jest↔mock gone; trace↔bisect, trace↔logs, bisect↔commit, watcher↔trace remain
    expect(edges.length).toBe(4);
    const sources = edges.map((e) => e.source);
    const targets = edges.map((e) => e.target);
    expect(sources.concat(targets)).not.toContain('jest');
    expect(sources.concat(targets)).not.toContain('mock');
  });

  it('returns includedSkills reflecting the skillFilter', () => {
    const { build } = makeBuilder();
    const { edges, includedSkills } = build({ skillFilter: new Set(['debugging']) });
    expect(includedSkills.size).toBe(5);
    expect(includedSkills.has('trace')).toBe(true);
    expect(includedSkills.has('jest')).toBe(false);
  });

  it('returns schoolOfSkill mapping every included spell to its school', () => {
    const { build } = makeBuilder();
    const { schoolOfSkill } = build();
    expect(schoolOfSkill.get('trace').id).toBe('debugging');
    expect(schoolOfSkill.get('jest').id).toBe('testing');
  });

  it('includes all skills when no skillFilter is given', () => {
    const { build } = makeBuilder();
    const { edges, includedSkills } = build();
    expect(includedSkills.size).toBe(7); // 5 debug + 2 testing
    expect(edges.length).toBe(5);
  });
});
