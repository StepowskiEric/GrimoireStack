import { useCallback, useEffect, useRef, useState } from 'react';
import { ALPHABET, CODE_LEN, isValidSyncCode } from '../data/sync-codes.ts';
import { useFavorites } from './useFavorites.ts';
import { useLocalStorageState } from './useLocalStorageState.ts';

const SYNC_CODE_KEY = 'grimoire-sync-code';
const SYNC_API_URL = '/api/favorites-sync';
const PUSH_DEBOUNCE_MS = 1000;

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LEN);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

function mergeFavorites(
  local: Array<{ skill: string; name: string; addedAt: number }>,
  cloud: unknown,
): Array<{ skill: string; name: string; addedAt: number }> {
  if (!Array.isArray(cloud)) return local;
  const bySkill = new Map<string, { skill: string; name: string; addedAt: number }>();
  for (const f of [...local, ...cloud]) {
    if (!f || typeof f.skill !== 'string' || !f.skill) continue;
    const existing = bySkill.get(f.skill);
    if (!existing || (f.addedAt || 0) < (existing.addedAt || 0)) {
      bySkill.set(f.skill, f);
    }
  }
  return Array.from(bySkill.values());
}

async function callSyncApi({
  op,
  code,
  data,
}: {
  op: string;
  code: string;
  data?: unknown;
}): Promise<{ data?: unknown; error?: string }> {
  const res = await fetch(SYNC_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, code, data }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `HTTP ${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  return body;
}

export function useFavoritesSync() {
  const base = useFavorites();
  const { favorites, isFavorited, toggleFavorite, findFavoriteSpell, setFavorites } = base;

  const { value: code, setValue: setCodeValue } = useLocalStorageState<string | null>({
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
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);
  const favoritesRef = useRef(favorites);
  const prevCodeRef = useRef(code);

  useEffect(() => {
    favoritesRef.current = favorites;
  });

  const syncToggleFavorite = useCallback(
    (name: string, skill: string) => {
      toggleFavorite(name, skill);
      dirtyRef.current = true;
      setDirty(true);
      return true;
    },
    [toggleFavorite],
  );

  const enableSync = useCallback(() => {
    const newCode = generateCode();
    initializedRef.current = false;
    dirtyRef.current = false;
    setStatus('idle');
    setError(null);
    setDirty(false);
    setLastSyncedAt(null);
    setCodeValue(newCode);
    return newCode;
  }, [setCodeValue]);

  const disableSync = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SYNC_CODE_KEY);
      } catch {}
    }
    setCodeValue(null);
    initializedRef.current = false;
    dirtyRef.current = false;
    setStatus('idle');
    setLastSyncedAt(null);
    setError(null);
    setDirty(false);
  }, [setCodeValue]);

  useEffect(() => {
    if (!code) return undefined;

    const codeJustChanged = prevCodeRef.current !== code;
    prevCodeRef.current = code;

    let cancelled = false;
    let pushTimer: ReturnType<typeof setTimeout> | null = null;

    const schedulePush = () => {
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        if (cancelled) return;
        try {
          await callSyncApi({ op: 'put', code, data: favoritesRef.current });
          if (cancelled) return;
          dirtyRef.current = false;
          setDirty(false);
          setLastSyncedAt(Date.now());
          setStatus('synced');
        } catch (e: unknown) {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : 'Unknown error');
          setStatus('error');
        } finally {
          pushTimer = null;
        }
      }, PUSH_DEBOUNCE_MS);
    };

    if (codeJustChanged || !initializedRef.current) {
      const wasDirty = dirtyRef.current;
      initializedRef.current = false;
      dirtyRef.current = false;
      setDirty(false);
      setStatus('syncing');
      setError(null);

      const initSync = async () => {
        try {
          const res = await callSyncApi({ op: 'get', code });
          if (cancelled) return;
          const cloud = Array.isArray(res.data) ? res.data : [];
          const merged = mergeFavorites(favoritesRef.current, cloud);
          setFavorites(merged);

          await callSyncApi({ op: 'put', code, data: merged });
          if (cancelled) return;

          initializedRef.current = true;
          setLastSyncedAt(Date.now());
          setStatus('synced');

          if (wasDirty) {
            schedulePush();
          }
        } catch (e: unknown) {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : 'Unknown error');
          setStatus('error');
        }
      };
      initSync();
    } else if (initializedRef.current && dirty) {
      schedulePush();
    }

    return () => {
      cancelled = true;
      if (pushTimer) clearTimeout(pushTimer);
    };
  }, [code, dirty, setFavorites]);

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
