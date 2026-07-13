import { useEffect, useRef } from 'react';
import { cn } from '../utils/cn.js';
import Icon from './Icon.jsx';
import ModalEye from './ModalEye.tsx';

const SHORTCUTS = [
  { keys: ['/'], desc: 'Focus the Scrying Orb (search)' },
  { keys: ['?'], desc: 'Open this cheatsheet' },
  { keys: ['Esc'], desc: 'Close any open modal or panel' },
  { keys: ['j'], desc: 'Move focus to the next spell' },
  { keys: ['k'], desc: 'Move focus to the previous spell' },
  { keys: ['f'], desc: 'Favorite the focused spell' },
];

export default function ShortcutsModal({ onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return undefined;
    const focusable = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    first?.focus();

    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        focusable.at(-1)?.focus();
      } else if (!e.shiftKey && document.activeElement === focusable.at(-1)) {
        e.preventDefault();
        first?.focus();
      }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(8,10,6,0.78)_0%,rgba(2,2,3,0.96)_80%)] backdrop-blur-[6px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[520px] rounded-sm border border-border bg-surface p-6"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <button
          className="absolute right-[18px] top-[14px] z-[3] flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-[rgba(20,22,18,0.7)] font-['IM_Fell_English'] text-[1.1rem] text-[#d4c8a0] transition-all hover:border-border-hover hover:text-sickly hover:shadow-[0_0_12px_rgba(138,154,106,0.4)]"
          onClick={onClose}
          aria-label="Close cheatsheet"
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
        <span className="mb-3 block text-[1.6rem] text-[#3a3018] text-shadow-gold">
          <ModalEye size={36} />
        </span>
        <div className="font-['Cinzel'] text-center text-[1.55rem] font-bold tracking-wide text-[#3a2010] text-shadow-modal-title">
          Runes of Power
        </div>
        <div className="font-['Cinzel'] mt-1 text-center text-[0.65rem] uppercase tracking-widest text-[#3a2a18]">
          Keyboard shortcuts for the warlock on the go
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {SHORTCUTS.map((s) => (
            <div
              key={s.desc}
              className="flex items-center justify-between gap-4 rounded-md border border-[rgba(180,140,80,0.18)] bg-[rgba(35,22,12,0.5)] px-3 py-2"
            >
              <span className="flex-1 text-right font-['Cormorant_Garamond'] text-[0.95rem] text-[#e8d8b8]">
                {s.desc}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {s.keys.map((k) => (
                  <span
                    key={k}
                    className={cn(
                      'inline-flex h-6 min-w-7 items-center justify-center rounded border px-1.5 font-["Special_Elite"] text-[0.72rem] font-bold text-[#2a1a08] shadow-[0_1px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]',
                      k.length > 1 ? 'min-w-[48px] text-[0.65rem]' : '',
                    )}
                  >
                    {k}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center font-['Cormorant_Garamond'] italic text-[0.82rem] text-[#a89878]">
          Shortcuts are inert when typing in the search or a note.
        </div>
      </div>
    </div>
  );
}
