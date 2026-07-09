import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoidIncantations from '../components/VoidIncantations.jsx';

// Isolate the component: reuse the single resident page-agent via the hook,
// which we mock so no real page-agent import (or network) happens in tests.
const mockRunAgent = vi.fn();

vi.mock('../hooks/useAgentMode.js', () => ({
  useAgentMode: () => ({ runAgent: mockRunAgent }),
}));

beforeEach(() => {
  mockRunAgent.mockReset();
});

describe('VoidIncantations', () => {
  it('renders nothing below peak gaze (eye is closed to incantations)', () => {
    render(<VoidIncantations gaze={0.7} />);
    expect(screen.queryByPlaceholderText('utter an incantation')).toBeNull();
  });

  it('renders the incantation affordance at peak gaze', () => {
    render(<VoidIncantations gaze={1} />);
    expect(screen.getByPlaceholderText('utter an incantation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Utter' })).toBeInTheDocument();
  });

  it('utters the incantation through the resident page-agent', () => {
    mockRunAgent.mockResolvedValue(true);
    render(<VoidIncantations gaze={1} />);

    const input = screen.getByPlaceholderText('utter an incantation');
    fireEvent.change(input, { target: { value: 'open the divination panel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Utter' }));

    expect(mockRunAgent).toHaveBeenCalledWith(
      expect.objectContaining({ incantation: 'open the divination panel' })
    );
  });

  it('does not utter an empty incantation', () => {
    render(<VoidIncantations gaze={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Utter' }));
    expect(mockRunAgent).not.toHaveBeenCalled();
  });
});
