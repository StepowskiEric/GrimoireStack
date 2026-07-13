export function clamp01(v: unknown): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export function dwellRamp(tSec: unknown): number {
  const t = typeof tSec === 'number' && Number.isFinite(tSec) ? tSec : 0;
  return clamp01(0.45 * (1 - Math.exp(-t / 40)));
}

export function ritualProgress(state: string | undefined, round: unknown): number {
  const r = typeof round === 'number' && Number.isFinite(round) ? round : 0;
  if (!state || state === 'idle') return 0;
  const base = 0.05;
  const roundGain = 0.14 * r;
  const converge = state === 'converged' ? 0.1 : 0;
  return clamp01(base + roundGain + converge);
}

export function computeGaze({
  dwellSec = 0,
  state = 'idle',
  round = 0,
}: { dwellSec?: number; state?: string; round?: number } = {}): number {
  return clamp01(dwellRamp(dwellSec) + ritualProgress(state, round));
}

export function bandGaze(gaze: unknown): number {
  return Math.round(clamp01(gaze) * 5) / 5;
}

export function gazeStage(band: unknown): number {
  return Math.round(clamp01(band) * 5);
}

export const GAZE_BANDS = [0, 0.2, 0.4, 0.6, 0.8, 1];
