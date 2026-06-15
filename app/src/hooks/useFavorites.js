import { useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { useLocalStorageState } from './useLocalStorageState.js';

const STORAGE_KEY = 'grimoire-favorites';
const MAX_FAVORITES = 12;

export function useFavorites() {
  const { value: favorites, setValue: setFavorites } = useLocalStorageState({
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
    (skill) => favorites.some((f) => f.skill === skill),
    [favorites]
  );

  const toggleFavorite = useCallback((spellName, skill) => {
    let capped = false;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.skill === skill);
      if (exists) return prev.filter((f) => f.skill !== skill);
      if (prev.length >= MAX_FAVORITES) {
        capped = true;
        return prev;
      }
      return [...prev, { name: spellName, skill, addedAt: Date.now() }];
    });
    return !capped; // true if added or removed, false if capped
  }, [setFavorites]);

  const findFavoriteSpell = useCallback((skill) => {
    const entry = grimoireIndex.resolveBySkill(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  }, []);

  return { favorites, isFavorited, toggleFavorite, findFavoriteSpell, setFavorites };
}
