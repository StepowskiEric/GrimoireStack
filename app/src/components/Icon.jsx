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

    case 'profile':
      // Hooded figure: a hood silhouette with a single eye dot inside
      return (
        <svg {...props}>
          <path d="M5 21 C 5 14, 8 9, 12 8 C 16 9, 19 14, 19 21" />
          <path d="M8.5 14.5 C 10 12.5, 14 12.5, 15.5 14.5" />
          <circle cx="12" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'index':
      // Segmented circle: a divided disc with three tab marks
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3 L 12 21" />
          <path d="M5.5 7.5 C 8 9, 16 9, 18.5 7.5" opacity="0.6" />
          <path d="M3.5 12 C 6 14, 18 14, 20.5 12" opacity="0.6" />
        </svg>
      );

    case 'graph':
      // Three interconnected circles — a tendril network
      return (
        <svg {...props}>
          <circle cx="7" cy="8" r="3" />
          <circle cx="17" cy="8" r="3" />
          <circle cx="12" cy="17" r="3" />
          <path d="M9.5 9.5 C 10.5 11.5, 13.5 11.5, 14.5 9.5" opacity="0.6" />
          <path d="M8.5 10.5 L 10.5 15" opacity="0.6" />
          <path d="M15.5 10.5 L 13.5 15" opacity="0.6" />
        </svg>
      );

    case 'changelog':
      // Torn page with a single ink line and a curling tendril
      return (
        <svg {...props}>
          <path d="M5 3 L 17 3 L 19 5 L 19 21 L 5 21 Z" />
          <path d="M17 3 L 17 5 L 19 5" />
          <path d="M7 9 C 9 8.5, 13 9.5, 15 9" opacity="0.7" />
          <path d="M7 13 C 9 12.5, 13 13.5, 15 13" opacity="0.7" />
          <path d="M7 17 C 8 16.5, 10 17.5, 11 17" opacity="0.5" />
        </svg>
      );

    case 'close':
      // X cross — two crossing strokes, round caps
      return (
        <svg {...props}>
          <path d="M6 6 L 18 18" />
          <path d="M18 6 L 6 18" />
        </svg>
      );

    case 'warded-seal':
      // Ritual circle with an inverted triangle sigil inside
      // Uses lidless-eye__sigil-stroke for draw-on animation when parent applies it
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" className="lidless-eye__sigil-stroke" pathLength="1" />
          <path d="M 5.5 7 L 18.5 7 L 12 17 Z" className="lidless-eye__sigil-stroke" pathLength="1" style={{ transitionDelay: '0.12s' }} />
          <path d="M 8 7 L 16 7" className="lidless-eye__sigil-stroke" pathLength="1" style={{ transitionDelay: '0.24s' }} />
        </svg>
      );

    case 'eye-fragment':
      // Small lidless eye — iris + pupil only, no lid
      return (
        <svg {...props}>
          <ellipse cx="12" cy="12" rx="9" ry="6" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'oracle':
      // Scrying orb atop a ritual triangle — for the Séance tab
      return (
        <svg {...props}>
          <path d="M 4 19 L 20 19" />
          <path d="M 12 3 L 18 14 L 6 14 Z" />
          <circle cx="12" cy="9" r="3" />
          <path d="M 12 6.5 L 12 11.5 M 9.5 9 L 14.5 9" opacity="0.6" />
        </svg>
      );

    default:
      return null;
  }
}
