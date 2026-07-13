/**
 * ModalTentacle — decorative corner tentacle SVG for the spell modal.
 */

const TENTACLE_PATH =
  'M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115 C 110 138, 85 145, 70 130 C 58 118, 65 100, 82 98 C 100 98, 112 112, 105 130';
const TENTACLE_LAYERS = [
  { stroke: 'rgba(4,4,3,0.98)', width: 24 },
  { stroke: 'rgba(18,20,14,0.95)', width: 17 },
  { stroke: 'rgba(32,38,24,0.95)', width: 11 },
  { stroke: 'rgba(60,70,42,0.9)', width: 5 },
  { stroke: 'rgba(110,130,70,0.55)', width: 1.6, partial: true },
];

const TENDRIL_PATH = 'M 0 55 C 14 62, 30 78, 38 98 C 44 116, 38 134, 24 138';
const TENDRIL_LAYERS = [
  { stroke: 'rgba(8,8,6,0.85)', width: 7 },
  { stroke: 'rgba(30,34,22,0.7)', width: 3 },
];

function cornerTransform(corner) {
  if (corner === 'tr') return 'translate(160,0) scale(-1,1)';
  if (corner === 'bl') return 'translate(0,160) scale(1,-1)';
  if (corner === 'br') return 'translate(160,160) scale(-1,-1)';
  return null;
}

export default function ModalTentacle({ corner }) {
  const mirror = cornerTransform(corner);
  return (
    <svg
      className={`modal-tentacle modal-tentacle--${corner}`}
      viewBox="0 0 160 160"
      aria-hidden="true"
    >
      <g transform={mirror || undefined}>
        {/* Secondary smaller tendril */}
        {TENDRIL_LAYERS.map((l) => (
          <path
            key={l.width}
            d={TENDRIL_PATH}
            fill="none"
            stroke={l.stroke}
            strokeWidth={l.width}
            strokeLinecap="round"
          />
        ))}
        {/* Small suckers */}
        <circle
          cx="22"
          cy="74"
          r="2.2"
          fill="rgba(180,200,130,0.4)"
          stroke="rgba(8,8,6,0.9)"
          strokeWidth="0.6"
        />
        <circle
          cx="34"
          cy="98"
          r="1.8"
          fill="rgba(180,200,130,0.4)"
          stroke="rgba(8,8,6,0.9)"
          strokeWidth="0.6"
        />
        <circle
          cx="36"
          cy="122"
          r="1.4"
          fill="rgba(180,200,130,0.4)"
          stroke="rgba(8,8,6,0.9)"
          strokeWidth="0.6"
        />

        {/* Dorsal spines */}
        <g
          className="t-spines"
          fill="rgba(38,44,22,0.95)"
          stroke="rgba(6,6,4,0.9)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        >
          <path d="M 30 4 L 38 -5 L 44 10 Z" />
          <path d="M 56 14 L 68 4 L 78 28 Z" />
          <path d="M 84 32 L 100 22 L 110 50 Z" />
          <path d="M 108 56 L 124 48 L 132 72 Z" />
          <path d="M 122 86 L 138 80 L 138 102 Z" />
        </g>

        {/* Main tentacle — 5 layered strokes */}
        {TENTACLE_LAYERS.map((l) => (
          <path
            key={l.width}
            d={l.partial ? 'M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115' : TENTACLE_PATH}
            fill="none"
            stroke={l.stroke}
            strokeWidth={l.width}
            strokeLinecap="round"
          />
        ))}

        {/* Suckers along the underside */}
        <g className="t-suckers">
          <g transform="translate(48 18) rotate(22)">
            <ellipse rx="7" ry="4.4" fill="rgba(10,8,6,0.95)" />
            <ellipse rx="6" ry="3.6" fill="rgba(170,190,120,0.32)" />
            <ellipse rx="4.4" ry="2.6" fill="rgba(210,225,165,0.62)" />
            <ellipse rx="1.8" ry="1.1" fill="rgba(8,8,6,0.95)" />
            <ellipse cx="-1.2" cy="-0.7" rx="1" ry="0.6" fill="rgba(240,245,200,0.5)" />
          </g>
          <g transform="translate(82 42) rotate(45)">
            <ellipse rx="6.5" ry="4" fill="rgba(10,8,6,0.95)" />
            <ellipse rx="5.5" ry="3.2" fill="rgba(170,190,120,0.32)" />
            <ellipse rx="4" ry="2.3" fill="rgba(210,225,165,0.62)" />
            <ellipse rx="1.6" ry="0.95" fill="rgba(8,8,6,0.95)" />
            <ellipse cx="-1" cy="-0.6" rx="0.9" ry="0.55" fill="rgba(240,245,200,0.5)" />
          </g>
          <g transform="translate(110 72) rotate(65)">
            <ellipse rx="5.6" ry="3.5" fill="rgba(10,8,6,0.95)" />
            <ellipse rx="4.7" ry="2.8" fill="rgba(170,190,120,0.32)" />
            <ellipse rx="3.4" ry="2" fill="rgba(210,225,165,0.6)" />
            <ellipse rx="1.4" ry="0.85" fill="rgba(8,8,6,0.95)" />
            <ellipse cx="-0.9" cy="-0.5" rx="0.8" ry="0.5" fill="rgba(240,245,200,0.5)" />
          </g>
          <g transform="translate(115 102) rotate(90)">
            <ellipse rx="4.6" ry="2.9" fill="rgba(10,8,6,0.95)" />
            <ellipse rx="3.8" ry="2.3" fill="rgba(170,190,120,0.32)" />
            <ellipse rx="2.7" ry="1.6" fill="rgba(210,225,165,0.6)" />
            <ellipse rx="1.1" ry="0.7" fill="rgba(8,8,6,0.95)" />
          </g>
          <g transform="translate(96 128) rotate(115)">
            <ellipse rx="3.6" ry="2.3" fill="rgba(10,8,6,0.95)" />
            <ellipse rx="3" ry="1.8" fill="rgba(170,190,120,0.32)" />
            <ellipse rx="2.1" ry="1.3" fill="rgba(210,225,165,0.6)" />
            <ellipse rx="0.9" ry="0.55" fill="rgba(8,8,6,0.95)" />
          </g>
          <g transform="translate(78 132) rotate(135)">
            <ellipse rx="2.6" ry="1.7" fill="rgba(10,8,6,0.95)" />
            <ellipse rx="2.1" ry="1.3" fill="rgba(170,190,120,0.32)" />
            <ellipse rx="1.4" ry="0.9" fill="rgba(210,225,165,0.6)" />
            <ellipse rx="0.6" ry="0.4" fill="rgba(8,8,6,0.95)" />
          </g>
        </g>

        {/* Grasping hook at the tip */}
        <path
          d="M 102 128 C 112 130, 122 138, 120 150 C 118 158, 108 160, 102 154 C 96 148, 100 138, 108 136"
          fill="rgba(8,8,6,0.95)"
          stroke="rgba(4,4,3,1)"
          strokeWidth="0.8"
        />
        <path
          d="M 102 128 C 112 130, 122 138, 120 150"
          fill="none"
          stroke="rgba(120,140,80,0.4)"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
}
