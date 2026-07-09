// Gaze: a single continuous 0..1 value that quantifies how far the viewer has
// slid into the eldritch. Derived from dwell time on the page plus progress
// through the Ritual. One value drives every later visual slice (pupil, iris,
// chromatic aberration, veil, tentacles) so the transformation is coherent.

export function clamp01(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

// Dwell ramp: slow asymptotic climb toward 0.45 as the viewer lingers.
// Time constant 40s — noticeable by ~20s, near-saturated by ~2min.
export function dwellRamp(tSec) {
  const t = Number.isFinite(tSec) ? tSec : 0;
  return clamp01(0.45 * (1 - Math.exp(-t / 40)));
}

// Ritual contribution: opening the Ritual, each answered question, and the
// final convergence each push the gaze upward. Idle contributes nothing.
export function ritualProgress(state, round) {
  const r = Number.isFinite(round) ? round : 0;
  if (!state || state === 'idle') return 0;
  const base = 0.05; // the Ritual has been opened
  const roundGain = 0.14 * r; // each answered question pulls you deeper
  const converge = state === 'converged' ? 0.1 : 0;
  return clamp01(base + roundGain + converge);
}

export function computeGaze({ dwellSec = 0, state = 'idle', round = 0 } = {}) {
  return clamp01(dwellRamp(dwellSec) + ritualProgress(state, round));
}

// Snap a continuous gaze into one of six discrete bands. The whole-page veil
// and most CSS transitions key off the band, so the screen shifts in steps
// rather than a continuous crawl — each step reads as the void "looking back".
export function bandGaze(gaze) {
  return Math.round(clamp01(gaze) * 5) / 5;
}

// Band (0|0.2|0.4|0.6|0.8|1) → integer stage 0..5.
export function gazeStage(band) {
  return Math.round(clamp01(band) * 5);
}

export const GAZE_BANDS = [0, 0.2, 0.4, 0.6, 0.8, 1];
