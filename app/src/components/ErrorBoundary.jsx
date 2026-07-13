import { Component } from 'react';

/**
 * GrimoireStack Error Boundary
 * Catches render errors and displays a themed fallback so the whole app
 * doesn't crash on a single bad component.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center min-h-screen bg-background text-foreground p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="panel max-w-md w-full p-6 text-center">
            <div className="text-sickly text-2xl mb-3" aria-hidden="true">
              ⟐
            </div>
            <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide mb-2">
              The Scroll Has Torn
            </h2>
            <p className="text-text-secondary text-[0.82rem] mb-4">
              Something went wrong while rendering this part of the Grimoire.
            </p>
            {this.state.error?.message && (
              <pre className="bg-surface-overlay border border-border text-text-primary text-[0.82rem] p-3 rounded-sm mb-4 text-left overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              className="section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
              onClick={this.handleReload}
            >
              ⟐ Rebind the Scroll
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
