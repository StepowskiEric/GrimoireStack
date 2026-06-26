import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

let mockIndex = {
  resolveKinsForSpell: () => [],
};

vi.mock('../data/grimoireIndexInstance.js', () => ({
  get grimoireIndex() {
    return mockIndex;
  },
}));

import FamiliarWhisper from '../components/FamiliarWhisper.jsx';

describe('FamiliarWhisper', () => {
  beforeEach(() => {
    mockIndex = { resolveKinsForSpell: () => [] };
  });

  it('renders nothing when the spell resolves no kins', () => {
    const { container } = render(<FamiliarWhisper spell={{ skill: 'a', name: 'A' }} onNavigate={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the spirit button when kins exist', () => {
    mockIndex = {
      resolveKinsForSpell: () => [{
        spell: { name: 'Bisect Divination', trueName: 'The Halving Rite', skill: 'bisect-debugging' },
        school: { real: 'Debugging' },
      }],
    };
    render(<FamiliarWhisper spell={{ skill: 'log-trace', name: 'Trace Sight', kins: ['bisect-debugging'] }} onNavigate={() => {}} />);
    expect(screen.getByLabelText('Reveal familiar')).toBeInTheDocument();
  });

  it('renders the kin trueName as the headline', () => {
    mockIndex = {
      resolveKinsForSpell: () => [{
        spell: { name: 'Bisect Divination', trueName: 'The Halving Rite', skill: 'bisect' },
        school: { real: 'Debugging' },
      }],
    };
    render(<FamiliarWhisper spell={{ skill: 'a', name: 'A', kins: ['bisect'] }} onNavigate={() => {}} />);
    expect(screen.getByText('The Halving Rite')).toBeInTheDocument();
    expect(screen.getByText(/Debugging/)).toBeInTheDocument();
  });

  it('falls back to name when the kin has no distinct trueName', () => {
    mockIndex = {
      resolveKinsForSpell: () => [{
        spell: { name: 'Plain Skill', skill: 'plain' },
        school: { real: 'School' },
      }],
    };
    render(<FamiliarWhisper spell={{ skill: 'a', name: 'A', kins: ['plain'] }} onNavigate={() => {}} />);
    expect(screen.getByText('Plain Skill')).toBeInTheDocument();
  });

  it('invokes onNavigate(spell, school) when a kin is clicked', () => {
    const kin = { spell: { name: 'Bisect', trueName: 'The Halving Rite', skill: 'b' }, school: { real: 'Debugging' } };
    mockIndex = { resolveKinsForSpell: () => [kin] };
    const onNavigate = vi.fn();
    render(<FamiliarWhisper spell={{ skill: 'a', name: 'A', kins: ['b'] }} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('The Halving Rite'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(kin.spell, kin.school);
  });

  it('relies on the data layer for capping and skipping unresolved kins', () => {
    const resolver = vi.fn().mockReturnValue([]);
    mockIndex = { resolveKinsForSpell: resolver };
    render(
      <FamiliarWhisper
        spell={{ skill: 'a', name: 'A', kins: ['s1', 's2', 's3', 's4', 's5'] }}
        onNavigate={() => {}}
      />
    );
    // FamiliarWhisper passes only the spell — the cap is the resolver's default
    // (kept in sync with MAX_KINS_PER_SPELL in derive.mjs).
    expect(resolver).toHaveBeenCalledWith(
      expect.objectContaining({ skill: 'a', kins: ['s1', 's2', 's3', 's4', 's5'] }),
    );
  });

  it('does not double-fire onNavigate on Enter/Space (native button semantics)', () => {
    const kin = { spell: { name: 'Bisect', skill: 'b' }, school: { real: 'Debugging' } };
    mockIndex = { resolveKinsForSpell: () => [kin] };
    const onNavigate = vi.fn();
    render(<FamiliarWhisper spell={{ skill: 'a', name: 'A', kins: ['b'] }} onNavigate={onNavigate} />);
    const btn = screen.getByText('Bisect');
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.keyDown(btn, { key: ' ' });
    // Native <button> activation is the click event; onKeyDown does not navigate.
    // Only an explicit click should call onNavigate.
    expect(onNavigate).not.toHaveBeenCalled();
    fireEvent.click(btn);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
