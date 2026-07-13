import { useMemo } from 'react';
import { grimoireIndex } from '../../data/grimoireIndexInstance.js';
import { cn } from '../../utils/cn.js';
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
    [result.primary],
  );
  const altEntry = useMemo(
    () => (result.alt ? grimoireIndex.resolveBySkill(result.alt) : null),
    [result.alt],
  );

  if (!primaryEntry) {
    return (
      <div className="panel p-4 text-center" data-beasthood={result.beasthood ? 'true' : 'false'}>
        <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide mb-2">
          The Oracle is Silent
        </h2>
        <p className="text-text-secondary text-[0.82rem] mb-4">
          No spell emerged from the consultation. Begin again, with a different sigil.
        </p>
        <button
          type="button"
          className="px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
          onClick={onReset}
        >
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
      data-testid="seance-result"
      className={cn('panel p-4', result.beasthood && 'border-danger/40')}
      data-beasthood={result.beasthood ? 'true' : 'false'}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className={cn('text-sickly', result.beasthood && 'text-danger')} aria-hidden="true">
          <SchoolSigil schoolId={school.id} size={56} animated />
        </span>
        <div
          className={cn(
            'font-display text-[0.68rem] uppercase tracking-widest',
            result.beasthood ? 'text-danger' : 'text-text-muted',
          )}
        >
          {result.beasthood ? 'The Forbidden Sigil Reveals' : 'The Oracle Reveals'}
        </div>
        <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">
          {spell.name}
        </h2>
        <p className="text-text-secondary text-[0.82rem]">{spell.effect}</p>
        {result.reason && (
          <blockquote
            className={cn(
              'text-text-muted text-[0.82rem] italic',
              result.beasthood && 'text-danger',
            )}
          >
            {result.beasthood ? '\u201c\u2026\u201d ' : '\u201c'}
            {result.reason}
            {result.beasthood ? '' : '\u201d'}
          </blockquote>
        )}
      </div>

      {alt && altSchool && (
        <div className="mt-4 panel-raised p-3">
          <div className="text-text-muted text-[0.78rem] mb-1">Or, if the wound resists:</div>
          <div className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">
            {alt.name}
          </div>
          <div className="text-text-muted text-[0.78rem]">{altSchool.real}</div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className="px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
          onClick={() => onRevealSpell?.(primaryEntry.spell, primaryEntry.school)}
        >
          Reveal the Spell
        </button>
        <button
          type="button"
          className="px-3 py-2 border border-border text-text-muted hover:border-border-hover"
          onClick={onReset}
        >
          Begin Again
        </button>
      </div>
    </div>
  );
}
