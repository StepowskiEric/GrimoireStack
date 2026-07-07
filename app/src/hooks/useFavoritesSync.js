import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorageState } from './useLocalStorageState.js';
import { useFavorites } from './useFavorites.js';
import { ALPHABET, CODE_LEN, isValidSyncCode } from '../data/sync-codes.js';

const SYNC_CODE_KEY = 'grimoire-sync-code';
const SYNC_API_URL = '/api/favorites-sync';
const PUSH_DEBOUNCE_MS = 1000;

function generateCode() {
  const bytes = new Uint8Array(CODE_LEN);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

function mergeFavorites(local, cloud) {
  if (!Array.isArray(cloud)) return local;
  const bySkill = new Map();
  for (const f of [...local, ...cloud]) {
    if (!f || typeof f.skill !== 'string' || !f.skill) continue;
    const existing = bySkill.get(f.skill);
    if (!existing || (f.addedAt || 0) < (existing.addedAt || 0)) {
      bySkill.set(f.skill, f);
    }
  }
  return Array.from(bySkill.values());
}


async function callSyncApi({ op, code, data }) {
  const res = await fetch(SYNC_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, code, data }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export function useFavoritesSync() {
  const base = useFavorites();
  const { favorites, isFavorited, toggleFavorite, findFavoriteSpell, setFavorites } = base;

  const { value: code, setValue: setCodeValue } = useLocalStorageState({
    key: SYNC_CODE_KEY,
    initial: () => null,
    parse: (raw) => {
      if (typeof raw !== 'string' || raw.length === 0) return null;
      try {
        const v = JSON.parse(raw);
        return isValidSyncCode(v) ? v : null;
      } catch {
        return isValidSyncCode(raw) ? raw : null;
      }
    },
  });

  const [status, setStatus] = useState('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);

  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);
  const favoritesRef = useRef(favorites);

  useEffect(() => { favoritesRef.current = favorites; });

  const syncToggleFavorite = useCallback(
    (name, skill) => {
      toggleFavorite(name, skill);
      dirtyRef.current = true;
      setDirty(true);
      return true;
    },
    [toggleFavorite]
  );

  const enableSync = useCallback(() => {
    const newCode = generateCode();
    initializedRef.current = false;
    dirtyRef.current = false;
    setStatus('idle');
    setError(null);
    setDirty(false);
    setCodeValue(newCode);
    return newCode;
  }, [setCodeValue]);

  const disableSync = useCallback(() => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(SYNC_CODE_KEY); } catch {}
    }
    setCodeValue(null);
    initializedRef.current = false;
    dirtyRef.current = false;
    setStatus('idle');
    setLastSyncedAt(null);
    setError(null);
    setDirty(false);
  }, [setCodeValue]);

  // Effect 1: on code change, pull cloud state, merge with local, push merged.
  useEffect(() => {
    if (!code) return undefined;
    initializedRef.current = false;
    let cancelled = false;

    (async () => {
      setStatus('syncing');
      setError(null);
      try {
        const res = await callSyncApi({ op: 'get', code });
        if (cancelled) return;
        const cloud = Array.isArray(res.data) ? res.data : [];
        const currentFavorites = favoritesRef.current;
        const merged = mergeFavorites(currentFavorites, cloud);
        setFavorites(merged);
        await callSyncApi({ op: 'put', code, data: merged });
        if (cancelled) return;
        initializedRef.current = true;
        dirtyRef.current = false;
        setDirty(false);
        setLastSyncedAt(Date.now());
        setStatus('synced');
      } catch (e) {
        if (cancelled) return;
        setError(e.message);
        setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [code, setFavorites]);

  // Effect 2: on dirty flag, debounced push of local favorites to cloud.
  useEffect(() => {
    if (!code || !initializedRef.current || !dirty) return undefined;

    const timeoutId = setTimeout(async () => {
      try {
        await callSyncApi({ op: 'put', code, data: favoritesRef.current });
        setDirty(false);
        dirtyRef.current = false;
        setLastSyncedAt(Date.now());
        setStatus('synced');
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    }, PUSH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [code, dirty]);

  return {
    favorites,
    isFavorited,
    toggleFavorite: syncToggleFavorite,
    findFavoriteSpell,
    sync: {
      code,
      status,
      lastSyncedAt,
      error,
      enableSync,
      disableSync,
    },
  };
}
