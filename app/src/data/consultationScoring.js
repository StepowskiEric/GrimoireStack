/**
 * consultationScoring.js — pure functions for the Séance.
 *
 * The Séance is a state machine that accumulates "votes" for skill ids
 * as the user picks option cards. Each option contributes its `primary`
 * skill (full weight) and its `alt` skill (half weight). When the
 * consultation ends naturally (convergence) or forced (Sanity 0), the
 * top-accumulator becomes the result.
 *
 * The Beasthood ending is structurally identical to a normal ending —
 * the only difference is which skill is shown as primary vs alt. The
 * rendering layer reads the `beasthood` flag and applies the corrupted
 * styles. The scoring layer just decides which skill id is the "winner."
 */

import {
  SEANCE_DARKNESS_THRESHOLD,
  SEANCE_MAX_SANITY,
  SEANCE_MAX_QUESTIONS,
  SEANCE_CONVERGENCE_RUN,
} from './consultationData.js';

const ALT_WEIGHT = 0.5;

/**
 * One selection, the minimal unit of state the hook tracks.
 * @typedef {Object} Selection
 * @property {string} schoolId    — sigil school (scope)
 * @property {string} questionId  — id from the question bank
 * @property {string} optionId    — id of the chosen option
 * @property {string} pool        — 'narrowing' | 'darker' | 'sigil' (the sigil pick is recorded as pool='sigil')
 * @property {number} sanityAfter — sanity value AFTER this tap
 */

/**
 * Accumulate one selection's primary + alt weights into a map.
 * @param {Map<string, number>} acc
 * @param {string} primary
 * @param {string} alt
 */
function addOption(acc, primary, alt) {
  if (primary) acc.set(primary, (acc.get(primary) || 0) + 1);
  if (alt && alt !== primary) acc.set(alt, (acc.get(alt) || 0) + ALT_WEIGHT);
}

/**
 * Compute the cumulative skill scores from a list of selections.
 * Selections should be in order; the option lookup uses the schoolId
 * captured at selection time.
 *
 * @param {Selection[]} selections
 * @param {{
 *   resolveOption: (schoolId: string, optionId: string) => {primary:string, alt:string, reason:string}|null,
 * }} deps
 * @returns {{
 *   bySkill: Map<string, number>,
 *   topSkill: string|null,
 *   topScore: number,
 *   rankedSkills: Array<{skill: string, score: number}>,
 * }}
 */
export function scoreSelections(selections, { resolveOption }) {
  const bySkill = new Map();
  for (const sel of selections) {
    if (sel.pool === 'sigil') continue; // sigil pick is scope, not a vote
    const opt = resolveOption(sel.schoolId, sel.optionId);
    if (!opt) continue;
    addOption(bySkill, opt.primary, opt.alt);
  }
  const ranked = [...bySkill.entries()]
    .map(([skill, score]) => ({ skill, score }))
    .sort((a, b) => b.score - a.score);
  return {
    bySkill,
    topSkill: ranked.length ? ranked[0].skill : null,
    topScore: ranked.length ? ranked[0].score : 0,
    rankedSkills: ranked,
  };
}

/**
 * Has the top skill stabilized AND no new contender has appeared in the
 * top 2 across the last `n` snapshots?
 *
 * The top-2 check matters because with the alt-weight 0.5 scheme, a new
 * pick often *adds* a new contender to the top 2 even when the top 1 is
 * unchanged. The user should feel like the conversation is *narrowing*,
 * not stalling. So convergence = top stable AND the set of top-2 skills
 * is stable across the last `n` snapshots.
 *
 * @param {Array<{topSkill: string|null, rankedSkills: Array<{skill:string}>}>} snapshots
 * @param {number} n — run length
 * @returns {boolean}
 */
export function converged(snapshots, n = SEANCE_CONVERGENCE_RUN) {
  if (snapshots.length < n) return false;
  const last = snapshots.slice(-n);
  if (!last.every((s) => s.topSkill)) return false;
  // Top skill must be the same across the run.
  const top = last[0].topSkill;
  if (!last.every((s) => s.topSkill === top)) return false;
  // Top-2 set must be the same across the run.
  const top2 = (s) => new Set((s.rankedSkills || []).slice(0, 2).map((r) => r.skill));
  const a = top2(last[0]);
  for (let i = 1; i < last.length; i++) {
    const b = top2(last[i]);
    if (a.size !== b.size) return false;
    for (const skill of a) {
      if (!b.has(skill)) return false;
    }
  }
  return true;
}

