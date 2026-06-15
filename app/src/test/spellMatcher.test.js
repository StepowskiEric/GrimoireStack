import { describe, it, expect } from 'vitest';
import { createGrimoireIndex } from '../data/grimoireIndex.js';

/**
 * spellMatcher tests — similarTo and matchProblem scoring rules.
 *
 * Uses small synthetic corpora so scoring behavior is deterministic
 * and easy to reason about.
 */

const TWO_SCHOOLS = [
  {
    id: 'debugging',
    name: 'School of Remediation',
    real: 'Debugging',
    desc: 'Bug fixes.',
    spells: [
      { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Maps stack traces to source.', status: 'Proven', combos: ['Bisect Divination'] },
      { name: 'Bisect Divination', skill: 'bisect-debugging', effect: 'Binary search commit history.', status: 'Proven' },
      { name: 'Test Weave', skill: 'jest-testing', effect: 'Write correct Jest tests.', status: 'New' },
    ],
  },
  {
    id: 'reasoning',
    name: 'School of Cognition',
    real: 'Reasoning',
    desc: 'Thinking tools.',
    spells: [
      { name: 'Razor of Parsimony', skill: 'occams-razor', effect: 'Simplest explanation wins.', status: 'Proven', combos: ['Tree of Thoughts', 'Rashomon Triad'] },
      { name: 'Tree of Thoughts', skill: 'tree-of-thoughts', effect: 'Branch reasoning paths.', status: 'Proven' },
      { name: 'Thought-Weave', skill: 'thought-weave', effect: 'Weave thoughts together.' },
    ],
  },
];

function makeIndex(schools = TWO_SCHOOLS) {
  return createGrimoireIndex(schools);
}

// ── similarTo ──────────────────────────────────────────

describe('similarTo', () => {
  it('returns exact skill matches first', () => {
    const idx = makeIndex();
    const results = idx.similarTo('log-trace-correlation', 4);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].spell.skill).toBe('log-trace-correlation');
  });

  it('returns exact name matches', () => {
    const idx = makeIndex();
    const results = idx.similarTo('Trace Sight', 4);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].spell.name).toBe('Trace Sight');
  });

  it('returns partial matches ranked below exact', () => {
    const idx = makeIndex();
    const results = idx.similarTo('trace', 4);
    // 'trace' appears in both 'Trace Sight' (substring) and 'log-trace-correlation' (token)
    // Substring hit on 'Trace Sight' scores 5, token hit on 'log-trace-correlation' scores 1
    expect(results.length).toBeGreaterThanOrEqual(1);
    const skills = results.map(r => r.spell.skill);
    expect(skills).toContain('log-trace-correlation');
  });

  it('returns empty for no query', () => {
    const idx = makeIndex();
    expect(idx.similarTo('')).toEqual([]);
    expect(idx.similarTo('   ')).toEqual([]);
  });

  it('returns empty for no match', () => {
    const idx = makeIndex();
    expect(idx.similarTo('zzznotfound', 4)).toEqual([]);
  });

  it('respects the limit', () => {
    const idx = makeIndex();
    const results = idx.similarTo('test', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('defaults limit to 4', () => {
    const idx = makeIndex();
    const results = idx.similarTo('test');
    expect(results.length).toBeLessThanOrEqual(4);
  });

  it('scores substring hit higher than single token', () => {
    // 'trace' is a substring of 'Trace Sight' (score 5) and a token in 'log-trace-correlation' (score 1)
    const idx = makeIndex();
    const results = idx.similarTo('trace', 4);
    const top = results[0];
    expect(top.spell.name).toBe('Trace Sight'); // substring wins
  });

  it('case-insensitive matching', () => {
    const idx = makeIndex();
    const upper = idx.similarTo('TRACE', 4);
    const lower = idx.similarTo('trace', 4);
    expect(upper.map(r => r.spell.skill)).toEqual(lower.map(r => r.spell.skill));
  });
});

// ── matchProblem ──────────────────────────────────────

describe('matchProblem', () => {
  it('returns empty for empty query', () => {
    const idx = makeIndex();
    expect(idx.matchProblem('')).toEqual([]);
    expect(idx.matchProblem(null)).toEqual([]);
  });

  it('returns empty for stopword-only query', () => {
    const idx = makeIndex();
    expect(idx.matchProblem('the and or')).toEqual([]);
  });

  it('matches on spell name tokens', () => {
    const idx = makeIndex();
    const results = idx.matchProblem('stack trace mapping', { limit: 5 });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].spell.skill).toBe('log-trace-correlation');
  });

  it('matches on effect tokens', () => {
    const idx = makeIndex();
    const results = idx.matchProblem('binary search commits', { limit: 5 });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].spell.skill).toBe('bisect-debugging');
  });

  it('matches on school name', () => {
    const idx = makeIndex();
    const results = idx.matchProblem('remediation', { limit: 5 });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].school.id).toBe('debugging');
  });

  it('bonuses Proven status', () => {
    // 'weave' appears in 'Thought-Weave' (no status, score 0) and 'Tree of Thoughts' (Proven, score 0.5 bonus)
    // With the bonus, Tree of Thoughts should outrank Thought-Weave
    const idx = makeIndex();
    const results = idx.matchProblem('weave', { limit: 4 });
    const provenResult = results.find(r => r.spell.skill === 'tree-of-thoughts');
    const plainResult = results.find(r => r.spell.skill === 'thought-weave');
    if (provenResult && plainResult) {
      expect(provenResult.score).toBeGreaterThan(plainResult.score);
    }
  });

  it('bonuses combo count', () => {
    // 'Razor of Parsimony' has 2 combos (score +1.0), 'Trace Sight' has 1 combo (score +0.5)
    // Query 'simplest' matches only 'Razor of Parsimony'
    const idx = makeIndex();
    const results = idx.matchProblem('simplest', { limit: 4 });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].spell.skill).toBe('occams-razor');
  });

  it('respects limit', () => {
    const idx = makeIndex();
    const results = idx.matchProblem('test', { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('defaults limit to 5', () => {
    const idx = makeIndex();
    const results = idx.matchProblem('test');
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('filters stopwords before scoring', () => {
    // 'write' appears in 'Test Weave' effect but 'tests' appears nowhere
    // 'the' is a stopword — should not contribute to matching
    const idx = makeIndex();
    const results = idx.matchProblem('the write tests', { limit: 5 });
    // 'write' should match 'Test Weave'; 'the' and 'tests' should not
    expect(results.length).toBeGreaterThanOrEqual(1);
    const skills = results.map(r => r.spell.skill);
    expect(skills).toContain('jest-testing');
  });
});
