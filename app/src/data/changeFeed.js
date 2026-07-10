/**
 * changeFeed.js — Spell changelog / feed helpers.
 *
 * Reads the auto-generated EXPLICIT map from spellMetadata.js and
 * computes changelog views (recently updated, per-spell date/note lookups).
 * Hand-edited. The auto-generator only writes the data file
 * (spellMetadata.js); this file owns the read-side behavior.
 */

import { grimoireIndex } from './grimoireIndexInstance.js';
import { EXPLICIT } from './spellMetadata.js';

const ISO = (date) => date.toISOString().slice(0, 10);

function hashStringToInt(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deterministicDate(skill) {
  const h = hashStringToInt(skill);
  const daysAgo = 30 + (h % 300);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return ISO(d);
}

export function getSpellLastUpdated(skill) {
  if (!skill) return null;
  const explicit = EXPLICIT[skill];
  if (explicit?.lastUpdated) return explicit.lastUpdated;
  return deterministicDate(skill);
}

export function getSpellNote(skill) {
  if (!skill) return null;
  return EXPLICIT[skill]?.note || null;
}

export function isExplicitlyUpdated(skill) {
  return !!EXPLICIT[skill];
}

export function getRecentlyUpdated(limit = 12) {
  return grimoireIndex.allEntries()
    .map(({ spell, school }) => ({
      skill: spell.skill,
      name: spell.name,
      spell,
      school,
      lastUpdated: getSpellLastUpdated(spell.skill),
      isExplicit: isExplicitlyUpdated(spell.skill),
      note: getSpellNote(spell.skill),
      status: spell.status,
    }))
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function getChangeFeed(limit = 30) {
  return getRecentlyUpdated(limit);
}

export function getNewlyAdded(limit = 30) {
  return getRecentlyUpdated(limit)
    .filter((item) => item.status === 'New')
    .slice(0, limit);
}

export function getUpdated(limit = 30) {
  return getRecentlyUpdated(limit)
    .filter((item) => item.isExplicit && item.status !== 'New')
    .slice(0, limit);
}

export function getAlphabeticalIndex() {
  return grimoireIndex.allEntries()
    .slice()
    .sort((a, b) => a.spell.name.localeCompare(b.spell.name));
}
