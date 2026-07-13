import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState.js';

const STORAGE_KEY = 'grimoire-recent';
const MAX_ENTRIES = 20;

export function useRecentlyViewed() {
  const { value: recent, setValue: setRecent } = useLocalStorageState({
    key: STORAGE_KEY,
    initial: () => [],
    parse: (raw) => {
      if (!raw) return [];
      try {
        const v = JSON.parse(raw);
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    },
  });

  const record = useCallback(
    (name, skill) => {
      setRecent((prev) => {
        const filtered = prev.filter((e) => e.skill !== skill);
        const next = [{ name, skill, viewedAt: Date.now() }, ...filtered];
        return next.slice(0, MAX_ENTRIES);
      });
    },
    [setRecent],
  );

  const clear = useCallback(() => {
    setRecent([]);
  }, [setRecent]);

  return { recent, record, clear, setRecent };
}
