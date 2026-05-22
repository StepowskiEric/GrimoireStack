import { useState, useCallback, useEffect, useRef } from 'react';
import { WIZARD_DATA } from '../data/schools.js';

export default function WizardModal({ schools, onSelectSkill, onClose }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [situation, setSituation] = useState(null);

  const modalRef = useRef(null);

  // Focus trap: trap tab cycling and close on Escape
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  const currentStep = step;
  const catData = category ? WIZARD_DATA.find(c => c.id === category) : null;
  const sitData = situation && catData ? catData.situations.find(s => s.id === situation) : null;

  const selectCategory = useCallback((id) => {
    setCategory(id);
    setSituation(null);
  }, []);

  const selectSituation = useCallback((id) => {
    setSituation(id);
  }, []);

  const goNext = useCallback(() => {
    if (step === 0 && category) setStep(1);
    else if (step === 1 && situation) setStep(2);
  }, [step, category, situation]);

  const goBack = useCallback(() => {
    if (step === 1) { setStep(0); setSituation(null); }
    else if (step === 2) setStep(1);
  }, [step]);

  const openSkill = useCallback((skillId) => {
    for (const school of schools) {
      const spell = school.spells.find(s => s.skill === skillId);
      if (spell) { onSelectSkill(spell, school); return; }
    }
    onClose();
  }, [schools, onSelectSkill, onClose]);

  const getSpellNameBySkill = useCallback((skillId) => {
    for (const school of schools) {
      const spell = school.spells.find(s => s.skill === skillId);
      if (spell) return spell.name;
    }
    return null;
  }, [schools]);

  return (
    <div className="modal-overlay open" id="wizardOverlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" id="wizardModal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Skill recommendation wizard">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Progress pips */}
        <div className="wizard-progress">
          <div className={`wizard-step-pip ${step >= 0 ? 'done' : ''}`} />
          <div className={`wizard-step-pip ${step >= 1 ? (step >= 2 ? 'done' : 'active') : ''}`} />
          <div className={`wizard-step-pip ${step >= 2 ? 'done' : ''}`} />
        </div>

        {/* Step 0: Pick category */}
        {step === 0 && (
          <>
            <div className="wizard-question">What is happening?</div>
            <div className="wizard-subtitle">Select the category that best describes your situation</div>
            <div className="wizard-options">
              {WIZARD_DATA.map(cat => (
                <div key={cat.id} className="wizard-option"
                  style={category === cat.id ? { borderColor: 'rgba(212,175,55,.3)', background: 'rgba(212,175,55,.04)' } : {}}
                  onClick={() => selectCategory(cat.id)}>
                  <span className="opt-label">{cat.label}</span>
                  <span className="opt-desc">{cat.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Pick situation */}
        {step === 1 && catData && (
          <>
            <div className="wizard-question">What is your situation?</div>
            <div className="wizard-subtitle">{catData.label}</div>
            <div className="wizard-options">
              {catData.situations.map(sit => (
                <div key={sit.id} className="wizard-option"
                  style={situation === sit.id ? { borderColor: 'rgba(212,175,55,.3)', background: 'rgba(212,175,55,.04)' } : {}}
                  onClick={() => selectSituation(sit.id)}>
                  <span className="opt-label">{sit.label}</span>
                  <span className="opt-desc">{sit.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Show result */}
        {step === 2 && sitData && (
          <div className="wizard-result">
            <div className="wr-skill-name">{getSpellNameBySkill(sitData.skill) || sitData.skill}</div>
            <div className="wr-effect">{sitData.effect}</div>
            <div className="wr-reason">{sitData.reason}</div>
            <span className="wr-cta" onClick={() => openSkill(sitData.skill)}>⚔ Open in Grimoire →</span>
            {sitData.alt ? (
              <>
                <div className="wr-alts">Or perhaps:</div>
                <div className="wr-alt-grid">
                  <span className="wr-alt-chip" onClick={() => openSkill(sitData.alt)}>
                    {getSpellNameBySkill(sitData.alt) || sitData.alt}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Navigation */}
        <div className="wizard-nav">
          {step > 0 ? (
            <button className="wizard-back" onClick={goBack}>
              {step === 1 ? '← Back' : '← Start over'}
            </button>
          ) : <div />}
          {step < 2 && (
            <button className={`wizard-next${(step === 0 && category) || (step === 1 && situation) ? ' ready' : ''}`}
              onClick={goNext}>
              {step === 0 ? 'Continue →' : 'Reveal Skill →'}
            </button>
          )}
        </div>

        <div className="wizard-unsure">
          <button onClick={onClose}>Not what you needed? Close and try the scrying orb instead.</button>
        </div>
      </div>
    </div>
  );
}
