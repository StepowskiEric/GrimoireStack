import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import ProblemIntakeModal from '../components/ProblemIntakeModal.jsx';

const defaultProps = {
  onClose: vi.fn(),
  onSelectSpell: vi.fn(),
};

function renderModal(ui) {
  return render(
    <BrowserRouter>
      <LanguageProvider>{ui}</LanguageProvider>
    </BrowserRouter>
  );
}

describe('ProblemIntakeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getModal() {
    return screen.getByRole('dialog', { name: /Describe your problem/i });
  }

  it('renders the modal with title and textarea', () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    expect(within(modal).getByText('What Ails You?')).toBeVisible();
    expect(within(modal).getByRole('textbox')).toBeVisible();
  });

  it('shows sample problems when no query and no category', () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    expect(within(modal).getByText('Or try a sample problem:')).toBeVisible();
    expect(within(modal).getByText(/CI but pass/i)).toBeVisible();
  });

  it('clicking a category chip auto-surfaces category skills', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();

    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);

    expect(bugChip.className).toContain('active');

    await waitFor(() => {
      const refreshed = getModal();
      expect(within(refreshed).getByText(/suggested incantation/i)).toBeVisible();
    });
  });

  it('clicking an active chip deactivates it', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);
    expect(bugChip.className).toContain('active');

    fireEvent.click(bugChip);
    expect(bugChip.className).not.toContain('active');
  });

  it('shows Clear filter button only when a chip is active', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    expect(within(modal).queryByText('Clear filter')).not.toBeInTheDocument();

    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);

    await waitFor(() => {
      const refreshed = getModal();
      expect(within(refreshed).getByText('Clear filter')).toBeVisible();
    });
  });

  it('Clear filter resets category and query', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);

    const clearBtn = within(modal).getByText('Clear filter');
    fireEvent.click(clearBtn);

    const refreshed = getModal();
    expect(bugChip.className).not.toContain('active');
    expect(within(refreshed).getByRole('textbox').value).toBe('');
  });

  it('category chip boosts category skills above non-category skills', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();

    const reasoningChip = within(modal).getByRole('button', { name: /Planning & Decisions/ });
    fireEvent.click(reasoningChip);

    const textarea = within(modal).getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'trace' } });

    await waitFor(() => {
      const refreshed = getModal();
      expect(within(refreshed).getByText(/suggested incantation/i)).toBeVisible();
    });
  });

  it('submit button text changes based on active category', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    expect(within(modal).getByRole('button', { name: /Reveal Suggestions/i })).toBeVisible();

    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);

    await waitFor(() => {
      const refreshed = getModal();
      expect(within(refreshed).getByRole('button', { name: /Find Spell/i })).toBeVisible();
    });
  });

  it('calls onClose when close button is clicked', () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    fireEvent.click(within(modal).getByLabelText('Close intake'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('clicking a result calls onSelectSpell with the correct spell and school', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();

    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);

    await waitFor(() => {
      const refreshed = getModal();
      expect(within(refreshed).getByText(/Trace Sight/i)).toBeVisible();
    });

    const refreshed = getModal();
    const resultBtn = within(refreshed).getByRole('button', { name: /Trace Sight/ });
    fireEvent.click(resultBtn);

    expect(defaultProps.onSelectSpell).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Trace Sight', skill: 'log-trace-correlation' }),
      expect.objectContaining({ id: 'debugging' }),
    );
  });

  it('clicking an example populates the textarea', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    const exampleBtn = within(modal).getByText(/CI but pass/i);
    fireEvent.click(exampleBtn);

    const refreshed = getModal();
    expect(within(refreshed).getByRole('textbox').value).toContain('CI');
  });

  it('submit button is disabled when no results', () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    const submitBtn = within(modal).getByRole('button', { name: /Reveal Suggestions/i });
    expect(submitBtn.disabled).toBe(true);
  });

  it('submit button is enabled when category results exist', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });
    fireEvent.click(bugChip);

    await waitFor(() => {
      const refreshed = getModal();
      const submitBtn = within(refreshed).getByRole('button', { name: /Find Spell/i });
      expect(submitBtn.disabled).toBe(false);
    });
  });

  it('closes modal on Escape key', () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('chips have aria-pressed attribute reflecting state', async () => {
    renderModal(<ProblemIntakeModal {...defaultProps} />);
    const modal = getModal();
    const bugChip = within(modal).getByRole('button', { name: /Bug \/ Failure/ });

    expect(bugChip.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(bugChip);
    expect(bugChip.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(bugChip);
    expect(bugChip.getAttribute('aria-pressed')).toBe('false');
  });
});
