import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock audio functions
vi.mock('../audio/sounds.js', () => ({
  castTear: vi.fn(),
  castBoom: vi.fn(),
  castScratch: vi.fn(),
  castThud: vi.fn(),
}));

import { castTear, castBoom, castScratch, castThud } from '../audio/sounds.js';

beforeEach(() => {
  vi.clearAllMocks();

  // Default: no reduced motion
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((q) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useEldritchCast', () => {
  it('starts in wake phase', () => {
    const { result } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });
    expect(result.current.phase).toBe('wake');
    expect(result.current.reduced).toBe(false);
    expect(result.current.canSkip).toBe(false);
  });

  it('respects prefers-reduced-motion', () => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q === '(prefers-reduced-motion: reduce)',
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });

    expect(result.current.phase).toBe('reduced');
    expect(result.current.reduced).toBe(true);
  });

  it('canSkip is false by default', () => {
    const { result } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });
    expect(result.current.canSkip).toBe(false);
  });

  it('handleSkip is a function', () => {
    const { result } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });
    expect(typeof result.current.handleSkip).toBe('function');
  });

  it('handleSkip is a callback that can be invoked', () => {
    const { result } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });
    // handleSkip should not throw when called (even if elapsed < SKIP_AFTER)
    expect(() => act(() => result.current.handleSkip())).not.toThrow();
  });

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });

    unmount();
    // The hook removes the keydown listener on cleanup
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('registers a keydown listener for Escape', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('exports expected properties', () => {
    const { result } = renderHook(() => {
      const mod = require('../hooks/useEldritchCast.js');
      return mod.useEldritchCast({ onComplete: vi.fn() });
    });

    expect(result.current).toHaveProperty('phase');
    expect(result.current).toHaveProperty('reduced');
    expect(result.current).toHaveProperty('canSkip');
    expect(result.current).toHaveProperty('handleSkip');
  });
});
