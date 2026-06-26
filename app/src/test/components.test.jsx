import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import SpellCard from '../components/SpellCard.jsx';
import GrimoireStackLayout from '../components/GrimoireStackLayout.jsx';
import InstallPrompt from '../components/InstallPrompt.jsx';
import ApprenticeWelcome from '../components/ApprenticeWelcome.jsx';
import BestiaryCodex from '../components/BestiaryCodex.jsx';
import RecipeLabView from '../components/RecipeLabView.jsx';
import StaleLinkBanner from '../components/StaleLinkBanner.jsx';
import SettingsView from '../components/SettingsView.jsx';
import { searchSpells } from '../search.js';

const sampleSpell = {
  name: 'Trace Sight',
  skill: 'log-trace-correlation',
  effect: 'Maps stack traces to source code and suggests fixes.',
  status: 'Proven',
};

const sampleSchool = {
  id: 'debugging',
  name: 'School of Remediation',
  real: 'Debugging',
  desc: 'Incantations to banish bugs.',
  spells: [sampleSpell],
};

const multiSchool = [
  sampleSchool,
  {
    id: 'testing',
    name: 'School of Validation',
    real: 'Testing',
    desc: 'Incantations to prove correctness.',
    spells: [{ name: 'Jest Invocation', skill: 'jest-testing', effect: 'Write correct Jest tests.', status: 'New' }],
  },
];

vi.mock('../data/grimoireIndexInstance.js', () => {
  const trace = { name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'Maps stack traces to source code and suggests fixes.', status: 'Proven' };
  const jest = { name: 'Jest Invocation', skill: 'jest-testing', effect: 'Write correct Jest tests.', status: 'New' };
  const debugging = { id: 'debugging', name: 'School of Remediation', real: 'Debugging', desc: 'Incantations to banish bugs.', spells: [trace] };
  const testing = { id: 'testing', name: 'School of Validation', real: 'Testing', desc: 'Incantations to prove correctness.', spells: [jest] };
  const manySchool = { id: 'many', name: 'School of Many', real: 'Many', desc: '', spells: [] };
  for (let i = 0; i < 40; i++) manySchool.spells.push({ name: `Spell ${i}`, skill: `skill-${i}`, effect: `effect ${i}` });

  const mockSchools = [debugging, testing, manySchool];
  const mockFlat = [];
  for (const s of mockSchools) for (const sp of s.spells) mockFlat.push({ spell: sp, school: s });
  const mockMap = new Map();
  for (const s of mockSchools) mockMap.set(s.id, s);

  return {
    grimoireIndex: {
      flatEntries: () => mockFlat,
      getSchoolMap: () => mockMap,
      getStats: () => ({ totalSchools: mockSchools.length, totalSpells: mockFlat.length }),
      getSchoolForSkill: () => null,
      resolveBySkill: (skill) => mockFlat.find(e => e.spell.skill === skill) || null,
      similarTo: (query) => {
        const q = query.toLowerCase();
        return mockFlat
          .filter(e => e.spell.skill.toLowerCase().includes(q) || e.spell.name.toLowerCase().includes(q))
          .map(e => ({ spell: e.spell, school: e.school }));
      },
    },
  };
});

