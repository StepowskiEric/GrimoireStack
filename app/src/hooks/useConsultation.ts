import { useCallback, useMemo, useReducer } from 'react';
import {
  getOptionById,
  SEANCE_CONVERGENCE_RUN,
  SEANCE_MAX_QUESTIONS,
  SEANCE_MAX_SANITY,
  SEANCE_QUESTIONS,
  type SeanceQuestionPool,
} from '../data/consultationData.ts';
import {
  converged,
  decideResult,
  nextState,
  scoreSelections,
  shouldSwapToDarker,
  type ConvergedSnapshot,
  type DecideResult,
  type ScoreResult,
  type Selection,
} from '../data/consultationScoring.ts';

const STAGE = {
  SIGIL: 'sigil',
  ASKING: 'asking',
  RESULT: 'result',
};

interface ConsultationState {
  stage: string;
  sanity: number;
  insight: number;
  schoolId: string | null;
  selections: Selection[];
  snapshots: ScoreResult[];
  result: DecideResult | null;
}

type ConsultationAction =
  | { type: 'PICK_SIGIL'; schoolId: string }
  | { type: 'TAP_OPTION'; questionId: string; optionId: string; pool: 'narrowing' | 'darker' | 'sigil' }
  | { type: 'RESET' };

const initialState: ConsultationState = {
  stage: STAGE.SIGIL,
  sanity: SEANCE_MAX_SANITY,
  insight: 0,
  schoolId: null,
  selections: [],
  snapshots: [],
  result: null,
};

function resolveOption(schoolId: string, optionId: string) {
  const found = getOptionById(schoolId, optionId);
  if (!found) return null;
  return { primary: found.option.primary, alt: found.option.alt, reason: found.option.reason };
}

function countNarrowingPicks(selections: Selection[]) {
  return selections.filter((s) => s.pool === 'narrowing' || s.pool === 'darker').length;
}

function reducer(state: ConsultationState, action: ConsultationAction): ConsultationState {
  switch (action.type) {
    case 'PICK_SIGIL': {
      if (state.stage !== STAGE.SIGIL) return state;
      const ns = nextState(
        { sanity: state.sanity, insight: state.insight, questionIndex: 0 },
        'sigil',
      );
      return {
        ...state,
        stage: STAGE.ASKING,
        schoolId: action.schoolId,
        sanity: ns.sanity,
        insight: ns.insight,
        selections: [
          ...state.selections,
          {
            schoolId: action.schoolId,
            questionId: '__sigil__',
            optionId: '__sigil__',
            pool: 'sigil',
            sanityAfter: ns.sanity,
          },
        ],
      };
    }
    case 'TAP_OPTION': {
      if (state.stage !== STAGE.ASKING) return state;
      const pool = action.pool;
      const ns = nextState(
        { sanity: state.sanity, insight: state.insight, questionIndex: 0 },
        pool,
      );
      const newSelections = [
        ...state.selections,
        {
          schoolId: state.schoolId!,
          questionId: action.questionId,
          optionId: action.optionId,
          pool,
          sanityAfter: ns.sanity,
        },
      ];
      const snapshots = [...state.snapshots, scoreSelections(newSelections, { resolveOption })];

      const narrowingPicks = countNarrowingPicks(newSelections);
      const isConverged = narrowingPicks >= 3 && converged(snapshots, SEANCE_CONVERGENCE_RUN);
      const isAtMax = narrowingPicks >= SEANCE_MAX_QUESTIONS;
      const isForced = ns.sanity <= 0;

      if (isForced || isConverged || isAtMax) {
        const lastSnapshot = snapshots.at(-1);
        const result = lastSnapshot ? decideResult(lastSnapshot, newSelections, { resolveOption }, ns.sanity) : null;
        return {
          ...state,
          stage: STAGE.RESULT,
          sanity: ns.sanity,
          insight: ns.insight,
          selections: newSelections,
          snapshots,
          result,
        };
      }

      return {
        ...state,
        sanity: ns.sanity,
        insight: ns.insight,
        selections: newSelections,
        snapshots,
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useConsultation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const pickSigil = useCallback((schoolId: string) => {
    dispatch({ type: 'PICK_SIGIL', schoolId });
  }, []);

  const tapOption = useCallback((questionId: string, optionId: string, pool: 'narrowing' | 'darker' | 'sigil') => {
    dispatch({ type: 'TAP_OPTION', questionId, optionId, pool });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const currentPool = useMemo(() => {
    if (state.stage === STAGE.SIGIL) return null;
    if (state.stage === STAGE.RESULT) return null;
    return shouldSwapToDarker(state.sanity) ? 'darker' : 'narrowing';
  }, [state.stage, state.sanity]);

  const currentQuestion = useMemo(() => {
    if (state.stage !== STAGE.ASKING || !state.schoolId) return null;
    const poolKey = shouldSwapToDarker(state.sanity) ? 'darker' : 'narrowing';
    const pool = (SEANCE_QUESTIONS as Record<string, SeanceQuestionPool>)[state.schoolId]?.[poolKey] || [];
    if (pool.length === 0) return null;
    const askedInPool = state.selections.filter((s) => s.pool === poolKey).length;
    return pool[Math.min(askedInPool, pool.length - 1)] || null;
  }, [state.stage, state.schoolId, state.sanity, state.selections]);

  return {
    stage: state.stage,
    sanity: state.sanity,
    insight: state.insight,
    schoolId: state.schoolId,
    currentPool,
    currentQuestion,
    result: state.result,
    pickSigil,
    tapOption,
    reset,
  };
}
