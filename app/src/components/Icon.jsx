// Hand-crafted SVG icons for the GrimoireStack interface.
// All icons share a 24x24 viewBox, 1.5px stroke, round caps/joins,
// and inherit color via currentColor so they match surrounding text.

const baseProps = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export default function Icon({ name, size, className, style }) {
  const props = {
    ...baseProps,
    ...(size ? { width: size, height: size } : {}),
    ...(className ? { className } : {}),
    ...(style ? { style } : {}),
  };

  switch (name) {
    case 'archive':
      // Open grimoire with arcane glyphs on the page
      return (
        <svg {...props}>
          <path d="M3 5.5 C 5 4.8, 9 4.8, 12 6 C 15 4.8, 19 4.8, 21 5.5 L 21 18.5 C 19 17.8, 15 17.8, 12 19 C 9 17.8, 5 17.8, 3 18.5 Z" />
          <path d="M12 6 L 12 19" />
          <path d="M6 10 L 9 10 M 6 13 L 9 13" opacity="0.6" />
          <path d="M15 10 L 18 10 M 15 13 L 18 13" opacity="0.6" />
        </svg>
      );

    case 'vault':
      // Sealed pentacle circle - bound and warded
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 4.5 L 18.5 16.5 L 5.5 16.5 Z" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'alembic':
      // Alchemist's flask with rising vapor
      return (
        <svg {...props}>
          <path d="M8 2.5 C 8 4, 10 4.5, 10 5.5" opacity="0.5" />
          <path d="M14 2.5 C 14 4, 12 4.5, 12 5.5" opacity="0.5" />
          <path d="M9.5 5 L 14.5 5" />
          <path d="M10 5 L 10 9 L 5 18 C 4.5 19.4, 5.5 20.5, 7 20.5 L 17 20.5 C 18.5 20.5, 19.5 19.4, 19 18 L 14 9 L 14 5" />
          <path d="M7 15 L 17 15" />
        </svg>
      );

    case 'tools':
      // Stylized wand with a sigil tip
      return (
        <svg {...props}>
          <path d="M14.5 3.5 L 20.5 9.5" />
          <circle cx="20.5" cy="9.5" r="1.5" />
          <path d="M3 21 L 14 10" />
          <path d="M11 7 L 17 13" />
        </svg>
      );

    case 'sigil':
      // Ritual sigil for configuration
      return (
        <svg {...props}>
          <path d="M12 3 L 14 10 L 21 12 L 14 14 L 12 21 L 10 14 L 3 12 L 10 10 Z" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );

    case 'search':
      // Scrying lens over a rune
      return (
        <svg {...props}>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="M15 15 L 20 20" />
          <path d="M10.5 7.5 L 10.5 13.5 M 7.5 10.5 L 13.5 10.5" opacity="0.5" />
        </svg>
      );

    default:
      return null;
  }
}
