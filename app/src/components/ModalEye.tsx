import { useEffect, useRef, useState } from 'react';

interface Props {
  size?: number;
  className?: string;
}

// A small lidless eye that opens its upper lid on mount.
// Echoes the LidlessEyeCast choreography, scaled down for modal headers.
// Respects prefers-reduced-motion: renders static (open) when reduced.
export default function ModalEye({ size = 48, className }: Props) {
  const [reduced, setReduced] = useState(false);
  const [opened, setOpened] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (typeof window.matchMedia !== 'function') {
      setOpened(true);
      return undefined;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) {
      setOpened(true);
      return undefined;
    }
    // Allow the lid to render closed, then open on the next frame
    rafRef.current = requestAnimationFrame(() => {
      setOpened(true);
    });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const aspect = 240 / 160;
  const w = size;
  const h = size / aspect;

  return (
    <svg
      className={`modal-eye ${className || ''} ${opened ? 'modal-eye--opened' : ''} ${reduced ? 'modal-eye--reduced' : ''}`}
      width={w}
      height={h}
      viewBox="0 0 240 160"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-testid="modal-eye"
    >
      <defs>
        <radialGradient id="modal-eye-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5a4a3a" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#2a1a1a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0a0608" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="modal-eye-pupil" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1a0a0a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="modal-eye-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#c44545" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sclera */}
      <ellipse cx="120" cy="80" rx="105" ry="65" fill="#0a0808" stroke="rgba(196,184,152,0.18)" strokeWidth="0.8" />

      {/* Iris */}
      <ellipse cx="120" cy="80" rx="50" ry="34" fill="url(#modal-eye-iris)" />

      {/* Faint inner iris detail lines */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x1 = 120 + Math.cos(a) * 16;
        const y1 = 80 + Math.sin(a) * 11;
        const x2 = 120 + Math.cos(a) * 46;
        const y2 = 80 + Math.sin(a) * 30;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(196,184,152,0.07)" strokeWidth="0.6" />;
      })}

      {/* Pupil */}
      <ellipse cx="120" cy="80" rx="18" ry="12" fill="url(#modal-eye-pupil)" />

      {/* Red glow behind the eye */}
      <ellipse cx="120" cy="80" rx="90" ry="55" fill="url(#modal-eye-glow)" />

      {/* Upper lid (the one that opens) */}
      <path
        className="modal-eye__lid modal-eye__lid--upper"
        d="M 15 80 C 15 30 55 12 120 12 C 185 12 225 30 225 80 C 195 32 45 32 15 80 Z"
        fill="#020203"
        stroke="rgba(196,184,152,0.14)"
        strokeWidth="0.8"
      />
      {/* Lower lid (static) */}
      <path
        className="modal-eye__lid modal-eye__lid--lower"
        d="M 15 80 C 15 130 55 148 120 148 C 185 148 225 130 225 80 C 195 128 45 128 15 80 Z"
        fill="#020203"
        stroke="rgba(196,184,152,0.14)"
        strokeWidth="0.8"
      />
    </svg>
  );
}
