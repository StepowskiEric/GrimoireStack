import { describe, expect, it } from 'vitest';
import {
  getRecentlyUpdated,
  getSpellLastUpdated,
  getSpellNote,
  isExplicitlyUpdated,
} from '../data/changeFeed.js';

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
        'Polished effect description; tier unchanged.',
      );
    });

    it('returns null for spells without a note', () => {
      // accelerate-ai has no note in the curated overlay
      expect(getSpellNote('accelerate-ai')).toBeNull();
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

  describe('coverage', () => {
    // These guard against the bug where a new skill was added to
    // spellMetadata.js but the schools[] entry was missing, making the
    // skill invisible to the changelog (which iterates schools[]).
    it('every explicit spellMetadata entry has a matching schools[] spell', async () => {
      const { default: schools } = await import('../data/schools.js');
      const catalogSkills = new Set(schools.flatMap((s) => s.spells.map((sp) => sp.skill)));
      // Extract just the skill keys from EXPLICIT (we re-read the file to avoid
      // a circular import that would require restructuring the module).
      const fs = await import('node:fs');
      const path = await import('node:path');
      const url = await import('node:url');
      const here = path.dirname(url.fileURLToPath(import.meta.url));
      const src = fs.readFileSync(path.resolve(here, '..', 'data', 'spellMetadata.js'), 'utf8');
      const explicitKeys = new Set(
        Array.from(src.matchAll(/'([a-z0-9-]+)':\s*\{\s*lastUpdated:/g)).map((m) => m[1]),
      );
      const orphans = [...explicitKeys].filter((k) => !catalogSkills.has(k));
      expect(orphans).toEqual([]);
    });
  });
});