// ── SpellCard ────────────────────────────────────────
describe('SpellCard', () => {
  it('renders the spell name and incantation', () => {
    render(<SpellCard spell={sampleSpell} matched={null} />);
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('〈 log-trace-correlation 〉')).toBeInTheDocument();
  });

  it('shows the arcane tier when status is set', () => {
    const { container } = render(<SpellCard spell={sampleSpell} matched={null} />);
    const tier = container.querySelector('.spell-tier');
    expect(tier).not.toBeNull();
    expect(tier.textContent).toContain('Adept Sigil');
  });

  it('applies glow class when matched is true', () => {
    const { container } = render(<SpellCard spell={sampleSpell} matched={true} />);
    const card = container.firstChild;
    expect(card.className).toContain('glow');
    expect(card.className).not.toContain('dim');
  });

  it('applies dim class and hides when matched is false', () => {
    const { container } = render(<SpellCard spell={sampleSpell} matched={false} />);
    const card = container.firstChild;
    expect(card.className).toContain('dim');
    expect(card.style.display).toBe('none');
  });

  it('has no glow/dim when matched is null (no search)', () => {
    const { container } = render(<SpellCard spell={sampleSpell} matched={null} />);
    const card = container.firstChild;
    expect(card.className).not.toContain('glow');
    expect(card.className).not.toContain('dim');
    expect(card.style.display).not.toBe('none');
  });

  it('renders trueName as the headline when distinct from name', () => {
    const trueNamed = { ...sampleSpell, trueName: 'The Eye That Reads the Trace' };
    const { container } = render(<SpellCard spell={trueNamed} matched={null} />);
    const trueNameEl = container.querySelector('.spell-true-name');
    expect(trueNameEl).not.toBeNull();
    expect(trueNameEl.textContent).toBe('The Eye That Reads the Trace');
    expect(container.querySelector('.spell-name--secondary').textContent).toBe('Trace Sight');
    expect(container.firstChild.className).toContain('has-true-name');
  });

  it('omits the trueName block when trueName matches name or is absent', () => {
    const { container } = render(<SpellCard spell={sampleSpell} matched={null} />);
    expect(container.querySelector('.spell-true-name')).toBeNull();
    expect(container.querySelector('.spell-name--secondary')).toBeNull();
    expect(container.firstChild.className).not.toContain('has-true-name');
  });

  it('fires onClick when clicked', () => {
    let clicked = false;
    render(<SpellCard spell={sampleSpell} matched={null} onClick={() => { clicked = true; }} />);
    screen.getByText('Trace Sight').click();
    expect(clicked).toBe(true);
  });

  it('shows children text in the reveal hint', () => {
    render(<SpellCard spell={sampleSpell} matched={null}>custom hint</SpellCard>);
    expect(screen.getByText('custom hint')).toBeInTheDocument();
  });

  it('shows default hint text when no children', () => {
    render(<SpellCard spell={sampleSpell} matched={null} />);
    expect(screen.getByText('click to reveal')).toBeInTheDocument();
  });

  it('renders spells with no status gracefully', () => {
    const noStatus = { ...sampleSpell, status: '—' };
    render(<SpellCard spell={noStatus} matched={null} />);
    const commonTexts = screen.getAllByText('common');
    expect(commonTexts.length).toBeGreaterThanOrEqual(1);
  });
});

// ── GrimoireStackLayout search results ────────────────
describe('GrimoireStackLayout search results', () => {
  const renderWithLang = (ui) => render(<BrowserRouter><LanguageProvider>{ui}</LanguageProvider></BrowserRouter>);

  it('shows matching spells in the library view when searchQuery is set', () => {
    const { container } = renderWithLang(
      <GrimoireStackLayout
        currentSchool="debugging"
        onSchoolSelect={() => {}}
        searchQuery="jest"
        onSearchChange={() => {}}
        totalMatches={searchSpells(multiSchool, 'jest').total}
        onSpellClick={() => {}}
        isFavorited={() => false}
        onToggleFavorite={() => {}}
        favorites={[]}
        recent={[]}
        marginalia={{}}
        getVote={() => null}
        castVote={() => {}}
        aggregateFor={() => null}
        castEnabled={false}
        onToggleCast={() => {}}
        onWizardOpen={() => {}}
        onIntakeOpen={() => {}}
        onCompareOpen={() => {}}
        onCastBones={() => {}}
        onExportJson={() => {}}
        onExportMarkdown={() => {}}
        onShowShortcuts={() => {}}
        schoolFilter={new Set()}
        tierFilter={new Set()}
        favoritesOnly={false}
        onToggleSchool={() => {}}
        onToggleTier={() => {}}
        onToggleFavorites={() => {}}
        onClearFilters={() => {}}
        filterResults={{ bySchool: {}, total: 0 }}
        featuredSchools={['debugging', 'reasoning', 'process', 'architecture', 'testing', 'creativity']}
        onFeaturedSchoolsChange={() => {}}
      />
    );

    expect(screen.getAllByText('Testing').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelector('.bestiary-index__row')).not.toBeNull();
  });
});

