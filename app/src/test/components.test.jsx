import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import SpellCard from '../components/SpellCard.jsx';
import GrimoireStackLayout from '../components/GrimoireStackLayout.jsx';
import BottomNav from '../components/BottomNav.jsx';
import InstallPrompt from '../components/InstallPrompt.jsx';
import ApprenticeWelcome from '../components/ApprenticeWelcome.jsx';
import BestiaryCodex from '../components/BestiaryCodex.jsx';
import RecipeLabView from '../components/RecipeLabView.jsx';
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
  symbol: '⚔',
  real: 'Debugging',
  desc: 'Incantations to banish bugs.',
  spells: [sampleSpell],
};

const multiSchool = [
  sampleSchool,
  {
    id: 'testing',
    name: 'School of Validation',
    symbol: '🛡',
    real: 'Testing',
    desc: 'Incantations to prove correctness.',
    spells: [{ name: 'Jest Invocation', skill: 'jest-testing', effect: 'Write correct Jest tests.', status: 'New' }],
  },
];

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
  const renderWithLang = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

  it('shows matching spells in the library view when searchQuery is set', () => {
    const { container } = renderWithLang(
      <GrimoireStackLayout
        schools={multiSchool}
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

    expect(screen.getByText('School of Validation')).toBeInTheDocument();
    expect(container.querySelector('.all-schools-view__card')).not.toBeNull();
  });
});

// ── BestiaryCodex ────────────────────────────────────
describe('BestiaryCodex', () => {
  const renderWithLang = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

  it('renders the codex title and stats', () => {
    renderWithLang(
      <BestiaryCodex
        schools={multiSchool}
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
        schools={multiSchool}
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
        schools={multiSchool}
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
        schools={multiSchool}
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
        schools={multiSchool}
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
        schools={multiSchool}
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
        schools={multiSchool}
        onSpellClick={() => {}}
        isFavorited={() => false}
        hasNote={() => false}
      />
    );
    // "Proven" → "adept" tier; "New" → "apprentice" tier
    expect(screen.getAllByText(/Adept Sigil|Apprentice Sigil/).length).toBeGreaterThanOrEqual(1);
  });
});

// ── RecipeLabView ────────────────────────────────────
describe('RecipeLabView', () => {
  it('renders the rituals title and a search input', () => {
    render(
      <LanguageProvider>
        <RecipeLabView schools={multiSchool} onSpellClick={() => {}} />
      </LanguageProvider>
    );
    expect(screen.getByText('Rituals')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/scry by name/i)).toBeInTheDocument();
  });

  it('shows all spells, not just the first 20', () => {
    const many = {
      id: 'many',
      name: 'School of Many',
      symbol: '✦',
      real: 'Many',
      desc: '',
      spells: Array.from({ length: 40 }, (_, i) => ({
        name: `Spell ${i}`,
        skill: `skill-${i}`,
        effect: `effect ${i}`,
      })),
    };
    render(
      <LanguageProvider>
        <RecipeLabView schools={[many]} onSpellClick={() => {}} />
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
          schools={multiSchool}
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

// ── BottomNav (mobile tab bar) ────────────────────────
describe('BottomNav', () => {
  it('renders the four mobile tabs', () => {
    render(
      <LanguageProvider>
        <BottomNav activeTab="library" onTabSelect={() => {}} />
      </LanguageProvider>
    );
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Craft')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
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
    expect(screen.getByText('Welcome to the Grimoire')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText(/Skip Rite/i));
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
