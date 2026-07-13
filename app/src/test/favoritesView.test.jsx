import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FavoritesView from '../components/FavoritesView.jsx';
import { LanguageProvider } from '../i18n/LanguageContext';

const sampleSchools = [
  {
    id: 'debugging',
    name: 'School of Remediation',
    real: 'Debugging',
    spells: [
      { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Maps stack traces.' },
      { name: 'Bisect Divination', skill: 'bisect-debugging', effect: 'Binary searches.' },
    ],
  },
  {
    id: 'reasoning',
    name: 'School of Cognition',
    real: 'Reasoning',
    spells: [
      { name: 'Razor of Parsimony', skill: 'occams-razor', effect: 'Simplest explanation.' },
    ],
  },
];

// Test school with many spells for the recent-limit test
const manyTestSchool = {
  id: 'test',
  name: 'Test School',
  spells: Array.from({ length: 15 }, (_, i) => ({
    name: `Spell ${i}`,
    skill: `skill-${i}`,
    effect: `effect ${i}`,
  })),
};

const flatEntries = [
  ...sampleSchools.flatMap((s) => s.spells.map((sp) => ({ spell: sp, school: s }))),
  ...manyTestSchool.spells.map((sp) => ({ spell: sp, school: manyTestSchool })),
];

vi.mock('../data/grimoireIndexInstance.js', () => ({
  grimoireIndex: {
    flatEntries: () => flatEntries,
  },
}));

const renderWithLang = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

describe('FavoritesView', () => {
  it('renders the Vault title', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('The Vault')).toBeInTheDocument();
  });

  it('shows empty state for favorites when none are bound', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText(/The circle is silent/)).toBeInTheDocument();
  });

  it('shows empty state for recent when none viewed', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText(/The trail is cold/)).toBeInTheDocument();
  });

  it('shows empty state for marginalia when none exist', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText(/The page is clean/)).toBeInTheDocument();
  });

  it('renders favorite spells by name', () => {
    renderWithLang(
      <FavoritesView
        favorites={[{ name: 'Trace Sight', skill: 'log-trace-correlation' }]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => true}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
  });

  it('shows the count of bound incantations', () => {
    renderWithLang(
      <FavoritesView
        favorites={[
          { name: 'Trace Sight', skill: 'log-trace-correlation' },
          { name: 'Bisect Divination', skill: 'bisect-debugging' },
        ]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => true}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText(/Bound Incantations \(2\)/)).toBeInTheDocument();
  });

  it('calls onSpellClick when a favorite is clicked', () => {
    const onSpellClick = vi.fn();
    renderWithLang(
      <FavoritesView
        favorites={[{ name: 'Trace Sight', skill: 'log-trace-correlation' }]}
        recent={[]}
        marginalia={{}}
        onSpellClick={onSpellClick}
        isFavorited={() => true}
        onToggleFavorite={() => {}}
      />,
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(onSpellClick).toHaveBeenCalledTimes(1);
    expect(onSpellClick.mock.calls[0][0]).toMatchObject({ name: 'Trace Sight' });
  });

  it('calls onToggleFavorite when the star is clicked', () => {
    const onToggleFavorite = vi.fn();
    renderWithLang(
      <FavoritesView
        favorites={[{ name: 'Trace Sight', skill: 'log-trace-correlation' }]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => true}
        onToggleFavorite={onToggleFavorite}
      />,
    );
    const starButtons = screen.getAllByLabelText(/Unbind|Bind/);
    fireEvent.click(starButtons[0]);
    expect(onToggleFavorite).toHaveBeenCalledWith('Trace Sight', 'log-trace-correlation');
  });

  it('renders recently viewed spells', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[{ name: 'Razor of Parsimony' }]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('Razor of Parsimony')).toBeInTheDocument();
  });

  it('shows the school name under each spell', () => {
    renderWithLang(
      <FavoritesView
        favorites={[{ name: 'Trace Sight', skill: 'log-trace-correlation' }]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('School of Remediation')).toBeInTheDocument();
  });

  it('renders marginalia notes', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{ 'Trace Sight': 'Very useful for prod incidents' }}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('Very useful for prod incidents')).toBeInTheDocument();
  });

  it('handles marginalia from hook object with notes property', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{ notes: { 'Trace Sight': 'My note' } }}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('My note')).toBeInTheDocument();
  });

  it('limits recent spells to 10', () => {
    const manyRecent = Array.from({ length: 15 }, (_, i) => ({ name: `Spell ${i}` }));
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={manyRecent}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('Spell 0')).toBeInTheDocument();
    expect(screen.getByText('Spell 9')).toBeInTheDocument();
    expect(screen.queryByText('Spell 10')).not.toBeInTheDocument();
  });

  it('favorites section uses role="button" for keyboard accessibility', () => {
    renderWithLang(
      <FavoritesView
        favorites={[{ name: 'Trace Sight', skill: 'log-trace-correlation' }]}
        recent={[]}
        marginalia={{}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    const item = screen.getByText('Trace Sight').closest('[role="button"]');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('tabindex', '0');
  });

  it('Enter key triggers onSpellClick on favorite items', () => {
    const onSpellClick = vi.fn();
    renderWithLang(
      <FavoritesView
        favorites={[{ name: 'Trace Sight', skill: 'log-trace-correlation' }]}
        recent={[]}
        marginalia={{}}
        onSpellClick={onSpellClick}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    const item = screen.getByText('Trace Sight').closest('[role="button"]');
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onSpellClick).toHaveBeenCalledTimes(1);
  });

  it('does not crash when marginalia has non-string values', () => {
    renderWithLang(
      <FavoritesView
        favorites={[]}
        recent={[]}
        marginalia={{ 'Trace Sight': 12_345 }}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
      />,
    );
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
  });
});
