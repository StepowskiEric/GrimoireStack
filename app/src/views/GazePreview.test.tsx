import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import GazePreview from './GazePreview.tsx';

// GrimoireEye drives its animation through requestAnimationFrame; stub it so
// the effect schedules without invoking the loop (the gaze/data-gaze wiring we
// assert is set by the prop-sync effect, which does not depend on the rAF cb).
beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});
afterEach(cleanup);

const renderPreview = (initial = '/gaze-preview?gaze=0.25') =>
  render(
    <MemoryRouter initialEntries={[initial]}>
      <GazePreview />
    </MemoryRouter>,
  );

describe('GazePreview fixture', () => {
  it('reads ?gaze= from the URL on mount', () => {
    renderPreview('/gaze-preview?gaze=0.75');
    expect(screen.getByLabelText('Gaze intensity')).toHaveValue('0.75');
    expect(document.querySelector('.gaze-preview')).toHaveAttribute('data-gaze', '0.75');
  });

  it('defaults to 0.25 when no gaze param is present', () => {
    renderPreview('/gaze-preview');
    expect(screen.getByLabelText('Gaze intensity')).toHaveValue('0.25');
  });

  it('updates the eye when a band button is clicked', () => {
    renderPreview('/gaze-preview?gaze=0.25');
    fireEvent.click(screen.getByRole('button', { name: '0.50' }));
    expect(screen.getByLabelText('Gaze intensity')).toHaveValue('0.5');
    expect(document.querySelector('.gaze-preview')).toHaveAttribute('data-gaze', '0.5');
  });

  it('renders the GrimoireEye', () => {
    renderPreview('/gaze-preview?gaze=0.5');
    expect(document.querySelector('.grimoire-eye-wrapper')).not.toBeNull();
  });
});
