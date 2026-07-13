import { useEffect, useRef, useState } from 'react';
import { bandGaze, computeGaze } from '../utils/gaze.js';

const DWELL_TICK_MS = 400;

// Tracks how long the page has been open and folds in Ritual progress to
// produce a banded `gaze` (0|0.2|0.4|0.6|0.8|1). Re-renders only when the band
// actually changes, so the rest of the shell is not churned every frame.
export function useGaze(ritual) {
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
