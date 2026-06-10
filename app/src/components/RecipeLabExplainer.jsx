import { useState, useEffect } from 'react';

const STORAGE_KEY = 'grimoire-lab-explained';

export default function RecipeLabExplainer({ visible, onDismiss }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) { setShow(false); return; }
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!dismissed) {
      const t = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
    onDismiss?.();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}>
      <div className="modal explainer-modal" role="dialog" aria-modal="true" aria-label="Alchemist's Note">
        <button className="modal-close" onClick={handleDismiss} aria-label="Dismiss note">✕</button>
        <div className="explainer-symbol" aria-hidden="true">⚗</div>
        <div className="explainer-title">The Alchemist's Note</div>
        <div className="explainer-body">
          <p>
            The <strong>Recipe Lab</strong> is where you <em>brew custom rituals</em> by combining
            two or more incantations into a single workflow.
          </p>
          <p>
            Click spells in the grid below to add them to the cauldron. When ready, press
            <strong> Brew Ritual</strong> to generate a named, potency-ranked recipe.
          </p>
          <p>
            Like an alchemist mixing reagents, the order and combination of skills affect
            the final result. Experiment and discover new synergies.
          </p>
        </div>
        <button type="button" className="explainer-cta" onClick={handleDismiss}>
          Understood — Begin Brewing
        </button>
        <div className="explainer-footer">
          This note will not appear again. You can reset it by clearing local storage.
        </div>
      </div>
    </div>
  );
}
