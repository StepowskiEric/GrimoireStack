import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState.ts';

const STORAGE_KEY = 'grimoire-recent';
const MAX_ENTRIES = 20;

export interface RecentEntry {
  name: string;
  skill: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const { value: recent, setValue: setRecent } = useLocalStorageState<RecentEntry[]>({
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
    (name: string, skill: string) => {
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
