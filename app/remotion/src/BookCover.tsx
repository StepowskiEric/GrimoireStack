import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence, AbsoluteFill } from 'remotion';

// ── Theme colors ──
const GOLD = '#b8964a';
const GOLD_GLOW = '#d4af37';
const DARK = '#080604';
const PARCHMENT = '#1a1208';
const RED_WAX = '#5a0a05';

// ── Runes for decoration ──
const RUNES = ['ᚠ','ᛗ','ᚱ','ᛋ','ᚨ','ᛏ','ᚦ','ᛖ','ᛒ','ᛟ','ᚲ','ᛉ','ᛇ','ᛈ','ᛞ','ᚩ','ᚪ','ᚫ','ᚣ','ᚤ','ᚥ','ᛠ','ᛡ','ᛢ'];

function randomRunes(count: number): string {
  let s = '';
  for (let i = 0; i < count; i++) s += RUNES[Math.floor(Math.random() * RUNES.length)] + ' ';
  return s;
}

// ── Noise texture overlay ──
const NoiseOverlay: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.03, background: 'repeating-conic-gradient(#000 0%, transparent 0.1%, #000 0.2%)' }} />
);

// ── Book cover background ──
const BookBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${PARCHMENT}, ${DARK})` }} />
    </AbsoluteFill>
  );
};

// ── Border frame with gold lines ──
const BorderFrame: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [15, 40], [0, 0.4], { extrapolateRight: 'clamp' });
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', opacity }}>
      <rect x="60" y="60" width="1800" height="960" rx="12" fill="none"
        stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <rect x="72" y="72" width="1776" height="936" rx="8" fill="none"
        stroke={GOLD} strokeWidth="0.5" opacity={0.15} />
      <line x1="60" y1="60" x2="60" y2="140" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="60" y1="60" x2="140" y2="60" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="1860" y1="60" x2="1860" y2="140" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="1860" y1="60" x2="1780" y2="60" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="60" y1="1020" x2="60" y2="940" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="60" y1="1020" x2="140" y2="1020" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="1860" y1="1020" x2="1860" y2="940" stroke={GOLD} strokeWidth="1" opacity={0.3} />
      <line x1="1860" y1="1020" x2="1780" y2="1020" stroke={GOLD} strokeWidth="1" opacity={0.3} />
    </svg>
  );
};

// ── Rune ring around the edges ──
const RuneRing: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [30, 60], [0, 0.15], { extrapolateRight: 'clamp' });
  const rotation = interpolate(frame, [0, 300], [0, 360]);
  return (
    <div style={{ position: 'absolute', inset: 100, opacity, transform: `rotate(${rotation}deg)` }}>
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360;
        return (
          <span key={i} style={{
            position: 'absolute', left: '50%', top: '0%',
            transform: `rotate(${angle}deg) translateY(-20px)`,
            color: GOLD, fontSize: '14px', fontFamily: 'serif',
            opacity: 0.4 + Math.sin(angle * 0.1 + frame * 0.02) * 0.3,
          }}>
            {RUNES[i % RUNES.length]}
          </span>
        );
      })}
    </div>
  );
};

// ── Wax Seal ──
const WaxSeal: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = spring({ frame: frame - 50, fps: 30, config: { damping: 10, mass: 0.8 } });
  const opacity = interpolate(frame, [50, 80], [0, 1], { extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [80, 120, 200, 250], [0, 0.4, 0.4, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: '42%', left: '50%',
      transform: `translate(-50%, -50%) scale(${Math.max(0, scale)})`,
      opacity, width: 140, height: 140,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, ${RED_WAX}, #3a0505 70%)`,
        border: `3px solid ${GOLD}`,
        boxShadow: `0 0 ${30 + glow * 40}px ${GOLD_GLOW}, 0 0 ${60 + glow * 60}px ${GOLD_GLOW}44, inset 0 0 20px rgba(0,0,0,0.4)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '80%', height: '80%', borderRadius: '50%',
          border: `1px solid ${GOLD}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 44, color: GOLD_GLOW, textShadow: '0 0 10px rgba(212,175,55,0.3)' }}>⛧</span>
        </div>
      </div>
    </div>
  );
};

// ── Title text with glow ──
const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const titleIn = spring({ frame: frame - 120, fps: 30, config: { damping: 12, mass: 0.7 } });
  const fadeIn = interpolate(frame, [120, 155], [0, 1], { extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [150, 180, 260], [0.3, 0.8, 0.3], { extrapolateLeft: 'clamp' });
  const subtitleOpacity = interpolate(frame, [170, 200], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: '54%', left: '50%', transform: 'translate(-50%, 0)', textAlign: 'center', opacity: fadeIn }}>
      <h1 style={{
        fontFamily: "'Cinzel Decorative', serif", fontSize: 72, fontWeight: 900,
        color: GOLD_GLOW, letterSpacing: '0.08em', margin: 0,
        textShadow: `0 0 ${20 + glow * 30}px rgba(212,175,55,${0.2 + glow * 0.3}), 0 0 ${40 + glow * 60}px rgba(212,175,55,${0.1 + glow * 0.2}), 2px 2px 0px rgba(0,0,0,0.5)`,
        transform: `scale(${Math.max(0, titleIn)})`,
      }}>
        GrimoireStack
      </h1>
      <p style={{
        fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 400,
        color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 12,
        opacity: subtitleOpacity,
        textShadow: '0 0 10px rgba(212,175,55,0.1)',
      }}>
        The Warlock's Tome of Agent Incantations
      </p>
    </div>
  );
};

// ── Flickering candle glow at bottom ──
const CandleGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const flicker = 0.7 + Math.sin(frame * 0.3) * 0.15 + Math.sin(frame * 0.7) * 0.1 + Math.sin(frame * 1.1) * 0.05;
  const opacity = interpolate(frame, [40, 70], [0, 0.12], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      opacity: opacity * flicker,
    }}>
      <div style={{
        width: 200, height: 80,
        background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.15), transparent 70%)`,
      }} />
    </div>
  );
};

// ── End fade out ──
const EndFade: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [270, 300], [0, 1], { extrapolateLeft: 'clamp' });
  return <AbsoluteFill style={{ background: DARK, opacity }} />;
};

// ── Main composition ──
export const BookCover: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: DARK }}>
      <BookBackground frame={frame} />
      <NoiseOverlay />
      <BorderFrame frame={frame} />
      <RuneRing frame={frame} />
      <CandleGlow frame={frame} />
      <WaxSeal frame={frame} />
      <Title frame={frame} />
      <EndFade frame={frame} />
    </AbsoluteFill>
  );
};
