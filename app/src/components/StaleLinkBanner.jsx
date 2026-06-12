import { useMemo } from 'react';
import { findSimilarSkills } from '../utils/findSimilarSkills.js';
import { useLanguage } from '../i18n/LanguageContext';

export default function StaleLinkBanner({ skill, onDismiss, onSelectSkill }) {
  const { lang } = useLanguage();
  const isGrimoire = lang === 'grimoire';

  const suggestions = useMemo(() => findSimilarSkills(skill, 4), [skill]);

  const title = isGrimoire
    ? 'The incantation has been unbound'
    : 'Skill not found';
  const message = isGrimoire
    ? `No spell named "${skill}" is inscribed in the current grimoire.`
    : `No skill named "${skill}" exists in the current catalog.`;
  const leadText = isGrimoire ? 'Did you mean…' : 'Did you mean…';
  const dismissLabel = isGrimoire ? '✕ Dismiss' : '✕ Dismiss';
  const leadGlyph = isGrimoire ? '⛧' : '⚠';
  const ariaLabel = isGrimoire
    ? `Unknown incantation ${skill}. Suggestion banner.`
    : `Unknown skill ${skill}. Suggestion banner.`;

  return (
    <div className="notfound-banner" role="alert" aria-live="polite" aria-label={ariaLabel}>
      <div className="notfound-glyph" aria-hidden="true">{leadGlyph}</div>
      <div className="notfound-body">
        <div className="notfound-title">{title}</div>
        <div className="notfound-msg">{message}</div>
        {suggestions.length > 0 && (
          <>
            <div className="notfound-suggestions-lead">{leadText}</div>
            <div className="notfound-suggestions">
              {suggestions.map((entry) => (
                <button
                  key={entry.skill}
                  type="button"
                  className="notfound-suggestion"
                  onClick={() => onSelectSkill?.(entry.skill, entry.school)}
                >
                  {entry.skill}
                </button>
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          className="notfound-dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          {dismissLabel}
        </button>
      </div>
    </div>
  );
}
