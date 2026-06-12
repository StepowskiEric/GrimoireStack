import { describe, it, expect } from 'vitest';
import { schoolColors } from '../utils/schoolColors.js';

describe('schoolColors', () => {
  it('returns an object with all expected color keys', () => {
    const colors = schoolColors('debugging');
    expect(colors).toHaveProperty('hue');
    expect(colors).toHaveProperty('bg');
    expect(colors).toHaveProperty('border');
    expect(colors).toHaveProperty('glow');
    expect(colors).toHaveProperty('glowStrong');
    expect(colors).toHaveProperty('dripTop');
    expect(colors).toHaveProperty('dripBottom');
    expect(colors).toHaveProperty('text');
    expect(colors).toHaveProperty('cssVars');
  });

  it('returns deterministic colors for the same schoolId', () => {
    const a = schoolColors('debugging');
    const b = schoolColors('debugging');
    expect(a.hue).toBe(b.hue);
    expect(a.bg).toBe(b.bg);
    expect(a.border).toBe(b.border);
    expect(a.glow).toBe(b.glow);
    expect(a.glowStrong).toBe(b.glowStrong);
    expect(a.dripTop).toBe(b.dripTop);
    expect(a.dripBottom).toBe(b.dripBottom);
    expect(a.text).toBe(b.text);
  });

  it('returns different colors for different schoolIds', () => {
    const a = schoolColors('debugging');
    const b = schoolColors('reasoning');
    // They might coincidentally share one property but hue should differ
    expect(a.hue).not.toBe(b.hue);
  });

  it('hue is in range 0-359', () => {
    const ids = ['debugging', 'reasoning', 'testing', 'process', 'creativity', 'architecture'];
    for (const id of ids) {
      const colors = schoolColors(id);
      expect(colors.hue).toBeGreaterThanOrEqual(0);
      expect(colors.hue).toBeLessThan(360);
    }
  });

  it('bg contains valid HSL format', () => {
    const colors = schoolColors('debugging');
    expect(colors.bg).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('border contains valid HSL format', () => {
    const colors = schoolColors('debugging');
    expect(colors.border).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('glow contains valid HSLA format with alpha', () => {
    const colors = schoolColors('debugging');
    expect(colors.glow).toMatch(/^hsla\(\d+, \d+%, \d+%, 0\.35\)$/);
  });

  it('glowStrong has higher alpha than glow', () => {
    const colors = schoolColors('debugging');
    expect(colors.glowStrong).toMatch(/0\.55\)$/);
  });

  it('text contains valid HSL format', () => {
    const colors = schoolColors('debugging');
    expect(colors.text).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('cssVars contains all expected custom properties', () => {
    const colors = schoolColors('debugging');
    const cssVars = colors.cssVars;
    expect(cssVars).toHaveProperty('--school-hue');
    expect(cssVars).toHaveProperty('--school-sat');
    expect(cssVars).toHaveProperty('--school-bg');
    expect(cssVars).toHaveProperty('--school-border');
    expect(cssVars).toHaveProperty('--school-glow');
    expect(cssVars).toHaveProperty('--school-glow-strong');
    expect(cssVars).toHaveProperty('--school-drip-top');
    expect(cssVars).toHaveProperty('--school-drip-bottom');
    expect(cssVars).toHaveProperty('--school-text');
  });

  it('cssVars --school-hue matches the hue property', () => {
    const colors = schoolColors('debugging');
    expect(colors.cssVars['--school-hue']).toBe(colors.hue);
  });

  it('cssVars --school-sat is a percentage string', () => {
    const colors = schoolColors('debugging');
    expect(colors.cssVars['--school-sat']).toMatch(/^\d+%$/);
  });

  it('handles empty string schoolId', () => {
    const colors = schoolColors('');
    expect(colors).toHaveProperty('hue');
    expect(colors.hue).toBeGreaterThanOrEqual(0);
    expect(colors.hue).toBeLessThan(360);
  });

  it('handles special characters in schoolId', () => {
    const colors = schoolColors('school-of-123!');
    expect(colors).toHaveProperty('hue');
    expect(colors.bg).toMatch(/^hsl/);
  });

  it('produces valid inline style object from cssVars', () => {
    const colors = schoolColors('debugging');
    const style = { ...colors.cssVars };
    // Should be usable as a React inline style
    expect(typeof style['--school-hue']).toBe('number');
    expect(typeof style['--school-sat']).toBe('string');
  });
});
