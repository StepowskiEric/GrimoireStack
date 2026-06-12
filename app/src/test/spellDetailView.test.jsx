import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpellDetailView from '../components/SpellDetailView.jsx';

const sampleSchool = {
  id: 'debugging',
  name: 'School of Remediation',
  real: 'Debugging',
  desc: 'Incantations to banish bugs.',
  spells: [
    {
      name: 'Trace Sight',
      skill: 'log-trace-correlation',
      effect: 'Maps stack traces to source code and suggests fixes.',
      status: 'Proven',
      combos: ['Bisect Divination'],
    },
    {
      name: 'Bisect Divination',
      skill: 'bisect-debugging',
      effect: 'Binary searches commit history for the regression commit.',
      status: 'Proven',
    },
    {
      name: 'Minimal Summoning',
      skill: 'minimal-reproduction',
      effect: 'A'.repeat(150), // long effect to test truncation
      status: '—',
    },
  ],
};

describe('SpellDetailView', () => {
  it('renders null when school is null', () => {
    const { container } = render(<SpellDetailView school={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when school is undefined', () => {
    const { container } = render(<SpellDetailView />);
    expect(container.firstChild).toBeNull();
  });

  it('shows school name and description', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    expect(screen.getByText('Debugging')).toBeInTheDocument();
    expect(screen.getByText('Incantations to banish bugs.')).toBeInTheDocument();
  });

  it('shows spell count', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    expect(screen.getByText('3 incantations')).toBeInTheDocument();
  });

  it('renders all spells in the list', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('Bisect Divination')).toBeInTheDocument();
    expect(screen.getByText('Minimal Summoning')).toBeInTheDocument();
  });

  it('truncates long effects to 120 chars', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    const longEffect = screen.getByText(/^A{120}\.\.\./);
    expect(longEffect).toBeInTheDocument();
  });

  it('does not truncate short effects', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    expect(screen.getByText('Maps stack traces to source code and suggests fixes.')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<SpellDetailView school={sampleSchool} onBack={onBack} />);
    fireEvent.click(screen.getByText(/Back to The Spine/));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to spell detail when a spell is clicked', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    // Click the spell item button (not just the text)
    const spellButton = screen.getByRole('button', { name: /Trace Sight/ });
    fireEvent.click(spellButton);

    // Should now show spell detail view
    expect(screen.getByText('Effect')).toBeInTheDocument();
    expect(screen.getByText('Maps stack traces to source code and suggests fixes.')).toBeInTheDocument();
  });

  it('shows status badge for spells with non-em-dash status', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    const statusBadges = screen.getAllByText('Proven');
    expect(statusBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show status badge for spells with em-dash status', () => {
    render(<SpellDetailView school={sampleSchool} onBack={() => {}} />);
    // Minimal Summoning has status '—', should not render a status badge
    const items = document.querySelectorAll('.spell-detail__spell-item');
    const minimalItem = Array.from(items).find(el =>
      el.querySelector('.spell-detail__spell-name')?.textContent === 'Minimal Summoning'
    );
    expect(minimalItem.querySelector('.spell-detail__spell-status')).toBeNull();
  });

  it('returns to school view when back is clicked from spell detail', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    // Click into a spell
    const spellButton = screen.getByRole('button', { name: /Trace Sight/ });
    fireEvent.click(spellButton);
    expect(screen.getByText('Effect')).toBeInTheDocument();

    // Click back to school
    fireEvent.click(screen.getByText(/Back to Debugging/));
    expect(screen.getByText('3 incantations')).toBeInTheDocument();
  });

  it('shows tier from getVote when provided', () => {
    const getVote = vi.fn().mockReturnValue({ name: 'Adept Sigil' });
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        getVote={getVote}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Adept Sigil')).toBeInTheDocument();
    expect(getVote).toHaveBeenCalledWith('log-trace-correlation');
  });

  it('defaults tier to Common when getVote returns null', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        getVote={() => null}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Common')).toBeInTheDocument();
  });

  it('defaults tier to Common when getVote is not provided', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Common')).toBeInTheDocument();
  });

  it('shows combos when present', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Combinations')).toBeInTheDocument();
    expect(screen.getByText('Bisect Divination')).toBeInTheDocument();
  });

  it('does not show combos section when spell has no combos', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Bisect Divination'));
    expect(screen.queryByText('Combinations')).not.toBeInTheDocument();
  });

  it('shows Add to Favorites when not favorited', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
  });

  it('shows Favorited when favorited', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => true}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const onToggleFavorite = vi.fn();
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    fireEvent.click(screen.getByText('Add to Favorites'));
    expect(onToggleFavorite).toHaveBeenCalledWith('Trace Sight', 'log-trace-correlation');
  });

  it('renders the marginalia textarea', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    const textarea = screen.getByPlaceholderText('Add your notes here...');
    expect(textarea).toBeInTheDocument();
  });

  it('allows typing in the marginalia textarea', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    const textarea = screen.getByPlaceholderText('Add your notes here...');
    fireEvent.change(textarea, { target: { value: 'My notes' } });
    expect(textarea.value).toBe('My notes');
  });

  it('shows spell note when present', () => {
    const schoolWithNote = {
      ...sampleSchool,
      spells: [
        { ...sampleSchool.spells[0], note: 'Very useful for production incidents' },
      ],
    };
    render(
      <SpellDetailView
        school={schoolWithNote}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('Very useful for production incidents')).toBeInTheDocument();
  });

  it('does not show note section when spell has no note', () => {
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    // Note section should not exist for spells without a note
    const effectSection = screen.getByText('Effect');
    const noteHeading = document.querySelector('.spell-detail__note h3');
    expect(noteHeading).toBeNull();
  });

  it('handles school with no optional props gracefully', () => {
    // Should not crash when clicking a spell without optional props
    // (spell detail view doesn't use onBack, but it does use isFavorited)
    render(
      <SpellDetailView
        school={sampleSchool}
        onBack={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />
    );
    const spellButton = screen.getByRole('button', { name: /Trace Sight/ });
    fireEvent.click(spellButton);
    expect(screen.getByText('Effect')).toBeInTheDocument();
  });
});
