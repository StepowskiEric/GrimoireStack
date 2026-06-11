import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const isGrimoire = lang === 'grimoire';

  return (
    <button
      type="button"
      className={`language-toggle${isGrimoire ? ' is-grimoire' : ' is-plain'}`}
      onClick={() => setLang(isGrimoire ? 'plain' : 'grimoire')}
      aria-label={isGrimoire ? 'Switch to plain English' : 'Switch to themed (grimoire) language'}
      title={isGrimoire ? 'Switch to plain English' : 'Switch to themed (grimoire) language'}
      aria-pressed={!isGrimoire}
    >
      <span className="language-toggle-rune" aria-hidden="true">{isGrimoire ? '⛧' : '✦'}</span>
      <span className="language-toggle-text">
        {isGrimoire ? 'Grimoire' : 'Plain'}
      </span>
    </button>
  );
}
