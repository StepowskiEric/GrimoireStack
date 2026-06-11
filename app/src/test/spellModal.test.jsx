import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SpellModal from '../components/SpellModal.jsx';

const sampleSpell = {
  name: 'Trace Sight',
  skill: 'log-trace-correlation',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
};

const sampleSchool = {
  id: 'debugging',
  name: 'School of Remediation',
  symbol: '⚔',
  real: 'Debugging',
};

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

  // Catches ISSUE-002: restore must use stable string, not fragile dataset lookup
  it('restores the Inscribe button text after copy', async () => {
    render(<SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />);
    const inscribeBtn = screen.getByRole('button', { name: /inscribe to your workshop/i });
    await act(async () => { fireEvent.click(inscribeBtn); });
    expect(inscribeBtn.textContent).toBe('✦ Incantation Inscribed');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'npx jerry-skills install --agent claude --skill log-trace-correlation'
    );
    // After the timeout, the original text must be restored
    await act(() => new Promise(r => setTimeout(r, 2100)));
    expect(inscribeBtn.textContent).toBe('✦ Inscribe to your Workshop');
  });

  it('changes the copied command when a different agent is selected', async () => {
    render(<SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />);
    const select = screen.getByLabelText(/select target agent/i);
    await act(async () => { fireEvent.change(select, { target: { value: 'factory-droid' } }); });
    const inscribeBtn = screen.getByRole('button', { name: /inscribe to your workshop/i });
    await act(async () => { fireEvent.click(inscribeBtn); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'Copy log-trace-correlation/SKILL.md into ~/.factory/skills/log-trace-correlation/'
    );
  });

  it('shows a Copy failed state if clipboard rejects', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('blocked'));
    render(<SpellModal spell={sampleSpell} school={sampleSchool} onClose={() => {}} />);
    const inscribeBtn = screen.getByRole('button', { name: /inscribe to your workshop/i });
    await act(async () => { fireEvent.click(inscribeBtn); });
    expect(inscribeBtn.textContent).toBe('✦ Copy failed');
  });
});