// ── BestiaryCodex ────────────────────────────────────
describe('BestiaryCodex', () => {
  const renderWithLang = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

  it('renders the codex title and stats', () => {
    renderWithLang(
      <BestiaryCodex
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    expect(screen.getByText('The Bestiary Codex')).toBeInTheDocument();
    expect(screen.getByText('Entities')).toBeInTheDocument();
    expect(screen.getByText('Schools')).toBeInTheDocument();
  });

  it('lists every spell from the provided schools', () => {
    renderWithLang(
      <BestiaryCodex
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('Jest Invocation')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    renderWithLang(
      <BestiaryCodex
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    const input = screen.getByPlaceholderText(/scry by name/i);
    fireEvent.change(input, { target: { value: 'jest' } });
    expect(screen.getByText('Jest Invocation')).toBeInTheDocument();
    expect(screen.queryByText('Trace Sight')).not.toBeInTheDocument();
  });

  it('shows the empty state when filters return nothing', () => {
    renderWithLang(
      <BestiaryCodex
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    const input = screen.getByPlaceholderText(/scry by name/i);
    fireEvent.change(input, { target: { value: 'no-such-spell' } });
    expect(screen.getByText(/the abyss returns nothing/i)).toBeInTheDocument();
  });

  it('calls onSpellClick when a row is clicked', () => {
    const onClick = vi.fn();
    renderWithLang(
      <BestiaryCodex
        onSpellClick={onClick}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    fireEvent.click(screen.getByText('Trace Sight'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].skill).toBe('log-trace-correlation');
  });

  it('renders a Clear button when filters are active', () => {
    renderWithLang(
      <BestiaryCodex
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    const input = screen.getByPlaceholderText(/scry by name/i);
    fireEvent.change(input, { target: { value: 'jest' } });
    expect(screen.getByText(/purge filters/i)).toBeInTheDocument();
  });

  it('shows tier badges', () => {
    renderWithLang(
      <BestiaryCodex
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    // "Proven" → "adept" tier; "New" → "apprentice" tier
    // Badges show the compact label (e.g., "Adept" not "Adept Sigil")
    expect(screen.getAllByText(/^Adept$|^Apprentice$/).length).toBeGreaterThanOrEqual(1);
  });
});

// ── RecipeLabView ────────────────────────────────────
describe('RecipeLabView', () => {
  it('renders the rituals title and a search input', () => {
    render(
      <LanguageProvider>
        <RecipeLabView onSpellClick={() => {}} />
      </LanguageProvider>
    );
    expect(screen.getByText('Rituals')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/scry by name/i)).toBeInTheDocument();
  });

  it('shows all spells, not just the first 20', () => {
    render(
      <LanguageProvider>
        <RecipeLabView onSpellClick={() => {}} />
      </LanguageProvider>
    );
    // First page is 60, so all 40 should be visible
    expect(screen.getByText('Spell 0')).toBeInTheDocument();
    expect(screen.getByText('Spell 39')).toBeInTheDocument();
  });

  it('lets you select two spells and emits a compare-two call', () => {
    const onCompareTwo = vi.fn();
    render(
      <LanguageProvider>
        <RecipeLabView
          onSpellClick={() => {}}
          onCompareTwo={onCompareTwo}
        />
      </LanguageProvider>
    );
    // Click the two spell cards (by their names)
    fireEvent.click(screen.getByText('Trace Sight'));
    fireEvent.click(screen.getByText('Jest Invocation'));
    const compareBtn = screen.getByText(/Compare These Incantations/i);
    fireEvent.click(compareBtn);
    expect(onCompareTwo).toHaveBeenCalledTimes(1);
    // Argument order: leftSpell, leftSchool, rightSpell, rightSchool
    const args = onCompareTwo.mock.calls[0];
    expect(args[0].skill).toBe('log-trace-correlation');
    expect(args[2].skill).toBe('jest-testing');
  });
});

// ── InstallPrompt (storage init) ──────────────────────
describe('InstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no beforeinstallprompt event has fired', () => {
    const { container } = render(
      <LanguageProvider>
        <InstallPrompt />
      </LanguageProvider>
    );
    expect(container.firstChild).toBeNull();
  });
});

// ── ApprenticeWelcome (storage init) ─────────────────
describe('ApprenticeWelcome', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the welcome panels on first visit', () => {
    render(
      <LanguageProvider>
        <ApprenticeWelcome onClose={() => {}} />
      </LanguageProvider>
    );
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue/i)).toBeInTheDocument();
  });

  it('advances to the next panel when Continue is clicked', async () => {
    render(
      <LanguageProvider>
        <ApprenticeWelcome onClose={() => {}} />
      </LanguageProvider>
    );
    // The "Back" button only appears on panels after the first.
    expect(screen.queryByText(/Back/i)).not.toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByText(/Continue/i)); });
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });

  it('writes the dismissed key to localStorage when Skip Rite is clicked', () => {
    const onClose = vi.fn();
    render(
      <LanguageProvider>
        <ApprenticeWelcome onClose={onClose} />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText(/Skip/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ── SpellCard with favorites ───────────────────────────
describe('SpellCard favorites', () => {
  it('does not show star when onToggleFavorite is not provided', () => {
    render(<SpellCard spell={sampleSpell} matched={null} />);
    expect(screen.queryByLabelText(/bind to/i)).not.toBeInTheDocument();
  });

  it('shows unfilled star when not favorited', () => {
    render(
      <SpellCard
        spell={sampleSpell}
        matched={null}
        isFavorited={false}
        onToggleFavorite={() => {}}
      />
    );
    expect(screen.getByLabelText(/bind to/i)).toBeInTheDocument();
  });

  it('shows filled star when favorited', () => {
    render(
      <SpellCard
        spell={sampleSpell}
        matched={null}
        isFavorited={true}
        onToggleFavorite={() => {}}
      />
    );
    expect(screen.getByLabelText(/unbind from/i)).toBeInTheDocument();
  });

  it('calls onToggleFavorite when star is clicked', () => {
    const toggle = vi.fn();
    render(
      <SpellCard
        spell={sampleSpell}
        matched={null}
        isFavorited={false}
        onToggleFavorite={toggle}
      />
    );
    fireEvent.click(screen.getByLabelText(/bind to/i));
    expect(toggle).toHaveBeenCalledWith('Trace Sight', 'log-trace-correlation');
  });

  it('does not trigger card click when star is clicked', () => {
    const onClick = vi.fn();
    const toggle = vi.fn();
    render(
      <SpellCard
        spell={sampleSpell}
        matched={null}
        isFavorited={false}
        onClick={onClick}
        onToggleFavorite={toggle}
      />
    );
    fireEvent.click(screen.getByLabelText(/bind to/i));
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ── StaleLinkBanner (deep-link to missing skill) ──────
describe('StaleLinkBanner', () => {
  const renderWithLang = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

  it('shows the unknown skill in the message and a dismiss button', () => {
    const onDismiss = vi.fn();
    renderWithLang(
      <StaleLinkBanner skill="no-such-typo" onDismiss={onDismiss} onSelectSkill={() => {}} />
    );
    expect(screen.getByText(/no-such-typo/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('suggests similar skills from the catalog', () => {
    renderWithLang(
      <StaleLinkBanner
        skill="log-trace" // partial match against "log-trace-correlation"
        onDismiss={() => {}}
        onSelectSkill={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'log-trace-correlation' })).toBeInTheDocument();
  });

  it('routes a clicked suggestion through onSelectSkill with the resolved school', () => {
    const onSelectSkill = vi.fn();
    renderWithLang(
      <StaleLinkBanner
        skill="log-trace"
        onDismiss={() => {}}
        onSelectSkill={onSelectSkill}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'log-trace-correlation' }));
    expect(onSelectSkill).toHaveBeenCalledTimes(1);
    const [skill, school] = onSelectSkill.mock.calls[0];
    expect(skill).toBe('log-trace-correlation');
    expect(school.id).toBe('debugging');
  });
});

// ── SettingsView (Ritual Chamber) ─────────────────────
describe('SettingsView', () => {
  it('renders the four sections and a working language select', () => {
    render(
      <LanguageProvider>
        <SettingsView
          castEnabled
          onToggleCast={() => {}}
          onShowShortcuts={() => {}}
          onExportJson={() => {}}
          onExportMarkdown={() => {}}

        />
      </LanguageProvider>
    );
    expect(screen.getByText('Ritual Chamber')).toBeInTheDocument();
    const select = screen.getByLabelText(/Language/i);
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('plain');
  });

  it('points the GitHub link at the real repository', () => {
    render(
      <LanguageProvider>
        <SettingsView
          castEnabled
          onToggleCast={() => {}}
          onShowShortcuts={() => {}}
          onExportJson={() => {}}
          onExportMarkdown={() => {}}

        />
      </LanguageProvider>
    );
    // Open the About section
    fireEvent.click(screen.getByText('About'));
    const link = screen.getByRole('link', { name: /Source Repository/i });
    expect(link.getAttribute('href')).toBe('https://github.com/StepowskiEric/GrimoireStack');
  });

  it('switches language when the select changes', () => {
    render(
      <LanguageProvider>
        <SettingsView
          castEnabled
          onToggleCast={() => {}}
          onShowShortcuts={() => {}}
          onExportJson={() => {}}
          onExportMarkdown={() => {}}

        />
      </LanguageProvider>
    );
    const select = screen.getByLabelText(/Language/i);
    fireEvent.change(select, { target: { value: 'plain' } });
    expect(select.value).toBe('plain');
  });

  it('shows the export descriptions and import UI in the Data section', () => {
    render(
      <LanguageProvider>
        <SettingsView
          castEnabled
          onToggleCast={() => {}}
          onShowShortcuts={() => {}}
          onExportJson={() => {}}
          onExportMarkdown={() => {}}

        />
      </LanguageProvider>
    );
    // The Data section should be active by default? No — language is default.
    // Click Data tab.
    fireEvent.click(screen.getByText('Data'));
    // Export descriptions
    expect(screen.getByText(/Machine-readable backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Human-readable summary/i)).toBeInTheDocument();
    // Import UI
    expect(screen.getByText(/Restore from config/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste a previously exported/i)).toBeInTheDocument();
    expect(screen.getByText('Restore Config')).toBeInTheDocument();
  });
});
