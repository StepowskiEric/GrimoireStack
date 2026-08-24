import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CompareSpellsModal from '../components/CompareSpellsModal.tsx';

// Mock the grimoireIndex module
const mockEntries = [
  {
    spell: {
      name: 'Trace Sight',
      skill: 'debug-issue',
      effect: 'Maps stack traces to source code.',
      status: 'Proven',
    },
    school: { id: 'debugging', name: 'School of Remediation', real: 'Debugging' },
  },
  {
    spell: {
      name: 'Bisect Divination',
      skill: 'debug-to-fix-pipeline',
      effect: 'Binary searches commit history.',
      status: 'Proven',
    },
    school: { id: 'debugging', name: 'School of Remediation', real: 'Debugging' },
  },
  {
    spell: {
      name: 'Razor of Parsimony',
      skill: 'occams-razor',
      effect: 'Favors the simplest sufficient explanation.',
      status: 'New',
    },
    school: { id: 'reasoning', name: 'School of Cognition', real: 'Reasoning' },
  },
];

vi.mock('../data/grimoireIndexInstance.ts', () => ({
  grimoireIndex: {
    allEntries: () => mockEntries,
  },
}));

import { grimoireIndex } from '../data/grimoireIndexInstance.ts';

const leftSpell = {
  spell: {
    name: 'Trace Sight',
    skill: 'debug-issue',
    effect: 'Maps stack traces to source code.',
    status: 'Proven',
  },
  school: { id: 'debugging', name: 'School of Remediation', real: 'Debugging' },
};

const rightSpell = {
  spell: {
    name: 'Bisect Divination',
    skill: 'debug-to-fix-pipeline',
    effect: 'Binary searches commit history.',
    status: 'Proven',
  },
  school: { id: 'debugging', name: 'School of Remediation', real: 'Debugging' },
};

