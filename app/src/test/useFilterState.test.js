import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterState } from '../hooks/useFilterState.js';

const sampleSchools = [
  {
    id: 'debugging',
    name: 'School of Remediation',
    real: 'Debugging',
    spells: [
      { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Maps stack traces.', status: 'Proven' },
      { name: 'Bisect Divination', skill: 'bisect-debugging', effect: 'Binary searches commits.', status: 'MCP' },
    ],
  },
  {
    id: 'testing',
    name: 'School of Validation',
    real: 'Testing',
    spells: [
      { name: 'Jest Invocation', skill: 'jest-testing', effect: 'Write correct Jest tests.', status: 'New' },
    ],
  },
];

describe('useFilterState', () => {
  it('starts with empty filters and all spells visible', () => {
    const isFavorited = vi.fn(() => false);
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));
    expect(result.current.query).toBe('');
    expect(result.current.debounced).toBe('');
    // Empty query + no filters = all spells (per filterSpells semantics)
    expect(result.current.results.total).toBe(3);
    expect(result.current.searchResults.total).toBe(0);
    expect(result.current.schoolFilter.size).toBe(0);
    expect(result.current.tierFilter.size).toBe(0);
    expect(result.current.favoritesOnly).toBe(false);
  });

  it('toggles school filter without debounce', () => {
    const isFavorited = vi.fn(() => false);
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));
    expect(result.current.schoolFilter.has('debugging')).toBe(false);

    act(() => { result.current.toggleSchool('debugging'); });
    expect(result.current.schoolFilter.has('debugging')).toBe(true);
    expect(result.current.results.total).toBe(2);

    act(() => { result.current.toggleSchool('debugging'); });
    expect(result.current.schoolFilter.has('debugging')).toBe(false);
    // Empty set is passed directly to filterSpells (no filter) so all 3 show
    expect(result.current.results.total).toBe(3);
  });

  it('toggles tier filter without debounce', () => {
    const isFavorited = vi.fn(() => false);
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));

    act(() => { result.current.toggleTier('adept'); });
    expect(result.current.tierFilter.has('adept')).toBe(true);
    // 'Proven' -> adept, 'MCP' -> master, 'New' -> apprentice
    expect(result.current.results.total).toBe(1);
  });

  it('toggles favorites-only without debounce', () => {
    const isFavorited = vi.fn(() => false);
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));
    expect(result.current.favoritesOnly).toBe(false);

    act(() => { result.current.toggleFavorites(); });
    expect(result.current.favoritesOnly).toBe(true);
    expect(result.current.results.total).toBe(0); // nothing favorited
  });

  it('clearAll resets filters without touching query', () => {
    const isFavorited = vi.fn(() => false);
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));

    act(() => {
      result.current.toggleSchool('debugging');
      result.current.toggleTier('adept');
      result.current.toggleFavorites();
      result.current.setQuery('jest');
    });

    // School + tier + favoritesOnly: 0 matches
    expect(result.current.results.total).toBe(0);

    act(() => { result.current.clearAll(); });
    expect(result.current.schoolFilter.size).toBe(0);
    expect(result.current.tierFilter.size).toBe(0);
    expect(result.current.favoritesOnly).toBe(false);
    expect(result.current.query).toBe('jest'); // query NOT cleared
    // After clearAll, no filters active => all 3 spells match
    expect(result.current.results.total).toBe(3);
  });

  it('passes isFavorited through to filterSpells', () => {
    const isFavorited = vi.fn((skill) => skill === 'log-trace-correlation');
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));

    act(() => { result.current.toggleFavorites(); });
    expect(result.current.results.total).toBe(1);
    expect(result.current.results.bySchool.debugging[0]).toContain('log-trace-correlation');
  });

  it('setQuery updates the live query state', () => {
    const isFavorited = vi.fn(() => false);
    const { result } = renderHook(() => useFilterState(sampleSchools, isFavorited));

    act(() => { result.current.setQuery('trace'); });
    expect(result.current.query).toBe('trace');
    expect(result.current.debounced).toBe(''); // not yet debounced
  });
});
