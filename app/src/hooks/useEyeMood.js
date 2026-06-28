import { useRef, useEffect, useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState.js';

export const EYE_MOODS = Object.freeze({
  NEUTRAL: 'neutral',
  CURIOUS: 'curious',
  OVERWHELMED: 'overwhelmed',
  NEGLECTFUL: 'neglectful',
});

const IDLE_THRESHOLD_MS = 15 * 60 * 1000;
const CURIOUS_THRESHOLD = 3;
const OVERWHELMED_THRESHOLD = 10;

function computeMood(viewedCount, idleMs) {
  if (idleMs >= IDLE_THRESHOLD_MS) return EYE_MOODS.NEGLECTFUL;
  if (viewedCount >= OVERWHELMED_THRESHOLD) return EYE_MOODS.OVERWHELMED;
  if (viewedCount >= CURIOUS_THRESHOLD) return EYE_MOODS.CURIOUS;
  return EYE_MOODS.NEUTRAL;
}

export function useEyeMood() {
  const { value: mood, setValue: setMood } = useLocalStorageState({
    key: 'grimoire-eye-mood',
    initial: () => EYE_MOODS.NEUTRAL,
  });

  const { value: lastInteraction, setValue: setLastInteraction } = useLocalStorageState({
    key: 'grimoire-eye-last-interaction',
    initial: () => Date.now(),
  });

  const viewedSkillsRef = useRef(new Set());
  const currentMoodRef = useRef(mood);

  // Keep ref in sync for comparison in the heartbeat
  useEffect(() => {
    currentMoodRef.current = mood;
  }, [mood]);

  const recordView = useCallback((skillId) => {
    if (!skillId) return;
    viewedSkillsRef.current.add(skillId);
    const now = Date.now();
    setLastInteraction(now);
    // Just interacted — idle is 0, mood can't be neglectful
    const next = computeMood(viewedSkillsRef.current.size, 0);
    setMood(next);
  }, [setMood, setLastInteraction]);

  // On mount: reset session state if returning after prolonged absence
  useEffect(() => {
    const idleMs = Date.now() - lastInteraction;
    if (idleMs >= IDLE_THRESHOLD_MS) {
      viewedSkillsRef.current.clear();
      setMood(EYE_MOODS.NEUTRAL);
    }
  }, [lastInteraction, setMood]);

  // Heartbeat: transition to neglectful when idle threshold is crossed
  useEffect(() => {
    const interval = setInterval(() => {
      const idleMs = Date.now() - lastInteraction;
      const next = computeMood(viewedSkillsRef.current.size, idleMs);
      if (next !== currentMoodRef.current) {
        setMood(next);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [lastInteraction, setMood]);

  return { mood, recordView, EYE_MOODS };
}
