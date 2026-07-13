/**
 * skillContent — fetch skill map index and markdown content.
 */
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

let mapCache = null;
const mdCache = new Map();

/** Clear all cached skill map and markdown data. Call when content may have changed. */
export function clearCache() {
  mapCache = null;
  mdCache.clear();
}

export async function fetchSkillMap() {
  if (mapCache) return mapCache;
  try {
    const res = await fetch('/skills/_map.json');
    if (!res.ok) throw new Error('Not found');
    mapCache = await res.json();
    return mapCache;
  } catch {
    mapCache = {};
    return mapCache;
  }
}

/** Fetch raw markdown text for a skill. Returns '' on failure. */
export async function fetchSkillMd(skillId) {
  if (mdCache.has(skillId)) return mdCache.get(skillId);
  const map = await fetchSkillMap();
  const path = map[skillId];
  if (!path) {
    mdCache.set(skillId, '');
    return '';
  }
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found');
    const text = await res.text();
    mdCache.set(skillId, text);
    return text;
  } catch {
    mdCache.set(skillId, '');
    return '';
  }
}

export function findSpell(name) {
  const entry = grimoireIndex.resolveByName(name);
  return entry ? { spell: entry.spell, school: entry.school } : null;
}
