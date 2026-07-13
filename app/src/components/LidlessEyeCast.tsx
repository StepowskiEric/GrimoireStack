import { useMemo } from 'react';
import { getSchoolSigil } from '../data/schoolSigils.jsx';
import { useEldritchCast } from '../hooks/useEldritchCast.js';
import { cn } from '../utils/cn.js';
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
  const veins = useMemo(
    () =>
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
    [],
  );

  // Reduced motion: simple cross-fade
  if (reduced) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[999] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(8,6,4,0.6)_0%,rgba(2,2,3,0.92)_100%)] cursor-default select-none',
          'animate-[castFadeIn_0.4s_ease-out]',
        )}
        role="button"
        aria-live="assertive"
        tabIndex={0}
        onClick={onComplete}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onComplete();
          }
        }}
        title="Dismiss"
        data-testid="lidless-cast"
      >
        <div className="text-center p-6 border border-[rgba(240,216,120,0.3)] bg-[radial-gradient(ellipse_at_center,rgba(240,216,120,0.06)_0%,transparent_70%)]">
          <span className="block mb-2 text-2xl drop-shadow-[0_0_8px_rgba(240,216,120,0.4)]">
            <SchoolSigil schoolId={school.id} size={32} />
          </span>
          <h2
            className="m-0 font-['Cinzel_Decorative'] text-[1.6rem] font-black text-[#f0d878] tracking-wide"
            style={{ textShadow: '0 0 12px rgba(240,216,120,0.4)' }}
          >
            {spell.name}
          </h2>
        </div>
      </div>
    );
  }

  const drawing = phase === 'sigil' || phase === 'name' || phase === 'hold' || phase === 'close';
  const showName = phase === 'name' || phase === 'hold' || phase === 'close';
  const showBlood =
    phase === 'bleed' ||
    phase === 'sigil' ||
    phase === 'name' ||
    phase === 'hold' ||
    phase === 'close';
  const showVeins =
    phase === 'bleed' ||
    phase === 'sigil' ||
    phase === 'name' ||
    phase === 'hold' ||
    phase === 'close';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[999] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(8,6,4,0.6)_0%,rgba(2,2,3,0.92)_100%)] select-none',
        'animate-[castFadeIn_0.4s_ease-out]',
        canSkip && 'cursor-pointer',
        `lidless-cast--${phase}`,
      )}
      role="button"
      tabIndex={0}
      aria-live="assertive"
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSkip();
        }
      }}
      title={canSkip ? 'Click to skip' : ''}
      data-testid="lidless-cast"
    >
      <div className="relative w-[min(90vw,480px)] aspect-[240/160] flex items-center justify-center">
        <svg
          className="w-full h-full overflow-visible drop-shadow-[0_0_30px_rgba(196,184,152,0.08)]"
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
            cx="120"
            cy="80"
            rx="110"
            ry="70"
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
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(196, 184, 152, 0.05)"
                  strokeWidth="0.6"
                />
              );
            })}

            {/* Pupil */}
            <ellipse cx="120" cy="80" rx="22" ry="14" fill="url(#cast-pupil-grad)" />
          </g>

          {/* Blood crack overlay — drawn on top of the iris when bleeding */}
          {showBlood && (
            <g clipPath="url(#cast-iris-clip)">
              <ellipse
                cx="120"
                cy="80"
                rx="55"
                ry="38"
                fill="url(#cast-blood-grad)"
                className={cn(
                  'origin-[120px_80px] scale-[0.3] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  (phase === 'sigil' || phase === 'name' || phase === 'hold') && 'scale-[1.05]',
                  phase === 'close' &&
                    'scale-[0.6] opacity-0 transition-transform duration-700 ease-in transition-opacity duration-500 ease-in',
                )}
              />
              {/* Cracks — radiating red veins */}
              {showVeins && (
                <g>
                  {veins.map((v, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <path
                      key={i}
                      d={`M ${v.x1} ${v.y1} L ${v.midX} ${v.midY} L ${v.x2} ${v.y2}`}
                      stroke="#3a0606"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                      pathLength={1}
                      className={cn(
                        'stroke-dasharray-[1] stroke-dashoffset-[1] transition-stroke-dashoffset duration-500 ease-out',
                        (phase === 'sigil' || phase === 'name' || phase === 'hold') &&
                          'stroke-dashoffset-0',
                      )}
                    />
                  ))}
                </g>
              )}

              {/* Sigil — drawn over the blood */}
              {drawing && (
                <g
                  style={{ color: '#f0d878' }}
                  filter="url(#cast-glow)"
                  className={cn(
                    'transition-opacity duration-500 ease-in',
                    phase === 'close' && 'opacity-0',
                  )}
                >
                  <Sigil />
                </g>
              )}
            </g>
          )}

          {/* Eyelid crease */}
          <path
            d="M 10 80 C 10 30 50 8 120 8 C 190 8 230 30 230 80"
            fill="none"
            stroke="rgba(0, 0, 0, 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 10 80 C 10 130 50 152 120 152 C 190 152 230 130 230 80"
            fill="none"
            stroke="rgba(0, 0, 0, 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Upper lid (the one that retracts in Wake and descends in Close) */}
          <path
            className={cn(
              'origin-[center_80px] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]',
              phase === 'wake' && 'translate-y-[-32px]',
              (phase === 'bleed' || phase === 'sigil' || phase === 'name' || phase === 'hold') &&
                'translate-y-[-42px]',
              phase === 'close' &&
                'translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.84,0)]',
            )}
            d="M 10 80 C 10 30 50 8 120 8 C 190 8 230 30 230 80 C 200 28 40 28 10 80 Z"
            fill="#020203"
            stroke="rgba(196, 184, 152, 0.08)"
            strokeWidth="0.6"
          />
          {/* Lower lid */}
          <path
            className={cn(
              'origin-[center_80px] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]',
              phase === 'wake' && 'translate-y-[32px]',
              (phase === 'bleed' || phase === 'sigil' || phase === 'name' || phase === 'hold') &&
                'translate-y-[42px]',
              phase === 'close' &&
                'translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.84,0)]',
            )}
            d="M 10 80 C 10 130 50 152 120 152 C 190 152 230 130 230 80 C 200 132 40 132 10 80 Z"
            fill="#020203"
            stroke="rgba(196, 184, 152, 0.08)"
            strokeWidth="0.6"
          />
        </svg>

        {/* Spell name — appears in the Name phase, persists through Close */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 scale-[0.85] transition-all duration-400 ease-out',
            showName && 'opacity-100 scale-100',
            phase === 'close' &&
              'opacity-0 scale-[1.1] transition-opacity duration-500 ease-in transition-transform duration-600 ease-in',
          )}
        >
          <div className="text-center px-5 py-3.5 border-t border-b border-[rgba(240,216,120,0.25)] bg-[radial-gradient(ellipse_at_center,rgba(240,216,120,0.04)_0%,transparent_70%)]">
            <span
              className="block font-['Cinzel'] text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#c4a060] mb-1.5"
              style={{ textShadow: '0 0 8px rgba(240,216,120,0.3)' }}
            >
              {school.real}
            </span>
            <h2
              className="m-0 font-['Cinzel_Decorative'] text-[clamp(1.3rem,4vw,2.1rem)] font-black text-[#f0d878] tracking-wide"
              style={{
                textShadow:
                  '0 0 12px rgba(240,216,120,0.5), 0 0 28px rgba(240,216,120,0.25), 0 0 48px rgba(196,69,69,0.2), 1px 1px 0 rgba(0,0,0,0.6)',
              }}
            >
              {spell.name}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
