import { useState, useRef, useCallback, useEffect } from 'react';
import { castTear, castBoom, castScratch, castThud } from '../audio/sounds.js';

// Phase boundaries (ms from start). The phase is derived from elapsed
// time, not stored in state separately — single source of truth.
const PHASES = [
  { name: 'wake',  end: 600  },
  { name: 'bleed', end: 1100 },
  { name: 'sigil', end: 2000 },
  { name: 'name',  end: 2700 },
  { name: 'hold',  end: 3100 },
  { name: 'close', end: 3800 },
];

const TOTAL = 3800;
const CLOSE_DURATION = 700;
const SKIP_AFTER = 2000;

const SOUND_AT = {
  bleed: 1100,  // castTear at start of bleed
  sigil: 1100,  // castBoom at start of sigil
  name:  2000,  // castScratch at start of name
  close: 3100,  // castThud at start of close
};

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function phaseAt(elapsed) {
  for (const p of PHASES) {
    if (elapsed < p.end) return p.name;
  }
  return 'close';
}

/**
 * useEldritchCast — drives the Lidless Eye cast timeline.
 *
 * A single requestAnimationFrame loop is the source of truth. The
 * phase is derived from elapsed time, so there's no chain of
 * setTimeouts to clean up and no race between staggered phase
 * transitions. The animation runs once on mount, calls onComplete
 * after the close phase finishes, and supports skip-to-close.
 */
export function useEldritchCast({ onComplete }) {
  // Derive initial state once — no useEffect needed for this read
  const reduced = useRef(prefersReducedMotion()).current;
  const [phase, setPhase] = useState(reduced ? 'reduced' : 'wake');

  // Refs for the imperative timeline. Updated render-side so the
  // rAF callback always sees the latest values without re-subscribing.
  const startRef = useRef(0);
  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const completedRef = useRef(false);
  const playedSoundsRef = useRef(new Set());
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

    const tick = (now) => {
      if (completedRef.current) return;
      const elapsed = now - startRef.current + offsetRef.current;

      // Fire phase sounds once each (derived from elapsed time)
      for (const [key, at] of Object.entries(SOUND_AT)) {
        if (elapsed >= at && !playedSoundsRef.current.has(key)) {
          playedSoundsRef.current.add(key);
          if (key === 'bleed') castTear();
          else if (key === 'sigil') castBoom();
          else if (key === 'name') castScratch();
          else if (key === 'close') castThud();
        }
      }

      // Update phase (derived state — only setState if it actually changed)
      const next = phaseAt(elapsed);
      setPhase((prev) => (prev === next ? prev : next));

      if (elapsed >= TOTAL) {
        completedRef.current = true;
        // Close phase is the final 700ms — wait for it to finish
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

  // Skip: jump to close phase. canSkip mirrors the old "after sigil" rule.
  // canSkip is derived from the current phase — the rAF loop has already
  // determined that elapsed >= SKIP_AFTER (which is the sigil boundary).
  const canSkip = phase === 'sigil' || phase === 'name' || phase === 'hold' || phase === 'close';

  const handleSkip = useCallback(() => {
    if (completedRef.current) return;
    // Reject skip if we haven't reached the skippable window yet
    const elapsed = performance.now() - startRef.current + offsetRef.current;
    if (elapsed < SKIP_AFTER) return;
    // Mark completed immediately so the rAF tick cannot also fire completion
    completedRef.current = true;
    // Jump to close phase: shift offset so elapsed lands at TOTAL - CLOSE_DURATION
    offsetRef.current = (TOTAL - CLOSE_DURATION) - (performance.now() - startRef.current);
    if (offsetRef.current < 0) offsetRef.current = 0;
    setPhase('close');
    if (!playedSoundsRef.current.has('close')) {
      playedSoundsRef.current.add('close');
      castThud();
    }
    // Schedule completion after the close phase duration
    setTimeout(() => {
      onCompleteRef.current?.();
    }, CLOSE_DURATION);
  }, []);

  // Escape key support — single window listener, cleaned up with the hook
  useEffect(() => {
    const onKey = (e) => {
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
