import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentMode } from '../hooks/useAgentMode.js';

const mockExecute = vi.fn();

vi.mock('page-agent', () => ({
  PageAgent: class {
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

  it('starts enabled by default with built-in proxy defaults', () => {
    const { result } = renderHook(() => useAgentMode());
    expect(result.current.enabled).toBe(true);
    expect(result.current.config.baseURL).toMatch(/\/api\/llm-proxy\/v1$/);
    expect(result.current.config.model).toBe('@cf/zai-org/glm-4.7-flash');
    expect(result.current.config.apiKey).toBe('');
  });

  it('persists enabled state in localStorage', () => {
    const { result } = renderHook(() => useAgentMode());
    // default is enabled; toggling should disable and persist
    act(() => { result.current.toggle(); });
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem('grimoire-agent-mode')).toBe('false');
    // toggling again re-enables
    act(() => { result.current.toggle(); });
    expect(result.current.enabled).toBe(true);
    expect(localStorage.getItem('grimoire-agent-mode')).toBe('true');
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
    expect(result.current.config.baseURL).toMatch(/\/api\/llm-proxy\/v1$/);
    expect(result.current.config.model).toBe('@cf/zai-org/glm-4.7-flash');
    expect(result.current.config.apiKey).toBe('');
  });

  it('does not run agent when disabled', async () => {
    const { result } = renderHook(() => useAgentMode());
    act(() => { result.current.toggle(); }); // disable (now default is enabled)
    const navigated = await result.current.runAgent({
      query: 'test',
      bestSkill: { skill: 'test', name: 'Test' },
      onNavigate: () => { throw new Error('should not navigate'); },
    });
    expect(navigated).toBe(false);
    expect(result.current.status).toBe('idle');
  });

  it('silently falls back when config is missing', async () => {
    const { result } = renderHook(() => useAgentMode());
    act(() => {
      result.current.updateConfig({ baseURL: '', model: '' });
    });
    const navigated = await result.current.runAgent({
      query: 'test',
      bestSkill: { skill: 'test', name: 'Test' },
      onNavigate: () => { throw new Error('should not navigate'); },
    });
    expect(navigated).toBe(false);
    // Silent fallback: no error status, just a no-op so callers can
    // open the skill directly without surfacing agent failures.
    expect(result.current.status).toBe('idle');
  });

  it('returns false and marks error when page-agent fails', async () => {
    mockExecute.mockRejectedValue(new Error('agent failed'));

    const { result } = renderHook(() => useAgentMode());
    act(() => {
      result.current.updateConfig({ baseURL: 'https://example.com', model: 'test' });
    });

    let navigated = false;
    const returned = await act(async () => {
      return result.current.runAgent({
        query: 'test',
        bestSkill: { skill: 'test', name: 'Test' },
        onNavigate: () => { navigated = true; },
      });
    });

    expect(returned).toBe(false);
    // Silent fallback: the hook does NOT call onNavigate itself; the
    // caller observes the `false` return and triggers its own
    // navigation. This avoids double-firing in useAgentPrompt.
    expect(navigated).toBe(false);
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
