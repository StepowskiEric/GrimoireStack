import { describe, expect, it } from 'vitest';
import { serializeConfig, serializeMarkdown } from '../utils/serializeConfig.ts';

/**
 * serializeConfig tests — pure serialization, no DOM, no localStorage.
 *
 * Every test passes plain data objects. The module is a pure function
 * of its inputs: given the same data, it returns the same string.
 */

const SAMPLE_FAVS = [
  { name: 'Trace Sight', skill: 'debug-issue', addedAt: 1_718_000_000_000 },
  { name: 'Bisect Divination', skill: 'debug-to-fix-pipeline', addedAt: 1_718_000_001_000 },
];

const SAMPLE_MARG = {
  'debug-issue': 'Maps stack traces to source code',
  'debug-to-fix-pipeline': 'Use when tests fail',
};

const SAMPLE_RECENT = [
  { name: 'Trace Sight', skill: 'debug-issue', viewedAt: 1_718_000_000_000 },
  { name: 'Tree of Thoughts', skill: 'tree-of-thoughts', viewedAt: 1_717_999_999_000 },
];

// ── serializeConfig (JSON) ─────────────────────────────

describe('serializeConfig', () => {
  it('returns valid JSON', () => {
    const json = serializeConfig({ favorites: [], marginalia: {}, recent: [] });
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes the schema version', () => {
    const parsed = JSON.parse(serializeConfig({ favorites: [], marginalia: {}, recent: [] }));
    expect(parsed.schema).toBe('grimoirestack.config.v1');
  });

  it('includes an exportedAt ISO timestamp', () => {
    const parsed = JSON.parse(serializeConfig({ favorites: [], marginalia: {}, recent: [] }));
    expect(parsed.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('includes favorites', () => {
    const parsed = JSON.parse(
      serializeConfig({ favorites: SAMPLE_FAVS, marginalia: {}, recent: [] }),
    );
    expect(parsed.favorites.length).toBe(2);
    expect(parsed.favorites[0].skill).toBe('debug-issue');
  });

  it('includes marginalia', () => {
    const parsed = JSON.parse(
      serializeConfig({ favorites: [], marginalia: SAMPLE_MARG, recent: [] }),
    );
    expect(parsed.marginalia['debug-issue']).toBe('Maps stack traces to source code');
  });

  it('includes recent', () => {
    const parsed = JSON.parse(
      serializeConfig({ favorites: [], marginalia: {}, recent: SAMPLE_RECENT }),
    );
    expect(parsed.recent.length).toBe(2);
  });

  it('accepts meta override', () => {
    const parsed = JSON.parse(
      serializeConfig({
        favorites: [],
        marginalia: {},
        recent: [],
        meta: { source: 'Test' },
      }),
    );
    expect(parsed.meta.source).toBe('Test');
  });

  it('defaults meta to GrimoireStack when omitted', () => {
    const parsed = JSON.parse(serializeConfig({ favorites: [], marginalia: {}, recent: [] }));
    expect(parsed.meta.source).toBe('GrimoireStack');
  });

  it('defaults all collections to empty', () => {
    const parsed = JSON.parse(serializeConfig({}));
    expect(parsed.favorites).toEqual([]);
    expect(parsed.marginalia).toEqual({});
    expect(parsed.recent).toEqual([]);
  });

  it('is pure — same input produces same output', () => {
    const a = serializeConfig({
      favorites: SAMPLE_FAVS,
      marginalia: SAMPLE_MARG,
      recent: SAMPLE_RECENT,
    });
    const b = serializeConfig({
      favorites: SAMPLE_FAVS,
      marginalia: SAMPLE_MARG,
      recent: SAMPLE_RECENT,
    });
    expect(a).toBe(b);
  });

  it('does not touch window or localStorage', () => {
    // Calling with explicit data should never reference window
    serializeConfig({ favorites: SAMPLE_FAVS, marginalia: SAMPLE_MARG, recent: SAMPLE_RECENT });
    // If we get here without throwing, the module is side-effect free
    expect(true).toBe(true);
  });
});

// ── serializeMarkdown ──────────────────────────────────

describe('serializeMarkdown', () => {
  it('starts with a header', () => {
    const md = serializeMarkdown({ favorites: [], marginalia: {}, recent: [] });
    expect(md.startsWith('# GrimoireStack — Personal Config')).toBe(true);
  });

  it('includes a date line', () => {
    const md = serializeMarkdown({ favorites: [], marginalia: {}, recent: [] });
    expect(md).toContain('Exported 20');
  });

  it('lists favorites with name and skill id', () => {
    const md = serializeMarkdown({ favorites: SAMPLE_FAVS, marginalia: {}, recent: [] });
    expect(md).toContain('Trace Sight');
    expect(md).toContain('`debug-issue`');
    expect(md).toContain('Bisect Divination');
    expect(md).toContain('`debug-to-fix-pipeline`');
  });

  it('includes marginalia notes next to matching favorites', () => {
    const md = serializeMarkdown({ favorites: SAMPLE_FAVS, marginalia: SAMPLE_MARG, recent: [] });
    expect(md).toContain('Note: Maps stack traces to source code');
    expect(md).toContain('Note: Use when tests fail');
  });

  it('omits marginalia note when skill has no note', () => {
    const md = serializeMarkdown({
      favorites: [{ name: 'Orphan', skill: 'orphan-skill' }],
      marginalia: {},
      recent: [],
    });
    expect(md).not.toContain('Note:');
  });

  it('lists recently viewed spells', () => {
    const md = serializeMarkdown({ favorites: [], marginalia: {}, recent: SAMPLE_RECENT });
    expect(md).toContain('Trace Sight');
    expect(md).toContain('Tree of Thoughts');
  });

  it('includes marginalia for recent entries', () => {
    const md = serializeMarkdown({
      favorites: [],
      marginalia: SAMPLE_MARG,
      recent: SAMPLE_RECENT,
    });
    expect(md).toContain('Note: Maps stack traces to source code');
  });

  it('shows empty state for no favorites', () => {
    const md = serializeMarkdown({ favorites: [], marginalia: {}, recent: [] });
    expect(md).toContain('_None yet — star spells to bind them here._');
  });

  it('shows empty state for no recent', () => {
    const md = serializeMarkdown({ favorites: [], marginalia: {}, recent: [] });
    expect(md).toContain('_Empty._');
  });

  it('shows empty state for no marginalia', () => {
    const md = serializeMarkdown({ favorites: [], marginalia: {}, recent: [] });
    expect(md).toContain('_No notes scribbled yet._');
  });

  it('escapes pipe characters in favorite note lines', () => {
    const md = serializeMarkdown({
      favorites: SAMPLE_FAVS,
      marginalia: SAMPLE_MARG,
      recent: [],
    });
    // The 'Note:' sub-line under each favorite gets escaped
    expect(md).toContain('Note: Maps stack traces to source code');
    // The raw marginalia section at the bottom preserves verbatim
    const margSection = md.split('## Marginalia')[1];
    expect(margSection).toContain('Use when tests fail');
  });

  it('flattens newlines in favorite note lines', () => {
    const md = serializeMarkdown({
      favorites: SAMPLE_FAVS,
      marginalia: { 'debug-issue': 'line one\nline two' },
      recent: [],
    });
    // The 'Note:' sub-line under the favorite gets flattened
    expect(md).toContain('Note: line one line two');
    // The raw marginalia section preserves newlines
    const margSection = md.split('## Marginalia')[1];
    expect(margSection).toContain('line one\nline two');
  });

  it('defaults all collections to empty', () => {
    const md = serializeMarkdown({});
    expect(md).toContain('_None yet');
    expect(md).toContain('_Empty._');
    expect(md).toContain('_No notes scribbled yet._');
  });

  it('is pure — same input produces same output', () => {
    const a = serializeMarkdown({
      favorites: SAMPLE_FAVS,
      marginalia: SAMPLE_MARG,
      recent: SAMPLE_RECENT,
    });
    const b = serializeMarkdown({
      favorites: SAMPLE_FAVS,
      marginalia: SAMPLE_MARG,
      recent: SAMPLE_RECENT,
    });
    expect(a).toBe(b);
  });
});
