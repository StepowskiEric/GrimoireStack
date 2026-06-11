import { useEffect, useRef } from 'react';

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
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); focusable[focusable.length - 1]?.focus(); }
      else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal shortcuts-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <button className="modal-close" onClick={onClose} aria-label="Close cheatsheet">✕</button>
        <span className="modal-symbol" aria-hidden="true">⛧</span>
        <div className="modal-title">Runes of Power</div>
        <div className="modal-school">Keyboard shortcuts for the warlock on the go</div>

        <div className="shortcuts-list">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="shortcut-row">
              <span className="shortcut-desc">{s.desc}</span>
              <span className="shortcut-keys">
                {s.keys.map((k, i) => (
                  <span key={k} className={`shortcut-key${k.length > 1 ? ' wide' : ''}`}>{k}</span>
                ))}
              </span>
            </div>
          ))}
        </div>

        <div className="shortcuts-footnote">
          Shortcuts are inert when typing in the search or a note.
        </div>
      </div>
    </div>
  );
}
