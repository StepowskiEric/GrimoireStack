import { describe, expect, it } from 'vitest';
import { createSpellCore } from '../data/spellCore.js';
import {
  getSpellHeadline,
  getSpellSearchableText,
  hasDistinctTrueName,
} from '../data/spellDisplay.js';
import { createSpellLookup } from '../data/spellLookup.js';

describe('hasDistinctTrueName', () => {
  it('returns false when spell is null/undefined', () => {
    expect(hasDistinctTrueName(null)).toBe(false);
    expect(hasDistinctTrueName(undefined)).toBe(false);
  });

  it('returns false when trueName is missing', () => {
    expect(hasDistinctTrueName({ name: 'Trace Sight' })).toBe(false);
  });

  it('returns false when trueName matches name', () => {
    expect(hasDistinctTrueName({ name: 'Trace Sight', trueName: 'Trace Sight' })).toBe(false);
  });

  it('returns false when trueName is empty or whitespace', () => {
    expect(hasDistinctTrueName({ name: 'A', trueName: '' })).toBe(false);
    expect(hasDistinctTrueName({ name: 'A', trueName: '   ' })).toBe(false);
  });

  it('returns false when trueName is not a string', () => {
    expect(hasDistinctTrueName({ name: 'A', trueName: 42 })).toBe(false);
    expect(hasDistinctTrueName({ name: 'A', trueName: null })).toBe(false);
    expect(hasDistinctTrueName({ name: 'A', trueName: undefined })).toBe(false);
  });

  it('returns true when trueName is a non-empty distinct string', () => {
    expect(
      hasDistinctTrueName({ name: 'Trace Sight', trueName: 'The Eye That Reads the Trace' }),
    ).toBe(true);
  });
});

describe('getSpellHeadline', () => {
  it('returns trueName when distinct', () => {
    expect(getSpellHeadline({ name: 'Trace Sight', trueName: 'The Eye' })).toBe('The Eye');
  });

  it('returns name when trueName matches or is missing', () => {
    expect(getSpellHeadline({ name: 'Trace Sight' })).toBe('Trace Sight');
    expect(getSpellHeadline({ name: 'Trace Sight', trueName: 'Trace Sight' })).toBe('Trace Sight');
    expect(getSpellHeadline({ name: 'Trace Sight', trueName: '   ' })).toBe('Trace Sight');
  });

  it('returns empty string for empty spells', () => {
    expect(getSpellHeadline(null)).toBe('');
    expect(getSpellHeadline({})).toBe('');
  });
});

describe('resolveKinsForSpell', () => {
  const core = createSpellCore([
    {
      id: 'debugging',
      name: 'Debugging',
      spells: [
        { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Reads the trace.' },
        {
          name: 'Bisect Divination',
          skill: 'bisect-debugging',
          effect: 'Halves the search space.',
        },
        {
          name: 'Debug Familiar',
          skill: 'debug-subagent',
          effect: 'A dedicated debugging familiar.',
        },
      ],
    },
  ]);
  const lookup = createSpellLookup(core);

  it('returns [] for spell without kins', () => {
    expect(lookup.resolveKinsForSpell({ skill: 'a', name: 'A' })).toEqual([]);
  });

  it('returns [] when kins is empty array', () => {
    expect(lookup.resolveKinsForSpell({ skill: 'a', name: 'A', kins: [] })).toEqual([]);
  });

  it('returns [] when spell is null/undefined', () => {
    expect(lookup.resolveKinsForSpell(null)).toEqual([]);
    expect(lookup.resolveKinsForSpell(undefined)).toEqual([]);
  });

  it('resolves skill ids to {spell, school} entries', () => {
    const result = lookup.resolveKinsForSpell({ skill: 'log-trace', kins: ['bisect-debugging'] });
    expect(result).toHaveLength(1);
    expect(result[0].spell.skill).toBe('bisect-debugging');
    expect(result[0].school.id).toBe('debugging');
  });

  it('skips ids that do not resolve', () => {
    const result = lookup.resolveKinsForSpell({
      skill: 'log-trace',
      kins: ['nope', 'bisect-debugging'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].spell.skill).toBe('bisect-debugging');
  });

  it('caps results at max (default 3)', () => {
    const result = lookup.resolveKinsForSpell({
      skill: 'log-trace',
      kins: ['bisect-debugging', 'debug-subagent', 'log-trace-correlation', 'bisect-debugging'],
    });
    expect(result).toHaveLength(3);
  });

  it('respects a custom max', () => {
    const result = lookup.resolveKinsForSpell(
      {
        skill: 'log-trace',
        kins: ['bisect-debugging', 'debug-subagent', 'log-trace-correlation'],
      },
      2,
    );
    expect(result).toHaveLength(2);
  });

  it('default cap is MAX_WHISPERS (3) — matches the registry warning constant', () => {
    const result = lookup.resolveKinsForSpell({
      skill: 'log-trace',
      kins: ['bisect-debugging', 'debug-subagent', 'log-trace-correlation'],
    });
    expect(result).toHaveLength(3);
  });

  it('returns {spell, school} shape with stable references from the bySkill map', () => {
    const result = lookup.resolveKinsForSpell({ skill: 'log-trace', kins: ['bisect-debugging'] });
    expect(result[0]).toEqual({
      spell: expect.objectContaining({ name: 'Bisect Divination' }),
      school: expect.objectContaining({ id: 'debugging' }),
    });
  });
});

describe('getSpellSearchableText', () => {
  it('returns empty string for null/undefined spells', () => {
    expect(getSpellSearchableText(null)).toBe('');
    expect(getSpellSearchableText(undefined)).toBe('');
  });

  it('concatenates name + skill + effect + trueName lowercased', () => {
    const text = getSpellSearchableText({
      name: 'Trace Sight',
      skill: 'log-trace-correlation',
      effect: 'Reads the Stack.',
      trueName: 'The Eye',
    });
    expect(text).toBe('trace sight log-trace-correlation reads the stack. the eye');
  });

  it('includes trueName so it is searchable', () => {
    const text = getSpellSearchableText({
      name: 'A',
      skill: 'a',
      effect: 'a',
      trueName: 'The Hyperspecific True Name Token',
    });
    expect(text).toContain('hyperspecific');
  });

  it('omits trueName field gracefully when missing', () => {
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
    // Fully empty spell short-circuits to ''.
    expect(getSpellSearchableText({})).toBe('');
    // Partially populated spells join with single spaces (no trailing/leading spaces).
    expect(getSpellSearchableText({ trueName: 'Only' })).toBe('only');
    expect(getSpellSearchableText({ name: 'Only' })).toBe('only');
    expect(getSpellSearchableText({ name: 'A', effect: 'B' })).toBe('a b');
  });

  it('is case-insensitive (downcases the full concat)', () => {
    const text = getSpellSearchableText({
      name: 'UPPER',
      skill: 'MiXeD',
      effect: 'CamelCase',
      trueName: 'Title Case',
    });
    expect(text).toBe('upper mixed camelcase title case');
  });
});
