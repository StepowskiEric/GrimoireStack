/* eslint-disable react/no-array-index-key -- static decorative arrays; index is stable */

import { useState, useEffect, useRef, useCallback } from 'react';
import ModalEye from './ModalEye.tsx';
import Icon from './Icon.jsx';
import { useLanguage } from '../i18n/LanguageContext';

import { cn } from '../utils/cn.js';

const STORAGE_KEY = 'grimoire-welcome-dismissed';

const PANELS = [
  { titleKey: 'welcomeTitle', bodyKey: '************', accentKey: '**************' },
  { titleKey: 'welcomeTitle', bodyKey: '************', accentKey: '**************' },
  { titleKey: 'welcomeTitle', bodyKey: '************', accentKey: '**************' },
];

export default function ApprenticeWelcome({ onClose }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!modalRef.current) return;
    const modal = modalRef.current;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [index, onClose]);

  const current = PANELS[index];
  const last = index === PANELS.length - 1;

  const next = useCallback(() => {
    if (last) onClose();
    else setIndex((prev) => prev + 1);
  }, [last, onClose]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(8,10,6,0.78)_0%,rgba(2,2,3,0.96)_80%)] backdrop-blur-[6px]" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        className={cn('relative w-full max-w-[520px] rounded-sm border border-border bg-surface p-8 text-center', visible && 'animate-modalIn')}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('welcomeTitle')}
      >
        <button className="absolute right-[18px] top-[14px] z-[3] flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-[rgba(20,22,18,0.7)] font-['IM_Fell_English'] text-[1.1rem] text-[#d4c8a0] transition-all hover:border-border-hover hover:text-sickly hover:shadow-[0_0_12px_rgba(138,154,106,0.4)]" onClick={onClose} aria-label="Close welcome" type="button">
          <Icon name="close" size={18} />
        </button>

        <div className={cn('flex flex-col items-center gap-5', visible && 'animate-panelIn')} key={current.titleKey + index}>
          <div className="text-[2.4rem] text-gold text-shadow-gold"><ModalEye size={36} /></div>
          <h2 className="font-['Cinzel'] text-[clamp(1.1rem,2.5vw,1.45rem)] font-bold leading-snug tracking-wide text-[#6a3a1a]">{t(current.titleKey)}</h2>
          <p className="text-[0.98rem] leading-relaxed text-[#2a1a0a]">{t(current.bodyKey)}</p>
          <p className="font-['Cormorant_Garamond'] italic text-[0.88rem] leading-relaxed text-[#5a4428]">{t(current.accentKey)}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2" aria-hidden="true">
          {PANELS.map((_, i) => (
            <div key={i} className={cn('h-[3px] flex-1 rounded-[3px] bg-[rgba(100,70,30,0.15)] transition-colors duration-300', i === index && 'bg-gold', i < index && 'bg-[rgba(212,175,55,0.45)]')} />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            className="font-['Cinzel'] text-[0.55rem] uppercase tracking-widest text-silver underline decoration-current underline-offset-3 transition-colors hover:text-gold"
            onClick={onClose}
            type="button"
          >
            {t('welcomeSkip')}
          </button>
          <div className="flex items-center gap-2">
            {index > 0 ? (
              <button className="font-['Cinzel'] text-[0.58rem] uppercase tracking-wider text-silver transition-colors hover:border-border-hover hover:text-gold" onClick={() => setIndex((prev) => prev - 1)} type="button">
                {t('welcomeBack')}
              </button>
            ) : null}
            <button
              className="font-['Cinzel'] text-[0.6rem] font-semibold uppercase tracking-wider text-gold transition-colors hover:border-border-hover hover:text-[#f5e6c8]"
              onClick={next}
              type="button"
            >
              {last ? t('welcomeEnter') : t('welcomeNext')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { STORAGE_KEY };
