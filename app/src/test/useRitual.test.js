import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRitual } from '../hooks/useRitual.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(data, status = 200) {
  return { ok: status < 400, json: () => Promise.resolve(data) };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('useRitual', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useRitual());
    expect(result.current.state).toBe('idle');
    expect(result.current.query).toBe('');
    expect(result.current.round).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('transitions to consulting on start, then questioning on question response', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ type: 'question', question: 'What is your goal?', choices: ['A', 'B', 'C'] })
    );

    const { result } = renderHook(() => useRitual());
    await act(async () => {
      result.current.start('test query');
    });

    expect(result.current.state).toBe('questioning');
    expect(result.current.question).toBe('What is your goal?');
    expect(result.current.choices).toEqual(['A', 'B', 'C']);
    expect(result.current.round).toBe(0);
  });

  it('transitions to converged when API returns results', async () => {
    const onConverge = vi.fn();
    const results = [{ skill: 'test-skill', name: 'Test', school: 'testing' }];
    mockFetch.mockResolvedValueOnce(
      mockResponse({ type: 'results', results })
    );

    const { result } = renderHook(() => useRitual({ onConverge }));
    await act(async () => {
      result.current.start('test query');
    });

    expect(result.current.state).toBe('converged');
    expect(result.current.results).toEqual(results);
    expect(onConverge).toHaveBeenCalledWith(results);
  });

  it('transitions to error on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRitual());
    await act(async () => {
      result.current.start('test query');
    });

    expect(result.current.state).toBe('error');
    expect(result.current.error).toBeTruthy();
  });

  it('transitions to error on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'Bad request' }, 400)
    );

    const { result } = renderHook(() => useRitual());
    await act(async () => {
      result.current.start('test query');
    });

    expect(result.current.state).toBe('error');
  });

  it('transitions to error on unexpected response type', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ type: 'unknown' })
    );

    const { result } = renderHook(() => useRitual());
    await act(async () => {
      result.current.start('test query');
    });

    expect(result.current.state).toBe('error');
  });

  it('sends history on subsequent answer calls', async () => {
    // First call returns a question
    mockFetch.mockResolvedValueOnce(
      mockResponse({ type: 'question', question: 'Pick one?', choices: ['X', 'Y', 'Z'] })
    );

    const { result } = renderHook(() => useRitual());
    await act(async () => {
      result.current.start('initial query');
    });
    expect(result.current.state).toBe('questioning');

    // Second call returns results
    mockFetch.mockResolvedValueOnce(
      mockResponse({ type: 'results', results: [{ skill: 's', name: 'S', school: 'sc' }] })
    );

    await act(async () => {
      result.current.answer('X');
    });

    expect(result.current.state).toBe('converged');
    // Verify the fetch was called with history containing the question and answer
    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(secondCallBody.history).toHaveLength(1);
    expect(secondCallBody.history[0].question).toBe('Pick one?');
    expect(secondCallBody.history[0].answer).toBe('X');
  });

  it('increments round on each answer', async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ type: 'question', question: 'Q?', choices: ['A', 'B', 'C'] })
    );

    const { result } = renderHook(() => useRitual());
    await act(async () => { result.current.start('q'); });
    expect(result.current.round).toBe(0);

    await act(async () => { result.current.answer('A'); });
    expect(result.current.round).toBe(1);

    await act(async () => { result.current.answer('B'); });
    expect(result.current.round).toBe(2);
  });

  it('reset returns to idle with cleared state', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ type: 'question', question: 'Q?', choices: ['A', 'B', 'C'] })
    );

    const { result } = renderHook(() => useRitual());
    await act(async () => { result.current.start('q'); });
    expect(result.current.state).toBe('questioning');

    act(() => result.current.reset());
    expect(result.current.state).toBe('idle');
    expect(result.current.query).toBe('');
    expect(result.current.round).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.question).toBeNull();
    expect(result.current.choices).toEqual([]);
    expect(result.current.results).toEqual([]);
  });

  it('does nothing when start is called with empty query', async () => {
    const { result } = renderHook(() => useRitual());
    await act(async () => { result.current.start(''); });
    expect(result.current.state).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
