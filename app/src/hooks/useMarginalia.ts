import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState.ts';

const STORAGE_KEY = 'grimoire-marginalia';

export function useMarginalia() {
  const { value: notes, setValue: setNotes } = useLocalStorageState<Record<string, string>>({
    key: STORAGE_KEY,
    initial: () => ({}),
  });

  const getNote = useCallback((skill: string) => notes[skill] || '', [notes]);

  const setNote = useCallback(
    (skill: string, text: string) => {
      setNotes((prev) => ({ ...prev, [skill]: text }));
    },
    [setNotes],
  );

  const clear = useCallback(
    (skill: string) => {
      setNotes((prev) => {
        const next = { ...prev };
        delete next[skill];
        return next;
      });
    },
    [setNotes],
  );

  return { getNote, setNote, clear, notes, setNotes };
}
