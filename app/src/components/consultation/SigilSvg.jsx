// Displacement scale per sanity level (indexed by sanity value).
// Higher = more fractured. Sanity 4 and 5 are crisp.
const SCALE_BY_SANITY = [8.5, 5.2, 2.8, 1.2, 0, 0];

// feTurbulence seed offset. Combined with (5 - sanity) it produces a
// unique noise pattern per sanity level so the corruption looks
// visually distinct on each threshold crossing.
const SIGIL_SEED_BASE = 6;

// Color shifts from gold (sane) to red (beasthood).
const STROKE_BEASTHOOD = 'rgba(196, 68, 68, 0.85)';
const STROKE_SANE = 'rgba(212, 175, 55, 0.7)';
const GLOW_BEASTHOOD = 'rgba(196, 68, 68, 0.18)';
const GLOW_SANE = 'rgba(212, 175, 55, 0.10)';

/**
 * SigilSvg — a decorative corrupting sigil that overlays the Séance.
 *
 * The displacement scale ramps with sanity loss. At sanity 5 the sigil
 * is crisp; at sanity 0 it is heavily fractured. Built on the same
 * feTurbulence + feDisplacementMap primitives already in App.jsx.
 *
 * The shape is a custom arcane sigil — a circle with an inverted
 * triangle and a central eye. It does not need to vary by school; the
 * corruption is the message.
 */
export default function SigilSvg({ sanity }) {
  const scale = SCALE_BY_SANITY[sanity];
  const beasthood = sanity <= 1;
  const stroke = beasthood ? STROKE_BEASTHOOD : STROKE_SANE;
  const glow = beasthood ? GLOW_BEASTHOOD : GLOW_SANE;

  // Unique filter id per sanity level so the browser does not cache
  // the displacement map across threshold changes.
  const filterId = `seance-sigil-distortion-${sanity}`;

  return (
    <svg
      className={`seance-sigil-svg seance-sigil-svg--sanity-${sanity}`}
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
      data-sanity={sanity}
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed={SIGIL_SEED_BASE + (5 - sanity)} />
          <feDisplacementMap in="SourceGraphic" scale={scale} />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`} stroke={stroke} fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
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
        <path d="M 120 12 L 120 30 M 120 210 L 120 228 M 12 120 L 30 120 M 210 120 L 228 120" strokeOpacity="0.55" />
        {/* Cross-hatch cracks (only at low sanity) */}
        {sanity <= 2 && (
          <g stroke={stroke} strokeOpacity={0.4 - (sanity * 0.1)}>
            <path d="M 80 60 L 90 70 M 160 60 L 150 70" />
            <path d="M 80 180 L 90 170 M 160 180 L 150 170" />
            <path d="M 50 100 L 65 105 M 190 100 L 175 105" />
          </g>
        )}
      </g>

      {/* Soft glow background, opacity ramps with sanity */}
      <circle cx="120" cy="120" r="100" fill={glow} aria-hidden="true" />
    </svg>
  );
}
