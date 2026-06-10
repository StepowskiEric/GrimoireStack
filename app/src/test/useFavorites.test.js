import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../hooks/useFavorites.js';

const sampleSchools = [
  {
    id: 'debugging',
    spells: [
      { name: 'Trace Sight', skill: 'log-trace-correlation' },
      { name: 'Debug Familiar', skill: 'debug-subagent' },
    ],
  },
];

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorited('any-skill')).toBe(false);
  });

  it('adds a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('Trace Sight', 'log-trace-correlation');
    });
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].name).toBe('Trace Sight');
    expect(result.current.isFavorited('log-trace-correlation')).toBe(true);
  });

  it('removes a favorite when toggled again', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('Trace Sight', 'log-trace-correlation');
    });
    act(() => {
      result.current.toggleFavorite('Trace Sight', 'log-trace-correlation');
    });
    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorited('log-trace-correlation')).toBe(false);
  });

  it('stores favorites in localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('Trace Sight', 'log-trace-correlation');
    });
    const stored = JSON.parse(localStorage.getItem('grimoire-favorites'));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Trace Sight');
    expect(stored[0].skill).toBe('log-trace-correlation');
  });

  it('loads favorites from localStorage on mount', () => {
    localStorage.setItem(
      'grimoire-favorites',
      JSON.stringify([{ name: 'Debug Familiar', skill: 'debug-subagent', addedAt: Date.now() }])
    );
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorited('debug-subagent')).toBe(true);
  });

  it('caps favorites at 12', () => {
    const { result } = renderHook(() => useFavorites());
    for (let i = 0; i < 14; i++) {
      act(() => {
        result.current.toggleFavorite(`Spell ${i}`, `skill-${i}`);
      });
    }
    expect(result.current.favorites).toHaveLength(12);
  });

  it('finds a favorite spell across schools', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggleFavorite('Trace Sight', 'log-trace-correlation');
    });
    const found = result.current.findFavoriteSpell('log-trace-correlation', sampleSchools);
    expect(found).not.toBeNull();
    expect(found.spell.name).toBe('Trace Sight');
  });

  it('returns null when favorite spell is not found', () => {
    const { result } = renderHook(() => useFavorites());
    const found = result.current.findFavoriteSpell('unknown-skill', sampleSchools);
    expect(found).toBeNull();
  });
});
