/* eslint-disable react/no-array-index-key -- decorative procedural arrays; index is stable for the lifetime of the mount */
import { useEffect, useRef } from 'react';
import '../styles/components/grimoire-eye.css';

export default function GrimoireEye({ mood = 'neutral', gaze = 0.25 }: { mood?: string; gaze?: number } = {}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const moodRef = useRef<string>(mood);
  const gazeRef = useRef<number>(gaze);

  // Keep refs in sync with props so the rAF loop (which closes over the refs)
  // always reads the latest mood/gaze without triggering re-renders.
  useEffect(() => {
    moodRef.current = mood;
    gazeRef.current = gaze;
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.setAttribute('data-mood', mood);
      wrapper.setAttribute('data-gaze', String(gaze));
    }
  }, [mood, gaze]);
  // Slice 06 — chromatic-aberration fringe on the void edge. Computed at render
  // time (only changes when `gaze` prop changes), never per animation frame.
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const abT = !reducedMotion && gaze >= 0.4 ? Math.sqrt((gaze - 0.4) / 0.6) : 0; // 0..1, eased
  const abOff = 1 + abT; // 1..2 px offset
  const abOp = abT * 0.08; // 0..0.08 (subtle, cosmic)
  const pupilAberration =
    abOp > 0
      ? `drop-shadow(${abOff.toFixed(2)}px 0 0 rgba(74,108,255,${abOp.toFixed(3)})) ` +
        `drop-shadow(${(-abOff).toFixed(2)}px 0 0 rgba(176,74,138,${abOp.toFixed(3)}))`
      : 'none';

  // Slice 07 — background eyes swarm: density scales with gaze (20 → 60, capped).
  const bgCount = Math.min(60, Math.round(20 + gaze * 40));

  // Single rAF loop — writes ALL animated properties directly to DOM.
  // No React state involved, so zero React re-renders from animation frames.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let rafId;

    // Cache element queries after first frame — they're stable for the component's lifetime
    let svgEl: HTMLElement | null = null;
    let containerEl: HTMLElement | null = null;
    let irisRingEl: HTMLElement | null = null;
    let pupilGlowEl: HTMLElement | null = null;
    let irisGroupEl: HTMLElement | null = null;
    let pupilGroupEl: HTMLElement | null = null;
    let starsGroupEl: HTMLElement | null = null;
    let starsInnerEl: HTMLElement | null = null;
    const vesselEls: HTMLElement[] = [];
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    const queryElements = () => {
      containerEl = wrapper.querySelector<HTMLElement>('.great-eye-container');
      svgEl = wrapper.querySelector<HTMLElement>('.great-eye-svg');
      irisRingEl = wrapper.querySelector<HTMLElement>('.eye-iris-ring');
      pupilGlowEl = wrapper.querySelector<HTMLElement>('.eye-pupil-glow');
      irisGroupEl = wrapper.querySelector<HTMLElement>('#eye-iris-group');
      pupilGroupEl = wrapper.querySelector<HTMLElement>('#eye-pupil-group');
      starsGroupEl = wrapper.querySelector<HTMLElement>('#eye-stars-group');
      starsInnerEl = wrapper.querySelector<HTMLElement>('#eye-stars-inner');
      wrapper.querySelectorAll<HTMLElement>('.eye-vessel').forEach((el) => vesselEls.push(el));
    };

    const animate = () => {
      if (!svgEl) {
        queryElements();
      }

      const t = Date.now() / 1000;
      const currentMood = moodRef.current;
      const isNeglectful = currentMood === 'neglectful';
      const isOverwhelmed = currentMood === 'overwhelmed';
      const isCurious = currentMood === 'curious';

      const baseBreath = isNeglectful ? 0.005 : 0.02;
      const glowBoost = isOverwhelmed ? 0.5 : isCurious ? 0.15 : 0;
      const vesselBoost = isOverwhelmed ? 0.4 : isNeglectful ? -0.2 : 0;
      const breathFreq = 1;

      // Container breathing scale
      if (containerEl) {
        const breathScale = 1 + Math.sin(t * Math.PI * breathFreq) * baseBreath;
        containerEl.style.transform = `scale(${breathScale})`;
      }

      // SVG glow pulse
      if (svgEl) {
        const glow = 40 + Math.sin(t * Math.PI * 1.5) * (15 + glowBoost * 20);
        const glow2 = 80 + Math.sin(t * Math.PI) * (20 + glowBoost * 25);
        svgEl.style.filter = `drop-shadow(0 0 ${glow}px rgba(127,212,255,${0.14 + glowBoost * 0.1})) drop-shadow(0 0 ${glow2}px rgba(127,212,255,${0.07 + glowBoost * 0.05}))`;
      }

      // Iris ring pulse
      if (irisRingEl) {
        const irisOpacity = 0.12 + Math.sin(t * Math.PI) * 0.1;
        irisRingEl.setAttribute('stroke', `rgba(201,210,232,${irisOpacity})`);
      }

      // Pupil glow pulse
      if (pupilGlowEl) {
        const glowOpacity = 0.08 + Math.sin(t * Math.PI * 1.5) * 0.08;
        pupilGlowEl.setAttribute('fill', `rgba(120,150,255,${glowOpacity})`);
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
      // Starfield — slow rotation + brightness scale with gaze; opposite parallax
      if (starsGroupEl) {
        const speed = prefersReduced ? 0 : 2 + gazeRef.current * 26;
        const rot = (Date.now() / 1000) * speed;
        const px = prefersReduced ? 0 : -((mouse.x - 0.5) * 18) * 1.5;
        const py = prefersReduced ? 0 : -((mouse.y - 0.5) * 12) * 1.5;
        starsGroupEl.setAttribute(
          'transform',
          `translate(200,140) rotate(${rot}) translate(${px},${py})`,
        );
      }
      if (starsInnerEl) {
        const b = prefersReduced ? 0.5 : 0.25 + gazeRef.current * 0.75;
        starsInnerEl.style.opacity = String(b);
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Throttled mouse tracking — writes to mutable ref, no React state
  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
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
      const overlay = wrapper.querySelector<HTMLElement>('.eye-blink-overlay');
      if (!overlay) return;
      overlay.style.transform = 'scaleY(1)';
      overlay.style.opacity = '1';
      blinkTimeout = setTimeout(
        () => {
          overlay.style.transform = 'scaleY(0)';
          overlay.style.opacity = '0';
        },
        150 + Math.random() * 200,
      );
    };

    const schedule = () => {
      scheduleTimeout = setTimeout(
        () => {
          doBlink();
          schedule();
        },
        3000 + Math.random() * 5000,
      );
    };

    const initialTimeout = setTimeout(schedule, 2000);
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(scheduleTimeout);
      clearTimeout(blinkTimeout);
    };
  }, []);
  // Background eyes — static pool generated once via ref. First 20 are the calm
  // baseline; eyes 20..59 are weighted cold/red so the swarm reddens as it grows.
  const bgEyes = useRef(
    Array.from({ length: 60 }, (_, i) => {
      const base = i < 20;
      return {
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
        size: base ? 0.8 + Math.random() * 2.5 : 1.0 + Math.random() * 3.0,
        color: base
          ? Math.random() < 0.4
            ? '#7a3a5a'
            : Math.random() < 0.3
              ? '#7fd4ff'
              : '#5a6a8a'
          : Math.random() < 0.5
            ? '#7a3a5a'
            : '#7fd4ff',
        delay: Math.random() * 6,
      };
    }),
  ).current;

  // Starfield — static data generated once via ref
  const stars = useRef(
    Array.from({ length: 14 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 13;
      return {
        dx: Math.cos(angle) * radius,
        dy: Math.sin(angle) * radius * 0.7,
        r: 0.4 + Math.random() * 1.3,
        color: Math.random() < 0.5 ? '#aebfff' : '#cfd8ff',
        opacity: 0.04 + Math.random() * 0.08,
      };
    }),
  ).current;

  return (
    <div ref={wrapperRef} className="grimoire-eye-wrapper">
      {/* Background blinking eyes */}
      <svg className="bg-eyes-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bgEyes.slice(0, bgCount).map((eye, i) => {
          const x = eye.x;
          const y = eye.y;
          const s = eye.size;
          const eyePath = `M ${x},${y - s / 2} C ${x + s / 2},${y - s / 4} ${x + s / 2},${y + s / 4} ${x},${y + s / 2} C ${x - s / 2},${y + s / 4} ${x - s / 2},${y - s / 4} ${x},${y - s / 2}`;
          return (
            <g key={i} className="bg-eye-group" style={{ animationDelay: `${eye.delay}s` }}>
              <path
                d={eyePath}
                fill="rgba(220,215,200,0.12)"
                opacity={0.12 + gaze * 0.18}
                className="bg-eye-lid"
              />
              <circle cx={x} cy={y} r={s * 0.28} fill={eye.color} opacity={0.18 + gaze * 0.22} />
              <circle
                cx={x}
                cy={y}
                r={s * 0.12}
                fill="#020203"
                opacity={0.22 + gaze * 0.18}
                className="bg-eye-pupil"
              />
              <circle
                cx={x - s * 0.08}
                cy={y - s * 0.08}
                r={s * 0.04}
                fill="#ffffff"
                opacity={0.25 + gaze * 0.2}
              />
            </g>
          );
        })}
      </svg>

      {/* The Great Eye */}
      <div ref={containerRef} className="great-eye-container">
        <svg viewBox="0 0 400 280" className="great-eye-svg">
          <defs>
            <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#05060c" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#05060c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#05060c" stopOpacity="0.98" />
            </radialGradient>
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3a5a8c" stopOpacity="0.25" />
              <stop offset="30%" stopColor="#2a1a44" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#1a2540" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#16243a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0c14" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="pupilGrad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="70%" stopColor="#02030a" stopOpacity="1" />
              <stop offset="100%" stopColor="#05060c" stopOpacity="0.96" />
            </radialGradient>
            <filter id="voidBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7fd4ff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7fd4ff" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Outer glow rings */}
          <ellipse
            cx="200"
            cy="140"
            rx="220"
            ry="140"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="0.5"
            opacity="0.3"
            className="eye-ring-spin-slow"
          />
          <ellipse
            cx="200"
            cy="140"
            rx="205"
            ry="130"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="0.8"
            opacity="0.2"
            className="eye-ring-spin-reverse"
          />
          <ellipse
            cx="200"
            cy="140"
            rx="190"
            ry="120"
            fill="none"
            stroke="rgba(127,212,255,0.15)"
            strokeWidth="0.5"
            opacity="0.15"
            strokeDasharray="4 8"
            className="eye-ring-spin-medium"
          />

          {/* Sclera */}
          <path
            d="M 15,140 C 15,40 70,5 200,5 C 330,5 385,40 385,140 C 385,240 330,275 200,275 C 70,275 15,240 15,140 Z"
            fill="url(#scleraGrad)"
            stroke="rgba(127,212,255,0.05)"
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
              const mainMidX = startX + Math.cos(startAngle) * 30 + (((i * 4.1) % 20) - 10);
              const mainMidY = startY + Math.sin(startAngle) * 20 + (((i * 3.3) % 15) - 7);

              return (
                <path
                  key={i}
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
            <ellipse
              cx="200"
              cy="140"
              rx="125"
              ry="82"
              fill="none"
              stroke="rgba(201,210,232,0.2)"
              strokeWidth="2"
              className="eye-iris-ring"
            />

            {/* Non-Euclidean iris rings — count + contrast scale with gaze */}
            <g id="eye-rings-group">
              <ellipse
                cx="200"
                cy="140"
                rx="72"
                ry="66"
                fill="none"
                stroke="#c9d2e8"
                strokeWidth="0.8"
                strokeOpacity={0.1 + gaze * 0.25}
                transform="rotate(0 200 140)"
                className="eye-ring eye-ring--a"
              />
              {gaze >= 0.55 && (
                <ellipse
                  cx="200"
                  cy="140"
                  rx="112"
                  ry="42"
                  fill="none"
                  stroke="#c9d2e8"
                  strokeWidth="0.7"
                  strokeOpacity={0.07 + gaze * 0.22}
                  transform="rotate(24 200 140)"
                  className="eye-ring eye-ring--b"
                />
              )}
              {gaze >= 0.8 && (
                <ellipse
                  cx="200"
                  cy="140"
                  rx="84"
                  ry="60"
                  fill="none"
                  stroke="#c9d2e8"
                  strokeWidth="0.6"
                  strokeOpacity={0.05 + gaze * 0.2}
                  transform="rotate(-34 200 140)"
                  className="eye-ring eye-ring--c"
                />
              )}
            </g>

            <ellipse
              cx="200"
              cy="140"
              rx="45"
              ry="28"
              fill="none"
              stroke="rgba(2,2,5,0.4)"
              strokeWidth="1.5"
            />

            {/* Pupil — depthless void */}
            <g id="eye-pupil-group" style={{ filter: pupilAberration }}>
              <path
                d="M 200,104 C 215,104 218,140 218,140 C 218,140 215,176 200,176 C 185,176 182,140 182,140 C 182,140 185,104 200,104 Z"
                fill="url(#pupilGrad)"
              />
              <ellipse
                cx="200"
                cy="140"
                rx="12"
                ry="20"
                fill="rgba(120,150,255,0.12)"
                className="eye-pupil-glow"
              />
            </g>
          </g>

          {/* Starfield + nebula — deeper layer, parallax opposite the iris */}
          <g id="eye-stars-group" transform="translate(200,140)">
            <g id="eye-stars-inner">
              <ellipse
                cx="-4"
                cy="3"
                rx="14"
                ry="10"
                fill="#1b1f4a"
                opacity="0.5"
                filter="url(#voidBlur)"
                className="eye-nebula"
              />
              <ellipse
                cx="6"
                cy="-4"
                rx="9"
                ry="7"
                fill="#3a2a5a"
                opacity="0.42"
                filter="url(#voidBlur)"
                className="eye-nebula eye-nebula--b"
              />
              {stars.map((s, i) => (
                <circle
                  key={i}
                  cx={s.dx}
                  cy={s.dy}
                  r={s.r}
                  fill={s.color}
                  opacity={s.opacity}
                  className="eye-star"
                />
              ))}
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
            const tipX = baseX + (((i * 7) % 30) - 15);
            const tipY = baseY - 30 - ((i * 5) % 15);
            return (
              <path
                key={`top-${i}`}
                d={`M ${baseX},${baseY} Q ${baseX + (((i * 3) % 20) - 10)},${baseY - 18} ${tipX},${tipY}`}
                fill="none"
                stroke="rgba(150,185,230,0.15)"
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
            const tipX = baseX + (((i * 5) % 25) - 12);
            const tipY = baseY + 25 + ((i * 3) % 12);
            return (
              <path
                key={`bot-${i}`}
                d={`M ${baseX},${baseY} Q ${baseX + (((i * 4) % 18) - 9)},${baseY + 15} ${tipX},${tipY}`}
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
      </div>
    </div>
  );
}
