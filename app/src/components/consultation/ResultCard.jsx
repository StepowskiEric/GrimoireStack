import { useMemo } from 'react';
import { grimoireIndex } from '../../data/grimoireIndexInstance.js';
import SchoolSigil from '../SchoolSigil.tsx';

/**
 * ResultCard — the Séance's final revelation.
 *
 * Renders the chosen spell (primary) and the alt, plus the eldritch
 * reason text. In the Beasthood state, the entire card is tinted red,
 * the sigil pulses, and the reason is prefixed with an echo marker.
 *
 * The card surfaces a "Reveal the Spell" button which calls
 * `onRevealSpell` with the resolved entry, so the parent can open
 * the existing SpellModal.
 */
export default function ResultCard({ result, onRevealSpell, onReset }) {
  const primaryEntry = useMemo(
    () => (result.primary ? grimoireIndex.resolveBySkill(result.primary) : null),
    [result.primary]
  );
  const altEntry = useMemo(
    () => (result.alt ? grimoireIndex.resolveBySkill(result.alt) : null),
    [result.alt]
  );

  if (!primaryEntry) {
    return (
      <div className={`seance-result seance-result--empty`} data-beasthood={result.beasthood ? 'true' : 'false'}>
        <h2 className="seance-result__title">The Oracle is Silent</h2>
        <p className="seance-result__reason">
          No spell emerged from the consultation. Begin again, with a different sigil.
        </p>
        <button type="button" className="seance-result__reset" onClick={onReset}>
          Begin Again
        </button>
      </div>
    );
  }

  const { spell, school } = primaryEntry;
  const alt = altEntry ? altEntry.spell : null;
  const altSchool = altEntry ? altEntry.school : null;

  return (
    <div
      className={`seance-result ${result.beasthood ? 'seance-result--beasthood' : ''}`}
      data-beasthood={result.beasthood ? 'true' : 'false'}
    >
      <span className="seance-result__sigil" aria-hidden="true">
        <SchoolSigil schoolId={school.id} size={56} animated />
      </span>
      <div className="seance-result__eyebrow">
        {result.beasthood ? 'The Forbidden Sigil Reveals' : 'The Oracle Reveals'}
      </div>
      <h2 className="seance-result__name">{spell.name}</h2>
      <div className="seance-result__skill">\u27e8 {spell.skill} \u27e9</div>
      <p className="seance-result__effect">{spell.effect}</p>
      {result.reason && (
        <blockquote className={`seance-result__reason ${result.beasthood ? 'seance-result__reason--echo' : ''}`}>
          {result.beasthood ? '\u201c\u2026\u201d ' : '\u201c'}{result.reason}{result.beasthood ? '' : '\u201d'}
        </blockquote>
      )}
      {alt && altSchool && (
        <div className="seance-result__alt">
          <div className="seance-result__alt-label">Or, if the wound resists:</div>
          <div className="seance-result__alt-name">{alt.name}</div>
          <div className="seance-result__alt-skill">\u27e8 {alt.skill} \u27e9 \u00b7 {altSchool.real}</div>
        </div>
      )}
      <div className="seance-result__actions">
        <button
          type="button"
          className="seance-result__reveal"
          onClick={() => onRevealSpell?.(primaryEntry.spell, primaryEntry.school)}
        >
          Reveal the Spell
        </button>
        <button type="button" className="seance-result__reset" onClick={onReset}>
          Begin Again
        </button>
      </div>
    </div>
  );
}
