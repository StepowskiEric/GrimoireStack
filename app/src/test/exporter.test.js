import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportAsJson,
  exportAsMarkdown,
  loadFavorites,
  loadMarginalia,
  loadRecent,
} from '../utils/exporter.js';

const mockStorage = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key) => mockStorage[key] ?? null,
        setItem: (key, val) => { mockStorage[key] = String(val); },
        removeItem: (key) => { delete mockStorage[key]; },
        clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
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
});
