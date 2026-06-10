import { useEffect, useRef } from 'react';
import schools from '../data/schools.js';
import { TIER_META } from '../data/tiers.js';
import { getSpellTier } from '../data/tiers.js';

function findSpell(name) {
  for (const s of schools) {
    for (const sp of s.spells) {
      if (sp.name === name) return { spell: sp, school: s };
    }
  }
  return null;
}

export default function SpellModal({ spell, school, onClose }) {
  if (!spell) return null;
  const statusStr = spell.status && spell.status !== '—' ? spell.status : 'Common';
  const statusClass = (spell.status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';
  const { tier, label, className: tierClass, title: tierTitle } = TIER_META[getSpellTier(spell)];
  const modalRef = useRef(null);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={`${spell.name} spell details`}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="modal-symbol">{school.symbol}</span>
        <div className="modal-school">
          {school.name} <span className="modal-school-real">({school.real})</span>
        </div>
        <div className="modal-title">{spell.name}</div>
        <div className="modal-incantation">〈 {spell.skill} 〉</div>

        {spell.note ? (
          <div className="modal-detail-row modal-note" style={{ display: 'flex' }}>
            <div className="modal-detail-label">Note</div>
            <div className="modal-detail-value">{spell.note}</div>
          </div>
        ) : null}

        <div className="modal-section-title">✦ Effect</div>
        <div className="modal-effect">{spell.effect}</div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Status</div>
          <div className="modal-detail-value">
            <span className={`tag ${statusClass}`}>{statusStr}</span>
          </div>
        </div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Arcane Tier</div>
          <div className="modal-detail-value">
            <span className={`sigil-tier ${tierClass}`} title={tierTitle}>
              <span className="sigil-mark" aria-hidden="true">⟐</span>
              <span className="sigil-label">{label}</span>
            </span>
          </div>
        </div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Skill Path</div>
          <div className="modal-detail-value">{spell.skill}</div>
        </div>

        {spell.combos?.length > 0 ? (
          <div className="modal-synergies">
            <div className="syn-title">✦ Synergistic Pairings</div>
            <div className="syn-grid">
              {spell.combos.map(comboName => {
                const found = findSpell(comboName);
                return (
                  <span key={comboName} className="syn-chip"
                    onClick={() => found && onClose(found.spell, found.school)}
                    title={found ? `Open ${comboName}` : ''}>
                    ✦ {comboName}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="modal-grimoire-ref">
          <code>〈 grimoirestack:{school.id}/{spell.skill} 〉</code>
        </div>

        <div className="modal-actions">
          <button className="modal-share modal-share-half" onClick={(e) => {
            const url = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(spell.skill)}`;
            const btn = e.currentTarget;
            const restore = () => { btn.textContent = '✦ Share'; };
            if (navigator.share) {
              navigator.share({ title: spell.name, text: spell.effect, url }).catch(() => {});
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(url).then(() => {
                btn.textContent = '✦ Link Copied!';
                setTimeout(restore, 2000);
              }).catch(() => {
                btn.textContent = '✦ Copy failed';
                setTimeout(restore, 2000);
              });
            }
          }}>✦ Share</button>
          <button className="modal-share modal-share-half modal-inscribe" onClick={(e) => {
            const cmd = `npx jerry-skills install --agent claude --skill ${spell.skill}`;
            const btn = e.currentTarget;
            const restore = () => { btn.textContent = '✦ Inscribe to your Workshop'; };
            if (!navigator.clipboard) {
              btn.textContent = '✦ Copy unsupported';
              setTimeout(restore, 2000);
              return;
            }
            navigator.clipboard.writeText(cmd).then(() => {
              btn.textContent = '✦ Incantation Inscribed';
              setTimeout(restore, 2000);
            }).catch(() => {
              btn.textContent = '✦ Copy failed';
              setTimeout(restore, 2000);
            });
          }}>✦ Inscribe to your Workshop</button>
        </div>
      </div>
    </div>
  );
}
