import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMarginalia } from '../hooks/useMarginalia.js';

describe('useMarginalia', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty note for unknown skill', () => {
    const { result } = renderHook(() => useMarginalia());
    expect(result.current.getNote('unknown')).toBe('');
  });

  it('saves a note for a skill', () => {
    const { result } = renderHook(() => useMarginalia());
    act(() => {
      result.current.setNote('log-trace-correlation', 'This was useful for the prod incident');
    });
    expect(result.current.getNote('log-trace-correlation')).toBe(
      'This was useful for the prod incident'
    );
  });

  it('keeps notes per skill', () => {
    const { result } = renderHook(() => useMarginalia());
    act(() => {
      result.current.setNote('a', 'note A');
      result.current.setNote('b', 'note B');
    });
    expect(result.current.getNote('a')).toBe('note A');
    expect(result.current.getNote('b')).toBe('note B');
  });

  it('clears a single note', () => {
    const { result } = renderHook(() => useMarginalia());
    act(() => {
      result.current.setNote('a', 'note A');
      result.current.clear('a');
    });
    expect(result.current.getNote('a')).toBe('');
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useMarginalia());
    act(() => {
      result.current.setNote('a', 'note A');
    });
    const stored = JSON.parse(localStorage.getItem('grimoire-marginalia'));
    expect(stored).toEqual({ a: 'note A' });
  });

  it('loads from localStorage on mount', () => {
    localStorage.setItem('grimoire-marginalia', JSON.stringify({ x: 'pre-existing' }));
    const { result } = renderHook(() => useMarginalia());
    expect(result.current.getNote('x')).toBe('pre-existing');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('grimoire-marginalia', 'not-json');
    const { result } = renderHook(() => useMarginalia());
    expect(result.current.getNote('a')).toBe('');
  });
});
