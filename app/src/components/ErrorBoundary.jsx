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
        <div className="grimoire-error" role="alert" aria-live="assertive">
          <div className="grimoire-error__scroll">
            <span className="grimoire-error__rune" aria-hidden="true">⟐</span>
            <h2 className="grimoire-error__title">The Scroll Has Torn</h2>
            <p className="grimoire-error__desc">
              Something went wrong while rendering this part of the Grimoire.
            </p>
            {this.state.error?.message && (
              <pre className="grimoire-error__trace">{this.state.error.message}</pre>
            )}
            <button
              type="button"
              className="grimoire-error__reload"
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
