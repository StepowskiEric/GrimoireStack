import { useMemo } from 'react';
import { useEldritchCast } from '../hooks/useEldritchCast.js';
import { getSchoolSigil } from '../data/schoolSigils.jsx';
import SchoolSigil from './SchoolSigil.tsx';

interface Props {
  spell: { name: string; effect: string; status?: string };
  school: { id: string; name: string; real: string; symbol: string };
  onComplete: () => void;
}

export default function LidlessEyeCast({ spell, school, onComplete }: Props) {
  const { phase, canSkip, reduced, handleSkip } = useEldritchCast({ onComplete });
  const Sigil = getSchoolSigil(school.id);

  // Seed vein geometry once per mount so Math.random() doesn't cause
  // visual jitter on every re-render during the animation phase.
  const veins = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const inner = 8 + Math.random() * 4;
      const outer = 50 + Math.random() * 8;
      const x1 = 120 + Math.cos(a) * inner;
      const y1 = 80 + Math.sin(a) * inner * 0.7;
      const midX = 120 + Math.cos(a) * (outer * 0.6);
      const midY = 80 + Math.sin(a) * (outer * 0.6) * 0.7;
      const x2 = 120 + Math.cos(a) * outer;
      const y2 = 80 + Math.sin(a) * outer * 0.7;
      return { x1, y1, midX, midY, x2, y2 };
    }),
  []);

  // Reduced motion: simple cross-fade
  if (reduced) {
    return (
      <div
        className="lidless-cast lidless-cast--reduced"
        role="button"
        aria-live="assertive"
        tabIndex={0}
        onClick={onComplete}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onComplete(); } }}
        title="Dismiss"
      >
        <div className="lidless-cast__reduced-inner">
          <span className="lidless-cast__reduced-symbol"><SchoolSigil schoolId={school.id} size={32} /></span>
          <h2 className="lidless-cast__reduced-name">{spell.name}</h2>
        </div>
      </div>
    );
  }

  const drawing = phase === 'sigil' || phase === 'name' || phase === 'hold' || phase === 'close';
  const showName = phase === 'name' || phase === 'hold' || phase === 'close';
  const showBlood = phase === 'bleed' || phase === 'sigil' || phase === 'name' || phase === 'hold' || phase === 'close';
  const showVeins = phase === 'bleed' || phase === 'sigil' || phase === 'name' || phase === 'hold' || phase === 'close';

  return (
    <div
      className={`lidless-cast lidless-cast--${phase} ${canSkip ? 'lidless-cast--skippable' : ''}`}
      role="button"
      tabIndex={0}
      aria-live="assertive"
      onClick={handleSkip}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSkip(); } }}
      title={canSkip ? 'Click to skip' : ''}
    >
      <div className="lidless-cast__stage">
        <svg
          className="lidless-eye"
          viewBox="0 0 240 160"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="cast-iris-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5a4a3a" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#2a1a1a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0a0608" stopOpacity="0.95" />
            </radialGradient>
            <radialGradient id="cast-pupil-grad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1a0a0a" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <radialGradient id="cast-blood-grad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#c44545" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#8a1a1a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4a0a0a" stopOpacity="0.7" />
            </radialGradient>
            <filter id="cast-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="cast-iris-clip">
              <ellipse cx="120" cy="80" rx="55" ry="38" />
            </clipPath>
          </defs>

          {/* Sclera */}
          <ellipse
            cx="120" cy="80" rx="110" ry="70"
            fill="#0a0808"
            stroke="rgba(196, 184, 152, 0.06)"
            strokeWidth="0.8"
          />

          {/* Iris */}
          <g clipPath="url(#cast-iris-clip)">
            <ellipse cx="120" cy="80" rx="55" ry="38" fill="url(#cast-iris-grad)" />

            {/* Iris fibrous lines */}
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              const x1 = 120 + Math.cos(a) * 18;
              const y1 = 80 + Math.sin(a) * 12;
              const x2 = 120 + Math.cos(a) * 52;
              const y2 = 80 + Math.sin(a) * 35;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(196, 184, 152, 0.05)" strokeWidth="0.6" />
              );
            })}

            {/* Pupil */}
            <ellipse cx="120" cy="80" rx="22" ry="14" fill="url(#cast-pupil-grad)" />
          </g>

          {/* Blood crack overlay — drawn on top of the iris when bleeding */}
          {showBlood && (
            <g className="lidless-eye__blood-group" clipPath="url(#cast-iris-clip)">
              <ellipse
                cx="120" cy="80" rx="55" ry="38"
                fill="url(#cast-blood-grad)"
                className="lidless-eye__blood"
              />
              {/* Cracks — radiating red veins */}
              {showVeins && (
                <g className="lidless-eye__veins">
                  {veins.map((v, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <path key={i}
                      d={`M ${v.x1} ${v.y1} L ${v.midX} ${v.midY} L ${v.x2} ${v.y2}`}
                      stroke="#3a0606"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                      className="lidless-eye__vein"
                      pathLength={1}
                    />
                  ))}
                </g>
              )}

              {/* Sigil — drawn over the blood */}
              {drawing && (
                <g
                  className="lidless-eye__sigil lidless-eye__sigil--drawing"
                  style={{ color: '#f0d878' }}
                  filter="url(#cast-glow)"
                >
                  <Sigil />
                </g>
              )}
            </g>
          )}

          {/* Eyelid crease */}
          <path
            d="M 10 80 C 10 30 50 8 120 8 C 190 8 230 30 230 80"
            fill="none" stroke="rgba(0, 0, 0, 0.6)" strokeWidth="2" strokeLinecap="round"
          />
          <path
            d="M 10 80 C 10 130 50 152 120 152 C 190 152 230 130 230 80"
            fill="none" stroke="rgba(0, 0, 0, 0.6)" strokeWidth="2" strokeLinecap="round"
          />

          {/* Upper lid (the one that retracts in Wake and descends in Close) */}
          <path
            className="lidless-eye__lid lidless-eye__lid--upper"
            d="M 10 80 C 10 30 50 8 120 8 C 190 8 230 30 230 80 C 200 28 40 28 10 80 Z"
            fill="#020203"
            stroke="rgba(196, 184, 152, 0.08)"
            strokeWidth="0.6"
          />
          {/* Lower lid */}
          <path
            className="lidless-eye__lid lidless-eye__lid--lower"
            d="M 10 80 C 10 130 50 152 120 152 C 190 152 230 130 230 80 C 200 132 40 132 10 80 Z"
            fill="#020203"
            stroke="rgba(196, 184, 152, 0.08)"
            strokeWidth="0.6"
          />
        </svg>

        {/* Spell name — appears in the Name phase, persists through Close */}
        <div className={`lidless-cast__name ${showName ? 'lidless-cast__name--visible' : ''}`}>
          <div className="lidless-cast__name-inner">
            <span className="lidless-cast__name-school">{school.real}</span>
            <h2 className="lidless-cast__name-spell">{spell.name}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
