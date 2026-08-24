import { describe, expect, it } from 'vitest';
import { compareSpells } from '../utils/markdownExport.ts';

const spellA = {
  name: 'Trace Sight',
  skill: 'debug-issue',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
  combos: ['Bisect Divination', 'Root Cause Revelation'],
  tier: 'adept',
  note: '',
};

const spellB = {
  name: 'Bisect Divination',
  skill: 'debug-to-fix-pipeline',
  effect: 'Binary searches commit history.',
  status: 'Proven',
  combos: ['Trace Sight'],
  tier: 'master',
  note: 'Fast',
};

describe('compareSpells', () => {
  it('returns an array of field comparisons', () => {
    const rows = compareSpells(spellA, spellB);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('marks same fields as matching', () => {
    const rows = compareSpells(spellA, spellA);
    for (const row of rows) {
      expect(row.same).toBe(true);
    }
  });

  it('marks different fields as not matching', () => {
    const rows = compareSpells(spellA, spellB);
    const nameRow = rows.find((r) => r.key === 'name');
    expect(nameRow.same).toBe(false);
    expect(nameRow.left).toBe('Trace Sight');
    expect(nameRow.right).toBe('Bisect Divination');
  });

  it('normalizes arrays to comma-separated strings', () => {
    const rows = compareSpells(spellA, spellB);
    const comboRow = rows.find((r) => r.key === 'combos');
    expect(comboRow.left).toBe('Bisect Divination, Root Cause Revelation');
    expect(comboRow.right).toBe('Trace Sight');
  });

  it('handles null inputs gracefully', () => {
    const rows = compareSpells(null, spellB);
    expect(rows.length).toBeGreaterThan(0);
    const nameRow = rows.find((r) => r.key === 'name');
    expect(nameRow.left).toBe('');
    expect(nameRow.right).toBe('Bisect Divination');
  });

  it('handles both null inputs', () => {
    const rows = compareSpells(null, null);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.left).toBe('');
      expect(row.right).toBe('');
      expect(row.same).toBe(true);
    }
  });
});
