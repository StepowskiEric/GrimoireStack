import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState.js';

const STORAGE_KEY = 'grimoire-marginalia';

export function useMarginalia() {
  const { value: notes, setValue: setNotes } = useLocalStorageState({
    key: STORAGE_KEY,
    initial: () => ({}),
  });

  const getNote = useCallback((skill) => notes[skill] || '', [notes]);

  const setNote = useCallback(
    (skill, text) => {
      setNotes((prev) => ({ ...prev, [skill]: text }));
    },
    [setNotes],
  );

  const clear = useCallback(
    (skill) => {
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
