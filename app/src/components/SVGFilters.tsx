export default function SVGFilters() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <filter id="parchment">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="8" />
      </filter>
      <filter id="parchment-stain">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 0.08 0"
        />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
      <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          seed="5"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0.18 0"
        />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <filter id="leather-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="2"
          seed="11"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 0.35 0"
        />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <filter id="ink-blot" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="9" />
        <feDisplacementMap in="SourceGraphic" scale="6" />
      </filter>
    </svg>
  );
}
