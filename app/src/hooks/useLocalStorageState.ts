import { useEffect, useState } from 'react';

interface UseLocalStorageStateOptions<T> {
  key: string;
  initial: () => T;
  parse?: (raw: string | null, fallback: T) => T;
  onChange?: (v: T) => void;
}

export function useLocalStorageState<T>({
  key,
  initial,
  parse,
  onChange,
}: UseLocalStorageStateOptions<T>): {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
} {
  const parseValue =
    parse ||
    ((raw: string | null, fallback: T) => {
      if (!raw) return fallback;
      try {
        const v = JSON.parse(raw);
        return v !== null && typeof v === 'object' && !Array.isArray(v) ? v : fallback;
      } catch {
        return fallback;
      }
    });

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial();
    return parseValue(window.localStorage.getItem(key), initial());
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
    onChange?.(value);
  }, [key, value, onChange]);

  return { value, setValue };
}
