import { describe, it, expect } from 'vitest';
import {
  matchProblemToSpells,
  suggestExampleProblems,
} from '../utils/problemMatch.js';

describe('problemMatch', () => {
  describe('matchProblemToSpells', () => {
    it('returns empty array for empty query', () => {
      expect(matchProblemToSpells('')).toEqual([]);
      expect(matchProblemToSpells(null)).toEqual([]);
    });

    it('returns results sorted by score descending', () => {
      const results = matchProblemToSpells('test failing', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score >= results[i].score).toBe(true);
      }
    });

    it('each result has spell, school, and score', () => {
      const results = matchProblemToSpells('bug crash', { limit: 3 });
      for (const r of results) {
        expect(r).toHaveProperty('spell');
        expect(r).toHaveProperty('school');
        expect(r).toHaveProperty('score');
        expect(typeof r.score).toBe('number');
      }
    });

    it('respects the limit parameter', () => {
      const results = matchProblemToSpells('test', { limit: 2 });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('matches on skill name', () => {
      const results = matchProblemToSpells('log-trace-correlation', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].spell.skill).toBe('log-trace-correlation');
    });

    it('matches on effect keywords', () => {
      const results = matchProblemToSpells('stack trace', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      const hasLogTrace = results.some(r => r.spell.skill === 'log-trace-correlation');
      expect(hasLogTrace).toBe(true);
    });

    it('matches on school name', () => {
      const results = matchProblemToSpells('reasoning cognition', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      const hasReasoning = results.some(r => r.school.id === 'reasoning');
      expect(hasReasoning).toBe(true);
    });
  });

  describe('suggestExampleProblems', () => {
    it('returns an array of example problems', () => {
      const examples = suggestExampleProblems();
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(3);
      for (const ex of examples) {
        expect(typeof ex).toBe('string');
        expect(ex.length).toBeGreaterThan(10);
      }
    });
  });
});
