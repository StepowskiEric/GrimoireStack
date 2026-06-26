import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';

const mockSchoolMap = new Map();
vi.mock('../data/grimoireIndexInstance.js', () => ({
  get grimoireIndex() {
    return {
      getSchoolMap: () => mockSchoolMap,
      getStats: () => ({ totalSchools: mockSchoolMap.size, totalSpells: 3 }),
    };
  },
}));

import AllSchoolsView from '../components/AllSchoolsView.jsx';

function renderWithProviders(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('AllSchoolsView — trueName search inclusion', () => {
  it('keeps a school in the results when only the trueName token matches', () => {
    mockSchoolMap.clear();
    mockSchoolMap.set('debugging', {
      id: 'debugging',
      name: 'School of Remediation',
      real: 'Debugging',
      desc: 'Incantations to banish bugs.',
      spells: [
        { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Reads stack traces.', trueName: 'The Eye That Reads' },
      ],
    });
    mockSchoolMap.set('reasoning', {
      id: 'reasoning',
      name: 'School of Cognition',
      real: 'Reasoning',
      desc: 'Incantations for clear thought.',
      spells: [
        { name: 'Razor of Parsimony', skill: 'occams-razor', effect: 'Favors simplicity.' },
      ],
    });

    renderWithProviders(
      <AllSchoolsView onSchoolSelect={() => {}} searchQuery="Eye That Reads" />
    );

    // The Debugging school contains the matching trueName token — kept.
    expect(screen.getByText('Debugging')).toBeInTheDocument();
    // The Reasoning school has no trueName match — filtered out.
    expect(screen.queryByText('Reasoning')).not.toBeInTheDocument();
  });

  it('filters by canonical name when trueName is absent', () => {
    mockSchoolMap.clear();
    mockSchoolMap.set('debugging', {
      id: 'debugging',
      name: 'School of Remediation',
      real: 'Debugging',
      desc: 'Incantations to banish bugs.',
      spells: [
        { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Reads stack traces.' },
      ],
    });
    mockSchoolMap.set('reasoning', {
      id: 'reasoning',
      name: 'School of Cognition',
      real: 'Reasoning',
      desc: 'Incantations for clear thought.',
      spells: [
        { name: 'Razor of Parsimony', skill: 'occams-razor', effect: 'Favors simplicity.' },
      ],
    });

    renderWithProviders(
      <AllSchoolsView onSchoolSelect={() => {}} searchQuery="Parsimony" />
    );
    expect(screen.queryByText('Debugging')).not.toBeInTheDocument();
    expect(screen.getByText('Reasoning')).toBeInTheDocument();
  });

  it('still matches by skill id when trueName is absent', () => {
    mockSchoolMap.clear();
    mockSchoolMap.set('debugging', {
      id: 'debugging',
      name: 'School of Remediation',
      real: 'Debugging',
      desc: 'x',
      spells: [
        { name: 'A', skill: 'log-trace-correlation', effect: 'b' },
      ],
    });

    renderWithProviders(
      <AllSchoolsView onSchoolSelect={() => {}} searchQuery="log-trace-correlation" />
    );
    expect(screen.getByText('Debugging')).toBeInTheDocument();
  });

  it('matches a school whose name or description contains the query', () => {
    mockSchoolMap.clear();
    mockSchoolMap.set('debugging', {
      id: 'debugging',
      name: 'School of Remediation',
      real: 'Debugging',
      desc: 'Incantations to banish bugs.',
      spells: [{ name: 'X', skill: 'x', effect: 'x' }],
    });

    renderWithProviders(
      <AllSchoolsView onSchoolSelect={() => {}} searchQuery="banish" />
    );
    expect(screen.getByText('Debugging')).toBeInTheDocument();
  });

  it('shows an empty-state message when nothing matches', () => {
    mockSchoolMap.clear();
    mockSchoolMap.set('debugging', {
      id: 'debugging',
      name: 'School of Remediation',
      real: 'Debugging',
      desc: 'x',
      spells: [{ name: 'X', skill: 'x', effect: 'x' }],
    });

    renderWithProviders(
      <AllSchoolsView onSchoolSelect={() => {}} searchQuery="zzz-no-match-zzz" />
    );
    expect(screen.queryByText('Debugging')).not.toBeInTheDocument();
    expect(screen.getByText(/abyss returns no wardens/i)).toBeInTheDocument();
  });

  it('shows all schools when searchQuery is empty', () => {
    mockSchoolMap.clear();
    mockSchoolMap.set('debugging', {
      id: 'debugging',
      name: 'School of Remediation',
      real: 'Debugging',
      desc: 'x',
      spells: [{ name: 'X', skill: 'x', effect: 'x' }],
    });
    mockSchoolMap.set('reasoning', {
      id: 'reasoning',
      name: 'School of Cognition',
      real: 'Reasoning',
      desc: 'x',
      spells: [{ name: 'Y', skill: 'y', effect: 'y' }],
    });

    renderWithProviders(
      <AllSchoolsView onSchoolSelect={() => {}} searchQuery="" />
    );
    expect(screen.getByText('Debugging')).toBeInTheDocument();
    expect(screen.getByText('Reasoning')).toBeInTheDocument();
  });
});
