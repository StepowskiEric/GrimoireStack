import { describe, it, expect } from 'vitest';
import { buildSitemapXml, escapeXml } from '../../scripts/sitemap-helpers.mjs';

describe('escapeXml', () => {
  it('escapes special characters', () => {
    expect(escapeXml('a & b <c> "d" \'e\'')).toBe('a &amp; b &lt;c&gt; &quot;d&quot; &apos;e&apos;');
  });
});

describe('buildSitemapXml', () => {
  it('includes the home URL', () => {
    const xml = buildSitemapXml({ origin: 'https://grimoirestack.dev', paths: [] });
    expect(xml).toContain('<loc>https://grimoirestack.dev/</loc>');
  });

  it('includes per-spell paths', () => {
    const xml = buildSitemapXml({
      origin: 'https://grimoirestack.dev',
      paths: ['/s/log-trace-correlation', '/s/bisect-debugging'],
    });
    expect(xml).toContain('<loc>https://grimoirestack.dev/s/log-trace-correlation</loc>');
    expect(xml).toContain('<loc>https://grimoirestack.dev/s/bisect-debugging</loc>');
  });

  it('produces a well-formed XML document', () => {
    const xml = buildSitemapXml({ origin: 'https://grimoirestack.dev', paths: ['/s/x'] });
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toMatch(/<\/urlset>$/);
  });

  it('escapes unsafe characters in paths', () => {
    const xml = buildSitemapXml({
      origin: 'https://grimoirestack.dev',
      paths: ['/s/foo&bar'],
    });
    expect(xml).toContain('foo&amp;bar');
    expect(xml).not.toContain('foo&bar');
  });
});
