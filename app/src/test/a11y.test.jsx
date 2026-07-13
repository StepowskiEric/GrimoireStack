import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import InstallPrompt from '../components/InstallPrompt.tsx';
import LibraryContent from '../components/LibraryContent.tsx';
import ShortcutsModal from '../components/ShortcutsModal.tsx';
import StaleLinkBanner from '../components/StaleLinkBanner.tsx';
import { LanguageProvider } from '../i18n/LanguageContext';

const sampleSchools = [
  {
    id: 'debugging',
    real: 'Debugging',
    name: 'School of Remediation',
    desc: '',
    spells: [
      { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'x', status: 'Proven' },
    ],
  },
  {
    id: 'reasoning',
    real: 'Reasoning',
    name: 'School of Cognition',
    desc: '',
    spells: [{ name: 'Razor', skill: 'occams-razor', effect: 'y', status: 'New' }],
  },
];

vi.mock('../data/grimoireIndexInstance.ts', () => {
  const trace = {
    name: 'Trace Sight',
    skill: 'log-trace-correlation',
    effect: 'x',
    status: 'Proven',
  };
  const razor = { name: 'Razor', skill: 'occams-razor', effect: 'y', status: 'New' };
  const debugging = {
    id: 'debugging',
    real: 'Debugging',
    name: 'School of Remediation',
    desc: '',
    spells: [trace],
  };
  const reasoning = {
    id: 'reasoning',
    real: 'Reasoning',
    name: 'School of Cognition',
    desc: '',
    spells: [razor],
  };
  const mockSchools = [debugging, reasoning];
  const mockFlat = [];
  for (const s of mockSchools) for (const sp of s.spells) mockFlat.push({ spell: sp, school: s });
  const mockMap = new Map();
  for (const s of mockSchools) mockMap.set(s.id, s);

  return {
    grimoireIndex: {
      flatEntries: () => mockFlat,
      getSchoolMap: () => mockMap,
      getStats: () => ({ totalSchools: mockSchools.length, totalSpells: mockFlat.length }),
      similarTo: () => [],
    },
  };
});

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

  it('LibraryContent (idle) has no axe violations', async () => {
    const { container } = renderWithLang(
      <LibraryContent
        featuredSchools={['debugging', 'reasoning']}
        onFeaturedSchoolsChange={() => {}}
        onSchoolSelect={() => {}}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
        marginalia={{}}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('InstallPrompt (hidden) has no axe violations', async () => {
    const { container } = renderWithLang(<InstallPrompt />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('StaleLinkBanner has no axe violations', async () => {
    const { container } = renderWithLang(
      <StaleLinkBanner skill="no-such-typo" onDismiss={() => {}} onSelectSkill={() => {}} />,
    );
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
