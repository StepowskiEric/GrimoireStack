import { SEANCE_SIGILS } from '../../data/consultationData.js';
import SchoolSigil from '../SchoolSigil.tsx';

/**
 * SigilPicker — Q1 of the Séance.
 *
 * Renders the 6 Domain Sigils in a triangular rune spread. Picking a
 * sigil is the moment the user "calls" their patron — it costs 1 Sanity
 * and locks the rest of the consultation to the chosen school's pool.
 */
export default function SigilPicker({ onPick }) {
  return (
    <div className="seance-sigil-picker" data-stage="sigil">
      <h2 className="seance-sigil-picker__title">Choose the Sigil That Calls You</h2>
      <p className="seance-sigil-picker__subtitle">
        Six domains. Six wounds. Touch the one that answers.
      </p>
      <div className="seance-sigil-picker__grid" role="list">
        {SEANCE_SIGILS.map((sigil) => (
          <button
            key={sigil.id}
            type="button"
            className="seance-sigil-card"
            onClick={() => onPick(sigil.schoolId)}
            data-school-id={sigil.schoolId}
          >
            <span className="seance-sigil-card__symbol" aria-hidden="true">
              <SchoolSigil schoolId={sigil.schoolId} size={42} animated />
            </span>
            <span className="seance-sigil-card__name">{sigil.crypticName}</span>
            <span className="seance-sigil-card__line">{sigil.crypticLine}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
