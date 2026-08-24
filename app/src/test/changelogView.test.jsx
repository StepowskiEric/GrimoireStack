import { render, screen } from '@testing-library/react';
import ChangelogView from '../components/ChangelogView.tsx';

// Mock the spellMetadata module
const mockRecentlyUpdated = [
  {
    skill: 'debug-issue',
    name: 'Trace Sight',
    spell: { name: 'Trace Sight', skill: 'debug-issue', effect: 'Maps stack traces.' },
    school: { id: 'debugging', real: 'Debugging', name: 'School of Remediation' },
    lastUpdated: '2026-06-10',
    isExplicit: true,
    note: 'Polished effect description.',
  },
  {
    skill: 'debug-to-fix-pipeline',
    name: 'Bisect Divination',
    spell: { name: 'Bisect Divination', skill: 'debug-to-fix-pipeline', effect: 'Binary searches.' },
    school: { id: 'debugging', real: 'Debugging', name: 'School of Remediation' },
    lastUpdated: '2026-06-05',
    isExplicit: true,
    note: null,
  },
  {
    skill: 'occams-razor',
    name: 'Razor of Parsimony',
    spell: { name: 'Razor of Parsimony', skill: 'occams-razor', effect: 'Favors simplest.' },
    school: { id: 'reasoning', real: 'Reasoning', name: 'School of Cognition' },
    lastUpdated: '2026-05-21',
    isExplicit: true,
    note: null,
  },
];

vi.mock('../data/changeFeed.ts', () => ({
  getRecentlyUpdated: (limit) =>
    mockRecentlyUpdated.slice(0, limit || mockRecentlyUpdated.length > 0),
  getSpellLastUpdated: (skill) => {
    const item = mockRecentlyUpdated.find((i) => i.skill === skill);
    return item ? item.lastUpdated : null;
  },
  getSpellNote: (skill) => {
    const item = mockRecentlyUpdated.find((i) => i.skill === skill);
    return item ? item.note : null;
  },
}));

describe('ChangelogView', () => {
  it('renders without crashing', () => {
    render(<ChangelogView />);
    expect(screen.getByText('Changelog')).toBeInTheDocument();
  });

  it('displays recent updates', () => {
    render(<ChangelogView />);
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('Bisect Divination')).toBeInTheDocument();
    expect(screen.getByText('Razor of Parsimony')).toBeInTheDocument();
  });

  it('displays dates', () => {
    render(<ChangelogView />);
    expect(screen.getByText('2026-06-10')).toBeInTheDocument();
    expect(screen.getByText('2026-06-05')).toBeInTheDocument();
    expect(screen.getByText('2026-05-21')).toBeInTheDocument();
  });

  it('displays notes when available', () => {
    render(<ChangelogView />);
    expect(screen.getByText('Polished effect description.')).toBeInTheDocument();
  });

  it('has search input', () => {
    render(<ChangelogView />);
    expect(screen.getByPlaceholderText('Search changelog...')).toBeInTheDocument();
  });

  it('has filter controls', () => {
    render(<ChangelogView />);
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
  });
});
