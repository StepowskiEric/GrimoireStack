import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavoritesSync } from '../hooks/useFavoritesSync.js';

function mockSyncApi(handler) {
  globalThis.fetch = vi.fn(async (url, opts) => {
    const body = JSON.parse(opts.body);
    const result = await handler(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

describe('useFavoritesSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no sync code and idle status', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() => useFavoritesSync());
    expect(result.current.sync.code).toBeNull();
    expect(result.current.sync.status).toBe('idle');
    expect(result.current.sync.lastSyncedAt).toBeNull();
  });


  it('generates a 16-character sync code from a 32-char alphabet', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() => useFavoritesSync());
    let code;
    act(() => { code = result.current.sync.enableSync(); });
    expect(code).toHaveLength(16);
    expect(code).toMatch(/^[a-hjkmnp-z2-9]+$/);
  });

  it('persists the sync code in localStorage (JSON-encoded)', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() => useFavoritesSync());
    act(() => { result.current.sync.enableSync(); });
    const stored = localStorage.getItem('grimoire-sync-code');
    const decoded = JSON.parse(stored);
    expect(decoded).toHaveLength(16);
    expect(decoded).toMatch(/^[a-hjkmnp-z2-9]+$/);
  });

  it('disables sync and clears in-memory + localStorage state', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() => useFavoritesSync());
    act(() => { result.current.sync.enableSync(); });
    expect(result.current.sync.code).toHaveLength(16);
    act(() => { result.current.sync.disableSync(); });
    expect(result.current.sync.code).toBeNull();
    const stored = localStorage.getItem('grimoire-sync-code');
    if (stored !== null) {
      expect(JSON.parse(stored)).toBeNull();
    }
  });

  it('on mount with a code, pulls from cloud and merges into local', async () => {
    const cloud = [
      { name: 'Cloud Spell', skill: 'cloud-skill', addedAt: 200 },
    ];
    let putCalled = false;

    mockSyncApi((body) => {
      if (body.op === 'get') return { data: cloud };
      if (body.op === 'put') { putCalled = true; return { ok: true, syncedAt: 999 }; }
    });

    localStorage.setItem('grimoire-sync-code', 'abcdefghjkmnpqrs');
    const { result } = renderHook(() => useFavoritesSync());

    await waitFor(() => expect(result.current.sync.status).toBe('synced'), { timeout: 2000 });
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].skill).toBe('cloud-skill');
    expect(putCalled).toBe(true);
  });

  it('on sync error, sets status to error and surfaces the message', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'Invalid sync code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    localStorage.setItem('grimoire-sync-code', 'abcdefghjkmnpqrs');
    const { result } = renderHook(() => useFavoritesSync());

    await waitFor(() => expect(result.current.sync.status).toBe('error'), { timeout: 2000 });
    expect(result.current.sync.error).toMatch(/Invalid sync code/);
  });

  it('toggleFavorite marks the local state dirty and triggers a debounced push', async () => {
    let putCount = 0;
    let lastPutData = null;
    mockSyncApi((body) => {
      if (body.op === 'get') return { data: [] };
      if (body.op === 'put') { putCount++; lastPutData = body.data; return { ok: true, syncedAt: 1000 + putCount }; }
    });

    localStorage.setItem('grimoire-sync-code', 'abcdefghjkmnpqrs');
    const { result } = renderHook(() => useFavoritesSync());

    await waitFor(() => expect(result.current.sync.status).toBe('synced'), { timeout: 2000 });
    const initialPutCount = putCount;

    act(() => {
      result.current.toggleFavorite('A', 'a-skill');
    });
    expect(result.current.favorites).toHaveLength(1);

    await waitFor(() => expect(putCount).toBeGreaterThan(initialPutCount), { timeout: 3000 });
    expect(lastPutData).toHaveLength(1);
    expect(lastPutData[0].skill).toBe('a-skill');
  });

  it('merge keeps earliest addedAt when both local and cloud have the same skill', async () => {
    const cloud = [
      { name: 'Older', skill: 'same-skill', addedAt: 100 },
    ];
    let putData = null;
    mockSyncApi((body) => {
      if (body.op === 'get') return { data: cloud };
      if (body.op === 'put') { putData = body.data; return { ok: true, syncedAt: 999 }; }
    });

    localStorage.setItem('grimoire-favorites', JSON.stringify([
      { name: 'Newer', skill: 'same-skill', addedAt: 200 },
    ]));
    localStorage.setItem('grimoire-sync-code', 'abcdefghjkmnpqrs');
    const { result } = renderHook(() => useFavoritesSync());

    await waitFor(() => expect(result.current.sync.status).toBe('synced'), { timeout: 2000 });
    // sameBySkill guard skips setFavorites when skill set is unchanged;
    // verify the merge result via the put payload instead
    expect(putData).toHaveLength(1);
    expect(putData[0].addedAt).toBe(100);
    expect(putData[0].name).toBe('Older');
  });

  it('enableSync resets initialized so the next code change re-pulls', async () => {
    let getCalls = 0;
    mockSyncApi((body) => {
      if (body.op === 'get') { getCalls++; return { data: [] }; }
      if (body.op === 'put') return { ok: true, syncedAt: Date.now() };
    });

    localStorage.setItem('grimoire-sync-code', 'abcdefghjkmnpqrs');
    const { result } = renderHook(() => useFavoritesSync());

    await waitFor(() => expect(result.current.sync.status).toBe('synced'), { timeout: 2000 });
    expect(getCalls).toBe(1);

    act(() => { result.current.sync.enableSync(); });
    const newCode = result.current.sync.code;
    expect(newCode).toHaveLength(16);

    await waitFor(() => expect(getCalls).toBe(2), { timeout: 2000 });
  });

  it('preserves dirty local favorites across a sync code change', async () => {
    let getCalls = 0;
    let putCalls = 0;
    mockSyncApi((body) => {
      if (body.op === 'get') {
        getCalls++;
        return { data: [] };
      }
      if (body.op === 'put') {
        putCalls++;
        return { ok: true, syncedAt: Date.now() };
      }
      return {};
    });

    localStorage.setItem('grimoire-sync-code', 'abcdefghjkmnpqrs');
    const { result } = renderHook(() => useFavoritesSync());

    await waitFor(() => expect(result.current.sync.status).toBe('synced'), { timeout: 2000 });
    expect(getCalls).toBe(1);

    act(() => { result.current.toggleFavorite('A', 'a-skill'); });
    expect(result.current.favorites).toHaveLength(1);

    act(() => { result.current.sync.enableSync(); });
    const newCode = result.current.sync.code;
    expect(newCode).toHaveLength(16);

    await waitFor(() => expect(getCalls).toBe(2), { timeout: 2000 });
    await waitFor(() => expect(putCalls).toBeGreaterThanOrEqual(2), { timeout: 3000 });
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].skill).toBe('a-skill');
  });
});
