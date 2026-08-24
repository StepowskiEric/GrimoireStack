import { describe, expect, it } from 'vitest';
import { getSpellTier } from '../data/tiers.ts';
import { filterSpellsOnEntries, searchSpellsOnEntries } from '../spellSearch.ts';

// Flat-entry fixtures (canonical shape for the implementation under test).
const sampleEntries = [
  {
    spell: {
      name: 'Trace Sight',
      skill: 'debug-issue',
      effect: 'Maps stack traces to source code and suggests fixes.',
      status: 'Proven',
    },
    school: { id: 'debugging', name: 'School of Remediation' },
  },
  {
    spell: {
      name: 'Bisect Divination',
      skill: 'debug-to-fix-pipeline',
      effect: 'Binary searches commit history for the regression commit.',
      status: 'Proven',
    },
    school: { id: 'debugging', name: 'School of Remediation' },
  },
  {
    spell: {
      name: 'Razor of Parsimony',
      skill: 'occams-razor',
      effect: 'Favors the simplest sufficient explanation.',
      status: '—',
    },
    school: { id: 'reasoning', name: 'School of Cognition' },
  },
  {
    spell: {
      name: 'Thought-Weave',
      skill: 'tree-of-thoughts',
      effect: 'Branches multiple reasoning paths in parallel.',
      status: '—',
    },
    school: { id: 'reasoning', name: 'School of Cognition' },
  },
];

// Raw-schools fixtures (used only for adapter verification).
const sampleSchools = [
  {
    id: 'debugging',
    name: 'School of Remediation',
    spells: [
      {
        name: 'Trace Sight',
        skill: 'debug-issue',
        effect: 'Maps stack traces to source code and suggests fixes.',
        status: 'Proven',
      },
      {
        name: 'Bisect Divination',
        skill: 'debug-to-fix-pipeline',
        effect: 'Binary searches commit history for the regression commit.',
        status: 'Proven',
      },
    ],
  },
  {
    id: 'reasoning',
    name: 'School of Cognition',
    spells: [
      {
        name: 'Razor of Parsimony',
        skill: 'occams-razor',
        effect: 'Favors the simplest sufficient explanation.',
        status: '—',
      },
      {
        name: 'Thought-Weave',
        skill: 'tree-of-thoughts',
        effect: 'Branches multiple reasoning paths in parallel.',
        status: '—',
      },
    ],
  },
];

describe('searchSpellsOnEntries (canonical)', () => {
  it('returns empty results for an empty query', () => {
    const result = searchSpellsOnEntries(sampleEntries, '');
    expect(result).toEqual({ bySchool: {}, total: 0 });
  });

  it('finds spells matching by name', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'Trace Sight');
    expect(result.total).toBe(1);
    expect(result.bySchool).toHaveProperty('debugging');
    expect(result.bySchool.debugging).toHaveLength(1);
    expect(result.bySchool.debugging[0]).toContain('Trace Sight');
  });

  it('finds spells matching by skill ID', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'debug-to-fix-pipeline');
    expect(result.total).toBe(1);
    expect(result.bySchool.debugging[0]).toContain('debug-to-fix-pipeline');
  });

  it('finds spells matching by partial effect text', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'commit');
    expect(result.total).toBe(1);
    expect(result.bySchool.debugging[0]).toContain('Bisect Divination');
  });

  it('is case-insensitive', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'trace sight');
    expect(result.total).toBe(1);
    expect(result.bySchool.debugging[0]).toContain('Trace Sight');
  });

  it('returns empty for a non-matching query', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'zzznotfound');
    expect(result).toEqual({ bySchool: {}, total: 0 });
  });

  it('groups matching spells by school', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'Sight');
    expect(result.total).toBe(1);
    expect(result.bySchool).toHaveProperty('debugging');
    expect(result.bySchool).not.toHaveProperty('reasoning');
  });

  it('reports accurate total count', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'trace');
    expect(result.total).toBe(1);
  });

  it('uses name + NUL + skill as the match key format', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'Trace Sight');
    expect(result.bySchool.debugging[0]).toBe('Trace Sight\0debug-issue');
  });
});

describe('filterSpellsOnEntries (canonical)', () => {
  const favFn = (skill) => skill === 'debug-issue';

  it('returns all spells when no filters and no query', () => {
    const result = filterSpellsOnEntries(sampleEntries, { isFavorited: () => false });
    expect(result.total).toBe(4);
  });

  it('narrows by school filter', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      schoolFilter: new Set(['reasoning']),
      isFavorited: () => false,
    });
    expect(result.total).toBe(2);
    expect(result.bySchool).toHaveProperty('reasoning');
    expect(result.bySchool).not.toHaveProperty('debugging');
  });

  it('narrows by tier filter', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      tierFilter: new Set(['master']),
      isFavorited: () => false,
    });
    // 'debug-to-fix-pipeline' has status 'Proven' so tier = 'adept' (Proven, no combo)
    // 'debug-issue' has 'Proven' so tier = 'adept'
    // No master tier in this sample
    expect(result.total).toBe(0);
  });

  it('narrows by favorites only', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      favoritesOnly: true,
      isFavorited: favFn,
    });
    expect(result.total).toBe(1);
    expect(result.bySchool.debugging[0]).toContain('debug-issue');
  });

  it('combines query and filters (AND)', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      query: 'razor',
      tierFilter: new Set(['faded']),
      isFavorited: () => false,
    });
    expect(result.total).toBe(1);
  });

  it('returns empty when query and filters are mutually exclusive', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      query: 'razor',
      schoolFilter: new Set(['debugging']),
      isFavorited: () => false,
    });
    expect(result.total).toBe(0);
  });

  it('returns empty for empty school filter set', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      schoolFilter: new Set(),
      isFavorited: () => false,
    });
    expect(result.total).toBe(0);
  });
});

describe('getSpellTier is the canonical tier function', () => {
  it('returns correct tier for a Proven spell with no combos', () => {
    const sample = sampleEntries[0].spell;
    expect(getSpellTier(sample)).toBe('adept');
  });
});

describe('search matches by name and skill', () => {
  it('matches by name', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'Trace Sight');
    expect(result.total).toBe(1);
    expect(result.bySchool.debugging[0]).toContain('debug-issue');
  });

  it('matches by skill id', () => {
    const result = searchSpellsOnEntries(sampleEntries, 'debug-to-fix-pipeline');
    expect(result.total).toBe(1);
  });

  it('filter narrows by effect text', () => {
    const result = filterSpellsOnEntries(sampleEntries, {
      query: 'commit',
      isFavorited: () => false,
    });
    expect(result.total).toBe(1);
  });
});
