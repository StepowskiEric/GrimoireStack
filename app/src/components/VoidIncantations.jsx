import { useState, useCallback } from 'react';
import { useAgentMode } from '../hooks/useAgentMode.js';

// Slice 10 — page-agent void incantations. At peak gaze (>= 0.8) the eye
// "listens": a cold, eldritch affordance lets the user utter incantations
// that the resident page-agent executes as scoped in-grimoire DOM actions.
// Below peak gaze the eye is closed to incantations, so we render nothing.
// The page-agent is shared with the recommendation flow (useAgentMode) — this
// is never a second competing agent.
const PEAK_THRESHOLD = 0.8;

export default function VoidIncantations({ gaze = 0 }) {
  const { runAgent } = useAgentMode();
  const [incantation, setIncantation] = useState('');
  const [status, setStatus] = useState('idle'); // idle | stirring | error
  const [error, setError] = useState(null);

  const handleUtter = useCallback(
    async (e) => {
      e?.preventDefault?.();
      const text = incantation.trim();
      if (!text) return;

      setStatus('stirring');
      setError(null);
      try {
        const ok = await runAgent({
          incantation: text,
          onError: (msg) => {
            setError(msg);
            setStatus('error');
          },
        });
        // On success the page-agent panel carries its own feedback; reset.
        if (ok) setStatus('idle');
      } catch {
        setStatus('error');
        setError('The void did not respond.');
      }
    },
    [incantation, runAgent]
  );

  // The eye only listens at peak gaze — no affordance below the threshold.
  if (gaze < PEAK_THRESHOLD) return null;

  return (
    <form className="void-incantations" onSubmit={handleUtter} aria-label="Void incantations">
      <label className="void-incantations__label" htmlFor="void-incantation-input">
        The void listens…
      </label>
      <div className="void-incantations__row">
        <input
          id="void-incantation-input"
          className="void-incantations__input"
          type="text"
          value={incantation}
          placeholder="utter an incantation"
          autoComplete="off"
          aria-label="Incantation"
          onChange={(e) => setIncantation(e.target.value)}
        />
        <button
          type="submit"
          className="void-incantations__utter"
          disabled={status === 'stirring' || !incantation.trim()}
        >
          Utter
        </button>
      </div>
      {status === 'stirring' && <p className="void-incantations__status">The void stirs…</p>}
      {status === 'error' && (
        <p className="void-incantations__status void-incantations__status--error">{error}</p>
      )}
    </form>
  );
}
