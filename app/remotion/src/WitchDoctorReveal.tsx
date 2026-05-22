import { useCurrentFrame, interpolate, spring, AbsoluteFill, Img, staticFile } from 'remotion';

// ── Colors ──
const GOLD = '#d4af37';
const GOLD_GLOW = '#f0d060';
const DARK = '#080604';

const RUNES = ['ᚦ','ᛖ','ᛒ','ᛟ','ᚲ','ᛉ','ᚠ','ᛗ','ᚱ','ᛋ','ᚨ','ᛏ'];

// ── Witch Doctor Reveal ──
// 3 seconds at 30fps = 90 frames, one-shot
// Rendered at 400x600

export const WitchDoctorReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Golden burst scale: 1 → 1.15 (frames 0-10), settle back to 1 (frames 10-25)
  const burstScale = spring({ frame: Math.min(frame, 25), fps: 30, config: { damping: 8, mass: 0.6 } });
  const scale = 1 + (burstScale * 0.15);

  // Flash intensity: peaks at frame 3, decays by frame 12
  const flashOpacity = interpolate(frame, [0, 3, 12], [0, 0.6, 0], { extrapolateRight: 'clamp' });

  // Eye glow: peaks at frames 4-8
  const eyeGlow = interpolate(frame, [2, 5, 10], [0, 0.8, 0], { extrapolateRight: 'clamp' });

  // Rune ring expansion
  const runeRingScale = 0.5 + interpolate(frame, [0, 45], [0, 1.5], { extrapolateRight: 'clamp' });
  const runeOpacity = interpolate(frame, [0, 20, 40, 60], [0, 0.6, 0.4, 0], { extrapolateRight: 'clamp' });

  // Head highlight sweep
  const headHighlight = interpolate(frame, [5, 15, 30], [0, 0.3, 0], { extrapolateRight: 'clamp' });

  // Sparkles: scattered small gold dots
  const sparkles = Array.from({ length: 20 }).map((_, i) => {
    const seed = i * 71.3;
    const appearFrame = 5 + (seed % 20);
    const peakFrame = appearFrame + 8;
    const fadeFrame = peakFrame + 10;
    const opacity = interpolate(frame, [appearFrame, peakFrame, fadeFrame], [0, 0.7, 0], { extrapolateRight: 'clamp' });
    const x = 15 + (seed * 1.7) % 70;
    const y = 10 + (seed * 2.3) % 75;
    const size = 1.5 + (seed % 3);
    return { x, y, size, opacity };
  });

  // End fade out
  const endOpacity = interpolate(frame, [75, 90], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ background: DARK }}>
      {/* Background gradient */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,${interpolate(frame, [0, 15, 35], [0, 0.08, 0.04])}), transparent 70%)`,
      }} />

      {/* Golden burst overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: flashOpacity,
        background: `radial-gradient(ellipse at 50% 45%, rgba(212,175,55,0.4), transparent 60%)`,
      }} />

      {/* Expanding rune ring */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '45%',
        transform: `translate(-50%, -50%) scale(${runeRingScale})`,
        opacity: runeOpacity,
        width: 200, height: 200,
        borderRadius: '50%',
        border: '1px solid rgba(212,175,55,0.3)',
      }}>
        {RUNES.map((rune, i) => {
          const angle = (i / RUNES.length) * 360;
          return (
            <span key={i} style={{
              position: 'absolute',
              left: '50%', top: '0%',
              transform: `rotate(${angle}deg) translateY(-14px)`,
              color: GOLD, fontSize: 9,
              fontFamily: 'serif',
              opacity: 0.6,
            }}>
              {rune}
            </span>
          );
        })}
      </div>

      {/* Second rune ring (outer, counter-rotating) */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '45%',
        transform: `translate(-50%, -50%) scale(${runeRingScale * 1.3}) rotate(${frame * 2}deg)`,
        opacity: runeOpacity * 0.5,
        width: 260, height: 260,
        borderRadius: '50%',
      }}>
        {RUNES.slice(0, 8).map((rune, i) => {
          const angle = (i / 8) * 360 + 15;
          return (
            <span key={i} style={{
              position: 'absolute',
              left: '50%', top: '0%',
              transform: `rotate(${angle}deg) translateY(-16px)`,
              color: GOLD, fontSize: 7,
              fontFamily: 'serif',
              opacity: 0.3,
            }}>
              {rune}
            </span>
          );
        })}
      </div>

      {/* Character with burst scale */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: '70%', height: '90%',
      }}>
        <Img
          src={staticFile('witch_doctor.png')}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 ${20 * interpolate(frame, [5, 15, 30], [0, 8, 0], {extrapolateRight:'clamp'})}px rgba(212,175,55,0.3))`,
          }}
        />

        {/* Eye glow overlay */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '42%',
          width: '16%', height: '8%',
          background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,${eyeGlow}), transparent 70%)`,
          opacity: eyeGlow,
          pointerEvents: 'none',
        }} />

        {/* Head highlight */}
        <div style={{
          position: 'absolute',
          top: '5%', left: '10%',
          width: '80%', height: '20%',
          background: `linear-gradient(180deg, rgba(212,175,55,${headHighlight}), transparent)`,
          pointerEvents: 'none',
        }} />

        {/* Necklace shimmer */}
        <div style={{
          position: 'absolute',
          top: '38%', left: '30%',
          width: '40%', height: '15%',
          background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,${interpolate(frame, [3, 10, 20], [0, 0.15, 0], {extrapolateRight:'clamp'})}), transparent 60%)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <div key={`sparkle-${i}`} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: GOLD_GLOW,
          opacity: s.opacity,
          boxShadow: s.opacity > 0.3 ? `0 0 4px ${GOLD_GLOW}` : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      {/* End fade */}
      <AbsoluteFill style={{
        background: DARK,
        opacity: endOpacity,
      }} />
    </AbsoluteFill>
  );
};
