import { useState } from 'react';
import Icon from './Icon.jsx';

/**
 * RitualPanel — the Problem Intake Ritual UI.
 *
 * Three phases:
 * 1. idle — textarea for initial problem description
 * 2. questioning — shows the LLM's question + 3 choice buttons
 * 3. converged — shows final skills, triggers Ritual Walk
 *
 * Visual urgency: each round darkens the panel and narrows the eye.
 */
export default function RitualPanel({ ritual, onConverge }) {
  const { state, question, choices, results, round, error } = ritual;
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const q = input.trim();
    if (!q) return;
    ritual.start(q);
  };

  const handleChoice = (choice) => {
    ritual.answer(choice);
  };

  // ── Idle: textarea for the initial problem ──
  if (state === 'idle') {
    return (
      <div className="ritual-panel" data-round="0">
        <div className="ritual-header">
          <Icon name="oracle" size={16} />
          <span className="ritual-header-label">The Problem Intake Ritual</span>
        </div>
        <form className="ritual-form" onSubmit={handleSubmit}>
          <textarea
            className="ritual-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your problem and the oracle will begin its inquisition..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="ritual-actions">
            <button
              type="submit"
              className="ritual-submit"
              disabled={!input.trim()}
            >
              Begin the Inquisition
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Consulting: waiting for Groq ──
  if (state === 'consulting') {
    return (
      <div className="ritual-panel" data-round={round}>
        <div className="ritual-loading">
          <div className="ritual-loading-eye" />
          <span className="ritual-loading-text">
            {round === 0 ? 'The oracle considers your words...' : 'The oracle narrows its gaze...'}
          </span>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (state === 'error') {
    return (
      <div className="ritual-panel" data-round={round}>
        <div className="ritual-error">
          <p>The oracle falters: {error}</p>
          <button type="button" className="ritual-retry" onClick={ritual.reset}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Questioning: show question + 3 choices ──
  if (state === 'questioning') {
    return (
      <div className="ritual-panel" data-round={round}>
        <div className="ritual-question-round">
          Question {round + 1}
        </div>
        <div className="ritual-question">
          {question}
        </div>
        <div className="ritual-choices">
          {choices.map((choice, i) => (
            <button
              key={choice}
              type="button"
              className="ritual-choice"
              onClick={() => handleChoice(choice)}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="ritual-choice-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="ritual-choice-text">{choice}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Converged: show results, trigger Ritual Walk ──
  if (state === 'converged') {
    return (
      <div className="ritual-panel ritual-panel--converged" data-round={round}>
        <div className="ritual-converged-header">
          The Oracle Has Spoken
        </div>
        <div className="ritual-results">
          {results.map((r, i) => (
            <button
              key={r.skill}
              type="button"
              className="ritual-result"
              onClick={() => onConverge?.(r)}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="ritual-result-rank">{i + 1}</span>
              <div className="ritual-result-body">
                <span className="ritual-result-name">{r.name}</span>
                <span className="ritual-result-school">{r.school}</span>
              </div>
            </button>
          ))}
        </div>
        <button type="button" className="ritual-restart" onClick={ritual.reset}>
          Begin Anew
        </button>
      </div>
    );
  }

  return null;
}
