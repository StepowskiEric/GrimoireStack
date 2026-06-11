import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'grimoire-recent';
const MAX_ENTRIES = 20;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState(load);

  useEffect(() => {
    save(recent);
  }, [recent]);

  const record = useCallback((name, skill) => {
    setRecent((prev) => {
      const filtered = prev.filter((e) => e.skill !== skill);
      const next = [{ name, skill, viewedAt: Date.now() }, ...filtered];
      return next.slice(0, MAX_ENTRIES);
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
  }, []);

  return { recent, record, clear };
}
