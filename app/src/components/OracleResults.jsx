import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import SchoolSigil from './SchoolSigil.tsx';

/**
 * OracleResults — renders AI-suggested skills as floating cards.
 * Used in the right panel when the oracle has results.
 */
export default function OracleResults({ results, onSelectSpell }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="oracle-results">
      <div className="oracle-results__header">
        <span className="oracle-results__title">The Oracle Speaks</span>
        <span className="oracle-results__subtitle">Incantations matched to your problem</span>
      </div>
      <div className="oracle-results__grid">
        {results.map((r, i) => {
          const entry = grimoireIndex.resolveBySkill(r.skill);
          if (!entry) return null;
          return (
            <button
              key={r.skill}
              type="button"
              className="oracle-card"
              onClick={() => onSelectSpell?.(entry.spell, entry.school)}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="oracle-card__rank">#{i + 1}</span>
              <span className="oracle-card__sigil" aria-hidden="true">
                <SchoolSigil schoolId={entry.school.id} size={24} />
              </span>
              <span className="oracle-card__body">
                <span className="oracle-card__name">{r.name || entry.spell.name}</span>
                <span className="oracle-card__reason">{r.reason || entry.spell.effect}</span>
                <span className="oracle-card__meta">
                  <span className="oracle-card__school">{r.school || entry.school.name}</span>
                  {r.score != null && (
                    <span className="oracle-card__score">
                      {Math.round(r.score * 100)}% match
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
