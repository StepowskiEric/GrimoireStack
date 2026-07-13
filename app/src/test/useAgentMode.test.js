import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildIncantationPrompt, useAgentMode } from '../hooks/useAgentMode.js';

const mockExecute = vi.fn();

vi.mock('page-agent', () => ({
  PageAgent: class {
    panel = { show: vi.fn(), hide: vi.fn() };
    dispose = vi.fn();
    async execute(...args) {
      return mockExecute(...args);
    }
  },
}));

describe('useAgentMode', () => {
  afterEach(() => {
    mockExecute.mockReset();
    vi.restoreAllMocks();
  });

  it('runs agent and returns true on success', async () => {
    mockExecute.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({
        bestSkill: { skill: 'test', name: 'Test Skill' },
      });
    });

    expect(returned).toBe(true);
  });

  it('returns false when agent execute returns success:false', async () => {
    mockExecute.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({
        bestSkill: { skill: 'test', name: 'Test Skill' },
      });
    });

    expect(returned).toBe(false);
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
  it('runs agent with a guarded prompt from an incantation', async () => {
    mockExecute.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({ incantation: 'open the divination panel' });
    });

    expect(returned).toBe(true);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    const prompt = mockExecute.mock.calls[0][0];
    expect(prompt).toContain('open the divination panel');
    expect(prompt).toContain('THIS page only'); // strict in-grimoire allowlist
  });

  it('prefers the bestSkill path when both are provided', async () => {
    mockExecute.mockResolvedValue({ success: true });
    const bestSkill = { skill: 'test', name: 'Test Skill' };
    const { result } = renderHook(() => useAgentMode());

    await act(async () => {
      return result.current.runAgent({ bestSkill, incantation: 'ignore me' });
    });

    const prompt = mockExecute.mock.calls[0][0];
    expect(prompt).toContain('Test Skill');
    expect(prompt).not.toContain('THIS page only');
  });

  it('returns false when only an empty incantation is given', async () => {
    const { result } = renderHook(() => useAgentMode());

    const returned = await act(async () => {
      return result.current.runAgent({ incantation: '   ' });
    });

    expect(returned).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('buildIncantationPrompt embeds the incantation and the allowlist guard', () => {
    const prompt = buildIncantationPrompt('scroll to the bestiary');
    expect(prompt).toContain('scroll to the bestiary');
    expect(prompt).toContain('THIS page only');
    expect(prompt).toContain('do anything that would take the user out of the grimoire');
  });
});
