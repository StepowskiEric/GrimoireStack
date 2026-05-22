import { useCurrentFrame, interpolate, spring, AbsoluteFill, Img, staticFile } from 'remotion';

// ── Colors ──
const GOLD = '#d4af37';
const DARK = '#080604';

const RUNES = ['ᚱ','ᛉ','ᛗ','ᚨ','ᚲ','ᛒ','ᛟ','ᚦ'];

// ── Witch Doctor Idle ──
// 5 seconds at 30fps = 150 frames, loopable
// Rendered at 400x600

export const WitchDoctorIdle: React.FC = () => {
  const frame = useCurrentFrame();

  // Gentle floating bob (sinusoidal)
  const bobY = Math.sin(frame * 0.08) * 2.5;

  // Amber pulse on the skull pendant area
  const glowIntensity = 0.15 + Math.sin(frame * 0.12) * 0.08 + Math.sin(frame * 0.3) * 0.03;

  // Mist particles - 8 floating dots
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const seed = i * 137.5;
    const x = (seed % 100) / 100;
    const y = ((seed * 1.3 + frame * 0.3) % 100) / 100;
    const size = 1.5 + Math.sin(seed + frame * 0.05) * 1;
    const opacity = 0.1 + Math.sin(seed + frame * 0.08) * 0.08;
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill style={{ background: DARK }}>
      {/* Background radial gradient */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 60%, rgba(30,15,8,0.6), transparent 70%)`,
      }} />

      {/* Rune particles floating */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.2 + Math.sin(frame * 0.05) * 0.05,
      }}>
        {particles.slice(0, 3).map((p, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `${p.x * 100}%`, top: `${p.y * 100}%`,
            color: GOLD, fontSize: 8,
            fontFamily: 'serif',
            opacity: p.opacity,
            transform: `rotate(${frame * 0.5 + i * 120}deg)`,
          }}>
            {RUNES[i]}
          </span>
        ))}
      </div>

      {/* Character image with gentle bob */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(-50%, ${-50 + bobY}%)`,
        width: '70%', height: '90%',
      }}>
        <Img
          src={staticFile('witch_doctor.png')}
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.08))',
          }}
        />

        {/* Skull pendant glow */}
        <div style={{
          position: 'absolute',
          top: '42%', left: '50%',
          width: 40, height: 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,175,55,${glowIntensity}), transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        {/* Head area subtle amber */}
        <div style={{
          position: 'absolute',
          top: '8%', left: '45%',
          width: '10%', height: '10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,175,55,${glowIntensity * 0.5}), transparent 60%)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Bottom glow */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '50%',
        transform: 'translateX(-50%)',
        width: '60%', height: '15%',
        background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,${0.04 + Math.sin(frame * 0.1) * 0.02}), transparent 70%)`,
      }} />

      {/* Floating dust particles */}
      {particles.map((p, i) => (
        <div key={`dust-${i}`} style={{
          position: 'absolute',
          left: `${p.x * 100}%`, top: `${p.y * 100}%`,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: GOLD,
          opacity: p.opacity,
          pointerEvents: 'none',
        }} />
      ))}
    </AbsoluteFill>
  );
};
