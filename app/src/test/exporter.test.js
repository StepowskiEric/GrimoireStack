import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  exportAsJson,
  exportAsMarkdown,
  importConfig,
  loadFavorites,
  loadMarginalia,
  loadRecent,
} from '../utils/exporter.js';

const mockStorage = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key) => mockStorage[key] ?? null,
        setItem: (key, val) => {
          mockStorage[key] = String(val);
        },
        removeItem: (key) => {
          delete mockStorage[key];
        },
        clear: () => {
          Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
        },
      },
      writable: true,
    });
  }
});

describe('exporter', () => {
  describe('exportAsJson', () => {
    it('produces a valid JSON string with schema field', () => {
      const json = exportAsJson({ favorites: [], marginalia: {}, recent: [] });
      const parsed = JSON.parse(json);
      expect(parsed.schema).toBe('grimoirestack.config.v1');
      expect(parsed.exportedAt).toBeTruthy();
      expect(parsed.favorites).toEqual([]);
    });

    it('includes favorites in output', () => {
      const favs = [{ name: 'Trace Sight', skill: 'log-trace-correlation' }];
      const json = exportAsJson({ favorites: favs, marginalia: {}, recent: [] });
      const parsed = JSON.parse(json);
      expect(parsed.favorites.length).toBe(1);
      expect(parsed.favorites[0].skill).toBe('log-trace-correlation');
    });

    it('includes marginalia in output', () => {
      const marg = { 'log-trace-correlation': 'my note' };
      const json = exportAsJson({ favorites: [], marginalia: marg, recent: [] });
      const parsed = JSON.parse(json);
      expect(parsed.marginalia['log-trace-correlation']).toBe('my note');
    });
  });

  describe('exportAsMarkdown', () => {
    it('starts with a header', () => {
      const md = exportAsMarkdown({ favorites: [], marginalia: {}, recent: [] });
      expect(md.startsWith('# GrimoireStack — Personal Config')).toBe(true);
    });

    it('lists favorites with skill ID', () => {
      const favs = [{ name: 'Trace Sight', skill: 'log-trace-correlation' }];
      const md = exportAsMarkdown({ favorites: favs, marginalia: {}, recent: [] });
      expect(md).toContain('Trace Sight');
      expect(md).toContain('`log-trace-correlation`');
    });

    it('includes marginalia when present', () => {
      const marg = { 'log-trace-correlation': 'my note' };
      const md = exportAsMarkdown({ favorites: [], marginalia: marg, recent: [] });
      expect(md).toContain('my note');
    });

    it('shows empty state messages when data is empty', () => {
      const md = exportAsMarkdown({ favorites: [], marginalia: {}, recent: [] });
      expect(md).toContain('_None yet');
      expect(md).toContain('_Empty._');
      expect(md).toContain('_No notes scribbled yet._');
    });
  });

  describe('loadFavorites', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(loadFavorites()).toEqual([]);
    });

    it('parses favorites from localStorage', () => {
      mockStorage['grimoire-favorites'] = JSON.stringify([{ skill: 'test' }]);
      expect(loadFavorites()).toEqual([{ skill: 'test' }]);
    });
  });

  describe('loadMarginalia', () => {
    it('returns empty object when localStorage is empty', () => {
      expect(loadMarginalia()).toEqual({});
    });
  });

  describe('loadRecent', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(loadRecent()).toEqual([]);
    });
  });

  // ── importConfig ──────────────────────────────────────
  describe('importConfig', () => {
    it('returns null for null input', () => {
      expect(importConfig(null)).toBeNull();
      expect(importConfig(undefined)).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      expect(importConfig('not json')).toBeNull();
      expect(importConfig('{}')).toBeNull();
    });

    it('returns null for wrong schema', () => {
      expect(importConfig(JSON.stringify({ schema: 'other' }))).toBeNull();
    });

    it('normalizes malformed favorites (non-array coerced to empty)', () => {
      const bad = JSON.stringify({ schema: 'grimoirestack.config.v1', favorites: 'oops' });
      const result = importConfig(bad);
      expect(result).not.toBeNull();
      expect(result.favorites).toEqual([]);
      expect(result.marginalia).toEqual({});
      expect(result.recent).toEqual([]);
    });

    it('normalizes marginalia that is an array instead of object', () => {
      // Arrays are now explicitly rejected — they pass typeof 'object' but
      // Array.isArray guards against them, returning {} instead.
      const bad = JSON.stringify({ schema: 'grimoirestack.config.v1', marginalia: [] });
      const result = importConfig(bad);
      expect(result).not.toBeNull();
      expect(result.marginalia).toEqual({});
    });

    it('parses a valid config and returns normalized data', () => {
      const raw = JSON.stringify({
        schema: 'grimoirestack.config.v1',
        favorites: [{ name: 'X', skill: 'x', addedAt: 1 }],
        marginalia: { x: 'note' },
        recent: [{ name: 'Y', skill: 'y', viewedAt: 2 }],
      });
      const result = importConfig(raw);
      expect(result).not.toBeNull();
      expect(result.favorites).toEqual([{ name: 'X', skill: 'x', addedAt: 1 }]);
      expect(result.marginalia).toEqual({ x: 'note' });
      expect(result.recent).toEqual([{ name: 'Y', skill: 'y', viewedAt: 2 }]);
    });

    it('defaults missing fields to empty structures', () => {
      const raw = JSON.stringify({ schema: 'grimoirestack.config.v1' });
      const result = importConfig(raw);
      expect(result.favorites).toEqual([]);
      expect(result.marginalia).toEqual({});
      expect(result.recent).toEqual([]);
    });

    it('round-trips: export then import produces equivalent data', () => {
      const favs = [{ name: 'Trace Sight', skill: 'log-trace-correlation' }];
      const marg = { 'log-trace-correlation': 'my note' };
      const rec = [{ name: 'Trace Sight', skill: 'log-trace-correlation', viewedAt: 123 }];
      const json = exportAsJson({ favorites: favs, marginalia: marg, recent: rec });
      const result = importConfig(json);
      expect(result.favorites).toEqual(favs);
      expect(result.marginalia).toEqual(marg);
      expect(result.recent).toEqual(rec);
    });
  });
});
