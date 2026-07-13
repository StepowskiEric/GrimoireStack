import { grimoireIndex } from '../data/grimoireIndexInstance.ts';

let mapCache: Record<string, string> | null = null;
const mdCache = new Map<string, string>();

export function clearCache() {
  mapCache = null;
  mdCache.clear();
}

export async function fetchSkillMap(): Promise<Record<string, string>> {
  if (mapCache) return mapCache;
  try {
    const res = await fetch('/skills/_map.json');
    if (!res.ok) throw new Error('Not found');
    const data: Record<string, string> = await res.json();
    mapCache = data;
    return mapCache;
  } catch {
    mapCache = {};
    return mapCache;
  }
}

export async function fetchSkillMd(skillId: string): Promise<string> {
  if (mdCache.has(skillId)) return mdCache.get(skillId)!;
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

export function findSpell(name: string) {
  const entry = grimoireIndex.resolveByName(name);
  return entry ? { spell: entry.spell, school: entry.school } : null;
}
