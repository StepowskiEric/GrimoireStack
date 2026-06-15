import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'grimoire-marginalia';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function save(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}

export function useMarginalia() {
  const [notes, setNotes] = useState(load);

  useEffect(() => {
    save(notes);
  }, [notes]);

  const getNote = useCallback((skill) => notes[skill] || '', [notes]);

  const setNote = useCallback((skill, text) => {
    setNotes((prev) => ({ ...prev, [skill]: text }));
  }, []);

  const clear = useCallback((skill) => {
    setNotes((prev) => {
      const next = { ...prev };
      delete next[skill];
      return next;
    });
  }, []);

  return { getNote, setNote, clear, notes, setNotes };
}
