import { useEffect } from 'react';

const isTextInput = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
};

interface KeyboardHandlers {
  openCheatsheet?: () => void;
  focusSearch?: () => void;
  handleGlobalEscape?: () => boolean;
}

export function useKeyboardShortcuts(handlers: KeyboardHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        handlers.openCheatsheet?.();
        e.preventDefault();
        return;
      }

      const inInput = isTextInput(document.activeElement);

      if (e.key === '/' && !inInput) {
        handlers.focusSearch?.();
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') {
        if (handlers.handleGlobalEscape?.()) {
          e.preventDefault();
        }
        return;
      }

      if (inInput) return;

      if (e.key === 'j' || e.key === 'k' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const cards = Array.from(
          document.querySelectorAll('.spell-card:not([style*="display: none"])'),
        ).filter((el) => (el as HTMLElement).tabIndex >= 0);
        if (cards.length === 0) return;
        const current = document.activeElement;
        const idx = cards.indexOf(current as Element);
        let next = idx;
        if (e.key === 'j' || e.key === 'ArrowDown') next = Math.min(idx + 1, cards.length - 1);
        if (e.key === 'k' || e.key === 'ArrowUp') next = Math.max(idx - 1, 0);
        if (next !== idx && next >= 0) {
          e.preventDefault();
          (cards[next] as HTMLElement).focus();
        }
        return;
      }

      if (e.key === 'f') {
        const card = (document.activeElement as HTMLElement)?.closest?.('.spell-card');
        if (card) {
          const star = card.querySelector('.spell-star');
          if (star) {
            e.preventDefault();
            (star as HTMLElement).click();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, handlers]);
}
