/* eslint-disable react/no-array-index-key -- static decorative arrays; index is stable */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalEye from './ModalEye.tsx';
import Icon from './Icon.jsx';
import { useLanguage } from '../i18n/LanguageContext';

const STORAGE_KEY = 'grimoire-welcome-dismissed';

const PANELS = [
  { titleKey: 'welcomeTitle', bodyKey: 'welcomeBody1', accentKey: 'welcomeAccent1' },
  { titleKey: 'welcomeTitle', bodyKey: 'welcomeBody2', accentKey: 'welcomeAccent2' },
  { titleKey: 'welcomeTitle', bodyKey: 'welcomeBody3', accentKey: 'welcomeAccent3' },
];

const transition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1],
};

export default function ApprenticeWelcome({ onClose }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const modalRef = useRef(null);

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

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="modal-overlay open" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div
        className="modal welcome-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('welcomeTitle')}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={transition}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close welcome" type="button">
          <Icon name="close" size={18} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.titleKey + index}
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -22 }}
            transition={transition}
          >
            <div className="welcome-symbol"><ModalEye size={36} /></div>
            <h2 className="welcome-title">{t(current.titleKey)}</h2>
            <p className="welcome-body">{t(current.bodyKey)}</p>
            <p className="welcome-accent">{t(current.accentKey)}</p>
          </motion.div>
        </AnimatePresence>

        <div className="welcome-progress" aria-hidden="true">
          {PANELS.map((_, i) => (
            <div key={i} className={`welcome-pip${i === index ? ' active' : ''}${i < index ? ' done' : ''}`} />
          ))}
        </div>

        <div className="welcome-nav">
          <button
            className="welcome-skip"
            onClick={onClose}
            type="button"
          >
            {t('welcomeSkip')}
          </button>
          <div className="welcome-actions">
            {index > 0 ? (
              <button className="welcome-back" onClick={() => setIndex((prev) => prev - 1)} type="button">
                {t('welcomeBack')}
              </button>
            ) : null}
            <button
              className="welcome-next"
              onClick={() => {
                if (last) onClose();
                else setIndex((prev) => prev + 1);
              }}
              type="button"
            >
              {last ? t('welcomeEnter') : t('welcomeNext')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { STORAGE_KEY };
