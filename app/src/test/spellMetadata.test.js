import { describe, it, expect } from 'vitest';
import {
  getSpellLastUpdated,
  getSpellNote,
  isExplicitlyUpdated,
  getRecentlyUpdated,
  getChangeFeed,
  getAlphabeticalIndex,
} from '../data/spellMetadata.js';

describe('spellMetadata', () => {
  describe('getSpellLastUpdated', () => {
    it('returns a string for any known skill', () => {
      const d = getSpellLastUpdated('log-trace-correlation');
      expect(typeof d).toBe('string');
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns an explicit date for curated spells', () => {
      expect(getSpellLastUpdated('log-trace-correlation')).toBe('2026-05-22');
    });

    it('returns a deterministic fallback for unknown spells', () => {
      const a = getSpellLastUpdated('nonexistent-skill-xyz');
      const b = getSpellLastUpdated('nonexistent-skill-xyz');
      expect(a).toBe(b);
      expect(a).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns null for falsy input', () => {
      expect(getSpellLastUpdated(null)).toBeNull();
      expect(getSpellLastUpdated(undefined)).toBeNull();
      expect(getSpellLastUpdated('')).toBeNull();
    });
  });

  describe('getSpellNote', () => {
    it('returns the note for a curated spell', () => {
      expect(getSpellNote('log-trace-correlation')).toBe(
        'Polished effect description; tier unchanged.'
      );
    });

    it('returns null for spells without a note', () => {
      expect(getSpellNote('bisect-debugging')).toBeNull();
    });
  });

  describe('isExplicitlyUpdated', () => {
    it('returns true for curated spells', () => {
      expect(isExplicitlyUpdated('log-trace-correlation')).toBe(true);
    });

    it('returns false for non-curated spells', () => {
      expect(isExplicitlyUpdated('nonexistent')).toBe(false);
    });
  });

  describe('getRecentlyUpdated', () => {
    it('returns an array sorted by lastUpdated descending', () => {
      const items = getRecentlyUpdated(10);
      expect(items.length).toBeLessThanOrEqual(10);
      for (let i = 1; i < items.length; i++) {
        expect(items[i - 1].lastUpdated >= items[i].lastUpdated).toBe(true);
      }
    });

    it('each entry has required fields', () => {
      const items = getRecentlyUpdated(5);
      for (const item of items) {
        expect(item).toHaveProperty('skill');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('school');
        expect(item).toHaveProperty('lastUpdated');
        expect(item).toHaveProperty('isExplicit');
      }
    });

    it('defaults to a large limit', () => {
      const items = getRecentlyUpdated();
      expect(items.length).toBeGreaterThan(10);
    });
  });

  describe('getChangeFeed', () => {
    it('returns the same shape as getRecentlyUpdated', () => {
      const feed = getChangeFeed(5);
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getAlphabeticalIndex', () => {
    it('returns all spells sorted by name', () => {
      const items = getAlphabeticalIndex();
      expect(items.length).toBeGreaterThan(0);
      for (let i = 1; i < items.length; i++) {
        expect(
          items[i - 1].spell.name.localeCompare(items[i].spell.name) <= 0
        ).toBe(true);
      }
    });

    it('each entry has spell and school', () => {
      const items = getAlphabeticalIndex();
      expect(items[0]).toHaveProperty('spell');
      expect(items[0]).toHaveProperty('school');
    });
  });
});
