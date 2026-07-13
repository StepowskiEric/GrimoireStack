import { describe, expect, it } from 'vitest';
import { buildPathForSpell, buildShareUrl, parseSpellFromLocation } from '../utils/urlSpellSync.js';

describe('parseSpellFromLocation', () => {
  it('reads skill from ?s= query', () => {
    expect(parseSpellFromLocation('/?s=log-trace-correlation')).toBe('log-trace-correlation');
  });

  it('reads skill from /s/<skill> path', () => {
    expect(parseSpellFromLocation('/s/log-trace-correlation')).toBe('log-trace-correlation');
  });

  it('reads skill from /s/<skill>/ path', () => {
    expect(parseSpellFromLocation('/s/log-trace-correlation/')).toBe('log-trace-correlation');
  });

  it('returns null when no skill in URL', () => {
    expect(parseSpellFromLocation('/')).toBeNull();
    expect(parseSpellFromLocation('/foo')).toBeNull();
    expect(parseSpellFromLocation('/?q=other')).toBeNull();
  });

  it('prefers path over query when both are present', () => {
    expect(parseSpellFromLocation('/s/path-skill?s=query-skill')).toBe('path-skill');
  });

  it('handles a window.location-like object', () => {
    expect(parseSpellFromLocation({ pathname: '/s/x', search: '' })).toBe('x');
    expect(parseSpellFromLocation({ pathname: '/', search: '?s=y' })).toBe('y');
  });
});

describe('buildShareUrl', () => {
  it('builds an absolute URL with the path form', () => {
    const url = buildShareUrl('https://grimoirestack.dev', 'log-trace-correlation');
    expect(url).toBe('https://grimoirestack.dev/s/log-trace-correlation');
  });
});

describe('buildPathForSpell', () => {
  it('returns a relative path', () => {
    expect(buildPathForSpell('log-trace-correlation')).toBe('/s/log-trace-correlation');
  });
});
