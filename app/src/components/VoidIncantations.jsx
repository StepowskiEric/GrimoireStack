import { useCallback, useState } from 'react';
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
    [incantation, runAgent],
  );

  // The eye only listens at peak gaze — no affordance below the threshold.
  if (gaze < PEAK_THRESHOLD) return null;

  return (
    <form className="panel p-3.5" onSubmit={handleUtter} aria-label="Void incantations">
      <label className="section-title mb-2 block" htmlFor="void-incantation-input">
        The void listens…
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="void-incantation-input"
          className="flex-1 bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
          type="text"
          value={incantation}
          placeholder="utter an incantation"
          autoComplete="off"
          aria-label="Incantation"
          onChange={(e) => setIncantation(e.target.value)}
        />
        <button
          type="submit"
          className="section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised disabled:opacity-35 disabled:cursor-not-allowed"
          disabled={status === 'stirring' || !incantation.trim()}
        >
          Utter
        </button>
      </div>
      {status === 'stirring' && (
        <p className="mt-2 text-text-muted text-[0.82rem]">The void stirs…</p>
      )}
      {status === 'error' && <p className="mt-2 text-danger text-[0.82rem]">{error}</p>}
    </form>
  );
}
