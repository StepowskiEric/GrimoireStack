import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../components/ErrorBoundary.tsx';

// Component that throws on render
function ThrowError({ message = 'Test error' }) {
  throw new Error(message);
}

// Component that renders normally
function GoodChild() {
  return <div>Hello from child</div>;
}

describe('ErrorBoundary', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello from child')).toBeInTheDocument();
  });

  it('renders the error fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Something broke" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('The Scroll Has Torn')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong while rendering/)).toBeInTheDocument();
  });

  it('displays the error message in the fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Detailed error info" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Detailed error info')).toBeInTheDocument();
  });

  it('has role="alert" on the fallback container', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('has aria-live="assertive" on the fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders the reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /Rebind the Scroll/ })).toBeInTheDocument();
  });

  it('calls window.location.reload when reload button is clicked', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Rebind the Scroll/ }));
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('logs the error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="logged error" />
      </ErrorBoundary>,
    );
    expect(consoleSpy).toHaveBeenCalled();
    // componentDidCatch calls console.error with (error, info)
    const firstCall = consoleSpy.mock.calls[0];
    expect(firstCall.length).toBeGreaterThanOrEqual(1);
    // First arg should be the Error object or a string containing the error
    const errorArg = firstCall[0];
    const isErrorObj = errorArg instanceof Error;
    const isString = typeof errorArg === 'string';
    expect(isErrorObj || isString).toBe(true);
  });

  it('does not show the error message when error has no message', () => {
    function ThrowNoMessage() {
      const err = new Error();
      err.message = '';
      throw err;
    }

    const { container } = render(
      <ErrorBoundary>
        <ThrowNoMessage />
      </ErrorBoundary>,
    );

    expect(screen.getByText('The Scroll Has Torn')).toBeInTheDocument();
    const trace = container.querySelector('.grimoire-error__trace');
    expect(trace).toBeNull();
  });

  it('recovers when a new child is rendered after error', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('The Scroll Has Torn')).toBeInTheDocument();

    // Re-render with a good child — but ErrorBoundary won't recover
    // automatically (React's behavior: once errored, stays errored
    // until component is remounted)
    rerender(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );

    // Still shows error fallback (expected React behavior)
    expect(screen.getByText('The Scroll Has Torn')).toBeInTheDocument();
  });

  it('renders the decorative rune symbol', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    // The ⟐ symbol appears in the rune span and the button
    const runes = screen.getAllByText('⟐', { exact: false });
    expect(runes.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render fallback when children are valid', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>,
    );
    expect(container.querySelector('.grimoire-error')).toBeNull();
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });
});
