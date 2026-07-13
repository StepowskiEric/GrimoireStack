import { useCallback, useEffect, useReducer, useRef } from 'react';

const IDLE = 'idle';
const DIMMING = 'dimming';
const WALKING = 'walking';
const ARRIVING = 'arriving';
const DONE = 'done';

interface WalkState {
  phase: string;
  targetSkill: { skill: string; school: string } | null;
  scrollProgress: number;
}

type WalkAction =
  | { type: 'START'; skill: { skill: string; school: string } }
  | { type: 'TIMEOUT' }
  | { type: 'ARRIVE' }
  | { type: 'RESET' };

function walkReducer(state: WalkState, action: WalkAction): WalkState {
  switch (state.phase) {
    case IDLE:
      if (action.type === 'START')
        return { phase: DIMMING, targetSkill: action.skill, scrollProgress: 0 };
      break;
    case DIMMING:
      if (action.type === 'TIMEOUT') return { ...state, phase: WALKING };
      if (action.type === 'RESET') return INITIAL;
      break;
    case WALKING:
      if (action.type === 'ARRIVE') return { ...state, phase: ARRIVING };
      if (action.type === 'RESET') return INITIAL;
      break;
    case ARRIVING:
      if (action.type === 'TIMEOUT') return { ...state, phase: DONE };
      if (action.type === 'RESET') return INITIAL;
      break;
    case DONE:
      if (action.type === 'RESET') return INITIAL;
      break;
  }
  return state;
}

const INITIAL: WalkState = { phase: IDLE, targetSkill: null, scrollProgress: 0 };

export function useRitualWalk({
  onComplete,
  navigateToLibrary,
}: {
  onComplete: (target: { skill: string; school: string }) => void;
  navigateToLibrary: () => void;
}) {
  const [s, dispatch] = useReducer(walkReducer, INITIAL);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (s.phase !== DIMMING) return;
    const timer = setTimeout(() => dispatch({ type: 'TIMEOUT' }), 600);
    return () => clearTimeout(timer);
  }, [s.phase]);

  useEffect(() => {
    if (s.phase !== WALKING || !s.targetSkill) return;
    let rafId: number;
    const startTime = performance.now();
    const duration = 2500;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const targetEl = document.querySelector(`[data-skill="${s.targetSkill!.skill}"]`);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const targetY = rect.top + window.scrollY - window.innerHeight / 2;
        const currentY = window.scrollY;
        window.scrollTo({ top: currentY + (targetY - currentY) * 0.05, behavior: 'auto' });

        if (rect.top > 0 && rect.top < window.innerHeight * 0.7 && progress > 0.5) {
          dispatch({ type: 'ARRIVE' });
          return;
        }
      } else if (progress >= 1) {
        dispatch({ type: 'ARRIVE' });
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [s.phase, s.targetSkill]);

  useEffect(() => {
    if (s.phase !== ARRIVING || !s.targetSkill) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'TIMEOUT' });
      onCompleteRef.current?.(s.targetSkill!);
    }, 400);
    return () => clearTimeout(timer);
  }, [s.phase, s.targetSkill]);

  const start = useCallback(
    (skill: { skill: string; school: string }) => {
      dispatch({ type: 'START', skill });
      navigateToLibrary?.();
    },
    [navigateToLibrary],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    phase: s.phase,
    targetSkill: s.targetSkill,
    scrollProgress: s.scrollProgress,
    start,
    reset,
  };
}
