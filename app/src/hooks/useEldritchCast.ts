import { useCallback, useEffect, useRef, useState } from 'react';
import { castBoom, castScratch, castTear, castThud } from '../audio/sounds.ts';

const PHASES = [
  { name: 'wake', end: 600 },
  { name: 'bleed', end: 1100 },
  { name: 'sigil', end: 2000 },
  { name: 'name', end: 2700 },
  { name: 'hold', end: 3100 },
  { name: 'close', end: 3800 },
];

const TOTAL = 3800;
const CLOSE_DURATION = 700;
const SKIP_AFTER = 2000;

const SOUND_AT: Record<string, number> = {
  bleed: 1100,
  sigil: 1100,
  name: 2000,
  close: 3100,
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function phaseAt(elapsed: number): string {
  for (const p of PHASES) {
    if (elapsed < p.end) return p.name;
  }
  return 'close';
}

export function useEldritchCast({ onComplete }: { onComplete: () => void }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const [phase, setPhase] = useState<string>(reduced ? 'reduced' : 'wake');

  const startRef = useRef(0);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const playedSoundsRef = useRef(new Set<string>());
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(() => onCompleteRef.current?.(), 600);
      return () => clearTimeout(t);
    }

    startRef.current = performance.now();
    offsetRef.current = 0;
    completedRef.current = false;
    playedSoundsRef.current = new Set();

    const tick = (now: number) => {
      if (completedRef.current) return;
      const elapsed = now - startRef.current + offsetRef.current;

      for (const [key, at] of Object.entries(SOUND_AT)) {
        if (elapsed >= at && !playedSoundsRef.current.has(key)) {
          playedSoundsRef.current.add(key);
          if (key === 'bleed') castTear();
          else if (key === 'sigil') castBoom();
          else if (key === 'name') castScratch();
          else if (key === 'close') castThud();
        }
      }

      const next = phaseAt(elapsed);
      setPhase((prev) => (prev === next ? prev : next));

      if (elapsed >= TOTAL) {
        completedRef.current = true;
        setTimeout(() => onCompleteRef.current?.(), CLOSE_DURATION);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  const canSkip = phase === 'sigil' || phase === 'name' || phase === 'hold' || phase === 'close';

  const handleSkip = useCallback(() => {
    if (completedRef.current) return;
    const elapsed = performance.now() - startRef.current + offsetRef.current;
    if (elapsed < SKIP_AFTER) return;
    completedRef.current = true;
    offsetRef.current = TOTAL - CLOSE_DURATION - (performance.now() - startRef.current);
    if (offsetRef.current < 0) offsetRef.current = 0;
    setPhase('close');
    if (!playedSoundsRef.current.has('close')) {
      playedSoundsRef.current.add('close');
      castThud();
    }
    setTimeout(() => {
      onCompleteRef.current?.();
    }, CLOSE_DURATION);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSkip]);

  return { phase, reduced, canSkip, handleSkip };
}
