import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { LanguageProvider } from '../i18n/LanguageContext';
import ShortcutsModal from '../components/ShortcutsModal.jsx';
import StaleLinkBanner from '../components/StaleLinkBanner.jsx';
import FilterChips from '../components/FilterChips.jsx';
import InstallPrompt from '../components/InstallPrompt.jsx';

const sampleSchools = [
  {
    id: 'debugging',
    real: 'Debugging',
    name: 'School of Remediation',
    symbol: '⚔',
    desc: '',
    spells: [{ name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'x', status: 'Proven' }],
  },
  {
    id: 'reasoning',
    real: 'Reasoning',
    name: 'School of Cognition',
    symbol: '◇',
    desc: '',
    spells: [{ name: 'Razor', skill: 'occams-razor', effect: 'y', status: 'New' }],
  },
];

const renderWithLang = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

describe('a11y', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ShortcutsModal has no axe violations', async () => {
    const { container } = renderWithLang(<ShortcutsModal onClose={() => {}} />);
    const results = await axe(container, {
      rules: { region: { enabled: false } }, // modal itself is not a landmark by default
    });
    expect(results).toHaveNoViolations();
  });

  it('StaleLinkBanner has no axe violations', async () => {
    const { container } = renderWithLang(
      <StaleLinkBanner skill="totally-unknown" onSelect={() => {}} onDismiss={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FilterChips has no axe violations', async () => {
    const noop = () => {};
    const { container } = renderWithLang(
      <FilterChips
        schools={sampleSchools}
        schoolFilter={new Set()}
        tierFilter={new Set()}
        favoritesOnly={false}
        onToggleSchool={noop}
        onToggleTier={noop}
        onToggleFavorites={noop}
        onClear={noop}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FilterChips with active filters has no axe violations', async () => {
    const noop = () => {};
    const { container } = renderWithLang(
      <FilterChips
        schools={sampleSchools}
        schoolFilter={new Set(['debugging'])}
        tierFilter={new Set(['adept'])}
        favoritesOnly
        onToggleSchool={noop}
        onToggleTier={noop}
        onToggleFavorites={noop}
        onClear={noop}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('InstallPrompt (hidden) has no axe violations', async () => {
    const { container } = renderWithLang(<InstallPrompt />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
