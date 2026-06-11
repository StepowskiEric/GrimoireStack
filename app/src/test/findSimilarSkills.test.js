import { describe, it, expect } from 'vitest';
import { findSimilarSkills } from '../utils/findSimilarSkills.js';

describe('findSimilarSkills', () => {
  it('returns up to the limit', () => {
    const out = findSimilarSkills('test', 3);
    expect(out.length).toBeLessThanOrEqual(3);
    expect(out.length).toBeGreaterThan(0);
  });

  it('ranks exact substring matches higher than partial', () => {
    const out = findSimilarSkills('log-trace', 5);
    expect(out[0].skill).toBe('log-trace-correlation');
  });

  it('returns empty for empty query', () => {
    expect(findSimilarSkills('', 5)).toEqual([]);
    expect(findSimilarSkills('   ', 5)).toEqual([]);
  });

  it('falls back to token-overlap match when substring misses', () => {
    const out = findSimilarSkills('something-totally-unrelated-xx', 5);
    expect(out).toEqual([]);
  });
});
