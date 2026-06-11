import { useMessages } from '../i18n/messages';

export default function LanguageToggle() {
  const { lang, setLang } = useMessages();

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={() => setLang(lang === 'grimoire' ? 'plain' : 'grimoire')}
      aria-label={lang === 'grimoire' ? 'Switch to plain English' : 'Switch to themed language'}
      title={lang === 'grimoire' ? 'Switch to plain English' : 'Switch to themed language'}
    >
      {lang === 'grimoire' ? 'Plain' : 'Grimoire'}
    </button>
  );
}
