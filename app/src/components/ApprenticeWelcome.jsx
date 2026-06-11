import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'grimoire-welcome-dismissed';

const panels = [
  {
    title: 'Welcome to the Grimoire',
    body: 'This is a living collection of agent skills, organized as schools and spells. You do not need prior knowledge to use it.',
    accent: 'Schools are skill families; spells are individual skills you can inspect or combine.',
  },
  {
    title: 'Find What Ails You',
    body: 'Use the orb to search by name, topic, or symptom. If you are unsure, the wizard can guide you to a likely incantation.',
    accent: 'Search works across every school at once, so you do not need to know where a skill lives.',
  },
  {
    title: 'Brew and Iterate',
    body: 'Combine spells in the recipe lab, open them for details, and reuse them in your own workflows.',
    accent: 'Your progress is not tracked. This is a reference tome, not a lesson plan.',
  },
];

const transition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1],
};

export default function ApprenticeWelcome({ onClose }) {
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

  const current = panels[index];

  return (
    <div className="modal-overlay open" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div
        className="modal welcome-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Apprentice welcome"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={transition}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close welcome">✕</button>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -22 }}
            transition={transition}
          >
            <div className="welcome-symbol" aria-hidden="true">⛧</div>
            <h2 className="welcome-title">{current.title}</h2>
            <p className="welcome-body">{current.body}</p>
            <p className="welcome-accent">{current.accent}</p>
          </motion.div>
        </AnimatePresence>

        <div className="welcome-progress" aria-hidden="true">
          {panels.map((_, i) => (
            <div key={i} className={`welcome-pip${i === index ? ' active' : ''}${i < index ? ' done' : ''}`} />
          ))}
        </div>

        <div className="welcome-nav">
          <button
            className="welcome-skip"
            onClick={onClose}
            type="button"
          >
            Skip Rite
          </button>
          <div className="welcome-actions">
            {index > 0 ? (
              <button className="welcome-back" onClick={() => setIndex((prev) => prev - 1)} type="button">
                ← Back
              </button>
            ) : null}
            <button
              className="welcome-next"
              onClick={() => {
                if (index === panels.length - 1) onClose();
                else setIndex((prev) => prev + 1);
              }}
              type="button"
            >
              {index === panels.length - 1 ? 'Enter the Grimoire' : 'Continue →'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { STORAGE_KEY };
