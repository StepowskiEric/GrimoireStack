import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { compareSpells } from '../utils/markdownExport.js';
import ModalEye from './ModalEye.tsx';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';
import { cn } from '../utils/cn.js';

export default function CompareSpellsModal({ left, right, onClose, onSelect, onPickSlot }) {
  const modalRef = useRef(null);
  const [pickerSlot, setPickerSlot] = useState(null); // 'left' | 'right' | null
  const [pickerQuery, setPickerQuery] = useState('');

  const all = useMemo(() => grimoireIndex.allEntries(), []);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (pickerSlot) { setPickerSlot(null); return; }
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(8,10,6,0.78)_0%,rgba(2,2,3,0.96)_80%)] backdrop-blur-[6px]" data-testid="compare-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        if (pickerSlot) { setPickerSlot(null); return; }
        onClose();
      }
    }}>
      <div className="relative w-full max-w-[600px] rounded-sm border border-border bg-surface p-6" ref={modalRef} role="dialog" aria-modal="true" aria-label="Compare spells">
        <button className="absolute right-[18px] top-[14px] z-[3] flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-[rgba(20,22,18,0.7)] font-['IM_Fell_English'] text-[1.1rem] text-[#d4c8a0] transition-all hover:border-border-hover hover:text-sickly hover:shadow-[0_0_12px_rgba(138,154,106,0.4)]" onClick={onClose} aria-label="Close compare" type="button">
          <Icon name="close" size={18} />
        </button>
        <span className="mb-3 block text-[1.6rem] text-[#3a3018] text-shadow-gold"><ModalEye size={36} /></span>
        <div className="font-['Cinzel'] text-center text-[1.55rem] font-bold tracking-wide text-[#3a2010] text-shadow-modal-title">Compare Incantations</div>
        <div className="font-['Cinzel'] mt-1 text-center text-[0.65rem] uppercase tracking-widest text-[#3a2a18]">Side-by-side comparison of two spells</div>

        {!pickerSlot ? (
          <>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1">
                <button
                  type="button"
                  data-testid="compare-slot"
                  className="w-full rounded-md border border-[rgba(180,140,80,0.12)] bg-[rgba(26,20,10,0.6)] p-3.5 text-center transition-colors hover:border-border-hover"
                  onClick={() => setPickerSlot('left')}
                >
                  {left ? (
                    <>
                      <div className="text-[1.3rem] text-[rgba(212,175,55,0.7)]"><SchoolSigil schoolId={left.school.id} size={32} /></div>
                      <div className="mt-1 font-['Cormorant_Garamond'] text-[0.78rem] text-[#e8dcc4]">{left.name}</div>
                      <div className="mt-1 font-['Special_Elite'] text-[0.5rem] text-[rgba(168,152,120,0.4)]">〈 {left.skill} 〉</div>
                      <div className="mt-1 text-[0.55rem] text-[#5a4a3a]">Click to replace</div>
                    </>
                  ) : (
                    <div className="font-['Cormorant_Garamond'] italic text-[0.78rem] text-[#6a5a3a]">Summon the first incantation</div>
                  )}
                </button>
              </div>
              <div className="font-['Cinzel'] shrink-0 text-[0.7rem] text-[#6a5a3a]" aria-hidden="true">vs</div>
              <div className="flex-1">
                <button
                  type="button"
                  data-testid="compare-slot"
                  className="w-full rounded-md border border-[rgba(180,140,80,0.12)] bg-[rgba(26,20,10,0.6)] p-3.5 text-center transition-colors hover:border-border-hover"
                  onClick={() => setPickerSlot('right')}
                >
                  {right ? (
                    <>
                      <div className="text-[1.3rem] text-[rgba(212,175,55,0.7)]"><SchoolSigil schoolId={right.school.id} size={32} /></div>
                      <div className="mt-1 font-['Cormorant_Garamond'] text-[0.78rem] text-[#e8dcc4]">{right.name}</div>
                      <div className="mt-1 font-['Special_Elite'] text-[0.5rem] text-[rgba(168,152,120,0.4)]">〈 {right.skill} 〉</div>
                      <div className="mt-1 text-[0.55rem] text-[#5a4a3a]">Click to replace</div>
                    </>
                  ) : (
                    <div className="font-['Cormorant_Garamond'] italic text-[0.78rem] text-[#6a5a3a]">Summon the second</div>
                  )}
                </button>
              </div>
            </div>

            {left && right ? (
              <div className="mt-4">
                <div className="grid grid-cols-[1fr_70px_1fr] gap-2 border-b border-[rgba(180,140,80,0.15)] px-2.5 py-2 font-['Cinzel'] text-[0.5rem] uppercase tracking-widest text-[#a89878]">
                  <div className="text-left">{left.name}</div>
                  <div className="text-center">Field</div>
                  <div className="text-right">{right.name}</div>
                </div>
                {comparison.map((row) => (
                  <div key={row.key} data-testid="compare-table-row" data-state={row.same ? 'same' : 'diff'} className={cn('relative grid grid-cols-[1fr_70px_1fr] gap-2 border-b border-[rgba(180,140,80,0.06)] px-2.5 py-2 text-[0.68rem]', row.same ? '' : 'bg-[rgba(212,175,55,0.03)]')}>
                    <div className="text-left text-[#d8ccb5]"><span className="text-[0.65rem]">{row.left || <em>—</em>}</span></div>
                    <div className="text-center text-[0.55rem] uppercase tracking-widest text-[#6a5a3a]">{row.label}</div>
                    <div className="text-right text-[#d8ccb5]"><span className="text-[0.65rem]">{row.right || <em>—</em>}</span></div>
                    {!row.same ? <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[0.5rem] text-gold" aria-hidden="true">●</span> : null}
                  </div>
                ))}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="rounded border border-[rgba(180,140,80,0.15)] bg-[rgba(26,20,10,0.6)] px-3.5 py-1.5 font-['Cinzel'] text-[0.55rem] text-[#a89878] transition-colors hover:border-border-hover hover:text-gold"
                    onClick={() => onSelect?.(left, leftSchoolOf(left, all))}
                  >
                    Open {left.name}
                  </button>
                  <button
                    type="button"
                    className="rounded border border-[rgba(180,140,80,0.15)] bg-[rgba(26,20,10,0.6)] px-3.5 py-1.5 font-['Cinzel'] text-[0.55rem] text-[#a89878] transition-colors hover:border-border-hover hover:text-gold"
                    onClick={() => onSelect?.(right, leftSchoolOf(right, all))}
                  >
                    Open {right.name}
                  </button>
                </div>
              </div>
            ) : (
            <div className="mt-4 text-center text-[0.72rem] text-[#6a5a3a]">
              Bind two incantations to weigh them. The Eye will set them
              side by side: effect, status, and the threads that bind them.
            </div>
            )}
          </>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[0.72rem] text-[#a89878]">
              <span>Choose a spell for the {pickerSlot} side</span>
              <button type="button" className="text-[0.65rem] text-[#6a5a3a] transition-colors hover:text-gold" onClick={() => { setPickerSlot(null); setPickerQuery(''); }}>
                Cancel
              </button>
            </div>
            <input
              type="text"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search by name, skill, or school…"
              className="w-full rounded border border-[rgba(180,140,80,0.15)] bg-[rgba(26,20,10,0.6)] p-2.5 font-['Cormorant_Garamond'] text-[0.78rem] text-[#d8ccb5] outline-none placeholder:text-[rgba(168,152,120,0.4)]"
              aria-label="Search spells to compare"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <div className="max-h-[300px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-5 text-center font-['Cormorant_Garamond'] italic text-[0.78rem] text-[#5a4a3a]">The abyss returns no incantations for this scrying.</div>
              ) : (
                filtered.map(({ spell, school }) => {
                  const isThis = (pickerSlot === 'left' && left?.skill === spell.skill) ||
                                 (pickerSlot === 'right' && right?.skill === spell.skill);
                  return (
                    <button
                      key={spell.skill}
                      type="button"
                      data-testid="compare-picker-row"
                      className={cn('flex w-full items-center gap-2 rounded border px-3 py-2.5 text-left font-[\'Cormorant_Garamond\'] text-[#d8ccb5] transition-colors min-h-11', isThis ? 'border-[rgba(180,140,80,0.08)] opacity-40 cursor-default' : 'border-[rgba(180,140,80,0.08)] bg-[rgba(26,20,10,0.4)] hover:border-border-hover hover:bg-[rgba(42,32,18,0.6)]')}
                      onClick={() => pickSpell(spell, school)}
                      disabled={isThis}
                    >
                      <span className="text-[0.8rem] text-[rgba(212,175,55,0.7)]" aria-hidden="true"><SchoolSigil schoolId={school.id} size={20} /></span>
                      <span className="text-[0.72rem] text-[#e8dcc4]">{spell.name}</span>
                      <span className="font-['Special_Elite'] text-[0.5rem] text-[rgba(168,152,120,0.4)]">〈 {spell.skill} 〉</span>
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
