import { useCallback, useReducer } from 'react';
import { callRecommendApi } from '../api/oracle.ts';

const IDLE = 'idle';
const CONSULTING = 'consulting';
const QUESTIONING = 'questioning';
const CONVERGED = 'converged';
const ERROR = 'error';

interface RitualState {
  state: string;
  query: string;
  history: Array<{ question: string | null; answer: string }>;
  question: string | null;
  choices: string[];
  results: unknown[];
  round: number;
  error: string | null;
  source: string | null;
}

type RitualAction =
  | { type: 'START'; query: string }
  | { type: 'ANSWER'; choice: string }
  | { type: 'QUESTION'; question: string; choices: string[] }
  | { type: 'RESULTS'; results: unknown[]; source: string }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

function ritualReducer(state: RitualState, action: RitualAction): RitualState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        state: CONSULTING,
        query: action.query,
        history: [],
        round: 0,
        error: null,
        question: null,
        choices: [],
        results: [],
        source: null,
      };
    case 'ANSWER':
      return {
        ...state,
        state: CONSULTING,
        history: [...state.history, { question: state.question, answer: action.choice }],
        round: state.round + 1,
      };
    case 'QUESTION':
      return { ...state, state: QUESTIONING, question: action.question, choices: action.choices };
    case 'RESULTS':
      return { ...state, state: CONVERGED, results: action.results, source: action.source };
    case 'ERROR':
      return { ...state, state: ERROR, error: action.error };
    case 'RESET':
      return {
        state: IDLE,
        query: '',
        history: [],
        question: null,
        choices: [],
        results: [],
        round: 0,
        error: null,
        source: null,
      };
    default:
      return state;
  }
}

const INITIAL: RitualState = {
  state: IDLE,
  query: '',
  history: [],
  question: null,
  choices: [],
  results: [],
  round: 0,
  error: null,
  source: null,
};

function handleApiResponse(
  data: { type?: string; question?: string; choices?: string[]; results?: unknown[]; source?: string },
  dispatch: React.Dispatch<RitualAction>,
  onConverge?: (results: unknown[]) => void,
) {
  if (data.type === 'question') {
    dispatch({ type: 'QUESTION', question: data.question || '', choices: data.choices || [] });
  } else if (data.type === 'results') {
    const results = data.results || [];
    dispatch({ type: 'RESULTS', results, source: data.source || 'ai' });
    onConverge?.(results);
  } else {
    throw new Error('Unexpected response from oracle');
  }
}

export function useRitual({ onConverge }: { onConverge?: (results: unknown[]) => void } = {}) {
  const [s, dispatch] = useReducer(ritualReducer, INITIAL);

  const start = useCallback(
    async (initialQuery: string) => {
      const q = initialQuery.trim();
      if (!q) return;
      dispatch({ type: 'START', query: q });
      try {
        const data = await callRecommendApi({ query: q, mode: 'interview', history: [] });
        handleApiResponse(data, dispatch, onConverge);
      } catch (err: unknown) {
        dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : 'Unknown error' });
      }
    },
    [onConverge],
  );

  const answer = useCallback(
    async (choice: string) => {
      const currentQuery = s.query;
      const newHistory = [...s.history, { question: s.question, answer: choice }];
      dispatch({ type: 'ANSWER', choice });
      try {
        const data = await callRecommendApi({
          query: currentQuery,
          mode: 'interview',
          history: newHistory,
        });
        handleApiResponse(data, dispatch, onConverge);
      } catch (err: unknown) {
        dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : 'Unknown error' });
      }
    },
    [s.query, s.history, s.question, onConverge],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { ...s, start, answer, reset };
}
