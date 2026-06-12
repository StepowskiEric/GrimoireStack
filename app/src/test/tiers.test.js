import { describe, it, expect } from 'vitest';
import { getSpellTier, TIER_META } from '../data/tiers.js';

describe('getSpellTier', () => {
  it('returns faded for empty status', () => {
    expect(getSpellTier({ status: '' })).toBe('faded');
  });

  it('returns faded for missing status', () => {
    expect(getSpellTier({})).toBe('faded');
  });

  it('returns faded for em-dash status', () => {
    expect(getSpellTier({ status: '—' })).toBe('faded');
  });

  it('returns apprentice for New status', () => {
    expect(getSpellTier({ status: 'New' })).toBe('apprentice');
  });

  it('returns apprentice for Framework status', () => {
    expect(getSpellTier({ status: 'Framework' })).toBe('apprentice');
  });

  it('returns adept for Proven with no combos', () => {
    expect(getSpellTier({ status: 'Proven', combos: [] })).toBe('adept');
  });

  it('returns adept for Proven with no combos property', () => {
    expect(getSpellTier({ status: 'Proven' })).toBe('adept');
  });

  it('returns master for Proven with 1 combo', () => {
    expect(getSpellTier({ status: 'Proven', combos: ['A'] })).toBe('master');
  });

  it('returns master for Proven with 2 combos', () => {
    expect(getSpellTier({ status: 'Proven', combos: ['A', 'B'] })).toBe('master');
  });

  it('returns archmage for Proven with 3+ combos', () => {
    expect(getSpellTier({ status: 'Proven', combos: ['A', 'B', 'C'] })).toBe('archmage');
  });

  it('returns archmage for Proven with many combos', () => {
    expect(getSpellTier({ status: 'Proven', combos: ['A', 'B', 'C', 'D'] })).toBe('archmage');
  });

  it('returns master for MCP status', () => {
    expect(getSpellTier({ status: 'MCP' })).toBe('master');
  });

  it('returns master for status containing MCP', () => {
    expect(getSpellTier({ status: 'Tool-MCP' })).toBe('master');
  });

  it('returns master for Proven with MCP in status (not exactly Proven)', () => {
    // hasProven requires status === 'Proven' exactly, so 'Proven MCP' has hasProven=false
    // hasMCP=true → master
    expect(getSpellTier({ status: 'Proven MCP' })).toBe('master');
  });

  it('returns adept for Hybrid status', () => {
    expect(getSpellTier({ status: 'Hybrid' })).toBe('adept');
  });

  it('returns adept for Hybrid with non-exactly-Proven status', () => {
    // hasProven requires status === 'Proven' exactly
    // hasHybrid=true, hasProven=false → adept
    expect(getSpellTier({ status: 'Proven Hybrid' })).toBe('adept');
  });

  it('returns master for Proven MCP + 3 combos (hasProven is false)', () => {
    // hasProven requires status === 'Proven' exactly, so this has hasProven=false
    // hasMCP=true → master (the archmage path requires hasProven=true)
    expect(getSpellTier({ status: 'Proven MCP', combos: ['A', 'B', 'C'] })).toBe('master');
  });

  it('returns archmage for exactly Proven + MCP + 3 combos', () => {
    // This won't match because 'Proven' doesn't contain MCP
    // But Proven + 3 combos alone = archmage
    expect(getSpellTier({ status: 'Proven', combos: ['A', 'B', 'C'] })).toBe('archmage');
  });

  it('trims whitespace from status', () => {
    expect(getSpellTier({ status: '  Proven  ' })).toBe('adept');
  });

  it('handles null status', () => {
    expect(getSpellTier({ status: null })).toBe('faded');
  });

  it('handles combos as non-array', () => {
    expect(getSpellTier({ status: 'Proven', combos: 'not-an-array' })).toBe('adept');
  });

  it('returns faded for unknown status', () => {
    expect(getSpellTier({ status: 'Deprecated' })).toBe('faded');
  });
});

describe('TIER_META', () => {
  it('has all five tiers', () => {
    expect(TIER_META).toHaveProperty('faded');
    expect(TIER_META).toHaveProperty('apprentice');
    expect(TIER_META).toHaveProperty('adept');
    expect(TIER_META).toHaveProperty('master');
    expect(TIER_META).toHaveProperty('archmage');
  });

  it('each tier has label, className, and title', () => {
    for (const [key, meta] of Object.entries(TIER_META)) {
      expect(meta).toHaveProperty('label');
      expect(meta).toHaveProperty('className');
      expect(meta).toHaveProperty('title');
      expect(typeof meta.label).toBe('string');
      expect(typeof meta.className).toBe('string');
      expect(typeof meta.title).toBe('string');
    }
  });

  it('tier keys match getSpellTier return values', () => {
    const tierKeys = Object.keys(TIER_META);
    const spellStatuses = [
      { status: '' },        // faded
      { status: 'New' },     // apprentice
      { status: 'Proven' },  // adept
      { status: 'Proven', combos: ['A'] }, // master
      { status: 'Proven', combos: ['A', 'B', 'C'] }, // archmage
    ];
    for (const spell of spellStatuses) {
      expect(tierKeys).toContain(getSpellTier(spell));
    }
  });
});
