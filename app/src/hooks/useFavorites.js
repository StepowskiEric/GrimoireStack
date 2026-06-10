import { useState, useEffect, useCallback } from 'react';
import { spellCatalog } from '../data/spellCatalogInstance.js';

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
    setFavorites((prev) => {
      const exists = prev.some((f) => f.skill === skill);
      if (exists) return prev.filter((f) => f.skill !== skill);
      if (prev.length >= 12) return prev;
      return [...prev, { name: spellName, skill, addedAt: Date.now() }];
    });
  }, []);

  const findFavoriteSpell = useCallback((skill) => {
    const entry = spellCatalog.resolveBySkill(skill);
    if (!entry) return null;
    return { spell: entry.spell, school: entry.school };
  }, []);

  return { favorites, isFavorited, toggleFavorite, findFavoriteSpell };
}
