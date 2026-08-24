import { describe, expect, it } from 'vitest';
import { buildPathForSpell, buildShareUrl, parseSpellFromLocation } from '../utils/urlSpellSync.ts';

describe('parseSpellFromLocation', () => {
  it('reads skill from ?s= query', () => {
    expect(parseSpellFromLocation('/?s=debug-issue')).toBe('debug-issue');
  });

  it('reads skill from /s/<skill> path', () => {
    expect(parseSpellFromLocation('/s/debug-issue')).toBe('debug-issue');
  });

  it('reads skill from /s/<skill>/ path', () => {
    expect(parseSpellFromLocation('/s/debug-issue/')).toBe('debug-issue');
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
    const url = buildShareUrl('https://grimoirestack.dev', 'debug-issue');
    expect(url).toBe('https://grimoirestack.dev/s/debug-issue');
  });
});

describe('buildPathForSpell', () => {
  it('returns a relative path', () => {
    expect(buildPathForSpell('debug-issue')).toBe('/s/debug-issue');
  });
});
