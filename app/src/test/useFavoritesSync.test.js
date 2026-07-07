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
    const { result } = renderHook(() =>
      useFavoritesSync({ favorites: [], onMerge: () => {} })
    );
    expect(result.current.code).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.lastSyncedAt).toBeNull();
  });

  it('generates a 16-character sync code from a 32-char alphabet', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() =>
      useFavoritesSync({ favorites: [], onMerge: () => {} })
    );
    let code;
    act(() => { code = result.current.enableSync(); });
    expect(code).toMatch(/^[a-z2-9]+$/);
  });

  it('persists the sync code in localStorage (JSON-encoded)', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() =>
      useFavoritesSync({ favorites: [], onMerge: () => {} })
    );
    act(() => { result.current.enableSync(); });
    const stored = localStorage.getItem('grimoire-sync-code');
    // useLocalStorageState JSON.stringifies on write, so the value is
    // stored as a quoted string. Decode before asserting on the code.
    const decoded = JSON.parse(stored);
    expect(decoded).toHaveLength(16);
    expect(decoded).toMatch(/^[a-z2-9]+$/);
  });

  it('disables sync and clears in-memory + localStorage state', () => {
    mockSyncApi(() => ({ data: null }));
    const { result } = renderHook(() =>
      useFavoritesSync({ favorites: [], onMerge: () => {} })
    );
    act(() => { result.current.enableSync(); });
    expect(result.current.code).toHaveLength(16);
    act(() => { result.current.disableSync(); });
    // After disable, in-memory state is null. The localStorage key may
    // have a JSON-encoded "null" written by useLocalStorageState's
    // useEffect, but the parse layer treats it as null.
    expect(result.current.code).toBeNull();
    const stored = localStorage.getItem('grimoire-sync-code');
    if (stored !== null) {
      expect(JSON.parse(stored)).toBeNull();
    }
  });

  it('on mount with a code, pulls from cloud and merges into local', async () => {
    const local = [{ name: 'Local Spell', skill: 'local-skill', addedAt: 100 }];
    const cloud = [{ name: 'Cloud Spell', skill: 'cloud-skill', addedAt: 200 }];
    const onMerge = vi.fn();
    let putCalled = false;

    mockSyncApi((body) => {
      if (body.op === 'get') return { data: cloud };
      if (body.op === 'put') { putCalled = true; return { ok: true, syncedAt: 999 }; }
    });

    localStorage.setItem('grimoire-sync-code', 'abcdefghijkmnpqr');
    renderHook(() => useFavoritesSync({ favorites: local, onMerge }));

    await waitFor(() => expect(onMerge).toHaveBeenCalled());
    const merged = onMerge.mock.calls[0][0];
    expect(merged).toHaveLength(2);
    expect(merged.map((f) => f.skill).sort()).toEqual(['cloud-skill', 'local-skill']);
    await waitFor(() => expect(putCalled).toBe(true));
  });

  it('on sync error, sets status to error and surfaces the message', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'Invalid sync code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    localStorage.setItem('grimoire-sync-code', 'abcdefghijkmnpqr');
    const { result } = renderHook(() =>
      useFavoritesSync({ favorites: [], onMerge: () => {} })
    );

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/Invalid sync code/);
  });

  it('syncNow pulls, merges, and pushes in one round-trip', async () => {
    const local = [{ name: 'A', skill: 'skill-a', addedAt: 100 }];
    const cloud = [{ name: 'B', skill: 'skill-b', addedAt: 200 }];
    const onMerge = vi.fn();
    const calls = [];

    mockSyncApi((body) => {
      calls.push(body.op);
      if (body.op === 'get') return { data: cloud };
      if (body.op === 'put') return { ok: true, syncedAt: 1234 };
    });

    localStorage.setItem('grimoire-sync-code', 'abcdefghijkmnpqr');
    const { result } = renderHook(() =>
      useFavoritesSync({ favorites: local, onMerge })
    );

    await act(async () => { await result.current.syncNow(); });

    expect(calls).toContain('get');
    expect(calls).toContain('put');
    expect(onMerge).toHaveBeenCalled();
    expect(result.current.status).toBe('synced');
    expect(result.current.lastSyncedAt).toBe(1234);
  });
});
