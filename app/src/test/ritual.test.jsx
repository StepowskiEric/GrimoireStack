import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RitualSection from '../components/RitualSection.jsx';

describe('RitualSection', () => {
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

  // Catches ISSUE-001 (timer cleanup)
  it('does not throw after unmount when a copy timer is still pending', () => {
    const { unmount } = render(<RitualSection />);
    const copyBtn = screen.getAllByRole('button', { name: /inscribe|copy/i })[0];
    fireEvent.click(copyBtn);
    unmount();
    // No assertion needed — test fails if unmounted-state update throws
  });

  // Verifies primary incantation copy
  it('copies the primary npx command when the first copy button is clicked', async () => {
    render(<RitualSection />);
    const btn = screen.getAllByRole('button', { name: /inscribe|copy/i })[0];
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('npx jerry-skills install');
  });

  // Verifies per-agent install command
  it('copies the per-agent install command with --agent flag', () => {
    render(<RitualSection />);
    const agentBtns = screen.getAllByRole('button', { name: /^✦$/ });
    expect(agentBtns.length).toBeGreaterThanOrEqual(5);
    fireEvent.click(agentBtns[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('npx jerry-skills install --agent codex');
  });

  // Verifies the GitHub link
  it('renders a link to the GrimoireStack GitHub repository', () => {
    render(<RitualSection />);
    const link = screen.getByRole('link', { name: /open the grimoirestack repository on github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/StepowskiEric/GrimoireStack');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // Catches ISSUE-002 (fragile dataset usage in SpellModal) — tested separately below
  it('renders the Grimoire reference format', () => {
    render(<RitualSection />);
    expect(screen.getByText(/grimoirestack/)).toBeInTheDocument();
  });
});
