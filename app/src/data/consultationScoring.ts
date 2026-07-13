/**
 * consultationScoring — pure functions for the Séance.
 *
 * The Séance is a state machine that accumulates "votes" for skill ids
 * as the user picks option cards. Each option contributes its `primary`
 * skill (full weight) and its `alt` skill (half weight). When the
 * consultation ends naturally (convergence) or forced (Sanity 0), the
 * top-accumulator becomes the result.
 */

import {
  SEANCE_CONVERGENCE_RUN,
  SEANCE_DARKNESS_THRESHOLD,
  SEANCE_MAX_SANITY,
} from './consultationData.ts';

const ALT_WEIGHT = 0.5;

export interface Selection {
  schoolId: string;
  questionId: string;
  optionId: string;
  pool: 'narrowing' | 'darker' | 'sigil';
  sanityAfter: number;
}

export interface ResolvedOption {
  primary: string;
  alt: string;
  reason: string;
}

export interface ScoreResult {
  bySkill: Map<string, number>;
  topSkill: string | null;
  topScore: number;
  rankedSkills: { skill: string; score: number }[];
}

export interface ConvergedSnapshot {
  topSkill: string | null;
  rankedSkills: { skill: string }[];
}

export interface DecideResult {
  primary: string | null;
  alt: string | null;
  beasthood: boolean;
  reason: string | null;
}

export interface SeanceState {
  sanity: number;
  insight: number;
  questionIndex: number;
}

function addOption(acc: Map<string, number>, primary: string, alt: string): void {
  if (primary) acc.set(primary, (acc.get(primary) || 0) + 1);
  if (alt && alt !== primary) acc.set(alt, (acc.get(alt) || 0) + ALT_WEIGHT);
}

export function scoreSelections(
  selections: Selection[],
  deps: { resolveOption: (schoolId: string, optionId: string) => ResolvedOption | null },
): ScoreResult {
  const bySkill = new Map<string, number>();
  for (const sel of selections) {
    if (sel.pool === 'sigil') continue;
    const opt = deps.resolveOption(sel.schoolId, sel.optionId);
    if (!opt) continue;
    addOption(bySkill, opt.primary, opt.alt);
  }
  const ranked = [...bySkill.entries()]
    .map(([skill, score]) => ({ skill, score }))
    .sort((a, b) => b.score - a.score);
  return {
    bySkill,
    topSkill: ranked.length > 0 ? ranked[0].skill : null,
    topScore: ranked.length > 0 ? ranked[0].score : 0,
    rankedSkills: ranked,
  };
}

export function converged(snapshots: ConvergedSnapshot[], n = SEANCE_CONVERGENCE_RUN): boolean {
  if (snapshots.length < n) return false;
  const last = snapshots.slice(-n);
  if (!last.every((s) => s.topSkill)) return false;
  const top = last[0].topSkill;
  if (!last.every((s) => s.topSkill === top)) return false;
  const top2 = (s: ConvergedSnapshot) => new Set((s.rankedSkills || []).slice(0, 2).map((r) => r.skill));
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

export function shouldSwapToDarker(sanity: number): boolean {
  return sanity <= SEANCE_DARKNESS_THRESHOLD;
}

export function sanityAfterTap(currentSanity: number): number {
  return Math.max(0, Math.min(SEANCE_MAX_SANITY, currentSanity - 1));
}

export function insightAfterTap(currentInsight: number): number {
  return currentInsight + 1;
}

export function decideResult(
  scoring: { bySkill: Map<string, number>; topSkill: string | null },
  selections: Selection[],
  deps: { resolveOption: (schoolId: string, optionId: string) => ResolvedOption | null },
  finalSanity: number,
): DecideResult {
  const beasthood = finalSanity <= 0;
  if (!scoring.topSkill) {
    return { primary: null, alt: null, beasthood, reason: null };
  }

  let sourceOption: ResolvedOption | null = null;
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

  const rankedAlt =
    [...scoring.bySkill.entries()]
      .filter(([skill]) => skill !== scoring.topSkill)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const normalPrimary = scoring.topSkill;
  const normalAlt =
    sourceOption && sourceOption.alt !== scoring.topSkill ? sourceOption.alt : rankedAlt;

  return {
    primary: beasthood ? normalAlt : normalPrimary,
    alt: beasthood ? normalPrimary : normalAlt,
    beasthood,
    reason: sourceOption ? sourceOption.reason : null,
  };
}

export function nextState(state: SeanceState, pool: string): SeanceState {
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
