import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SpellModal from '../components/SpellModal.tsx';

const sampleSpell = {
  name: 'Trace Sight',
  skill: 'log-trace-correlation',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
};

const sampleSchool = {
  id: 'debugging',
  name: 'School of Remediation',
  real: 'Debugging',
};

describe('SpellModal title', () => {
  it('renders the canonical name', () => {
    const { container } = render(
      <SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />,
    );
    const title = container.querySelector('[data-testid="spell-modal-title"]');
    expect(title.textContent).toBe('Trace Sight');
  });
});

describe('SpellModal action buttons', () => {
  beforeEach(() => {
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
        writable: true,
      });
    } else {
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restores the Inscribe button text after copy', async () => {
    render(<SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />);
    const inscribeBtn = screen.getByRole('button', { name: /inscribe to your workshop/i });
    await act(async () => {
      fireEvent.click(inscribeBtn);
    });
    expect(inscribeBtn.textContent).toBe('Incantation Inscribed');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'npx GrimoireStack install --agent claude --skill log-trace-correlation',
    );
    await act(() => new Promise((r) => setTimeout(r, 2100)));
    expect(inscribeBtn.textContent).toBe('Inscribe to your Workshop');
  });

  it('changes the copied command when a different agent is selected', async () => {
    render(<SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />);
    const select = screen.getByLabelText(/select target agent/i);
    await act(async () => {
      fireEvent.change(select, { target: { value: 'factory-droid' } });
    });
    const inscribeBtn = screen.getByRole('button', { name: /inscribe to your workshop/i });
    await act(async () => {
      fireEvent.click(inscribeBtn);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Copy log-trace-correlation/SKILL.md into ~/.factory/skills/log-trace-correlation/',
    );
  });

  it('shows a Copy failed state if clipboard rejects', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('blocked'));
    render(<SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />);
    const inscribeBtn = screen.getByRole('button', { name: /inscribe to your workshop/i });
    await act(async () => {
      fireEvent.click(inscribeBtn);
    });
    expect(inscribeBtn.textContent).toBe('Copy failed');
  });
});
