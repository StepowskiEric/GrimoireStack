import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the grimoire index — keeps the test fast and independent of the
// real registry, while exposing the methods App.jsx reads on mount.
vi.mock('../data/grimoireIndexInstance.js', () => {
  const debug = { id: 'debugging', real: 'Debugging', name: 'School of Remediation', spells: [] };
  const reason = { id: 'reasoning', real: 'Reasoning', name: 'School of Cognition', spells: [] };
  const map = new Map([
    [debug.id, debug],
    [reason.id, reason],
  ]);
  const emptySearch = { entries: [], total: 0, bySchool: new Map() };
  return {
    grimoireIndex: {
      flatEntries: () => [],
      allEntries: () => [],
      getSchoolMap: () => map,
      getStats: () => ({ totalSchools: 2, totalSpells: 0 }),
      resolveBySkill: () => null,
      resolveByName: () => null,
      resolveKinsForSpell: () => [],
      searchSpells: () => emptySearch,
      filterSpells: () => emptySearch,
      similarTo: () => [],
      matchProblem: () => [],
      buildSpellWeb: () => ({ nodes: [], edges: [] }),
      buildGraph: () => ({ nodes: [], edges: [] }),
    },
  };
});

import App from '../App.jsx';

function renderApp() {
  // App.jsx already provides its own BrowserRouter + LanguageProvider.
  return render(<App />);
}

describe('App smoke (full render)', () => {
  let consoleErrors;
  let consoleWarns;
  let unhandledErrors;

  beforeEach(() => {
    localStorage.clear();
    consoleErrors = [];
    consoleWarns = [];
    unhandledErrors = [];

    vi.spyOn(console, 'error').mockImplementation((...args) => {
      const msg = args
        .map((a) => (typeof a === 'string' ? a : (a?.message ?? String(a))))
        .join(' ');
      consoleErrors.push(msg);
    });
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      const msg = args
        .map((a) => (typeof a === 'string' ? a : (a?.message ?? String(a))))
        .join(' ');
      consoleWarns.push(msg);
    });

    const handler = (e) => {
      const err = e.reason || e.error || e;
      unhandledErrors.push(err?.message ?? String(err));
    };
    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', handler);
    globalThis.__smoke_handler__ = handler;
  });

  afterEach(() => {
    window.removeEventListener('error', globalThis.__smoke_handler__);
    window.removeEventListener('unhandledrejection', globalThis.__smoke_handler__);
    vi.restoreAllMocks();
  });

  it('renders without throwing', async () => {
    let renderError;
    try {
      await act(async () => {
        renderApp();
      });
    } catch (e) {
      renderError = e;
    }
    expect(renderError).toBeUndefined();
  });

  it('does NOT show the ErrorBoundary fallback', async () => {
    await act(async () => {
      renderApp();
    });
    // ErrorBoundary shows "The Scroll Has Torn" when it catches an error.
    expect(screen.queryByText('The Scroll Has Torn')).toBeNull();
  });

  it('does not log "X is not a function" errors to console', async () => {
    await act(async () => {
      renderApp();
    });
    // The production crash was "useLocalStorageState is not a function or
    // its return value is not iterable". Surface any destructuring-style
    // or function-call errors before they ship.
    const iterabilityErrors = consoleErrors.filter((m) =>
      /is not a function or its return value is not iterable/i.test(m),
    );
    expect(iterabilityErrors).toEqual([]);
  });

  it('does not throw unhandled errors', async () => {
    await act(async () => {
      renderApp();
    });
    // Allow microtasks to flush so async-throw hooks get caught.
    await waitFor(() => {
      expect(unhandledErrors).toEqual([]);
    });
  });

  it('renders the main layout shell', async () => {
    await act(async () => {
      renderApp();
    });
    // The layout exposes the brand name in the sidebar.
    expect(screen.getAllByText(/GrimoireStack/i).length).toBeGreaterThan(0);
  });
});
