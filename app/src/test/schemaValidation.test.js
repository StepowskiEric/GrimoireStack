import { describe, it, expect } from 'vitest';
import { validateSpell, validateSchool, validateSchools } from '../data/schema.js';

const baseSpell = () => ({
  name: 'Trace Sight',
  skill: 'log-trace-correlation',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
});

describe('validateSpell — trueName', () => {
  it('accepts a spell without trueName', () => {
    const spell = validateSpell(baseSpell());
    expect(spell).not.toHaveProperty('trueName');
  });

  it('accepts a distinct trueName', () => {
    const spell = validateSpell({ ...baseSpell(), trueName: 'The Eye That Reads' });
    expect(spell.trueName).toBe('The Eye That Reads');
  });

  it('throws when trueName is not a string', () => {
    expect(() => validateSpell({ ...baseSpell(), trueName: 42 })).toThrow(/trueName must be a string/);
    expect(() => validateSpell({ ...baseSpell(), trueName: null })).toThrow(/trueName must be a string/);
    expect(() => validateSpell({ ...baseSpell(), trueName: { word: 'no' } })).toThrow(/trueName must be a string/);
  });
});

describe('validateSpell — kins', () => {
  it('accepts a spell without kins', () => {
    const spell = validateSpell(baseSpell());
    expect(spell).not.toHaveProperty('kins');
  });

  it('accepts an array of non-empty string ids', () => {
    const spell = validateSpell({ ...baseSpell(), kins: ['bisect-debugging', 'root-cause-analysis'] });
    expect(spell.kins).toEqual(['bisect-debugging', 'root-cause-analysis']);
  });

  it('accepts an empty kins array', () => {
    const spell = validateSpell({ ...baseSpell(), kins: [] });
    expect(spell.kins).toEqual([]);
  });

  it('throws when kins is not an array', () => {
    expect(() => validateSpell({ ...baseSpell(), kins: 'bisect-debugging' })).toThrow(/kins must be an array/);
    expect(() => validateSpell({ ...baseSpell(), kins: 42 })).toThrow(/kins must be an array/);
    expect(() => validateSpell({ ...baseSpell(), kins: null })).toThrow(/kins must be an array/);
  });

  it('throws when any kin entry is not a non-empty string', () => {
    expect(() => validateSpell({ ...baseSpell(), kins: ['ok', ''] })).toThrow(/kins entries must be non-empty strings/);
    expect(() => validateSpell({ ...baseSpell(), kins: ['ok', '   '] })).toThrow(/kins entries must be non-empty strings/);
    expect(() => validateSpell({ ...baseSpell(), kins: ['ok', 42] })).toThrow(/kins entries must be non-empty strings/);
  });
});

describe('validateSchool / validateSchools — passthrough', () => {
  it('passes through spells with trueName and kins intact', () => {
    const school = validateSchool({
      id: 'debugging',
      name: 'Debugging',
      spells: [
        { ...baseSpell(), trueName: 'The Eye', kins: ['bisect-debugging'] },
      ],
    });
    expect(school.spells[0].trueName).toBe('The Eye');
    expect(school.spells[0].kins).toEqual(['bisect-debugging']);
  });

  it('still rejects a malformed spell inside a school', () => {
    expect(() => validateSchool({
      id: 'debugging',
      name: 'Debugging',
      spells: [{ ...baseSpell(), kins: 'not-an-array' }],
    })).toThrow(/kins must be an array/);
  });

  it('validateSchools runs over the whole array', () => {
    const schools = validateSchools([
      { id: 'a', name: 'A', spells: [{ ...baseSpell(), trueName: 'X' }] },
      { id: 'b', name: 'B', spells: [{ ...baseSpell(), kins: ['x'] }] },
    ]);
    expect(schools).toHaveLength(2);
    expect(schools[0].spells[0].trueName).toBe('X');
    expect(schools[1].spells[0].kins).toEqual(['x']);
  });
});
