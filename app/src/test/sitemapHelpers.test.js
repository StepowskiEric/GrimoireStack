import { describe, expect, it } from 'vitest';
import { buildSitemapXml, escapeXml } from '../../scripts/sitemap-helpers.mjs';

describe('escapeXml', () => {
  it('escapes special characters', () => {
    expect(escapeXml('a & b <c> "d" \'e\'')).toBe(
      'a &amp; b &lt;c&gt; &quot;d&quot; &apos;e&apos;',
    );
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
      paths: ['/s/debug-issue', '/s/debug-to-fix-pipeline'],
    });
    expect(xml).toContain('<loc>https://grimoirestack.dev/s/debug-issue</loc>');
    expect(xml).toContain('<loc>https://grimoirestack.dev/s/debug-to-fix-pipeline</loc>');
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
