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
    <div className="flex flex-col items-center gap-4" data-stage="sigil">
      <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide text-center">
        Choose the Sigil That Calls You
      </h2>
      <p className="text-text-muted text-[0.82rem] text-center italic">
        Six domains. Six wounds. Touch the one that answers.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl" role="list">
        {SEANCE_SIGILS.map((sigil) => (
          <button
            key={sigil.id}
            type="button"
            className="panel-raised flex flex-col items-center gap-2 p-4 cursor-pointer transition-all duration-200 hover:border-border-hover"
            onClick={() => onPick(sigil.schoolId)}
            data-school-id={sigil.schoolId}
          >
            <span className="text-sickly" aria-hidden="true">
              <SchoolSigil schoolId={sigil.schoolId} size={42} animated />
            </span>
            <span className="font-['Cinzel'] text-[0.78rem] font-semibold text-text-primary">
              {sigil.crypticName}
            </span>
            <span className="text-text-muted text-[0.7rem]">{sigil.plainLabel}</span>
            <span className="text-text-muted text-[0.68rem] italic">{sigil.crypticLine}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
