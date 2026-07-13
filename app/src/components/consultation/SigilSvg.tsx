import { cn } from '../../utils/cn.ts';

// Displacement scale per sanity level (indexed by sanity value).
// Higher = more fractured. Sanity 5 and 4 are crisp; the ramp
// accelerates below 3 for a eldritch reality-warp feel.
const SCALE_BY_SANITY = [12, 7.5, 4.2, 1.8, 0, 0];

// feTurbulence seed offset. Combined with (5 - sanity) it produces a
// unique noise pattern per sanity level so the corruption looks
// visually distinct on each threshold crossing.
const SIGIL_SEED_BASE = 6;

// Color ramp through eldritch palette: gold → sickly amber → blood → void purple.
const STROKE_PALETTE = [
  'rgba(196, 68, 68, 0.9)', // sanity 0 — blood red
  'rgba(170, 55, 55, 0.88)', // sanity 1 — deep blood
  'rgba(160, 90, 40, 0.85)', // sanity 2 — rust
  'rgba(180, 140, 50, 0.8)', // sanity 3 — sickly amber
  'rgba(200, 165, 60, 0.75)', // sanity 4 — dim gold
  'rgba(212, 175, 55, 0.7)', // sanity 5 — gold
];

const GLOW_PALETTE = [
  'rgba(100, 30, 120, 0.35)', // sanity 0 — void purple
  'rgba(140, 40, 40, 0.30)', // sanity 1 — blood glow
  'rgba(160, 70, 30, 0.25)', // sanity 2 — rust glow
  'rgba(120, 140, 50, 0.20)', // sanity 3 — sickly green-gold
  'rgba(180, 155, 50, 0.15)', // sanity 4 — dim gold
  'rgba(212, 175, 55, 0.10)', // sanity 5 — gold
];

/**
 * SigilSvg — a decorative corrupting sigil that overlays the Séance.
 *
 * The displacement scale ramps with sanity loss. At sanity 5 the sigil
 * is crisp; at sanity 0 it is heavily fractured with void-purple glow.
 * Built on feTurbulence + feDisplacementMap primitives.
 *
 * The shape is a custom arcane sigil — a circle with an inverted
 * triangle and a central eye. It does not vary by school; the
 * corruption is the message.
 */
export default function SigilSvg({ sanity }) {
  const scale = SCALE_BY_SANITY[sanity];
  const stroke = STROKE_PALETTE[sanity];
  const glow = GLOW_PALETTE[sanity];

  // Unique filter id per sanity level so the browser does not cache
  // the displacement map across threshold changes.
  const filterId = `seance-sigil-distortion-${sanity}`;
  const baseFreq = sanity <= 2 ? '0.05' : sanity <= 3 ? '0.04' : '0.03';
  const numOctaves = sanity <= 1 ? 5 : sanity <= 3 ? 4 : 3;

  return (
    <svg
      className={cn('seance-sigil-svg', `seance-sigil-svg--sanity-${sanity}`)}
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
      data-sanity={sanity}
      data-testid="seance-sigil"
    >
      <defs>
        <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFreq}
            numOctaves={numOctaves}
            seed={SIGIL_SEED_BASE + (5 - sanity)}
          />
          <feDisplacementMap in="SourceGraphic" scale={scale} />
        </filter>
      </defs>

      <g
        filter={`url(#${filterId})`}
        stroke={stroke}
        fill="none"
        strokeWidth={sanity <= 2 ? '1.8' : '1.4'}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer ring */}
        <circle cx="120" cy="120" r="100" />
        {/* Inner ring */}
        <circle cx="120" cy="120" r="78" stroke={stroke} strokeOpacity="0.55" />
        {/* Inverted triangle (Vesica) */}
        <path d="M 60 70 L 180 70 L 120 170 Z" strokeOpacity="0.7" />
        {/* Eye */}
        <ellipse cx="120" cy="120" rx="22" ry="13" />
        <circle cx="120" cy="120" r="5" fill={stroke} fillOpacity="0.85" stroke="none" />
        {/* Four cardinal points */}
        <path
          d="M 120 12 L 120 30 M 120 210 L 120 228 M 12 120 L 30 120 M 210 120 L 228 120"
          strokeOpacity="0.55"
        />
        {/* Cross-hatch cracks (intensified at low sanity) */}
        {sanity <= 3 && (
          <g stroke={stroke} strokeOpacity={0.3 + sanity * 0.1}>
            <path d="M 80 60 L 90 70 M 160 60 L 150 70" />
            <path d="M 80 180 L 90 170 M 160 180 L 150 170" />
            <path d="M 50 100 L 65 105 M 190 100 L 175 105" />
            {sanity <= 1 && (
              <>
                <path d="M 100 40 L 110 55 M 140 40 L 130 55" />
                <path d="M 100 200 L 110 185 M 140 200 L 130 185" />
                <path d="M 40 130 L 55 120 M 200 130 L 185 120" />
                <path d="M 40 110 L 55 120 M 200 110 L 185 120" />
              </>
            )}
          </g>
        )}
        {/* Tear lines at sanity 0 — reality is fully ruptured */}
        {sanity === 0 && (
          <g stroke={stroke} strokeOpacity="0.5" strokeWidth="1.2">
            <path d="M 70 50 L 90 80 L 75 110 L 95 140 L 80 170" />
            <path d="M 170 50 L 150 80 L 165 110 L 145 140 L 160 170" />
            <path d="M 50 90 L 80 100 L 110 85 L 140 105 L 190 90" />
            <path d="M 50 150 L 80 140 L 110 155 L 140 135 L 190 150" />
          </g>
        )}
      </g>

      {/* Soft glow background, opacity ramps with sanity */}
      <circle cx="120" cy="120" r="100" fill={glow} aria-hidden="true" />
    </svg>
  );
}
