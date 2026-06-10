import { useState, useRef, useEffect } from 'react';
import { TIER_META } from '../data/tiers.js';

export default function LegendOfSigils() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handler = (e) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [open]);

  const tiers = [
    { key: 'faded', ...TIER_META.faded },
    { key: 'apprentice', ...TIER_META.apprentice },
    { key: 'adept', ...TIER_META.adept },
    { key: 'master', ...TIER_META.master },
    { key: 'archmage', ...TIER_META.archmage },
  ];

  const statuses = [
    { label: 'Proven', desc: 'Tested and validated in practice', className: 'proven' },
    { label: 'New', desc: 'Recently inscribed, gaining experience', className: 'new' },
    { label: 'Framework', desc: 'Structured methodology or protocol', className: 'framework' },
    { label: 'Hybrid', desc: 'Fuses multiple approaches', className: 'hybrid' },
    { label: 'MCP', desc: 'Model Context Protocol integration', className: 'includes' },
  ];

  return (
    <>
      <button
        type="button"
        className="legend-toggle"
        onClick={() => setOpen(true)}
        aria-label="Open Legend of Sigils"
        title="Legend of Sigils"
      >
        <span aria-hidden="true">⟐</span>
        <span className="legend-toggle-text">Legend</span>
      </button>

      {open && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="modal legend-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Legend of Sigils">
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close legend">✕</button>
            <div className="legend-title">⟐ Legend of Sigils</div>
            <div className="legend-subtitle">A guide to the markings of this tome</div>

            <div className="legend-section">
              <div className="legend-section-title">✦ Arcane Tiers</div>
              <div className="legend-grid">
                {tiers.map((t) => (
                  <div key={t.key} className="legend-row">
                    <span className={`sigil-tier ${t.className}`}>
                      <span className="sigil-mark" aria-hidden="true">⟐</span>
                      <span className="sigil-label">{t.label}</span>
                    </span>
                    <span className="legend-desc">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="legend-section">
              <div className="legend-section-title">✦ Spell Status</div>
              <div className="legend-grid">
                {statuses.map((s) => (
                  <div key={s.label} className="legend-row">
                    <span className={`spell-status ${s.className}`}>{s.label}</span>
                    <span className="legend-desc">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="legend-hint">
              Each spell card displays its tier and status. Hover over any sigil in the grimoire to see its meaning.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
