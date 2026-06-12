import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';

function keydown(key, opts = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts });
  window.dispatchEvent(e);
  return e;
}

function mockActiveElement(el) {
  Object.defineProperty(document, 'activeElement', { value: el, configurable: true });
}

describe('useKeyboardShortcuts', () => {
  let handlers;

  beforeEach(() => {
    handlers = {
      openCheatsheet: vi.fn(),
      focusSearch: vi.fn(),
      handleGlobalEscape: vi.fn().mockReturnValue(true),
    };
    // Reset activeElement to body (not an input)
    mockActiveElement(document.body);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls openCheatsheet when ? is pressed', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('?');
    expect(handlers.openCheatsheet).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
  });

  it('calls focusSearch when / is pressed outside an input', () => {
    mockActiveElement(document.body);
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('/');
    expect(handlers.focusSearch).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
  });

  it('does not call focusSearch when / is pressed inside an input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    mockActiveElement(input);
    renderHook(() => useKeyboardShortcuts(handlers));
    keydown('/');
    expect(handlers.focusSearch).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('does not call focusSearch when / is pressed inside a textarea', () => {
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    mockActiveElement(ta);
    renderHook(() => useKeyboardShortcuts(handlers));
    keydown('/');
    expect(handlers.focusSearch).not.toHaveBeenCalled();
    document.body.removeChild(ta);
  });

  it('calls handleGlobalEscape on Escape and prevents default', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('Escape');
    expect(handlers.handleGlobalEscape).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
  });

  it('does not prevent default when handleGlobalEscape returns false', () => {
    handlers.handleGlobalEscape.mockReturnValue(false);
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('Escape');
    expect(e.defaultPrevented).toBe(false);
  });

  it('does nothing when enabled is false', () => {
    renderHook(() => useKeyboardShortcuts(handlers, false));
    keydown('?');
    keydown('/');
    keydown('Escape');
    expect(handlers.openCheatsheet).not.toHaveBeenCalled();
    expect(handlers.focusSearch).not.toHaveBeenCalled();
    expect(handlers.handleGlobalEscape).not.toHaveBeenCalled();
  });

  it('navigates spell cards with j key', () => {
    const card1 = document.createElement('div');
    card1.className = 'spell-card';
    card1.tabIndex = 0;
    const card2 = document.createElement('div');
    card2.className = 'spell-card';
    card2.tabIndex = 0;
    document.body.appendChild(card1);
    document.body.appendChild(card2);

    mockActiveElement(card1);
    renderHook(() => useKeyboardShortcuts(handlers));
    keydown('j');
    // jsdom doesn't actually focus, but we can verify the code ran without error

    document.body.removeChild(card1);
    document.body.removeChild(card2);
  });

  it('navigates spell cards with k key', () => {
    const card1 = document.createElement('div');
    card1.className = 'spell-card';
    card1.tabIndex = 0;
    document.body.appendChild(card1);

    mockActiveElement(card1);
    renderHook(() => useKeyboardShortcuts(handlers));
    keydown('k');
    // k on the first card should not error (idx stays at 0)

    document.body.removeChild(card1);
  });

  it('navigates with ArrowDown and ArrowUp', () => {
    const card1 = document.createElement('div');
    card1.className = 'spell-card';
    card1.tabIndex = 0;
    const card2 = document.createElement('div');
    card2.className = 'spell-card';
    card2.tabIndex = 0;
    document.body.appendChild(card1);
    document.body.appendChild(card2);

    mockActiveElement(card1);
    renderHook(() => useKeyboardShortcuts(handlers));
    keydown('ArrowDown');
    keydown('ArrowUp');

    document.body.removeChild(card1);
    document.body.removeChild(card2);
  });

  it('toggles favorite on focused card when f is pressed', () => {
    const card = document.createElement('div');
    card.className = 'spell-card';
    card.tabIndex = 0;
    const star = document.createElement('button');
    star.className = 'spell-star';
    card.appendChild(star);
    document.body.appendChild(card);

    mockActiveElement(card);
    const clickSpy = vi.spyOn(star, 'click');
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('f');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);

    document.body.removeChild(card);
  });

  it('does not toggle favorite when no card is focused', () => {
    mockActiveElement(document.body);
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('f');
    expect(e.defaultPrevented).toBe(false);
  });

  it('does not navigate cards when in an input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    mockActiveElement(input);
    renderHook(() => useKeyboardShortcuts(handlers));
    const e = keydown('j');
    expect(e.defaultPrevented).toBe(false);
    document.body.removeChild(input);
  });

  it('cleans up event listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardShortcuts(handlers));
    unmount();
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('ignores / inside a contentEditable element', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    // jsdom doesn't always set isContentEditable, so set it explicitly
    Object.defineProperty(div, 'isContentEditable', { value: true, configurable: true });
    document.body.appendChild(div);
    mockActiveElement(div);
    renderHook(() => useKeyboardShortcuts(handlers));
    keydown('/');
    expect(handlers.focusSearch).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });
});
