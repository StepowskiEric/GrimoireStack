import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';

describe('useRecentlyViewed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recent).toEqual([]);
  });

  it('records a spell view', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      result.current.record('Trace Sight', 'log-trace-correlation');
    });
    expect(result.current.recent).toHaveLength(1);
    expect(result.current.recent[0]).toMatchObject({
      name: 'Trace Sight',
      skill: 'log-trace-correlation',
    });
  });

  it('moves an existing spell to the front on re-record', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      result.current.record('A', 'a');
      result.current.record('B', 'b');
      result.current.record('A', 'a');
    });
    expect(result.current.recent[0].skill).toBe('a');
    expect(result.current.recent[1].skill).toBe('b');
    expect(result.current.recent).toHaveLength(2);
  });

  it('caps history at 20', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.record(`Spell ${i}`, `skill-${i}`);
      }
    });
    expect(result.current.recent).toHaveLength(20);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      result.current.record('Trace Sight', 'log-trace-correlation');
    });
    const stored = JSON.parse(localStorage.getItem('grimoire-recent'));
    expect(stored).toHaveLength(1);
    expect(stored[0].skill).toBe('log-trace-correlation');
  });

  it('loads from localStorage on mount', () => {
    localStorage.setItem(
      'grimoire-recent',
      JSON.stringify([{ name: 'X', skill: 'x', viewedAt: 1 }]),
    );
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recent).toHaveLength(1);
    expect(result.current.recent[0].skill).toBe('x');
  });

  it('clears history', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    act(() => {
      result.current.record('A', 'a');
      result.current.clear();
    });
    expect(result.current.recent).toEqual([]);
  });
});
