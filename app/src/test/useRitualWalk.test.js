import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRitualWalk } from '../hooks/useRitualWalk.ts';

let perfNow = 0;
beforeEach(() => {
  vi.useFakeTimers();
  perfNow = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = setTimeout(() => {
      perfNow += 16;
      cb(perfNow);
    }, 16);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  vi.spyOn(performance, 'now').mockImplementation(() => perfNow);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useRitualWalk', () => {
  it('starts in idle phase', () => {
    const { result } = renderHook(() => useRitualWalk({}));
    expect(result.current.phase).toBe('idle');
    expect(result.current.targetSkill).toBeNull();
    expect(result.current.scrollProgress).toBe(0);
  });

  it('transitions to dimming on start, then walking after timeout', () => {
    const navigateToLibrary = vi.fn();
    const { result } = renderHook(() => useRitualWalk({ navigateToLibrary }));

    act(() => {
      result.current.start({ skill: 'test-skill', school: 'testing' });
    });

    expect(result.current.phase).toBe('dimming');
    expect(result.current.targetSkill).toEqual({ skill: 'test-skill', school: 'testing' });
    expect(navigateToLibrary).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.phase).toBe('walking');
  });

  it('transitions to arriving when card is found in viewport', () => {
    const mockCard = {
      getBoundingClientRect: () => ({ top: 100, bottom: 300 }),
    };
    document.querySelector = vi.fn().mockReturnValue(mockCard);

    const { result } = renderHook(() => useRitualWalk({}));
    act(() => {
      result.current.start({ skill: 'test-skill', school: 'testing' });
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.phase).toBe('walking');

    // Advance past the 2500ms scroll duration in 16ms rAF steps
    for (let i = 0; i < 200; i++) {
      act(() => {
        vi.advanceTimersByTime(16);
      });
    }
    // The rAF sets 'arriving', then the 400ms timer immediately fires and sets 'done'
    expect(result.current.phase).toBe('done');
  });

  it('transitions to arriving when card is not found and progress >= 1', () => {
    document.querySelector = vi.fn().mockReturnValue(null);

    const { result } = renderHook(() => useRitualWalk({}));
    act(() => {
      result.current.start({ skill: 'test-skill', school: 'testing' });
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    for (let i = 0; i < 200; i++) {
      act(() => {
        vi.advanceTimersByTime(16);
      });
    }
    expect(result.current.phase).toBe('done');
  });

  it('transitions to done and calls onComplete after arriving', () => {
    const onComplete = vi.fn();
    const mockCard = {
      getBoundingClientRect: () => ({ top: 100, bottom: 300 }),
    };
    document.querySelector = vi.fn().mockReturnValue(mockCard);

    const { result } = renderHook(() => useRitualWalk({ onComplete }));
    act(() => {
      result.current.start({ skill: 'test-skill', school: 'testing' });
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    for (let i = 0; i < 200; i++) {
      act(() => {
        vi.advanceTimersByTime(16);
      });
    }
    expect(result.current.phase).toBe('done');
    expect(onComplete).toHaveBeenCalledWith({ skill: 'test-skill', school: 'testing' });
  });

  it('reset returns to idle', () => {
    const { result } = renderHook(() => useRitualWalk({}));
    act(() => {
      result.current.start({ skill: 's', school: 'sc' });
    });
    expect(result.current.phase).toBe('dimming');

    act(() => result.current.reset());
    expect(result.current.phase).toBe('idle');
    expect(result.current.targetSkill).toBeNull();
    expect(result.current.scrollProgress).toBe(0);
  });
});
