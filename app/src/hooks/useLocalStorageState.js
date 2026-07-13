import { useEffect, useState } from 'react';

/**
 * useLocalStorageState — shared primitive for localStorage-backed React state.
 *
 * Each hook that wraps this supplies its own value/array initializer,
 * change handler (for side effects like cap enforcement), and shape
 * of the returned helper API.
 *
 * @template T
 * @param {Object} opts
 * @param {string} opts.key — localStorage key
 * @param {() => T} opts.initial — default value factory
 * @param {(raw: string | null, fallback: T) => T} [opts.parse] — custom parser, defaults to JSON.parse
 * @param {(v: T) => void} [opts.onChange] — optional side-effect on every state change
 * @returns {{ value: T, setValue: (updater: T | ((prev: T) => T)) => void }}
 */
export function useLocalStorageState({ key, initial, parse, onChange }) {
  const parseValue =
    parse ||
    ((raw, fallback) => {
      if (!raw) return fallback;
      try {
        const v = JSON.parse(raw);
        return v !== null && typeof v === 'object' && !Array.isArray(v) ? v : fallback;
      } catch {
        return fallback;
      }
    });

  const [value, setValue] = useState(() => {
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