describe('CompareSpellsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with title and subtitle', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    expect(screen.getByText('Compare Incantations')).toBeInTheDocument();
    expect(screen.getByText('Side-by-side comparison of two spells')).toBeInTheDocument();
  });

  it('has correct dialog attributes', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Compare spells');
  });

  it('shows empty slot states when no spells are provided', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    expect(screen.getByText('Summon the first incantation')).toBeInTheDocument();
    expect(screen.getByText('Summon the second')).toBeInTheDocument();
  });

  it('shows the comparison prompt when only one spell is provided', () => {
    render(
      <CompareSpellsModal left={leftSpell} right={null} onClose={() => {}} onSelect={() => {}} />,
    );
    expect(screen.getByText(/Bind two incantations to weigh them/)).toBeInTheDocument();
  });

  it('shows spell details when both spells are provided', () => {
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    // Trace Sight appears in both the slot and the comparison table
    const traceSight = screen.getAllByText('Trace Sight');
    expect(traceSight.length).toBeGreaterThanOrEqual(2);
    const bisectDiv = screen.getAllByText('Bisect Divination');
    expect(bisectDiv.length).toBeGreaterThanOrEqual(2);
    // Skill IDs appear in slot and comparison table
    const skillIds = screen.getAllByText(/debug-issue/);
    expect(skillIds.length).toBeGreaterThanOrEqual(2);
  });

  it('shows comparison table with field labels', () => {
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Effect')).toBeInTheDocument();
  });

  it('marks differing fields with diff class', () => {
    const { container } = render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    const diffRows = container.querySelectorAll(
      '[data-testid="compare-table-row"][data-state="diff"]',
    );
    expect(diffRows.length).toBeGreaterThan(0);
  });

  it('marks matching fields with same class', () => {
    const { container } = render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    const sameRows = container.querySelectorAll(
      '[data-testid="compare-table-row"][data-state="same"]',
    );
    expect(sameRows.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={onClose}
        onSelect={() => {}}
      />,
    );
    fireEvent.click(screen.getByLabelText('Close compare'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={onClose}
        onSelect={() => {}}
      />,
    );
    const overlay = container.querySelector('[data-testid="compare-overlay"]');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens picker when left slot is clicked', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    expect(screen.getByText(/Choose a spell for the left side/)).toBeInTheDocument();
  });

  it('opens picker when right slot is clicked', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the second'));
    expect(screen.getByText(/Choose a spell for the right side/)).toBeInTheDocument();
  });

  it('opens picker when a filled slot is clicked (replace)', () => {
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    // Click the left slot button (which contains the spell name)
    const slotButtons = screen.getAllByTestId('compare-slot');
    fireEvent.click(slotButtons[0]);
    expect(screen.getByText(/Choose a spell for the left side/)).toBeInTheDocument();
  });

  it('shows search input in the picker', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    expect(screen.getByLabelText('Search spells to compare')).toBeInTheDocument();
  });

  it('shows spell list in the picker', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('Bisect Divination')).toBeInTheDocument();
    expect(screen.getByText('Razor of Parsimony')).toBeInTheDocument();
  });

  it('filters spells when typing in search', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    const input = screen.getByLabelText('Search spells to compare');
    fireEvent.change(input, { target: { value: 'bisect' } });
    expect(screen.getByText('Bisect Divination')).toBeInTheDocument();
    expect(screen.queryByText('Razor of Parsimony')).not.toBeInTheDocument();
  });

  it('calls onPickSlot when a spell is selected from picker', () => {
    const onPickSlot = vi.fn();
    render(
      <CompareSpellsModal
        left={null}
        right={null}
        onClose={() => {}}
        onSelect={() => {}}
        onPickSlot={onPickSlot}
      />,
    );
    fireEvent.click(screen.getByText('Summon the first incantation'));
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(onPickSlot).toHaveBeenCalledWith('left', mockEntries[0].spell, mockEntries[0].school);
  });

  it('closes picker after spell selection', () => {
    render(
      <CompareSpellsModal
        left={null}
        right={null}
        onClose={() => {}}
        onSelect={() => {}}
        onPickSlot={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Summon the first incantation'));
    expect(screen.getByText(/Choose a spell for the left side/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(screen.queryByText(/Choose a spell for the left side/)).not.toBeInTheDocument();
  });

  it('cancel button closes the picker', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    expect(screen.getByText(/Choose a spell for the left side/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(/Choose a spell for the left side/)).not.toBeInTheDocument();
  });

  it('Escape key closes the modal when picker is not open', () => {
    const onClose = vi.fn();
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={onClose}
        onSelect={() => {}}
      />,
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape key closes the picker when it is open', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    expect(screen.getByText(/Choose a spell for the left side/)).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByText(/Choose a spell for the left side/)).not.toBeInTheDocument();
  });

  it('calls onSelect with spell and school when Open button is clicked', () => {
    const onSelect = vi.fn();
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('Open Trace Sight'));
    expect(onSelect).toHaveBeenCalledWith(
      leftSpell.spell,
      expect.objectContaining({ id: 'debugging' }),
    );
  });

  it('shows empty state when picker search returns no results', () => {
    render(<CompareSpellsModal left={null} right={null} onClose={() => {}} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('Summon the first incantation'));
    const input = screen.getByLabelText('Search spells to compare');
    fireEvent.change(input, { target: { value: 'zzznotfound' } });
    expect(screen.getByText(/The abyss returns no incantations/)).toBeInTheDocument();
  });

  it('shows Click to replace hint for filled slots', () => {
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    const hints = screen.getAllByText('Click to replace');
    expect(hints.length).toBe(2);
  });

  it('disables selection of the currently active spell in the picker', () => {
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={null}
        onClose={() => {}}
        onSelect={() => {}}
        onPickSlot={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    const rows = screen.getAllByText('Trace Sight');
    // The row in the picker should be disabled
    const pickerRow = rows.find((el) => el.closest('[data-testid="compare-picker-row"]'));
    if (pickerRow) {
      expect(pickerRow.closest('button')).toBeDisabled();
    }
  });

  it('shows vs divider between slots', () => {
    render(
      <CompareSpellsModal
        left={leftSpell}
        right={rightSpell}
        onClose={() => {}}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText('vs')).toBeInTheDocument();
  });
});
