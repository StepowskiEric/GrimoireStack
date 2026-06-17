import { useState, useMemo, useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { useDebouncedValue } from './useDebouncedValue.js';
import { useFavorites } from './useFavorites.js';

const DEBOUNCE_MS = 120;

/**
 * useFilterState — owns all filter UI state for the grimoire.
 *
 * @param {{ searchSpells?: Function, filterSpells?: Function }} opts
 * @param {Function} [opts.grimoireIndex] — index to query; defaults to the singleton.
 *
 * Interface:
 *   query       — current live search string
 *   results     — { bySchool, total } derived from debounced query + filters
 *   schoolFilter, tierFilter — Set instances the UI toggles
 *   favoritesOnly — boolean
 *   toggleSchool(id) / toggleTier(key) / toggleFavorites() / clearAll()
 *   isFavorited(skill) — convenience passthrough
 */

export function useFilterState({ grimoireIndex: index = grimoireIndex } = {}) {
  const { isFavorited } = useFavorites();

  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);
  const [schoolFilter, setSchoolFilter] = useState(() => new Set());
  const [tierFilter, setTierFilter] = useState(() => new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Search results (text only, no filters) — used for the total-match count.
  const searchResults = useMemo(
    () => index.searchSpells(debounced),
    [debounced, index]
  );

  // Filtered results — text + school + tier + favorites.
  const results = useMemo(
    () => index.filterSpells({
      query: debounced,
      schoolFilter: schoolFilter.size > 0 ? schoolFilter : null,
      tierFilter: tierFilter.size > 0 ? tierFilter : null,
      favoritesOnly,
      isFavorited,
    }),
    [debounced, schoolFilter, tierFilter, favoritesOnly, isFavorited, index]
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
    isFavorited,
  };
}
