import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
  afterEach(() => {
    mockExecute.mockReset();
    vi.restoreAllMocks();
  });

  it('runs agent and returns true on success', async () => {
    mockExecute.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({
        bestSkill: { skill: 'test', name: 'Test Skill' },
      });
    });

    expect(returned).toBe(true);
  });

  it('returns false when bestSkill is missing', async () => {
    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({});
    });

    expect(returned).toBe(false);
  });

  it('returns false and calls onError when page-agent fails', async () => {
    mockExecute.mockRejectedValue(new Error('agent failed'));
    const onError = vi.fn();

    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({
        bestSkill: { skill: 'test', name: 'Test Skill' },
        onError,
      });
    });

    expect(returned).toBe(false);
    expect(onError).toHaveBeenCalledWith('agent failed');
  });
});
