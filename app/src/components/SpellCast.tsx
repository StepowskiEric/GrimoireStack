import { useEffect, useState, useRef } from 'react';

const RUNES = ['ᚠ','ᛗ','ᚱ','ᛋ','ᚨ','ᛏ','ᚦ','ᛖ','ᛒ','ᛟ','ᚲ','ᛉ'];

interface Particle {
  id: number; x: number; y: number; size: number;
  dx: number; dy: number; life: number; maxLife: number;
  char: string; delay: number;
}

export default function SpellCast({ spellName, schoolSymbol, onComplete }: {
  spellName: string; schoolSymbol: string; onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'entering' | 'burning' | 'parting'>('entering');
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    // Phase 1: Rune burst (0-300ms)
    const burst: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const speed = 80 + Math.random() * 140;
      burst.push({
        id: idRef.current++,
        x: 50, y: 50,
        size: 8 + Math.random() * 18,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 0, maxLife: 40 + Math.random() * 30,
        char: RUNES[Math.floor(Math.random() * RUNES.length)],
        delay: Math.random() * 8,
      });
    }
    setParticles(burst);

    const t1 = setTimeout(() => setPhase('burning'), 250);
    const t2 = setTimeout(() => setPhase('parting'), 1800);
    const t3 = setTimeout(onComplete, 2300);

    // Animate particles at ~60fps
    let frame: number;
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.dx * 0.016,
        y: p.y + p.dy * 0.016 + 20 * 0.016, // gravity
        dy: p.dy + 60 * 0.016,
        life: p.life + 1,
        size: p.size * 0.995,
      })).filter(p => p.life < p.maxLife));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      cancelAnimationFrame(frame);
    };
  }, [onComplete]);

  const textOpacity = phase === 'entering' ? 0 : phase === 'burning' ? 1 : 0;
  const textScale = phase === 'entering' ? 2 : phase === 'burning' ? 1 : 0.8;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: phase === 'parting' ? 'rgba(8,6,4,0)' : 'rgba(8,6,4,0.85)',
      transition: 'background 0.5s ease',
    }}>
      {/* Rune particles */}
      {particles.map(p => (
        <span key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          fontSize: p.size,
          color: p.life < 5 ? '#d4af37' : p.life < 20 ? '#b8964a' : '#6a4a2a',
          opacity: Math.max(0, 1 - p.life / p.maxLife) * (p.delay > 0 ? 0 : 1),
          transform: `rotate(${p.life * 15}deg)`,
          fontFamily: 'serif',
          textShadow: p.life < 10 ? '0 0 10px rgba(212,175,55,0.5)' : 'none',
          transition: 'opacity 0.1s',
          pointerEvents: 'none',
        }}>
          {p.char}
        </span>
      ))}

      {/* Central glow */}
      <div style={{
        position: 'absolute', width: 300, height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(212,175,55,${phase === 'burning' ? 0.08 : 0}), transparent 70%)`,
        transition: 'all 0.5s ease',
      }} />

      {/* Spell name burning in */}
      <div style={{
        textAlign: 'center',
        opacity: textOpacity,
        transform: `scale(${textScale})`,
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 56, fontWeight: 900,
          color: '#d4af37',
          textShadow: `
            0 0 20px rgba(212,175,55,0.4),
            0 0 40px rgba(212,175,55,0.2),
            2px 2px 0px rgba(0,0,0,0.5)
          `,
          letterSpacing: '0.06em',
        }}>
          {schoolSymbol} {spellName}
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 14,
          color: '#8a7a5a',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: 8,
          opacity: phase === 'burning' ? 0.6 : 0,
          transition: 'opacity 0.5s ease 0.3s',
        }}>
          Incantation Manifesting…
        </div>
      </div>
    </div>
  );
}
