import { cn } from '../../utils/cn.js';
import './TentacleSvg.css';

/**
 * TentacleSvg — eldritch tentacles that emerge from the edges of the
 * viewport as sanity drops. Purely decorative (pointer-events: none).
 *
 * Uses a 100×100 viewBox so tentacles scale to any screen size.
 * Visible at sanity <= 3, with intensity scaling down to sanity 0.
 */
export default function TentacleSvg({ sanity }) {
  if (sanity > 3) return null;

  const intensity = sanity === 0 ? 1.6 : sanity === 1 ? 1.35 : sanity === 2 ? 1.15 : 1;
  const opacity = sanity === 0 ? 0.95 : sanity === 1 ? 0.85 : sanity === 2 ? 0.75 : 0.6;

  return (
    <svg
      className={cn(
        'fixed inset-0 z-[5] h-screen w-screen overflow-visible pointer-events-none',
        'seance-tentacles',
      )}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ '--tentacle-intensity': intensity, opacity }}
      data-sanity={sanity}
      data-testid="seance-tentacles"
    >
      <defs>
        <linearGradient id="tentacle-grad-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(180,50,100,0.9)" />
          <stop offset="40%" stopColor="rgba(220,80,60,0.75)" />
          <stop offset="100%" stopColor="rgba(220,80,60,0)" />
        </linearGradient>
        <linearGradient id="tentacle-grad-bottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(140,40,80,0.9)" />
          <stop offset="40%" stopColor="rgba(200,70,60,0.7)" />
          <stop offset="100%" stopColor="rgba(200,70,60,0)" />
        </linearGradient>
        <linearGradient id="tentacle-grad-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(160,45,90,0.85)" />
          <stop offset="50%" stopColor="rgba(210,75,55,0.6)" />
          <stop offset="100%" stopColor="rgba(210,75,55,0)" />
        </linearGradient>
        <linearGradient id="tentacle-grad-right" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(170,50,90,0.85)" />
          <stop offset="50%" stopColor="rgba(215,80,60,0.55)" />
          <stop offset="100%" stopColor="rgba(215,80,60,0)" />
        </linearGradient>
      </defs>

      {/* Top-left tentacles */}
      <g className={cn('seance-tentacles__arm', 'seance-tentacles__arm--tl')}>
        <path d="M -5 -5 Q 10 12 6 32 T 12 60" stroke="url(#tentacle-grad-top)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M -2 -2 Q 15 10 18 30 T 16 50" stroke="url(#tentacle-grad-top)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        <circle cx="12" cy="60" r="3.5" fill="rgba(220,80,60,0.7)" />
        <circle cx="16" cy="50" r="2.5" fill="rgba(200,70,55,0.6)" />
      </g>

      {/* Top-right tentacles */}
      <g className={cn('seance-tentacles__arm', 'seance-tentacles__arm--tr')}>
        <path d="M 105 -5 Q 95 15 99 35 T 94 62" stroke="url(#tentacle-grad-top)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M 102 -2 Q 90 12 88 33 T 92 52" stroke="url(#tentacle-grad-top)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75" />
        <circle cx="94" cy="62" r="3" fill="rgba(210,75,55,0.65)" />
      </g>

      {/* Bottom-left tentacles */}
      <g className={cn('seance-tentacles__arm', 'seance-tentacles__arm--bl')}>
        <path d="M -5 105 Q 11 93 7 72 T 13 45" stroke="url(#tentacle-grad-bottom)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M -2 102 Q 16 94 19 74 T 17 44" stroke="url(#tentacle-grad-bottom)" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
        <circle cx="13" cy="45" r="4" fill="rgba(180,60,70,0.75)" />
        <circle cx="17" cy="44" r="2.5" fill="rgba(190,65,65,0.6)" />
      </g>

      {/* Bottom-right tentacles */}
      <g className={cn('seance-tentacles__arm', 'seance-tentacles__arm--br')}>
        <path d="M 105 105 Q 93 91 97 70 T 92 42" stroke="url(#tentacle-grad-bottom)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 102 102 Q 89 94 87 73 T 91 44" stroke="url(#tentacle-grad-bottom)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        <circle cx="92" cy="42" r="3.5" fill="rgba(170,55,65,0.7)" />
      </g>

      {/* Left edge tentacles */}
      <g className={cn('seance-tentacles__arm', 'seance-tentacles__arm--l')}>
        <path d="M -5 26 Q 7 29 8 35 T 6 44" stroke="url(#tentacle-grad-left)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M -3 29 Q 9 31 10 37 T 8 46" stroke="url(#tentacle-grad-left)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Right edge tentacles */}
      <g className={cn('seance-tentacles__arm', 'seance-tentacles__arm--r')}>
        <path d="M 105 24 Q 93 28 92 34 T 94 43" stroke="url(#tentacle-grad-right)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 103 27 Q 91 30 90 36 T 92 45" stroke="url(#tentacle-grad-right)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Sucker details — more at lower sanity */}
      {(sanity <= 2) && (
        <>
          <circle cx="8" cy="45" r="2" fill="rgba(220,100,70,0.5)" />
          <circle cx="7" cy="52" r="1.5" fill="rgba(210,90,60,0.45)" />
          <circle cx="97" cy="47" r="2" fill="rgba(215,95,65,0.5)" />
          <circle cx="98" cy="55" r="1.5" fill="rgba(205,85,55,0.42)" />
          <circle cx="9" cy="82" r="2" fill="rgba(190,75,60,0.55)" />
          <circle cx="8" cy="88" r="1.5" fill="rgba(180,65,50,0.48)" />
          <circle cx="96" cy="80" r="2" fill="rgba(185,70,55,0.5)" />
          <circle cx="97" cy="86" r="1.5" fill="rgba(175,60,45,0.42)" />
        </>
      )}
      {(sanity <= 1) && (
        <>
          <circle cx="10" cy="33" r="1.3" fill="rgba(230,110,80,0.45)" />
          <circle cx="9" cy="40" r="1" fill="rgba(220,100,70,0.4)" />
          <circle cx="95" cy="35" r="1.3" fill="rgba(225,105,75,0.42)" />
          <circle cx="96" cy="42" r="1" fill="rgba(215,95,65,0.36)" />
          <circle cx="10" cy="96" r="1.3" fill="rgba(200,85,65,0.48)" />
          <circle cx="9" cy="90" r="1" fill="rgba(190,75,55,0.4)" />
          <circle cx="95" cy="94" r="1.3" fill="rgba(195,80,60,0.45)" />
          <circle cx="96" cy="88" r="1" fill="rgba(185,70,50,0.38)" />
        </>
      )}
    </svg>
  );
}
