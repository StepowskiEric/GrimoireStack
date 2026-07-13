import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RitualPanel from '../components/RitualPanel.jsx';

function makeRitual(overrides = {}) {
  return {
    state: 'idle',
    question: null,
    choices: [],
    results: [],
    round: 0,
    error: null,
    start: vi.fn(),
    answer: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

describe('RitualPanel', () => {
  it('renders idle state with textarea and submit button', () => {
    const ritual = makeRitual();
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByPlaceholderText(/describe your problem/i)).toBeInTheDocument();
    expect(screen.getByText('Begin the Inquisition')).toBeInTheDocument();
  });

  it('disables submit button when textarea is empty', () => {
    const ritual = makeRitual();
    render(<RitualPanel ritual={ritual} />);

    const btn = screen.getByText('Begin the Inquisition');
    expect(btn).toBeDisabled();
  });

  it('calls ritual.start on form submit', () => {
    const ritual = makeRitual();
    render(<RitualPanel ritual={ritual} />);

    const textarea = screen.getByPlaceholderText(/describe your problem/i);
    fireEvent.change(textarea, { target: { value: 'my problem' } });

    const btn = screen.getByText('Begin the Inquisition');
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(ritual.start).toHaveBeenCalledWith('my problem');
  });

  it('calls ritual.start on Enter key without Shift', () => {
    const ritual = makeRitual();
    render(<RitualPanel ritual={ritual} />);

    const textarea = screen.getByPlaceholderText(/describe your problem/i);
    fireEvent.change(textarea, { target: { value: 'my problem' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(ritual.start).toHaveBeenCalledWith('my problem');
  });

  it('does not call ritual.start on Shift+Enter', () => {
    const ritual = makeRitual();
    render(<RitualPanel ritual={ritual} />);

    const textarea = screen.getByPlaceholderText(/describe your problem/i);
    fireEvent.change(textarea, { target: { value: 'my problem' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(ritual.start).not.toHaveBeenCalled();
  });

  it('renders consulting state with loading indicator', () => {
    const ritual = makeRitual({ state: 'consulting', round: 0 });
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByText(/the oracle considers your words/i)).toBeInTheDocument();
  });

  it('renders consulting with different text on later rounds', () => {
    const ritual = makeRitual({ state: 'consulting', round: 2 });
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByText(/the oracle narrows its gaze/i)).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const ritual = makeRitual({ state: 'error', error: 'Something went wrong' });
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Try Again'));
    expect(ritual.reset).toHaveBeenCalled();
  });

  it('renders questioning state with question and choices', () => {
    const ritual = makeRitual({
      state: 'questioning',
      question: 'What is your goal?',
      choices: ['Debug', 'Test', 'Deploy'],
      round: 0,
    });
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByText('What is your goal?')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('calls ritual.answer when a choice is clicked', () => {
    const ritual = makeRitual({
      state: 'questioning',
      question: 'Pick one?',
      choices: ['Option A', 'Option B', 'Option C'],
      round: 0,
    });
    render(<RitualPanel ritual={ritual} />);

    fireEvent.click(screen.getByText('Option B'));
    expect(ritual.answer).toHaveBeenCalledWith('Option B');
  });

  it('renders converged state with results', () => {
    const ritual = makeRitual({
      state: 'converged',
      results: [
        { skill: 's1', name: 'Skill One', school: 'School A' },
        { skill: 's2', name: 'Skill Two', school: 'School B' },
      ],
      round: 2,
    });
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByText('The Oracle Has Spoken')).toBeInTheDocument();
    expect(screen.getByText('Skill One')).toBeInTheDocument();
    expect(screen.getByText('Skill Two')).toBeInTheDocument();
    expect(screen.getByText('School A')).toBeInTheDocument();
    expect(screen.getByText('School B')).toBeInTheDocument();
  });

  it('calls onConverge when a result is clicked', () => {
    const onConverge = vi.fn();
    const ritual = makeRitual({
      state: 'converged',
      results: [{ skill: 's1', name: 'Skill One', school: 'School A' }],
      round: 2,
    });
    render(<RitualPanel ritual={ritual} onConverge={onConverge} />);

    fireEvent.click(screen.getByText('Skill One'));
    expect(onConverge).toHaveBeenCalledWith({ skill: 's1', name: 'Skill One', school: 'School A' });
  });

  it('renders restart button in converged state', () => {
    const ritual = makeRitual({
      state: 'converged',
      results: [{ skill: 's1', name: 'S1', school: 'Sc' }],
      round: 2,
    });
    render(<RitualPanel ritual={ritual} />);

    fireEvent.click(screen.getByText('Begin Anew'));
    expect(ritual.reset).toHaveBeenCalled();
  });

  it('renders choice letters A, B, C', () => {
    const ritual = makeRitual({
      state: 'questioning',
      question: 'Q?',
      choices: ['X', 'Y', 'Z'],
      round: 0,
    });
    render(<RitualPanel ritual={ritual} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('returns null for unknown state', () => {
    const ritual = makeRitual({ state: 'unknown' });
    const { container } = render(<RitualPanel ritual={ritual} />);
    expect(container.firstChild).toBeNull();
  });
});
