import { useMemo } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { getSpellHeadline } from '../data/spellDisplay.js';
import Icon from './Icon.jsx';
import './FamiliarWhisper.css';

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
    <div className="familiar-whisper" role="group" aria-label="Familiar and its kin">
      <button
        type="button"
        className="familiar-whisper__spirit"
        aria-label="Reveal familiar"
        title="Whisper kins"
      >
        <Icon name="warded-seal" size={16} />
      </button>

      <div className="familiar-whisper__list">
        <span className="familiar-whisper__prelude">Its kin whispers…</span>
        {kins.map((entry, idx) => (
          <button
            key={entry.spell.skill}
            type="button"
            className="familiar-whisper__kin"
            onClick={() => onNavigate?.(entry.spell, entry.school)}
            style={{ transitionDelay: `${idx * 60}ms` }}
          >
            <span className="familiar-whisper__kin-name">{getSpellHeadline(entry.spell)}</span>
            <span className="familiar-whisper__kin-school">— {entry.school.real}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
