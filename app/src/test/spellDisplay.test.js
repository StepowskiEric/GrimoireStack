import { describe, expect, it } from 'vitest';
import { getSpellSearchableText } from '../data/spellDisplay.ts';

describe('getSpellSearchableText', () => {
  it('returns empty string for null/undefined spells', () => {
    expect(getSpellSearchableText(null)).toBe('');
    expect(getSpellSearchableText(undefined)).toBe('');
  });

  it('concatenates name + skill + effect lowercased', () => {
    const text = getSpellSearchableText({
      name: 'Trace Sight',
      skill: 'log-trace-correlation',
      effect: 'Reads the Stack.',
    });
    expect(text).toBe('trace sight log-trace-correlation reads the stack.');
  });

  it('omits missing fields gracefully', () => {
    const text = getSpellSearchableText({
      name: 'A',
      skill: 'b',
      effect: 'c',
    });
    expect(text).toBe('a b c');
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('null');
  });

  it('survives empty or missing name/skill/effect', () => {
    expect(getSpellSearchableText({})).toBe('');
    expect(getSpellSearchableText({ name: 'Only' })).toBe('only');
    expect(getSpellSearchableText({ name: 'A', effect: 'B' })).toBe('a b');
  });

  it('is case-insensitive (downcases the full concat)', () => {
    const text = getSpellSearchableText({
      name: 'UPPER',
      skill: 'MiXeD',
      effect: 'CamelCase',
    });
    expect(text).toBe('upper mixed camelcase');
  });
});
