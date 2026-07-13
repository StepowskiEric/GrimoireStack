import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGaze } from './useGaze.js';

describe('useGaze', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns band 0 at idle with no dwell', () => {
    const { result } = renderHook(() => useGaze({ state: 'idle', round: 0 }));
    expect(result.current.gaze).toBe(0);
  });

  it('climbs in bands as dwell accrues', () => {
    const { result } = renderHook(() => useGaze({ state: 'idle', round: 0 }));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    // ~0.4s dwell → ramp ≈ 0.004 → band 0
    expect(result.current.gaze).toBe(0);
    act(() => {
      vi.setSystemTime(30_000);
      vi.advanceTimersByTime(400);
    });
    // ~30s dwell → ramp ≈ 0.237 → band 0.2
    expect(result.current.gaze).toBe(0.2);
  });

  it('reflects ritual progress immediately', () => {
    const { result } = renderHook(() => useGaze({ state: 'converged', round: 3 }));
    // 0.05 + 0.42 + 0.1 = 0.57 → band 0.6
    expect(result.current.gaze).toBe(0.6);
  });
});
