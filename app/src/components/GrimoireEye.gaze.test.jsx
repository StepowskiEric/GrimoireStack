import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import GrimoireEye from './GrimoireEye.jsx';

// GrimoireEye drives its animation through requestAnimationFrame; stub it so
// the effect schedules without invoking the loop (attributes are set by the
// prop-sync effect, which does not depend on the rAF callback).
beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});
afterEach(cleanup);

describe('GrimoireEye gaze prop', () => {
  it('reflects gaze and mood on the wrapper', () => {
    const { container } = render(<GrimoireEye gaze={0.8} mood="curious" />);
    const wrap = container.querySelector('.grimoire-eye-wrapper');
    expect(wrap).not.toBeNull();
    expect(wrap).toHaveAttribute('data-gaze', '0.8');
    expect(wrap).toHaveAttribute('data-mood', 'curious');
  });

  it('defaults gaze to 0.25 when omitted', () => {
    const { container } = render(<GrimoireEye mood="neutral" />);
    const wrap = container.querySelector('.grimoire-eye-wrapper');
    expect(wrap).toHaveAttribute('data-gaze', '0.25');
  });
});
