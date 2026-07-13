import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorageState } from './useLocalStorageState.ts';

export const EYE_MOODS = {
  NEUTRAL: 'neutral',
  CURIOUS: 'curious',
  OVERWHELMED: 'overwhelmed',
  NEGLECTFUL: 'neglectful',
} as const;

export type EyeMood = (typeof EYE_MOODS)[keyof typeof EYE_MOODS];

const IDLE_THRESHOLD_MS = 15 * 60 * 1000;
const CURIOUS_THRESHOLD = 3;
const OVERWHELMED_THRESHOLD = 10;

function computeMood(viewedCount: number, idleMs: number): EyeMood {
  if (idleMs >= IDLE_THRESHOLD_MS) return EYE_MOODS.NEGLECTFUL;
  if (viewedCount >= OVERWHELMED_THRESHOLD) return EYE_MOODS.OVERWHELMED;
  if (viewedCount >= CURIOUS_THRESHOLD) return EYE_MOODS.CURIOUS;
  return EYE_MOODS.NEUTRAL;
}

export function useEyeMood() {
  const { value: mood, setValue: setMood } = useLocalStorageState<EyeMood>({
    key: 'grimoire-eye-mood',
    initial: () => EYE_MOODS.NEUTRAL,
  });

  const { value: lastInteraction, setValue: setLastInteraction } = useLocalStorageState<number>({
    key: 'grimoire-eye-last-interaction',
    initial: () => Date.now(),
  });

  const viewedSkillsRef = useRef(new Set<string>());
  const currentMoodRef = useRef(mood);

  useEffect(() => {
    currentMoodRef.current = mood;
  }, [mood]);

  const recordView = useCallback(
    (skillId: string) => {
      if (!skillId) return;
      viewedSkillsRef.current.add(skillId);
      const now = Date.now();
      setLastInteraction(now);
      const next = computeMood(viewedSkillsRef.current.size, 0);
      setMood(next);
    },
    [setMood, setLastInteraction],
  );

  useEffect(() => {
    const idleMs = Date.now() - lastInteraction;
    if (idleMs >= IDLE_THRESHOLD_MS) {
      viewedSkillsRef.current.clear();
      setMood(EYE_MOODS.NEUTRAL);
    }
  }, [lastInteraction, setMood]);

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
