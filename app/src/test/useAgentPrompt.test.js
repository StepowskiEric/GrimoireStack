import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgentPrompt } from '../hooks/useAgentPrompt.js';

const mockExecute = vi.fn(async () => undefined);

vi.mock('page-agent', () => ({
  PageAgent: class {
    constructor() {}
    async execute() {
      return mockExecute();
    }
  },
}));

function mockRecommendApi(results) {
  globalThis.fetch = vi.fn(async () =>
    new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('useAgentPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    mockExecute.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns idle state initially', () => {
    mockRecommendApi([]);
    const { result } = renderHook(() => useAgentPrompt());
    expect(result.current.status).toBe('idle');
    expect(result.current.bestSkill).toBeNull();
  });

  it('fetches recommendations and selects the best skill', async () => {
    mockRecommendApi([
      { skill: 'skill-a', name: 'Skill A', school: 'School A', score: 0.9, reason: 'Best match' },
      { skill: 'skill-b', name: 'Skill B', school: 'School B', score: 0.5, reason: 'Okay match' },
    ]);

    // Make the agent fail so the hook falls back to onSpellClick.
    mockExecute.mockRejectedValueOnce(new Error('agent failed'));

    const onSpellClick = vi.fn();
    const { result } = renderHook(() => useAgentPrompt({ onSpellClick }));

    await act(async () => { result.current.handlePrompt('find me a skill'); });

    expect(result.current.status).toBe('matched');
    expect(result.current.bestSkill.skill).toBe('skill-a');
    expect(onSpellClick).toHaveBeenCalledTimes(1);
  });

  it('falls back to browse results when no match is found', async () => {
    mockRecommendApi([]);

    const onBrowseResults = vi.fn();
    const { result } = renderHook(() => useAgentPrompt({ onBrowseResults }));

    await act(async () => { result.current.handlePrompt('unknown topic'); });

    expect(result.current.status).toBe('no-match');
    expect(onBrowseResults).toHaveBeenCalledWith('unknown topic');
  });

  it('falls back to browse results on API error', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: 'AI inference failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const onBrowseResults = vi.fn();
    const { result } = renderHook(() => useAgentPrompt({ onBrowseResults }));

    await act(async () => { result.current.handlePrompt('test'); });

    expect(result.current.status).toBe('error');
    expect(onBrowseResults).toHaveBeenCalledWith('test');
  });

  it('resets state after browsing', async () => {
    mockRecommendApi([]);

    const onBrowseResults = vi.fn();
    const { result } = renderHook(() => useAgentPrompt({ onBrowseResults }));

    await act(async () => { result.current.handlePrompt('unknown topic'); });
    expect(result.current.status).toBe('no-match');

    act(() => { result.current.handleBrowse(); });
    expect(result.current.status).toBe('idle');
    expect(result.current.bestSkill).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
