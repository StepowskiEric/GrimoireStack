/**
 * changeFeed — Spell changelog / feed helpers.
 *
 * Reads the auto-generated EXPLICIT map from spellMetadata.js and
 * computes changelog views (recently updated, per-spell date/note lookups).
 */

import { grimoireIndex } from './grimoireIndexInstance.js';
import { EXPLICIT } from './spellMetadata.js';

const EXPLICIT_MAP = EXPLICIT as Record<string, { lastUpdated?: string; note?: string } | undefined>;

const ISO = (date: Date) => date.toISOString().slice(0, 10);

function hashStringToInt(str: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}

function deterministicDate(skill: string): string {
  const h = hashStringToInt(skill);
  const daysAgo = 30 + (h % 300);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return ISO(d);
}

export function getSpellLastUpdated(skill: string): string | null {
  if (!skill) return null;
  const explicit = EXPLICIT_MAP[skill];
  if (explicit?.lastUpdated) return explicit.lastUpdated;
  return deterministicDate(skill);
}

export function getSpellNote(skill: string): string | null {
  if (!skill) return null;
  return EXPLICIT_MAP[skill]?.note || null;
}

export function isExplicitlyUpdated(skill: string): boolean {
  return !!EXPLICIT_MAP[skill];
}

export interface ChangeFeedItem {
  skill: string;
  name: string;
  spell: unknown;
  school: unknown;
  lastUpdated: string | null;
  isExplicit: boolean;
  note: string | null;
  status: string | undefined;
}

export function getRecentlyUpdated(limit = 12): ChangeFeedItem[] {
  return (grimoireIndex as any)
    .allEntries()
    .map(({ spell, school }: any) => ({
      skill: spell.skill,
      name: spell.name,
      spell,
      school,
      lastUpdated: getSpellLastUpdated(spell.skill),
      isExplicit: isExplicitlyUpdated(spell.skill),
      note: getSpellNote(spell.skill),
      status: spell.status,
    }))
    .sort((a: ChangeFeedItem, b: ChangeFeedItem) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''))
    .slice(0, limit);
}

export function getNewlyAdded(limit = 30): ChangeFeedItem[] {
  return getRecentlyUpdated(limit)
    .filter((item) => item.status === 'New')
    .slice(0, limit);
}

export function getUpdated(limit = 30): ChangeFeedItem[] {
  return getRecentlyUpdated(limit)
    .filter((item) => item.isExplicit && item.status !== 'New')
    .slice(0, limit);
}
