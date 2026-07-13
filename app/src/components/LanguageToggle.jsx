import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../utils/cn.js';
import Icon from './Icon.jsx';

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  const isGrimoire = lang === 'grimoire';

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 border border-[rgba(180,140,80,0.22)] bg-[rgba(40,28,16,0.4)] px-2.5 py-1.5 font-["Cinzel"] text-[0.55rem] font-semibold uppercase tracking-widest text-[#a89878] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.4)] hover:text-[#d4af37] hover:shadow-[0_0_16px_rgba(212,175,55,0.1)] active:scale-95',
        isGrimoire &&
          'border-[rgba(212,175,55,0.5)] bg-gradient-to-b from-[rgba(80,52,18,0.7)] to-[rgba(50,32,12,0.7)] text-[#d4af37] shadow-[0_0_16px_rgba(212,175,55,0.12)]',
      )}
      onClick={() => setLang(isGrimoire ? 'plain' : 'grimoire')}
      aria-label={isGrimoire ? t('switchToPlain') : t('switchToGrimoire')}
      title={isGrimoire ? t('switchToPlain') : t('switchToGrimoire')}
      aria-pressed={!isGrimoire}
      data-testid="language-toggle"
    >
      <span
        className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[rgba(212,175,55,0.45)] bg-radial text-[0.7rem] leading-none text-[#f1d08a] shadow-[0_0_10px_rgba(212,175,55,0.18),inset_0_0_6px_rgba(0,0,0,0.35)]"
        aria-hidden="true"
        style={
          isGrimoire
            ? {
                background: 'radial-gradient(circle at 40% 35%, #d4af37, #8a6a30 65%, #4a3416)',
                color: '#2a1a08',
                boxShadow: '0 0 10px rgba(212,175,55,0.32), inset 0 0 6px rgba(0,0,0,0.2)',
              }
            : undefined
        }
      >
        <Icon name={isGrimoire ? 'eye-fragment' : 'warded-seal'} size={14} />
      </span>
      <span className="language-toggle-text">
        {isGrimoire ? t('languageGrimoire') : t('languagePlain')}
      </span>
    </button>
  );
}
