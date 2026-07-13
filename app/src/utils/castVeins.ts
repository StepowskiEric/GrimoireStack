/**
 * generateCastVeins — seeded vein geometry for the Lidless Eye blood-crack overlay.
 *
 * Returns 8 vein paths radiating from the pupil. Pure function, no React dependency.
 */

export interface VeinPath {
  x1: number;
  y1: number;
  midX: number;
  midY: number;
  x2: number;
  y2: number;
}

export function generateCastVeins(count = 8): VeinPath[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const inner = 8 + Math.random() * 4;
    const outer = 50 + Math.random() * 8;
    const x1 = 120 + Math.cos(a) * inner;
    const y1 = 80 + Math.sin(a) * inner * 0.7;
    const midX = 120 + Math.cos(a) * (outer * 0.6);
    const midY = 80 + Math.sin(a) * (outer * 0.6) * 0.7;
    const x2 = 120 + Math.cos(a) * outer;
    const y2 = 80 + Math.sin(a) * outer * 0.7;
    return { x1, y1, midX, midY, x2, y2 };
  });
}
