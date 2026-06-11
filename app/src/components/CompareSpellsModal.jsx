import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getAllFlat } from '../data/spellMetadata.js';
import { compareSpells } from '../utils/markdownExport.js';

export default function CompareSpellsModal({ left, right, onClose, onSelect, onPickSlot }) {
  const modalRef = useRef(null);
  const [pickerSlot, setPickerSlot] = useState(null); // 'left' | 'right' | null
  const [pickerQuery, setPickerQuery] = useState('');

  const all = useMemo(() => getAllFlat(), []);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    first?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (pickerSlot) { setPickerSlot(null); return; }
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); focusable[focusable.length - 1]?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    const last = focusable[focusable.length - 1];
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose, pickerSlot]);

  const comparison = useMemo(() => compareSpells(left, right), [left, right]);

  const filtered = useMemo(() => {
    if (!pickerQuery.trim()) return all.slice(0, 80);
    const q = pickerQuery.trim().toLowerCase();
    return all.filter(({ spell, school }) =>
      spell.name.toLowerCase().includes(q) ||
      spell.skill.toLowerCase().includes(q) ||
      school.name.toLowerCase().includes(q)
    ).slice(0, 80);
  }, [all, pickerQuery]);

  const pickSpell = useCallback((spell, school) => {
    onPickSlot?.(pickerSlot, spell, school);
    setPickerSlot(null);
    setPickerQuery('');
  }, [pickerSlot, onPickSlot]);

  return (
    <div className="modal-overlay open" onClick={(e) => {
      if (e.target === e.currentTarget) {
        if (pickerSlot) { setPickerSlot(null); return; }
        onClose();
      }
    }}>
      <div className="modal compare-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Compare spells">
        <button className="modal-close" onClick={onClose} aria-label="Close compare">✕</button>
        <span className="modal-symbol" aria-hidden="true">⚖</span>
        <div className="modal-title">Compare Incantations</div>
        <div className="modal-school">Side-by-side comparison of two spells</div>

        {!pickerSlot ? (
          <>
            <div className="compare-grid">
              <div className="compare-col">
                <button
                  type="button"
                  className="compare-slot"
                  onClick={() => setPickerSlot('left')}
                >
                  {left ? (
                    <>
                      <div className="compare-slot-symbol">{left.school?.symbol || '✦'}</div>
                      <div className="compare-slot-name">{left.name}</div>
                      <div className="compare-slot-skill">〈 {left.skill} 〉</div>
                      <div className="compare-slot-hint">Click to replace</div>
                    </>
                  ) : (
                    <div className="compare-slot-empty">+ Pick first spell</div>
                  )}
                </button>
              </div>
              <div className="compare-vs" aria-hidden="true">vs</div>
              <div className="compare-col">
                <button
                  type="button"
                  className="compare-slot"
                  onClick={() => setPickerSlot('right')}
                >
                  {right ? (
                    <>
                      <div className="compare-slot-symbol">{right.school?.symbol || '✦'}</div>
                      <div className="compare-slot-name">{right.name}</div>
                      <div className="compare-slot-skill">〈 {right.skill} 〉</div>
                      <div className="compare-slot-hint">Click to replace</div>
                    </>
                  ) : (
                    <div className="compare-slot-empty">+ Pick second spell</div>
                  )}
                </button>
              </div>
            </div>

            {left && right ? (
              <div className="compare-table">
                <div className="compare-table-head">
                  <div className="compare-cell compare-cell-left">{left.name}</div>
                  <div className="compare-cell compare-cell-label">Field</div>
                  <div className="compare-cell compare-cell-right">{right.name}</div>
                </div>
                {comparison.map((row) => (
                  <div key={row.key} className={`compare-table-row${row.same ? ' same' : ' diff'}`}>
                    <div className="compare-cell compare-cell-left">
                      <span className="compare-val">{row.left || <em>—</em>}</span>
                    </div>
                    <div className="compare-cell compare-cell-label">{row.label}</div>
                    <div className="compare-cell compare-cell-right">
                      <span className="compare-val">{row.right || <em>—</em>}</span>
                    </div>
                    {!row.same ? <span className="compare-diff-dot" aria-hidden="true">●</span> : null}
                  </div>
                ))}
                <div className="compare-table-actions">
                  <button
                    type="button"
                    className="compare-open-btn"
                    onClick={() => onSelect?.(left, leftSchoolOf(left, all))}
                  >
                    Open {left.name}
                  </button>
                  <button
                    type="button"
                    className="compare-open-btn"
                    onClick={() => onSelect?.(right, leftSchoolOf(right, all))}
                  >
                    Open {right.name}
                  </button>
                </div>
              </div>
            ) : (
              <div className="compare-prompt">
                Pick two spells to compare their effect, status, and synergies.
              </div>
            )}
          </>
        ) : (
          <div className="compare-picker">
            <div className="compare-picker-head">
              <span>Choose a spell for the {pickerSlot} side</span>
              <button type="button" className="compare-picker-cancel" onClick={() => { setPickerSlot(null); setPickerQuery(''); }}>
                Cancel
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search by name, skill, or school…"
              className="compare-picker-input"
              aria-label="Search spells to compare"
            />
            <div className="compare-picker-list">
              {filtered.length === 0 ? (
                <div className="compare-picker-empty">No matching spells.</div>
              ) : (
                filtered.map(({ spell, school }) => {
                  const isThis = (pickerSlot === 'left' && left?.skill === spell.skill) ||
                                 (pickerSlot === 'right' && right?.skill === spell.skill);
                  return (
                    <button
                      key={spell.skill}
                      type="button"
                      className={`compare-picker-row${isThis ? ' selected' : ''}`}
                      onClick={() => pickSpell(spell, school)}
                      disabled={isThis}
                    >
                      <span className="compare-picker-symbol" aria-hidden="true">{school.symbol}</span>
                      <span className="compare-picker-name">{spell.name}</span>
                      <span className="compare-picker-skill">〈 {spell.skill} 〉</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function leftSchoolOf(spell, all) {
  if (!spell) return null;
  return all.find((e) => e.spell.skill === spell.skill)?.school || null;
}
