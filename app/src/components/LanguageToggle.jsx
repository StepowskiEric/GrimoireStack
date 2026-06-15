import { useLanguage } from '../i18n/LanguageContext';
import Icon from './Icon.jsx';

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  const isGrimoire = lang === 'grimoire';

  return (
    <button
      type="button"
      className={`language-toggle eye-footer-link${isGrimoire ? ' is-grimoire' : ' is-plain'}`}
      onClick={() => setLang(isGrimoire ? 'plain' : 'grimoire')}
      aria-label={isGrimoire ? t('switchToPlain') : t('switchToGrimoire')}
      title={isGrimoire ? t('switchToPlain') : t('switchToGrimoire')}
      aria-pressed={!isGrimoire}
    >
      <span className="language-toggle-rune" aria-hidden="true"><Icon name={isGrimoire ? 'eye-fragment' : 'warded-seal'} size={14} /></span>
      <span className="language-toggle-text">
        {isGrimoire ? t('languageGrimoire') : t('languagePlain')}
      </span>
    </button>
  );
}