/**
 * Should the next question come from the darker pool?
 * @param {number} sanity
 * @returns {boolean}
 */
export function shouldSwapToDarker(sanity) {
  return sanity <= SEANCE_DARKNESS_THRESHOLD;
}

/**
 * Compute sanity after a tap. Sanity is bounded to [0, SEANCE_MAX_SANITY].
 * Every tap costs 1 (sigil, narrowing, and darker all decrement the same).
 *
 * @param {number} currentSanity
 * @returns {number}
 */
export function sanityAfterTap(currentSanity) {
  return Math.max(0, Math.min(SEANCE_MAX_SANITY, currentSanity - 1));
}

/**
 * Compute insight after a tap (just a counter).
 * @param {number} currentInsight
 * @returns {number}
 */
export function insightAfterTap(currentInsight) {
  return currentInsight + 1;
}

/**
 * Has the consultation reached the question cap?
 * @param {number} questionIndex  — zero-based; index of the question about to be asked
 * @returns {boolean}
 */
export function reachedMaxQuestions(questionIndex) {
  return questionIndex >= SEANCE_MAX_QUESTIONS;
}

/**
 * Decide the result, given the selections and the final sanity.
 *
 * The "normal" result has the top-accumulator skill as primary and
 * the second-best as alt. Beasthood is structurally identical —
 * the only difference is that primary and alt are *swapped*. This
 * keeps the algorithm in one place and makes the corruption feel
 * like a polarity flip rather than a separate code path.
 *
 * @param {{
 *   bySkill: Map<string, number>,
 *   topSkill: string|null,
 * }} scoring
 * @param {Selection[]} selections
 * @param {{
 *   resolveOption: (schoolId: string, optionId: string) => {primary:string, alt:string, reason:string}|null,
 * }} deps
 * @param {number} finalSanity
 * @returns {{
 *   primary: string|null,
 *   alt: string|null,
 *   beasthood: boolean,
 *   reason: string|null,
 * }}
 */
export function decideResult(scoring, selections, deps, finalSanity) {
  const beasthood = finalSanity <= 0;
  if (!scoring.topSkill) {
    return { primary: null, alt: null, beasthood, reason: null };
  }

  // Find the most recent selection whose option "votes" for the topSkill.
  // Its reason text reads coherently as the verdict.
  let sourceOption = null;
  for (let i = selections.length - 1; i >= 0; i--) {
    const sel = selections[i];
    if (sel.pool === 'sigil') continue;
    const opt = deps.resolveOption(sel.schoolId, sel.optionId);
    if (!opt) continue;
    if (opt.primary === scoring.topSkill || opt.alt === scoring.topSkill) {
      sourceOption = opt;
      break;
    }
  }

  // Second-best skill from the cumulative map (the natural alt).
  const rankedAlt = [...scoring.bySkill.entries()]
    .filter(([skill]) => skill !== scoring.topSkill)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const normalPrimary = scoring.topSkill;
  const normalAlt =
    sourceOption && sourceOption.alt !== scoring.topSkill
      ? sourceOption.alt
      : rankedAlt;

  return {
    primary: beasthood ? normalAlt : normalPrimary,
    alt: beasthood ? normalPrimary : normalAlt,
    beasthood,
    reason: sourceOption ? sourceOption.reason : null,
  };
}

/**
 * The pure state-machine step: given current state and a selection,
 * return the next state. This is what the hook calls.
 *
 *   - sanity decreases by 1 per tap (clamped to [0, MAX]).
 *   - insight increases by 1.
 *   - questionIndex advances when a narrowing option is picked.
 *
 * @param {{
 *   sanity: number,
 *   insight: number,
 *   questionIndex: number,
 * }} state
 * @param {string} pool  — 'sigil' | 'narrowing' | 'darker'
 * @returns {{sanity: number, insight: number, questionIndex: number}}
 */
export function nextState(state, pool) {
  if (pool === 'sigil') {
    return {
      sanity: sanityAfterTap(state.sanity),
      insight: insightAfterTap(0),
      questionIndex: 0,
    };
  }
  return {
    sanity: sanityAfterTap(state.sanity),
    insight: insightAfterTap(state.insight),
    questionIndex: state.questionIndex + 1,
  };
}
