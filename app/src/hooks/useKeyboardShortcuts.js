import { useEffect } from 'react';

const isTextInput = (el) => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
};

/**
 * Global keyboard shortcuts.
 * Mounted once at the App level. All handlers receive the active key event
 * and are responsible for calling preventDefault as needed.
 *
 * Handlers is a stable object; if you pass new functions each render, the
 * effect will re-bind (cheap).
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const onKeyDown = (e) => {
      // Open cheatsheet on '?' (Shift+/) regardless of focus
      if (e.key === '?') {
        handlers.openCheatsheet?.();
        e.preventDefault();
        return;
      }

      const inInput = isTextInput(document.activeElement);

      // '/' focuses the search input from anywhere
      if (e.key === '/' && !inInput) {
        handlers.focusSearch?.();
        e.preventDefault();
        return;
      }

      // Esc closes any open modal
      if (e.key === 'Escape') {
        if (handlers.handleGlobalEscape?.()) {
          e.preventDefault();
        }
        return;
      }

      if (inInput) return;

      // j/k navigate between visible cards
      if (e.key === 'j' || e.key === 'k' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const cards = Array.from(
          document.querySelectorAll('.spell-card:not([style*="display: none"])')
        ).filter((el) => el.tabIndex >= 0);
        if (!cards.length) return;
        const current = document.activeElement;
        const idx = cards.indexOf(current);
        let next = idx;
        if (e.key === 'j' || e.key === 'ArrowDown') next = Math.min(idx + 1, cards.length - 1);
        if (e.key === 'k' || e.key === 'ArrowUp') next = Math.max(idx - 1, 0);
        if (next !== idx && next >= 0) {
          e.preventDefault();
          cards[next].focus();
        }
        return;
      }

      // f toggles favorite on the focused card
      if (e.key === 'f') {
        const card = document.activeElement?.closest?.('.spell-card');
        if (card) {
          const star = card.querySelector('.spell-star');
          if (star) {
            e.preventDefault();
            star.click();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, handlers]);
}
