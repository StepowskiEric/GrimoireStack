import { describe, expect, it } from 'vitest';
import {
  bandGaze,
  clamp01,
  computeGaze,
  dwellRamp,
  GAZE_BANDS,
  gazeStage,
  ritualProgress,
} from './gaze.js';

describe('clamp01', () => {
  it('bounds to 0..1', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
  });
  it('coerces non-numbers to 0', () => {
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp01(undefined)).toBe(0);
    expect(clamp01('x')).toBe(0);
  });
});

describe('dwellRamp', () => {
  it('starts at 0 and asymptotes to 0.45', () => {
    expect(dwellRamp(0)).toBeCloseTo(0, 5);
    expect(dwellRamp(40)).toBeCloseTo(0.45 * (1 - Math.exp(-1)), 5);
    expect(dwellRamp(1e6)).toBeCloseTo(0.45, 5);
  });
});

describe('ritualProgress', () => {
  it('is 0 when idle', () => {
    expect(ritualProgress('idle', 0)).toBe(0);
  });
  it('adds base on open, per round, and converge bonus', () => {
    expect(ritualProgress('consulting', 0)).toBeCloseTo(0.05, 5);
    expect(ritualProgress('questioning', 1)).toBeCloseTo(0.19, 5);
    expect(ritualProgress('converged', 3)).toBeCloseTo(0.57, 5);
  });
});

describe('computeGaze', () => {
  it('combines dwell and ritual, clamped to 1', () => {
    expect(computeGaze({ dwellSec: 0, state: 'idle', round: 0 })).toBe(0);
    const g = computeGaze({ dwellSec: 1e6, state: 'converged', round: 5 });
    expect(g).toBe(1);
  });
});

describe('bandGaze', () => {
  it('snaps to the nearest 0.2 band', () => {
    expect(bandGaze(0)).toBe(0);
    expect(bandGaze(0.1)).toBe(0.2);
    expect(bandGaze(0.29)).toBe(0.2);
    expect(bandGaze(0.31)).toBe(0.4);
    expect(bandGaze(0.9)).toBe(1);
    expect(bandGaze(2)).toBe(1);
  });
});

describe('gazeStage', () => {
  it('maps a band to integer 0..5', () => {
    expect(gazeStage(0)).toBe(0);
    expect(gazeStage(0.8)).toBe(4);
    expect(gazeStage(1)).toBe(5);
  });
});

describe('GAZE_BANDS', () => {
  it('has six ordered steps', () => {
    expect(GAZE_BANDS).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });
});
