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
  const rawGaze = searchParams.get('gaze');
  const initial = rawGaze === null ? 0.25 : clamp01(Number(rawGaze));
  const [gaze, setGaze] = useState(initial);

  // Keep the URL in sync (replace, not push) so a refresh / deep link
  // preserves the scrubbed gaze without spamming history.
  useEffect(() => {
    if (Number(searchParams.get('gaze')) !== gaze) {
      setSearchParams({ gaze: String(gaze) }, { replace: true });
    }
  }, [gaze, searchParams, setSearchParams]);

  return (
    <div className="gaze-preview" data-gaze={gaze} style={{ '--gaze-veil': gaze }}>
      <div className="abyss-background" />
      {/* Whole-page gaze veil — void vignette + cold desaturation (Slice 08) */}
      <div className="gaze-veil" aria-hidden="true" />
      {/* Cosmic tendrils at peak gaze — Slice 09 */}
      <div className="gaze-tentacles" aria-hidden="true">
        <svg className="gaze-tentacles__svg" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMin slice">
          <defs>
            <linearGradient id="tentacleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a6cff" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#7fd4ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#b04a8a" stopOpacity="0" />
            </linearGradient>
            <filter id="tentacleSoft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>
          <g filter="url(#tentacleSoft)" fill="none" stroke="url(#tentacleGrad)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M 180 0 C 150 70, 210 140, 170 210 S 140 300, 190 350" />
            <path d="M 400 0 C 430 60, 360 130, 405 200 S 440 290, 395 345" />
            <path d="M 620 0 C 590 65, 655 135, 610 205 S 580 295, 630 348" />
            <path d="M 840 0 C 870 70, 805 140, 850 210 S 885 300, 835 352" />
          </g>
        </svg>
      </div>
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
