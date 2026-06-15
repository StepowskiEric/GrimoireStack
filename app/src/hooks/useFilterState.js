import { useState, useMemo, useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { useDebouncedValue } from './useDebouncedValue.js';

const DEBOUNCE_MS = 120;

/**
 * useFilterState — owns all filter UI state for the grimoire.
 *
 * Interface:
 *   query       — current live search string (what the user typed)
 *   results     — { bySchool, total } derived from debounced query + filters
 *   schoolFilter, tierFilter — Set instances the UI toggles
 *   favoritesOnly — boolean
 *   toggleSchool(id)  — add/remove a school from the filter set
 *   toggleTier(key)   — add/remove a tier from the filter set
 *   toggleFavorites() — flip favorites-only mode
 *   clearAll()        — reset every filter to empty
 *   isFavorited(skill) — lookup helper passed through to filterSpells
 *
 * The 120ms debounce is internal; callers only see `query` update on
 * every keystroke and `results` update after debounce settles.
 *
 * No schools parameter — grimoireIndex owns its own validated data.
 */

export function useFilterState(getFavorited, debounceMs = DEBOUNCE_MS) {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, debounceMs);
  const [schoolFilter, setSchoolFilter] = useState(() => new Set());
  const [tierFilter, setTierFilter] = useState(() => new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Search results (text only, no filters) — used for the total-match count.
  const searchResults = useMemo(
    () => grimoireIndex.searchSpells(debounced),
    [debounced]
  );

  // Filtered results — text + school + tier + favorites.
  const results = useMemo(
    () => grimoireIndex.filterSpells({
      query: debounced,
      schoolFilter: schoolFilter.size > 0 ? schoolFilter : null,
      tierFilter: tierFilter.size > 0 ? tierFilter : null,
      favoritesOnly,
      isFavorited: getFavorited,
    }),
    [debounced, schoolFilter, tierFilter, favoritesOnly, getFavorited]
  );

  const toggleSchool = useCallback((id) => {
    setSchoolFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleTier = useCallback((key) => {
    setTierFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const toggleFavorites = useCallback(() => {
    setFavoritesOnly((v) => !v);
  }, []);

  const clearAll = useCallback(() => {
    setSchoolFilter(new Set());
    setTierFilter(new Set());
    setFavoritesOnly(false);
  }, []);

  return {
    query,
    setQuery,
    debounced,
    searchResults,
    results,
    schoolFilter,
    tierFilter,
    favoritesOnly,
    toggleSchool,
    toggleTier,
    toggleFavorites,
    clearAll,
    // Convenience: the layout and App both need this for SpellCard etc.
    isFavorited: getFavorited,
  };
}
