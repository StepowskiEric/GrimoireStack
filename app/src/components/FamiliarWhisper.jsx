import { useMemo } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { getSpellHeadline } from '../data/spellDisplay.js';
import Icon from './Icon.jsx';

/**
 * FamiliarWhisper — small inkblot familiar spirit that whispers up to 3
 * related kin names. Open/closed state is driven entirely by CSS
 * (`:hover, :focus-within`), so there is no JS state machine, no focus
 * bug, and no double-fire on Enter/Space. Renders nothing when the
 * spell has no curated kins.
 *
 * Resolution + capping happen in `grimoireIndex.resolveKinsForSpell`,
 * not here — the component just renders.
 *
 * The `onNavigate` prop receives `(spell, school)` and is expected to
 * close the current modal and open the kin's modal. SpellModal wires
 * its existing `onClose` callback (which has exactly that signature)
 * to this prop, so we don't need new plumbing at the App.jsx level.
 */
export default function FamiliarWhisper({ spell, onNavigate }) {
  const kins = useMemo(
    () => grimoireIndex.resolveKinsForSpell(spell),
    [spell]
  );

  if (kins.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 mt-4.5 group" role="group" aria-label="Familiar and its kin">
      <button
        type="button"
        className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgba(60,70,42,.55)] to-[rgba(10,8,6,.95)] border border-[rgba(138,154,106,.28)] text-[rgba(196,184,152,.7)] shadow-[inset_0_0_0_1px_rgba(8,8,6,.6),0_0_14px_rgba(138,154,106,.18)] transition-all duration-200 flex-shrink-0 group-hover:scale-110 group-hover:-rotate-3 group-hover:border-[rgba(196,184,152,.55)] group-hover:shadow-[inset_0_0_0_1px_rgba(8,8,6,.6),0_0_22px_rgba(212,175,55,.32)]"
        aria-label="Reveal familiar"
        title="Whisper kins"
      >
        <Icon name="warded-seal" size={16} />
      </button>

      <div className="flex flex-col items-start gap-1 overflow-hidden transition-all duration-200 max-w-0 opacity-0 group-hover:max-w-[520px] group-hover:opacity-100">
        <span className="font-body italic text-[0.78rem] text-text-muted mb-1">Its kin whispers…</span>
        {kins.map((entry, idx) => (
          <button
            key={entry.spell.skill}
            type="button"
            className="bg-surface-overlay border border-border text-text-primary px-2.5 py-1 rounded-sm font-body text-[0.9rem] cursor-pointer inline-flex items-baseline gap-1.5 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 hover:bg-surface-raised hover:border-border-hover hover:text-text-primary"
            onClick={() => onNavigate?.(entry.spell, entry.school)}
            style={{ transitionDelay: `${idx * 60}ms` }}
          >
            <span className="italic">{getSpellHeadline(entry.spell)}</span>
            <span className="text-text-muted text-[0.72rem] normal tracking-wide">— {entry.school.real}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
