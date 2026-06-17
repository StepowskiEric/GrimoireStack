import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const entries = [
  { spell: { name: 'Trace Sight', skill: 'trace', effect: 'Stack traces.', status: 'Proven' }, school: { id: 'debugging', real: 'Debugging' } },
  { spell: { name: 'Bisect Divination', skill: 'bisect', effect: 'Binary search.', status: 'MCP' }, school: { id: 'debugging', real: 'Debugging' } },
  { spell: { name: 'Jest Invocation', skill: 'jest', effect: 'Write tests.', status: 'New' }, school: { id: 'testing', real: 'Testing' } },
];

const tierMap = { 'Proven': 'adept', 'MCP': 'master', 'New': 'apprentice' };

function makeIndex() {
  return {
    searchSpells(query) {
      if (!query) return { bySchool: {}, total: 0 };
      const q = query.toLowerCase();
      const bySchool = {};
      let total = 0;
      for (const { spell, school } of entries) {
        const searchable = `${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase();
        if (searchable.includes(q)) {
          const list = bySchool[school.id] || [];
          list.push(spell.name + '\0' + spell.skill);
          bySchool[school.id] = list;
          total++;
        }
      }
      return { bySchool, total };
    },
    filterSpells(opts = {}) {
      const { query = '', schoolFilter = null, tierFilter = null, favoritesOnly = false, isFavorited = () => false } = opts;
      if (schoolFilter && schoolFilter.size === 0) return { bySchool: {}, total: 0 };
      if (tierFilter && tierFilter.size === 0) return { bySchool: {}, total: 0 };
      const q = query.toLowerCase();
      const bySchool = {};
      let total = 0;
      for (const { spell, school } of entries) {
        if (schoolFilter && !schoolFilter.has(school.id)) continue;
        if (q) {
          const searchable = `${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase();
          if (!searchable.includes(q)) continue;
        }
        const tier = tierMap[spell.status] || 'faded';
        if (tierFilter && !tierFilter.has(tier)) continue;
        if (favoritesOnly && !isFavorited(spell.skill)) continue;
        const list = bySchool[school.id] || [];
        list.push(spell.name + '\0' + spell.skill);
        bySchool[school.id] = list;
        total++;
      }
      return { bySchool, total };
    },
  };
}

import { useFilterState } from '../hooks/useFilterState.js';

const mockIndex = makeIndex();

describe('useFilterState', () => {
  it('starts with empty filters and all spells visible', () => {
    const { result } = renderHook(() => useFilterState({ grimoireIndex: mockIndex }));
    expect(result.current.query).toBe('');
    expect(result.current.debounced).toBe('');
    expect(result.current.results.total).toBe(3);
    expect(result.current.searchResults.total).toBe(0);
    expect(result.current.schoolFilter.size).toBe(0);
    expect(result.current.tierFilter.size).toBe(0);
    expect(result.current.favoritesOnly).toBe(false);
  });

  it('toggles school filter without debounce', () => {
    const { result } = renderHook(() => useFilterState({ grimoireIndex: mockIndex }));
    expect(result.current.schoolFilter.has('debugging')).toBe(false);

    act(() => { result.current.toggleSchool('debugging'); });
    expect(result.current.schoolFilter.has('debugging')).toBe(true);
    expect(result.current.results.total).toBe(2);

    act(() => { result.current.toggleSchool('debugging'); });
    expect(result.current.schoolFilter.has('debugging')).toBe(false);
    expect(result.current.results.total).toBe(3);
  });

  it('toggles tier filter without debounce', () => {
    const { result } = renderHook(() => useFilterState({ grimoireIndex: mockIndex }));

    act(() => { result.current.toggleTier('adept'); });
    expect(result.current.tierFilter.has('adept')).toBe(true);
    expect(result.current.results.total).toBe(1);
  });

  it('toggles favorites-only without debounce', () => {
    const { result } = renderHook(() => useFilterState({ grimoireIndex: mockIndex }));
    expect(result.current.favoritesOnly).toBe(false);

    act(() => { result.current.toggleFavorites(); });
    expect(result.current.favoritesOnly).toBe(true);
    expect(result.current.results.total).toBe(0);
  });

  it('clearAll resets filters without touching query', () => {
    const { result } = renderHook(() => useFilterState({ grimoireIndex: mockIndex }));

    act(() => {
      result.current.toggleSchool('debugging');
      result.current.toggleTier('adept');
      result.current.toggleFavorites();
      result.current.setQuery('jest');
    });

    expect(result.current.results.total).toBe(0);

    act(() => { result.current.clearAll(); });
    expect(result.current.schoolFilter.size).toBe(0);
    expect(result.current.tierFilter.size).toBe(0);
    expect(result.current.favoritesOnly).toBe(false);
    expect(result.current.query).toBe('jest');
    expect(result.current.results.total).toBe(3);
  });

  it('setQuery updates the live query state', () => {
    const { result } = renderHook(() => useFilterState({ grimoireIndex: mockIndex }));

    act(() => { result.current.setQuery('trace'); });
    expect(result.current.query).toBe('trace');
    expect(result.current.debounced).toBe('');
  });
});
