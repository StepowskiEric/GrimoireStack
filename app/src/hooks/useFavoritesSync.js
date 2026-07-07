import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorageState } from './useLocalStorageState.js';

/**
 * useFavoritesSync — cross-device favorites sync over a Cloudflare Pages
 * Function backed by a Cloudflare KV namespace (see
 * functions/api/favorites-sync.js).
 *
 * Threat model: the 16-char sync code IS the auth. Anyone with the code
 * can read and write that user's favorites. The code is auto-generated
 * with crypto.getRandomValues and shown once on creation. This is
 * anonymous pairing, not real account auth — by design.
 *
 * Pairing: user generates a code on device A, types the same code on
 * device B. Both pull the cloud state and merge with their local copy
 * (union, by skill id, keeping the earliest addedAt). Subsequent
 * favorites toggles are debounced and pushed to cloud.
 */

const SYNC_CODE_KEY = 'grimoire-sync-code';
const SYNC_API_URL = '/api/favorites-sync';
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // 32 chars, no 0/o/1/i/l
const CODE_LEN = 16;
const PUSH_DEBOUNCE_MS = 1000;

function generateCode() {
  const bytes = new Uint8Array(CODE_LEN);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

function hashFavorites(favorites) {
  // Order-independent so a pull that re-sorts by addedAt doesn't re-push.
  return favorites.map((f) => f.skill).slice().sort().join('|');
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

function sameBySkill(a, b) {
  if (a.length !== b.length) return false;
  const ids = new Set(a.map((f) => f.skill));
  return b.every((f) => ids.has(f.skill));
}

function isValidCodeShape(value) {
  return typeof value === 'string' && /^[a-z2-9]{16}$/.test(value);
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

export function useFavoritesSync({ favorites, onMerge }) {
  const { value: code, setValue: setCodeValue } = useLocalStorageState({
    key: SYNC_CODE_KEY,
    initial: () => null,
    parse: (raw) => {
      if (typeof raw !== 'string' || raw.length === 0) return null;
      // Accept both JSON-encoded ("abc") and raw (abc) forms so the hook
      // survives a half-migrated localStorage and tests that seed raw values.
      try {
        const v = JSON.parse(raw);
        return isValidCodeShape(v) ? v : null;
      } catch {
        return isValidCodeShape(raw) ? raw : null;
      }
    },
  });

  const [status, setStatus] = useState('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState(null);

  const lastPushedHashRef = useRef(null);
  const onMergeRef = useRef(onMerge);
  onMergeRef.current = onMerge;

  const enableSync = useCallback(() => {
    const newCode = generateCode();
    lastPushedHashRef.current = null;
    setStatus('idle');
    setError(null);
    setCodeValue(newCode);
    return newCode;
  }, [setCodeValue]);

  const disableSync = useCallback(() => {
    // Clear the underlying localStorage key too — useLocalStorageState
    // JSON.stringify's null into the string "null" rather than removing
    // the key, so without this explicit removeItem the test and any
    // migration logic would see leftover state.
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(SYNC_CODE_KEY); } catch {}
    }
    setCodeValue(null);
    lastPushedHashRef.current = null;
    setStatus('idle');
    setLastSyncedAt(null);
    setError(null);
  }, [setCodeValue]);

  const syncNow = useCallback(async () => {
    if (!code) return;
    setStatus('syncing');
    setError(null);
    try {
      const res = await callSyncApi({ op: 'get', code });
      const cloud = Array.isArray(res.data) ? res.data : [];
      const merged = mergeFavorites(favorites, cloud);
      onMergeRef.current?.(merged);
      const putRes = await callSyncApi({ op: 'put', code, data: merged });
      setLastSyncedAt(putRes.syncedAt || Date.now());
      setStatus('synced');
      lastPushedHashRef.current = hashFavorites(merged);
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, [code, favorites]);

  // Effect 1: when the sync code changes, pull from cloud and merge.
  useEffect(() => {
    if (!code) return undefined;
    let cancelled = false;
    (async () => {
      setStatus('syncing');
      setError(null);
      try {
        const res = await callSyncApi({ op: 'get', code });
        if (cancelled) return;
        const cloud = Array.isArray(res.data) ? res.data : [];
        const merged = mergeFavorites(favorites, cloud);
        if (!sameBySkill(merged, favorites)) {
          onMergeRef.current?.(merged);
        }
        const putRes = await callSyncApi({ op: 'put', code, data: merged });
        if (cancelled) return;
        lastPushedHashRef.current = hashFavorites(merged);
        setLastSyncedAt(putRes.syncedAt || Date.now());
        setStatus('synced');
      } catch (e) {
        if (cancelled) return;
        setError(e.message);
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
    // Captures `favorites` at code-change time. The post-pull push of
    // `merged` already reflects local state, so Effect 2 handles ongoing
    // toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Effect 2: debounced push on local favorites change.
  useEffect(() => {
    if (!code) return undefined;
    if (lastPushedHashRef.current === null) return undefined;
    const currentHash = hashFavorites(favorites);
    if (currentHash === lastPushedHashRef.current) return undefined;

    const timeoutId = setTimeout(async () => {
      if (currentHash === lastPushedHashRef.current) return;
      setStatus('syncing');
      setError(null);
      try {
        const putRes = await callSyncApi({ op: 'put', code, data: favorites });
        lastPushedHashRef.current = currentHash;
        setLastSyncedAt(putRes.syncedAt || Date.now());
        setStatus('synced');
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    }, PUSH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [code, favorites]);

  return {
    code,
    status,
    lastSyncedAt,
    error,
    enableSync,
    disableSync,
    syncNow,
  };
}
