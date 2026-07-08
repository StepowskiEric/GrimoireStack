import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentMode } from '../hooks/useAgentMode.js';

const mockExecute = vi.fn();

vi.mock('page-agent', () => ({
  PageAgent: class {
    panel = { show: vi.fn(), hide: vi.fn() };
    dispose = vi.fn();
    constructor() {}
    async execute() {
      return mockExecute();
    }
  },
}));

describe('useAgentMode', () => {
  beforeEach(() => {
    localStorage.clear();
    mockExecute.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with Groq defaults', () => {
    const { result } = renderHook(() => useAgentMode());
    expect(result.current.config.baseURL).toBe('https://api.groq.com/openai/v1');
    expect(result.current.config.model).toBe('qwen/qwen3.6-27b');
    expect(result.current.config.apiKey).toBe('');
  });

  it('persists config in localStorage', () => {
    const { result } = renderHook(() => useAgentMode());
    act(() => { result.current.updateConfig({ baseURL: 'https://example.com', model: 'test-model' }); });
    expect(result.current.config).toEqual({
      baseURL: 'https://example.com',
      model: 'test-model',
      apiKey: '',
    });
    expect(JSON.parse(localStorage.getItem('grimoire-agent-mode-config'))).toEqual({
      baseURL: 'https://example.com',
      model: 'test-model',
      apiKey: '',
    });
  });

  it('ignores corrupt localStorage config', () => {
    localStorage.setItem('grimoire-agent-mode-config', 'not-json');
    const { result } = renderHook(() => useAgentMode());
    expect(result.current.config.baseURL).toBe('https://api.groq.com/openai/v1');
    expect(result.current.config.model).toBe('qwen/qwen3.6-27b');
    expect(result.current.config.apiKey).toBe('');
  });

  it('silently falls back when config is missing', async () => {
    const { result } = renderHook(() => useAgentMode());
    act(() => {
      result.current.updateConfig({ baseURL: '', model: '' });
    });
    const navigated = await result.current.runAgent({
      query: 'test',
      bestSkill: { skill: 'test', name: 'Test' },
    });
    expect(navigated).toBe(false);
    expect(result.current.status).toBe('idle');
  });

  it('returns false and marks error when page-agent fails', async () => {
    mockExecute.mockRejectedValue(new Error('agent failed'));

    const { result } = renderHook(() => useAgentMode());
    act(() => {
      result.current.updateConfig({ baseURL: 'https://example.com', model: 'test' });
    });

    const returned = await act(async () => {
      return result.current.runAgent({
        query: 'test',
        bestSkill: { skill: 'test', name: 'Test' },
      });
    });

    expect(returned).toBe(false);
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
