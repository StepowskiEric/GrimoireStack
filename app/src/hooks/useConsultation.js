import { useCallback, useMemo, useReducer } from 'react';
import {
  getOptionById,
  SEANCE_CONVERGENCE_RUN,
  SEANCE_MAX_QUESTIONS,
  SEANCE_MAX_SANITY,
  SEANCE_QUESTIONS,
} from '../data/consultationData.js';
import {
  converged,
  decideResult,
  nextState,
  scoreSelections,
  shouldSwapToDarker,
} from '../data/consultationScoring.js';

/**
 * useConsultation — the state machine for the Séance.
 *
 * Stages:
 *   - 'sigil'   : user is picking a Domain Sigil (school).
 *   - 'asking'  : user is answering narrowing/darker questions.
 *   - 'result'  : the consultation has ended; result is rendered.
 *
 * The hook exposes:
 *   - stage, sanity, insight
 *   - current question (or sigil picker)
 *   - tap()  — record a selection, advance the machine
 *   - reset() — start over
 *   - result — the final { primary, alt, beasthood, reason } when stage === 'result'
 *
 * Pure: no DOM, no audio, no side effects. The component layer wires
 * those up (whispers, page-turn sound, etc.) by reacting to `sanity` and
 * `stage`.
 */

const STAGE = {
  SIGIL: 'sigil',
  ASKING: 'asking',
  RESULT: 'result',
};

const initialState = {
  stage: STAGE.SIGIL,
  sanity: SEANCE_MAX_SANITY,
  insight: 0,
  schoolId: null,
  selections: [], // ordered list of Selection
  snapshots: [], // cumulative topSkill after each selection
  result: null, // { primary, alt, beasthood, reason } when stage === 'result'
};

function reducer(state, action) {
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
      const pool = action.pool; // 'narrowing' | 'darker'
      const ns = nextState(
        { sanity: state.sanity, insight: state.insight, questionIndex: 0 },
        pool,
      );
      const newSelections = [
        ...state.selections,
        {
          schoolId: state.schoolId,
          questionId: action.questionId,
          optionId: action.optionId,
          pool,
          sanityAfter: ns.sanity,
        },
      ];
      const snapshots = [...state.snapshots, scoreSelections(newSelections, { resolveOption })];

      // Decide if the consultation ends.
      // Convergence: requires at least 3 narrowing picks AND the top 2
      // has not changed for the last 2 snapshots. This way each pick
      // meaningfully narrows the conversation instead of stalling.
      const narrowingPicks = countNarrowingPicks(newSelections);
      const isConverged = narrowingPicks >= 3 && converged(snapshots, SEANCE_CONVERGENCE_RUN);
      const isAtMax = narrowingPicks >= SEANCE_MAX_QUESTIONS;
      const isForced = ns.sanity <= 0;

      if (isForced || isConverged || isAtMax) {
        const result = decideResult(snapshots.at(-1), newSelections, { resolveOption }, ns.sanity);
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

// Helper kept module-scope so the reducer does not capture the hook closure.
function resolveOption(schoolId, optionId) {
  const found = getOptionById(schoolId, optionId);
  if (!found) return null;
  return { primary: found.option.primary, alt: found.option.alt, reason: found.option.reason };
}

// How many narrowing or darker picks have been made (used for indexing
// the current question from the school's pool).
function countNarrowingPicks(selections) {
  return selections.filter((s) => s.pool === 'narrowing' || s.pool === 'darker').length;
}

export function useConsultation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const pickSigil = useCallback((schoolId) => {
    dispatch({ type: 'PICK_SIGIL', schoolId });
  }, []);

  const tapOption = useCallback((questionId, optionId, pool) => {
    dispatch({ type: 'TAP_OPTION', questionId, optionId, pool });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Derived: which pool is the current question from?
  const currentPool = useMemo(() => {
    if (state.stage === STAGE.SIGIL) return null;
    if (state.stage === STAGE.RESULT) return null;
    return shouldSwapToDarker(state.sanity) ? 'darker' : 'narrowing';
  }, [state.stage, state.sanity]);

  // Derived: the question object to render. Computed here so the view
  // doesn't have to know about the state machine's pool-switching rule
  // or its per-pool indexing. The index is pool-specific: when the
  // pool switches from narrowing to darker, the user starts at the
  // first darker question, not at the middle of it.
  const currentQuestion = useMemo(() => {
    if (state.stage !== STAGE.ASKING || !state.schoolId) return null;
    const poolKey = shouldSwapToDarker(state.sanity) ? 'darker' : 'narrowing';
    const pool = SEANCE_QUESTIONS[state.schoolId]?.[poolKey] || [];
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
