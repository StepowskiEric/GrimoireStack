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

  it('starts disabled by default', () => {
    const { result } = renderHook(() => useAgentMode());
    expect(result.current.enabled).toBe(false);
    expect(result.current.config).toEqual({
      baseURL: '',
      model: '',
      apiKey: '',
    });
  });

  it('persists enabled state in localStorage', () => {
    const { result } = renderHook(() => useAgentMode());
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
    expect(result.current.config).toEqual({
      baseURL: '',
      model: '',
      apiKey: '',
    });
  });

  it('does not run agent when disabled', async () => {
    const { result } = renderHook(() => useAgentMode());
    const navigated = await result.current.runAgent({
      query: 'test',
      bestSkill: { skill: 'test', name: 'Test' },
      onNavigate: () => { throw new Error('should not navigate'); },
    });
    expect(navigated).toBe(false);
    expect(result.current.status).toBe('idle');
  });

  it('does not run agent when config is missing', async () => {
    const { result } = renderHook(() => useAgentMode());
    act(() => { result.current.toggle(); });
    const navigated = await result.current.runAgent({
      query: 'test',
      bestSkill: { skill: 'test', name: 'Test' },
      onNavigate: () => { throw new Error('should not navigate'); },
    });
    expect(navigated).toBe(false);
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('falls back to onNavigate when page-agent fails', async () => {
    mockExecute.mockRejectedValue(new Error('agent failed'));

    const { result } = renderHook(() => useAgentMode());
    act(() => {
      result.current.toggle();
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
    expect(navigated).toBe(true);
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
