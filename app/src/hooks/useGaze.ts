import { useEffect, useRef, useState } from 'react';
import { bandGaze, computeGaze } from '../utils/gaze.ts';

const DWELL_TICK_MS = 400;

export function useGaze(ritual: { state?: string; round?: number } | null) {
  const ritualState = ritual?.state ?? 'idle';
  const ritualRound = ritual?.round ?? 0;
  const mountRef = useRef(Date.now());
  const [gaze, setGaze] = useState(0);

  useEffect(() => {
    const tick = () => {
      const dwellSec = (Date.now() - mountRef.current) / 1000;
      const next = bandGaze(computeGaze({ dwellSec, state: ritualState, round: ritualRound }));
      setGaze((prev) => (prev === next ? prev : next));
    };

    tick();
    const id = setInterval(tick, DWELL_TICK_MS);
    return () => clearInterval(id);
  }, [ritualState, ritualRound]);

  return { gaze };
}
