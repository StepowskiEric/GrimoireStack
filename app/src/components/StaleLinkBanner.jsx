import { useMemo } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { useLanguage } from '../i18n/LanguageContext';
import Icon from './Icon.jsx';
import '../styles/components/notfound.css';

export default function StaleLinkBanner({ skill, onDismiss, onSelectSkill }) {
  const { t } = useLanguage();

  const suggestions = useMemo(() => grimoireIndex.similarTo(skill, 4), [skill]);

  return (
    <div
      className="notfound-banner"
      role="alert"
      aria-live="polite"
      aria-label={t('notFoundAria', { skill })}
    >
      <div className="notfound-glyph" aria-hidden="true">
        <Icon name="eye-fragment" size={20} />
      </div>
      <div className="notfound-body">
        <div className="notfound-title">{t('notFoundTitle')}</div>
        <div className="notfound-msg">{t('notFoundMessage', { skill })}</div>
        {suggestions.length > 0 && (
          <>
            <div className="notfound-suggestions-lead">{t('notFoundSuggestionsLead')}</div>
            <div className="notfound-suggestions">
              {suggestions.map((entry) => (
                <button
                  key={entry.spell.skill}
                  type="button"
                  className="notfound-suggestion"
                  onClick={() => onSelectSkill?.(entry.spell.skill, entry.school)}
                >
                  {entry.spell.skill}
                </button>
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          className="notfound-dismiss"
          onClick={onDismiss}
          aria-label={t('notFoundDismiss')}
        >
          <Icon name="close" size={12} />
          <span>{t('notFoundDismiss')}</span>
        </button>
      </div>
    </div>
  );
}
