import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GrimoireEye from '../components/GrimoireEye.jsx';
import { clamp01 } from '../utils/gaze.js';

// Dev-only checkpoint harness for the Gaze work. Lets a human scrub the eye
// across exact gaze bands without waiting for dwell or clicking through the
// ritual. Mounted by GrimoireStackLayout only under import.meta.env.DEV at
// the /gaze-preview path.
const BANDS = [0, 0.25, 0.5, 0.75, 1];

export default function GazePreview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = clamp01(Number(searchParams.get('gaze')) || 0.25);
  const [gaze, setGaze] = useState(initial);

  // Keep the URL in sync (replace, not push) so a refresh / deep link
  // preserves the scrubbed gaze without spamming history.
  useEffect(() => {
    if (Number(searchParams.get('gaze')) !== gaze) {
      setSearchParams({ gaze: String(gaze) }, { replace: true });
    }
  }, [gaze, searchParams, setSearchParams]);

  return (
    <div className="gaze-preview" data-gaze={gaze}>
      <div className="abyss-background" />
      <main className="gaze-preview__stage">
        <GrimoireEye gaze={gaze} mood="neutral" />
      </main>
      <div className="gaze-preview__controls" role="group">
        <label className="gaze-preview__readout">
          gaze<span className="gaze-preview__value">{gaze.toFixed(2)}</span>
        </label>
        <input
          className="gaze-preview__slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={gaze}
          aria-label="Gaze intensity"
          onChange={(e) => setGaze(clamp01(Number(e.target.value)))}
        />
        <div className="gaze-preview__bands">
          {BANDS.map((b) => {
            const active = Math.abs(gaze - b) < 0.001;
            return (
              <button
                key={b}
                type="button"
                className={`gaze-preview__band${active ? ' gaze-preview__band--active' : ''}`}
                aria-pressed={active}
                onClick={() => setGaze(b)}
              >
                {b.toFixed(2)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
