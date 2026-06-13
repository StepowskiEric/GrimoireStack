import { describe, it, expect } from 'vitest';
import {
  scoreSelections,
  converged,
  shouldSwapToDarker,
  sanityAfterTap,
  insightAfterTap,
  reachedMaxQuestions,
  decideResult,
  nextState,
} from '../data/consultationScoring.js';
import { getOptionById } from '../data/consultationData.js';

const resolveOption = (schoolId, optionId) => {
  const found = getOptionById(schoolId, optionId);
  if (!found) return null;
  return { primary: found.option.primary, alt: found.option.alt, reason: found.option.reason };
};

describe('consultationScoring — sanityAfterTap', () => {
  it('decrements sanity by 1, clamped at 0', () => {
    expect(sanityAfterTap(5)).toBe(4);
    expect(sanityAfterTap(1)).toBe(0);
    expect(sanityAfterTap(0)).toBe(0);
  });
});

describe('consultationScoring — insightAfterTap', () => {
  it('increments insight by 1', () => {
    expect(insightAfterTap(0)).toBe(1);
    expect(insightAfterTap(3)).toBe(4);
  });
});

describe('consultationScoring — shouldSwapToDarker', () => {
  it('is true at sanity 2 and below, false above', () => {
    expect(shouldSwapToDarker(5)).toBe(false);
    expect(shouldSwapToDarker(3)).toBe(false);
    expect(shouldSwapToDarker(2)).toBe(true);
    expect(shouldSwapToDarker(1)).toBe(true);
    expect(shouldSwapToDarker(0)).toBe(true);
  });
});

describe('consultationScoring — reachedMaxQuestions', () => {
  it('is false below the cap, true at or above', () => {
    expect(reachedMaxQuestions(0)).toBe(false);
    expect(reachedMaxQuestions(4)).toBe(false);
    expect(reachedMaxQuestions(5)).toBe(true);
  });
});

describe('consultationScoring — scoreSelections', () => {
  it('returns empty map when no selections', () => {
    const out = scoreSelections([], { resolveOption });
    expect(out.topSkill).toBeNull();
    expect(out.bySkill.size).toBe(0);
  });

  it('ignores the sigil pick (pool === sigil)', () => {
    const out = scoreSelections(
      [
        {
          schoolId: 'debugging',
          questionId: '__sigil__',
          optionId: '__sigil__',
          pool: 'sigil',
          sanityAfter: 4,
        },
      ],
      { resolveOption }
    );
    expect(out.topSkill).toBeNull();
  });

  it('accumulates primary + alt weights across selections', () => {
    const out = scoreSelections(
      [
        { schoolId: 'debugging', questionId: 'dbg-n1', optionId: 'dbg-n1-a', pool: 'narrowing', sanityAfter: 4 },
        { schoolId: 'debugging', questionId: 'dbg-n3', optionId: 'dbg-n3-a', pool: 'narrowing', sanityAfter: 3 },
      ],
      { resolveOption }
    );
    // dbg-n1-a: primary=log-trace-correlation, alt=purify-test-output
    // dbg-n3-a: primary=iterative-patch-repair, alt=simulate-instrumentation
    expect(out.topSkill).toBeTruthy();
    expect(['log-trace-correlation', 'iterative-patch-repair']).toContain(out.topSkill);
    // alt weights are 0.5 each
    expect(out.bySkill.get('log-trace-correlation')).toBe(1);
    expect(out.bySkill.get('iterative-patch-repair')).toBe(1);
    expect(out.bySkill.get('purify-test-output')).toBe(0.5);
    expect(out.bySkill.get('simulate-instrumentation')).toBe(0.5);
  });

  it('repeated picks of the same option accumulate', () => {
    const out = scoreSelections(
      [
        { schoolId: 'debugging', questionId: 'dbg-n1', optionId: 'dbg-n1-a', pool: 'narrowing', sanityAfter: 4 },
        { schoolId: 'debugging', questionId: 'dbg-n2', optionId: 'dbg-n2-c', pool: 'narrowing', sanityAfter: 3 }, // alt = purify-test-output
      ],
      { resolveOption }
    );
    // dbg-n2-c: primary=minimal-reproduction, alt=purify-test-output
    // Both options have alt = purify-test-output
    expect(out.bySkill.get('purify-test-output')).toBe(1); // 0.5 + 0.5
    expect(out.bySkill.get('log-trace-correlation')).toBe(1);
    expect(out.bySkill.get('minimal-reproduction')).toBe(1);
  });
});

