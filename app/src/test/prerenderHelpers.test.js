import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  injectSpellMeta,
  truncateDescription,
} from '../../scripts/prerender-helpers.mjs';

const SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GrimoireStack — The Warlock's Tome of Agent Incantations</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel" rel="stylesheet">
</head>
<body>
<div id="root"></div>
<script type="module" src="/assets/main.ts"></script>
</body>
</html>`;

describe('injectSpellMeta', () => {
  const meta = {
    name: 'Trace Sight',
    effect: 'Maps stack traces to source code and suggests fixes.',
    skill: 'debug-issue',
    origin: 'https://grimoirestack.dev',
  };

  it('replaces the <title>', () => {
    const out = injectSpellMeta(SHELL, meta);
    expect(out).toContain('<title>GrimoireStack — Trace Sight</title>');
  });

  it('adds a meta description', () => {
    const out = injectSpellMeta(SHELL, meta);
    expect(out).toMatch(/<meta name="description" content="[^"]*stack traces/i);
  });

  it('adds Open Graph tags', () => {
    const out = injectSpellMeta(SHELL, meta);
    expect(out).toContain('<meta property="og:title" content="Trace Sight — GrimoireStack">');
    expect(out).toContain('<meta property="og:description"');
    expect(out).toContain('<meta property="og:type" content="article">');
    expect(out).toContain(
      '<meta property="og:url" content="https://grimoirestack.dev/s/debug-issue">',
    );
    expect(out).toContain(
      '<meta property="og:image" content="https://grimoirestack.dev/og-image.png">',
    );
  });

  it('adds Twitter card tags', () => {
    const out = injectSpellMeta(SHELL, meta);
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(out).toContain('<meta name="twitter:title"');
    expect(out).toContain('<meta name="twitter:description"');
    expect(out).toContain('<meta name="twitter:image"');
  });

  it('adds a canonical link', () => {
    const out = injectSpellMeta(SHELL, meta);
    expect(out).toContain(
      '<link rel="canonical" href="https://grimoirestack.dev/s/debug-issue">',
    );
  });

  it('preserves existing shell content (script tags, etc.)', () => {
    const out = injectSpellMeta(SHELL, meta);
    expect(out).toContain('<script type="module" src="/assets/main.ts"></script>');
    expect(out).toContain('<link rel="icon" type="image/png" href="/favicon.png">');
    expect(out).toContain('<div id="root"></div>');
  });

  it('escapes HTML in the spell name', () => {
    const out = injectSpellMeta(SHELL, { ...meta, name: '<script>alert(1)</script>' });
    expect(out).not.toContain('<script>alert(1)</script>');
    expect(out).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('<a href="x">&')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;');
  });
  it('passes plain text through', () => {
    expect(escapeHtml('Trace Sight')).toBe('Trace Sight');
  });
});

describe('truncateDescription', () => {
  it('keeps descriptions under 200 chars intact', () => {
    const short = 'A short description.';
    expect(truncateDescription(short)).toBe(short);
  });
  it('truncates long descriptions with an ellipsis at a word boundary', () => {
    const long = 'word '.repeat(60).trim();
    const out = truncateDescription(long, 100);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith('…') || out.endsWith('...')).toBe(true);
  });
});
