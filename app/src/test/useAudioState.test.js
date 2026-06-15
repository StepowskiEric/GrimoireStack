import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioState } from '../hooks/useAudioState.js';

describe('useAudioState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('AudioContext', class { resume() {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initial state', () => {
    it('defaults to true when localStorage has no entry', () => {
      const { result } = renderHook(() => useAudioState());
      expect(result.current.audioEnabled).toBe(true);
    });

    it('reads "off" from localStorage as disabled', () => {
      localStorage.setItem('grimoire-audio', 'off');
      const { result } = renderHook(() => useAudioState());
      expect(result.current.audioEnabled).toBe(false);
    });

    it('reads "on" from localStorage as enabled', () => {
      localStorage.setItem('grimoire-audio', 'on');
      const { result } = renderHook(() => useAudioState());
      expect(result.current.audioEnabled).toBe(true);
    });

    it('returns a toggleAudio function', () => {
      const { result } = renderHook(() => useAudioState());
      expect(typeof result.current.toggleAudio).toBe('function');
    });
  });

  describe('toggleAudio', () => {
    it('flips audioEnabled from true to false', () => {
      const { result } = renderHook(() => useAudioState());
      expect(result.current.audioEnabled).toBe(true);
      act(() => result.current.toggleAudio());
      expect(result.current.audioEnabled).toBe(false);
    });

    it('flips audioEnabled from false to true', () => {
      localStorage.setItem('grimoire-audio', 'off');
      const { result } = renderHook(() => useAudioState());
      expect(result.current.audioEnabled).toBe(false);
      act(() => result.current.toggleAudio());
      expect(result.current.audioEnabled).toBe(true);
    });

    it('persists toggle to localStorage', () => {
      const { result } = renderHook(() => useAudioState());
      act(() => result.current.toggleAudio());
      expect(localStorage.getItem('grimoire-audio')).toBe('off');
      act(() => result.current.toggleAudio());
      expect(localStorage.getItem('grimoire-audio')).toBe('on');
    });

    it('toggleAudio is stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useAudioState());
      const first = result.current.toggleAudio;
      rerender();
      expect(result.current.toggleAudio).toBe(first);
    });
  });

  describe('cleanup', () => {
    it('unmounts without errors', () => {
      const { unmount } = renderHook(() => useAudioState());
      expect(() => unmount()).not.toThrow();
    });
  });
});
