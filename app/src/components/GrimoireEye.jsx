import { useRef, useEffect, useState, useCallback } from 'react';

export default function GrimoireEye({ searchQuery, onSearchChange, totalMatches, featuredSchools, onSchoolSelect, isSearching, eyeRadius = 220 }) {
  const containerRef = useRef(null);
  const pupilRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [blinkPhase, setBlinkPhase] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);

  // Track mouse for eye tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 0.4;
      const clampedDist = Math.min(dist, maxDist) / maxDist;
      const angle = Math.atan2(dy, dx);
      setMousePos({
        x: Math.cos(angle) * clampedDist * 0.3 + 0.5,
        y: Math.sin(angle) * clampedDist * 0.3 + 0.5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Breathing/pulsing animation
  useEffect(() => {
    let raf;
    const animate = () => {
      setBreathPhase(Date.now() / 2000);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Random blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 5000;
      const blinkDuration = 150 + Math.random() * 200;
      setTimeout(() => {
        setBlinkPhase(1);
        setTimeout(() => setBlinkPhase(0), blinkDuration);
        scheduleBlink();
      }, delay);
    };
    const id = setTimeout(scheduleBlink, 2000);
    return () => clearTimeout(id);
  }, []);

  // Background eye blink data - bigger specks
  const bgEyes = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 1.2 + Math.random() * 2.2,
      delay: Math.random() * 10,
      speed: 1.5 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
    }))
  ).current;

  const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.02;
  const irisOffsetX = (mousePos.x - 0.5) * 18;
  const irisOffsetY = (mousePos.y - 0.5) * 12;
  const pupilOffsetX = (mousePos.x - 0.5) * 28;
  const pupilOffsetY = (mousePos.y - 0.5) * 20;

  return (
    <div ref={containerRef} className="grimoire-eye-wrapper">
      {/* Background blinking eyes - tiny specks, no glow */}
      <svg className="bg-eyes-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bgEyes.map((eye, i) => {
          const blink = Math.sin(breathPhase * eye.speed + eye.phase) > 0.92 ? 0.05 : 1;
          const opacity = 0.12 + Math.sin(breathPhase * 0.3 + eye.phase) * 0.08;
          return (
            <g key={i}>
              <ellipse
                cx={eye.x}
                cy={eye.y}
                rx={eye.size / 2}
                ry={(eye.size / 2) * blink}
                fill={i % 4 === 0 ? '#7a3a5a' : '#8a9a6a'}
                opacity={opacity}
              />
              {blink > 0.3 && (
                <circle
                  cx={eye.x + (Math.sin(breathPhase + eye.phase) * eye.size * 0.1)}
                  cy={eye.y}
                  r={eye.size * 0.15}
                  fill="#020203"
                  opacity={opacity}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* The Great Eye */}
      <div className="great-eye-container" style={{ transform: `scale(${breathScale})` }}>
        <svg
          viewBox="0 0 400 280"
          className="great-eye-svg"
          style={{
            filter: `drop-shadow(0 0 ${40 + Math.sin(breathPhase * Math.PI * 3) * 15}px rgba(138,154,106,0.15))
                     drop-shadow(0 0 ${80 + Math.sin(breathPhase * Math.PI * 2) * 20}px rgba(138,154,106,0.08))`,
          }}
        >
          <defs>
            {/* Organic wet texture - subtle */}
            <filter id="wet" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="13" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="0.3" result="blurred" />
              <feSpecularLighting in="blurred" surfaceScale="3" specularConstant="0.8" specularExponent="30" lightingColor="#8a9a6a" result="spec">
                <fePointLight x="200" y="100" z="60" />
              </feSpecularLighting>
              <feComposite in="spec" in2="blurred" operator="in" result="specComp" />
              <feBlend in="blurred" in2="specComp" mode="screen" />
            </filter>

            {/* Vein texture - very subtle */}
            <filter id="veins" x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" seed="7" result="turb" />
              <feColorMatrix in="turb" type="matrix"
                values="0 0 0 0 0   0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0.15 0"
                result="colored" />
              <feGaussianBlur in="colored" stdDeviation="0.8" result="veinBlur" />
              <feComposite in="veinBlur" in2="SourceGraphic" operator="atop" />
            </filter>

            {/* Pupil glow */}
            <radialGradient id="pupilGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1a2a30" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#060a0f" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#020203" stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </radialGradient>

            {/* Iris gradient */}
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8a9a6a" stopOpacity="0.25" />
              <stop offset="30%" stopColor="#0a5a3a" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#4a1a3a" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#1a2530" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0c14" stopOpacity="0.6" />
            </radialGradient>

            {/* Sclera gradient */}
            <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#141a24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0d1018" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06070a" stopOpacity="0.98" />
            </radialGradient>

            {/* Glowing ring */}
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a9a6a" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#4a1a3a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8a9a6a" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Outer glow rings */}
          <ellipse cx="200" cy="140" rx="220" ry="140"
            fill="none" stroke="url(#ringGrad)" strokeWidth="0.5" opacity="0.3"
            style={{ animation: 'ringRotate1 20s linear infinite' }} />
          <ellipse cx="200" cy="140" rx="205" ry="130"
            fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" opacity="0.2"
            style={{ animation: 'ringRotate2 30s linear infinite reverse' }} />
          <ellipse cx="200" cy="140" rx="190" ry="120"
            fill="none" stroke="#8a9a6a" strokeWidth="0.5" opacity="0.15"
            strokeDasharray="4 8" style={{ animation: 'ringRotate1 15s linear infinite' }} />

          {/* Sclera (the eyeball) - stretched horizontally, lidless */}
          <g filter="url(#wet)">
            <path
              d="M 15,140 C 15,40 70,5 200,5 C 330,5 385,40 385,140 C 385,240 330,275 200,275 C 70,275 15,240 15,140 Z"
              fill="url(#scleraGrad)"
              stroke="rgba(138,154,106,0.08)"
              strokeWidth="0.8"
            />
          </g>

          {/* Veins overlay */}
          <g filter="url(#veins)" opacity="0.35">
            <path
              d="M 15,140 C 15,40 70,5 200,5 C 330,5 385,40 385,140 C 385,240 330,275 200,275 C 70,275 15,240 15,140 Z"
              fill="url(#scleraGrad)"
            />
          </g>

          {/* Iris */}
          <g transform={`translate(${irisOffsetX}, ${irisOffsetY})`}>
            <ellipse cx="200" cy="140" rx="125" ry="82" fill="url(#irisGrad)" />

            {/* Iris fibrous texture lines */}
            {Array.from({ length: 32 }).map((_, i) => {
              const angle = (i / 32) * Math.PI * 2;
              const innerR = 42;
              const outerR = 115;
              const x1 = 200 + Math.cos(angle) * innerR;
              const y1 = 140 + Math.sin(angle) * innerR * 0.65;
              const x2 = 200 + Math.cos(angle) * outerR;
              const y2 = 140 + Math.sin(angle) * outerR * 0.65;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(138,154,106,0.06)"
                  strokeWidth={0.5 + Math.random() * 1.5}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Pupil */}
            <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
              <ellipse cx="200" cy="140" rx="58" ry="36" fill="url(#pupilGrad)" />
              {/* Pupil inner highlight */}
              <ellipse cx="188" cy="130" rx="14" ry="7"
                fill="rgba(138,154,106,0.06)" opacity="0.6" />
            </g>
          </g>

          {/* Eyelid crease - thin, lidless */}
          <path
            d="M 15,140 C 15,45 70,12 200,12 C 330,12 385,45 385,140"
            fill="none"
            stroke="rgba(2,2,5,0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 15,140 C 15,235 70,268 200,268 C 330,268 385,235 385,140"
            fill="none"
            stroke="rgba(2,2,5,0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Eyelash tentacles - top */}
          {Array.from({ length: 12 }).map((_, i) => {
            const t = i / 11;
            const baseX = 60 + t * 280;
            const baseY = 20 + Math.sin(t * Math.PI) * 10;
            const tipX = baseX + (Math.random() - 0.5) * 30;
            const tipY = baseY - 20 - Math.random() * 25;
            return (
              <path
                key={`top-${i}`}
                d={`M ${baseX},${baseY} Q ${baseX + (tipX - baseX) * 0.5},${baseY - 15} ${tipX},${tipY}`}
                fill="none"
                stroke="rgba(138,154,106,0.15)"
                strokeWidth={0.5 + Math.random()}
                strokeLinecap="round"
              />
            );
          })}

          {/* Eyelash tentacles - bottom */}
          {Array.from({ length: 10 }).map((_, i) => {
            const t = i / 9;
            const baseX = 70 + t * 260;
            const baseY = 255 + Math.sin(t * Math.PI) * 8;
            const tipX = baseX + (Math.random() - 0.5) * 25;
            const tipY = baseY + 18 + Math.random() * 20;
            return (
              <path
                key={`bot-${i}`}
                d={`M ${baseX},${baseY} Q ${baseX + (tipX - baseX) * 0.5},${baseY + 12} ${tipX},${tipY}`}
                fill="none"
                stroke="rgba(122,58,90,0.12)"
                strokeWidth={0.5 + Math.random()}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Blink overlay */}
        <div className="eye-blink-overlay" style={{
          transform: `scaleY(${blinkPhase})`,
          opacity: blinkPhase > 0 ? 1 : 0,
        }} />

        {/* School filaments positioned around the eye */}
        <div className="eye-filaments">
          {featuredSchools.map((school, i) => {
            const total = featuredSchools.length;
            const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * eyeRadius;
            const y = Math.sin(angle) * eyeRadius * 0.5;
            return (
              <button
                key={school.id}
                className="eye-filament-btn"
                onClick={() => onSchoolSelect(school.id)}
                type="button"
                style={{
                  '--tx': `${x}px`,
                  '--ty': `${y}px`,
                  transform: `translate(${x}px, ${y}px)`,
                  animationDelay: `${i * 0.3}s`,
                }}
                title={school.name}
              >
                <span className="eye-filament-btn__glow" />
                <span className="eye-filament-btn__symbol">{school.symbol}</span>
                <span className="eye-filament-btn__name">{school.real}</span>
                <span className="eye-filament-btn__count">{school.spells.length}</span>
              </button>
            );
          })}
        </div>

        {/* Search input in the pupil */}
        <div ref={pupilRef} className={`pupil-search ${isSearching ? 'pupil-search--active' : ''}`}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder=""
            aria-label="Search spells"
            className="pupil-search__input"
          />
          {!searchQuery && (
            <span className="pupil-search__placeholder">Search the abyss...</span>
          )}
          {searchQuery && totalMatches > 0 && (
            <span className="pupil-search__matches">{totalMatches} found</span>
          )}
        </div>
      </div>
    </div>
  );
}
