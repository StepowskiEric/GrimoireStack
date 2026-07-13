import { useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.ts';
import { useLocalStorageState } from './useLocalStorageState.ts';

const STORAGE_KEY = 'grimoire-favorites';

export interface FavoriteEntry {
  skill: string;
  name: string;
  addedAt: number;
}

export function useFavorites() {
  const { value: favorites, setValue: setFavorites } = useLocalStorageState<FavoriteEntry[]>({
    key: STORAGE_KEY,
    initial: () => [],
    parse: (raw) => {
      if (!raw) return [];
      try {
        const v = JSON.parse(raw);
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    },
  });

  const isFavorited = useCallback(
    (...args: [string, string] | [string]) => {
      const skill = args[1] ?? args[0];
      return favorites.some((f: FavoriteEntry) => f.skill === skill);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    (spellName: string, skill: string) => {
      setFavorites((prev: FavoriteEntry[]) => {
        const exists = prev.some((f) => f.skill === skill);
        if (exists) return prev.filter((f) => f.skill !== skill);
        return [...prev, { name: spellName, skill, addedAt: Date.now() }];
      });
      return true;
    },
    [setFavorites],
  );

  const findFavoriteSpell = useCallback((skill: string) => {
    const entry = grimoireIndex.resolveBySkill(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  }, []);

  return { favorites, isFavorited, toggleFavorite, findFavoriteSpell, setFavorites };
}
