/* eslint-disable react/no-array-index-key -- decorative procedural arrays; index is stable for the lifetime of the mount */

import { useRef, useEffect } from 'react';
import SchoolSigil from './SchoolSigil.tsx';

export default function GrimoireEye({ searchQuery, onSearchChange, totalMatches, featuredSchools, onSchoolSelect, isSearching, eyeRadius = 220, mood = 'neutral' }) {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const pupilRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const moodRef = useRef(mood);

  // Keep a ref in sync with the prop so the rAF loop (which closes over the ref)
  // always reads the latest mood without triggering re-renders.
  useEffect(() => {
    moodRef.current = mood;
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.setAttribute('data-mood', mood);
    }
  }, [mood]);

  // Single rAF loop — writes ALL animated properties directly to DOM.
  // No React state involved, so zero React re-renders from animation frames.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let rafId;

    // Cache element queries after first frame — they're stable for the component's lifetime
    let svgEl = null;
    let containerEl = null;
    let irisRingEl = null;
    let pupilGlowEl = null;
    let irisGroupEl = null;
    let pupilGroupEl = null;
    const vesselEls = [];

    const queryElements = () => {
      containerEl = wrapper.querySelector('.great-eye-container');
      svgEl = wrapper.querySelector('.great-eye-svg');
      irisRingEl = wrapper.querySelector('.eye-iris-ring');
      pupilGlowEl = wrapper.querySelector('.eye-pupil-glow');
      irisGroupEl = wrapper.querySelector('#eye-iris-group');
      pupilGroupEl = wrapper.querySelector('#eye-pupil-group');
      wrapper.querySelectorAll('.eye-vessel').forEach((el) => vesselEls.push(el));
    };

    const animate = () => {
      if (!svgEl) { queryElements(); }

      const t = Date.now() / 1000;
      const currentMood = moodRef.current;

      const isNeglectful = currentMood === 'neglectful';
      const isOverwhelmed = currentMood === 'overwhelmed';
      const isCurious = currentMood === 'curious';

      const baseBreath = isNeglectful ? 0.005 : 0.02;
      const glowBoost = isOverwhelmed ? 0.5 : isCurious ? 0.15 : 0;
      const vesselBoost = isOverwhelmed ? 0.4 : isNeglectful ? -0.2 : 0;

      // Container breathing scale
      if (containerEl) {
        const breathScale = 1 + Math.sin(t * Math.PI) * baseBreath;
        containerEl.style.transform = `scale(${breathScale})`;
      }

      // SVG glow pulse
      if (svgEl) {
        const glow = 40 + Math.sin(t * Math.PI * 1.5) * (15 + glowBoost * 20);
        const glow2 = 80 + Math.sin(t * Math.PI) * (20 + glowBoost * 25);
        svgEl.style.filter = `drop-shadow(0 0 ${glow}px rgba(138,154,106,${0.12 + glowBoost * 0.08})) drop-shadow(0 0 ${glow2}px rgba(138,154,106,${0.06 + glowBoost * 0.04}))`;
      }

      // Iris ring pulse
      if (irisRingEl) {
        const irisOpacity = 0.12 + Math.sin(t * Math.PI) * 0.1;
        irisRingEl.setAttribute('stroke', `rgba(138,154,106,${irisOpacity})`);
      }

      // Pupil glow pulse
      if (pupilGlowEl) {
        const glowOpacity = 0.08 + Math.sin(t * Math.PI * 1.5) * 0.08;
        pupilGlowEl.setAttribute('fill', `rgba(138,154,106,${glowOpacity})`);
      }

      // Blood vessels — staggered sin/cos opacity
      for (let i = 0; i < vesselEls.length; i++) {
        const v = vesselEls[i];
        if (v) {
          const baseOpacity = 0.5 + Math.sin(t * Math.PI * 0.8 + i * 0.5) * 0.3;
          const opacity = Math.min(1, Math.max(0.1, baseOpacity + vesselBoost));
          v.style.opacity = String(opacity);
        }
      }

      // Mouse-driven iris/pupil offset
      const mouse = mouseRef.current;
      if (irisGroupEl) {
        const ix = (mouse.x - 0.5) * 18;
        const iy = (mouse.y - 0.5) * 12;
        irisGroupEl.setAttribute('transform', `translate(${ix}, ${iy})`);
      }
      if (pupilGroupEl) {
        const px = (mouse.x - 0.5) * 28;
        const py = (mouse.y - 0.5) * 20;
        pupilGroupEl.setAttribute('transform', `translate(${px}, ${py})`);
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Throttled mouse tracking — writes to mutable ref, no React state
  useEffect(() => {
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
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
        mouseRef.current = {
          x: Math.cos(angle) * clampedDist * 0.3 + 0.5,
          y: Math.sin(angle) * clampedDist * 0.3 + 0.5,
        };
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Blink scheduling — writes blink transform directly to DOM overlay
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let blinkTimeout;
    let scheduleTimeout;

    const doBlink = () => {
      const overlay = wrapper.querySelector('.eye-blink-overlay');
      if (!overlay) return;
      overlay.style.transform = 'scaleY(1)';
      overlay.style.opacity = '1';
      blinkTimeout = setTimeout(() => {
        overlay.style.transform = 'scaleY(0)';
        overlay.style.opacity = '0';
      }, 150 + Math.random() * 200);
    };

    const schedule = () => {
      scheduleTimeout = setTimeout(() => {
        doBlink();
        schedule();
      }, 3000 + Math.random() * 5000);
    };

    const initialTimeout = setTimeout(schedule, 2000);
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(scheduleTimeout);
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Background eyes — static data generated once via ref
  const bgEyes = useRef(
    Array.from({ length: 20 }, () => ({
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      size: 0.8 + Math.random() * 2.5,
      color: Math.random() < 0.4 ? '#7a3a5a' : Math.random() < 0.3 ? '#8a9a6a' : '#5a6a40',
    }))
  ).current;

  return (
    <div ref={wrapperRef} className="grimoire-eye-wrapper">
      {/* Background blinking eyes */}
      <svg className="bg-eyes-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bgEyes.map((eye, i) => (
          <g key={i} className="bg-eye-group">
            <ellipse
              cx={eye.x}
              cy={eye.y}
              rx={eye.size / 2}
              ry={eye.size / 2}
              fill={eye.color}
              opacity="0.12"
              className="bg-eye-lid"
            />
            <circle
              cx={eye.x}
              cy={eye.y}
              r={eye.size * 0.15}
              fill="#020203"
              opacity="0.1"
              className="bg-eye-pupil"
            />
          </g>
        ))}
      </svg>

      {/* The Great Eye */}
      <div ref={containerRef} className="great-eye-container">
        <svg
          viewBox="0 0 400 280"
          className="great-eye-svg"
        >
          <defs>
            <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#141a24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0d1018" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06070a" stopOpacity="0.98" />
            </radialGradient>
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8a9a6a" stopOpacity="0.25" />
              <stop offset="30%" stopColor="#0a5a3a" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#4a1a3a" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#1a2530" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0c14" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="pupilGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1a2a30" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#060a0f" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#020203" stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a9a6a" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#4a1a3a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8a9a6a" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Outer glow rings */}
          <ellipse cx="200" cy="140" rx="220" ry="140"
            fill="none" stroke="url(#ringGrad)" strokeWidth="0.5" opacity="0.3"
            className="eye-ring-spin-slow" />
          <ellipse cx="200" cy="140" rx="205" ry="130"
            fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" opacity="0.2"
            className="eye-ring-spin-reverse" />
          <ellipse cx="200" cy="140" rx="190" ry="120"
            fill="none" stroke="#8a9a6a" strokeWidth="0.5" opacity="0.15"
            strokeDasharray="4 8" className="eye-ring-spin-medium" />

          {/* Sclera */}
          <path
            d="M 15,140 C 15,40 70,5 200,5 C 330,5 385,40 385,140 C 385,240 330,275 200,275 C 70,275 15,240 15,140 Z"
            fill="url(#scleraGrad)"
            stroke="rgba(138,154,106,0.06)"
            strokeWidth="0.8"
          />

          {/* Blood vessels */}
          <g className="eye-vessels">
            {Array.from({ length: 12 }).map((_, i) => {
              const startAngle = (i / 12) * Math.PI * 2;
              const startX = 200 + Math.cos(startAngle) * 130;
              const startY = 140 + Math.sin(startAngle) * 85;
              const mainEndX = startX + Math.cos(startAngle) * (60 + ((i * 3.7) % 40));
              const mainEndY = startY + Math.sin(startAngle) * (40 + ((i * 2.3) % 25));
              const mainMidX = startX + Math.cos(startAngle) * 30 + ((i * 4.1) % 20 - 10);
              const mainMidY = startY + Math.sin(startAngle) * 20 + ((i * 3.3) % 15 - 7);

              return (
                <path key={i}
                  d={`M ${startX},${startY} Q ${mainMidX},${mainMidY} ${mainEndX},${mainEndY}`}
                  fill="none"
                  stroke="rgba(138,30,30,0.12)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="eye-vessel"
                />
              );
            })}
          </g>

          {/* Iris */}
          <g id="eye-iris-group">
            <ellipse cx="200" cy="140" rx="125" ry="82" fill="url(#irisGrad)" />
            <ellipse cx="200" cy="140" rx="125" ry="82"
              fill="none"
              stroke="rgba(138,154,106,0.15)"
              strokeWidth="2"
              className="eye-iris-ring" />

            {/* Iris fibers */}
            {Array.from({ length: 48 }).map((_, i) => {
              const angle = (i / 48) * Math.PI * 2;
              const x1 = 200 + Math.cos(angle) * 40;
              const y1 = 140 + Math.sin(angle) * 40 * 0.65;
              const x2 = 200 + Math.cos(angle) * 110;
              const y2 = 140 + Math.sin(angle) * 110 * 0.65;
              const opacity = 0.04 + (i % 5) * 0.015;
              return (
                <line key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={`rgba(138,154,106,${opacity})`}
                  strokeWidth="0.3"
                  strokeLinecap="round"
                />
              );
            })}

            <ellipse cx="200" cy="140" rx="45" ry="28"
              fill="none"
              stroke="rgba(2,2,5,0.4)"
              strokeWidth="1.5" />

            {/* Pupil */}
            <g id="eye-pupil-group">
              <path
                d="M 200,104 C 215,104 218,140 218,140 C 218,140 215,176 200,176 C 185,176 182,140 182,140 C 182,140 185,104 200,104 Z"
                fill="url(#pupilGrad)"
              />
              <ellipse cx="200" cy="140" rx="12" ry="20"
                fill="rgba(138,154,106,0.1)"
                className="eye-pupil-glow" />
              <ellipse cx="192" cy="128" rx="8" ry="5"
                fill="rgba(138,154,106,0.08)" opacity="0.7" />
              <ellipse cx="208" cy="152" rx="5" ry="3"
                fill="rgba(138,154,106,0.04)" opacity="0.5" />
            </g>
          </g>

          {/* Eyelid creases */}
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

          {/* Eyelash tentacles */}
          {Array.from({ length: 16 }).map((_, i) => {
            const t = i / 15;
            const baseX = 40 + t * 320;
            const baseY = 15 + Math.sin(t * Math.PI) * 12;
            const tipX = baseX + ((i * 7) % 30 - 15);
            const tipY = baseY - 30 - ((i * 5) % 15);
            return (
              <path key={`top-${i}`}
                d={`M ${baseX},${baseY} Q ${baseX + ((i * 3) % 20 - 10)},${baseY - 18} ${tipX},${tipY}`}
                fill="none"
                stroke="rgba(138,154,106,0.15)"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="eye-tentacle"
              />
            );
          })}
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const baseX = 50 + t * 300;
            const baseY = 260 + Math.sin(t * Math.PI) * 10;
            const tipX = baseX + ((i * 5) % 25 - 12);
            const tipY = baseY + 25 + ((i * 3) % 12);
            return (
              <path key={`bot-${i}`}
                d={`M ${baseX},${baseY} Q ${baseX + ((i * 4) % 18 - 9)},${baseY + 15} ${tipX},${tipY}`}
                fill="none"
                stroke="rgba(122,58,90,0.12)"
                strokeWidth="1.2"
                strokeLinecap="round"
                className="eye-tentacle eye-tentacle--slow"
              />
            );
          })}
        </svg>

        {/* Blink overlay */}
        <div className="eye-blink-overlay" />

        {/* School filaments */}
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
                <span className="eye-filament-btn__symbol"><SchoolSigil schoolId={school.id} size={22} /></span>
                <span className="eye-filament-btn__name">{school.real}</span>
                <span className="eye-filament-btn__count">{school.spells.length}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
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
            <span className="pupil-search__placeholder">Search skills...</span>
          )}
          {searchQuery && totalMatches > 0 && (
            <span className="pupil-search__matches">{totalMatches} found</span>
          )}
        </div>
      </div>
    </div>
  );
}
