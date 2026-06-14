/**
 * useDebouncedValue — delay updates to a value by a quiet period.
 *
 * Rule 6 exception: debouncing inherently requires a deferred reaction
 * to a changing prop, which is exactly what useEffect was designed for.
 */
import { useState, useEffect, useRef } from 'react';

export function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(value), delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delayMs]);

  return debounced;
}