describe('consultationScoring — converged', () => {
  it('is false when fewer than n snapshots', () => {
    expect(converged([{ topSkill: 'a' }], 2)).toBe(false);
  });

  it('is true when the last n snapshots all have the same top', () => {
    expect(
      converged(
        [{ topSkill: 'a' }, { topSkill: 'a' }, { topSkill: 'a' }],
        2
      )
    ).toBe(true);
  });

  it('is false when the last n snapshots have a different top', () => {
    expect(
      converged(
        [{ topSkill: 'a' }, { topSkill: 'b' }, { topSkill: 'a' }],
        2
      )
    ).toBe(false);
  });

  it('is false when any top is null', () => {
    expect(
      converged(
        [{ topSkill: 'a' }, { topSkill: null }, { topSkill: null }],
        2
      )
    ).toBe(false);
  });
});

describe('consultationScoring — decideResult', () => {
  it('returns null fields when no top skill', () => {
    const out = decideResult(
      { bySkill: new Map(), topSkill: null },
      [],
      { resolveOption },
      3
    );
    expect(out.primary).toBeNull();
    expect(out.alt).toBeNull();
    expect(out.beasthood).toBe(false);
  });

  it('returns primary=winner, alt=second for sane ending', () => {
    const out = decideResult(
      {
        bySkill: new Map([
          ['log-trace-correlation', 2],
          ['purify-test-output', 1],
        ]),
        topSkill: 'log-trace-correlation',
      },
      [
        { schoolId: 'debugging', questionId: 'dbg-n1', optionId: 'dbg-n1-a', pool: 'narrowing', sanityAfter: 4 },
        { schoolId: 'debugging', questionId: 'dbg-n2', optionId: 'dbg-n2-c', pool: 'narrowing', sanityAfter: 3 },
      ],
      { resolveOption },
      3
    );
    expect(out.primary).toBe('log-trace-correlation');
    expect(out.alt).toBe('purify-test-output');
    expect(out.beasthood).toBe(false);
    expect(out.reason).toContain('trace');
  });

  it('inverts primary/alt for Beasthood ending (sanity 0)', () => {
    const out = decideResult(
      {
        bySkill: new Map([
          ['log-trace-correlation', 2],
          ['purify-test-output', 1],
        ]),
        topSkill: 'log-trace-correlation',
      },
      [
        { schoolId: 'debugging', questionId: 'dbg-n1', optionId: 'dbg-n1-a', pool: 'narrowing', sanityAfter: 4 },
        { schoolId: 'debugging', questionId: 'dbg-n2', optionId: 'dbg-n2-c', pool: 'narrowing', sanityAfter: 3 },
      ],
      { resolveOption },
      0
    );
    expect(out.beasthood).toBe(true);
    // The alt of dbg-n1-a is purify-test-output. That becomes the primary.
    expect(out.primary).toBe('purify-test-output');
    // The original top becomes the alt.
    expect(out.alt).toBe('log-trace-correlation');
  });
});

describe('consultationScoring — nextState', () => {
  it('sigil pick advances from sigil stage to asking', () => {
    const ns = nextState({ sanity: 5, insight: 0, questionIndex: 0 }, 'sigil');
    expect(ns.sanity).toBe(4);
    expect(ns.insight).toBe(1);
    expect(ns.questionIndex).toBe(0);
  });

  it('narrowing tap decreases sanity and increments insight and questionIndex', () => {
    const ns = nextState({ sanity: 4, insight: 1, questionIndex: 0 }, 'narrowing');
    expect(ns.sanity).toBe(3);
    expect(ns.insight).toBe(2);
    expect(ns.questionIndex).toBe(1);
  });
});
