import { useState, useEffect, useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

const STORAGE_KEY = 'grimoire-favorites';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(favs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {}
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load);

  useEffect(() => {
    save(favorites);
  }, [favorites]);

  const isFavorited = useCallback(
    (skill) => favorites.some((f) => f.skill === skill),
    [favorites]
  );

  const toggleFavorite = useCallback((spellName, skill) => {
    let added = false;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.skill === skill);
      if (exists) return prev.filter((f) => f.skill !== skill);
      if (prev.length >= 12) return prev;
      added = true;
      return [...prev, { name: spellName, skill, addedAt: Date.now() }];
    });
    // Return false if at cap, true if added/removed
    const alreadyFav = favorites.some((f) => f.skill === skill);
    if (alreadyFav) return true; // removed successfully
    return added; // true if added, false if capped
  }, [favorites]);

  const findFavoriteSpell = useCallback((skill) => {
    const entry = grimoireIndex.resolveBySkill(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  }, []);

  return { favorites, isFavorited, toggleFavorite, findFavoriteSpell, setFavorites };
}
