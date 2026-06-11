import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import SpellCard from '../components/SpellCard.jsx';
import SchoolSection from '../components/SchoolSection.jsx';
import ScryingOrb from '../components/ScryingOrb.jsx';
import LibrariansLedger from '../components/LibrariansLedger.jsx';
import LegendOfSigils from '../components/LegendOfSigils.jsx';
import ApprenticeMarginalia from '../components/ApprenticeMarginalia.jsx';
import WhispersFromTheVoid from '../components/WhispersFromTheVoid.jsx';
import Observatory from '../components/Observatory.jsx';
import SummoningCircle from '../components/SummoningCircle.jsx';
import TomeOfAilments from '../components/TomeOfAilments.jsx';
import RecipeLabExplainer from '../components/RecipeLabExplainer.jsx';
import RecipeLab from '../components/RecipeLab.jsx';

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

// ── SchoolSection ─────────────────────────────────────
describe('SchoolSection', () => {
  it('renders the school name and count', () => {
    render(<SchoolSection school={sampleSchool} isActive={true} onSpellClick={() => {}} />);
    expect(screen.getByText('School of Remediation')).toBeInTheDocument();
    expect(screen.getByText('1 incantation')).toBeInTheDocument();
  });

  it('renders active class when isActive is true', () => {
    const { container } = render(<SchoolSection school={sampleSchool} isActive={true} onSpellClick={() => {}} />);
    const section = container.firstChild;
    expect(section.className).toContain('active');
  });

  it('renders spell cards inside', () => {
    render(<SchoolSection school={sampleSchool} isActive={true} onSpellClick={() => {}} />);
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
  });

  it('shows no-spells message when search has no match', () => {
    render(<SchoolSection school={sampleSchool} isActive={false} searchQuery="zzznone" onSpellClick={() => {}} />);
    expect(screen.getByText('The orb sees nothing matching your affliction…')).toBeInTheDocument();
  });

  it('does not show no-spells when search matches', () => {
    render(<SchoolSection school={sampleSchool} isActive={false} searchQuery="Trace" onSpellClick={() => {}} />);
    expect(screen.queryByText('The orb sees nothing matching your affliction…')).not.toBeInTheDocument();
  });

  it('pluralizes count correctly', () => {
    const multi = { ...sampleSchool, spells: [sampleSpell, { ...sampleSpell, name: 'Bisect' }] };
    render(<SchoolSection school={multi} isActive={true} onSpellClick={() => {}} />);
    expect(screen.getByText('2 incantations')).toBeInTheDocument();
  });
});

// ── ScryingOrb ─────────────────────────────────────────
describe('ScryingOrb', () => {
  it('renders the search input', () => {
    render(<ScryingOrb searchQuery="" onSearchChange={() => {}} totalMatches={0} />);
    expect(screen.getByPlaceholderText(/search for a skill/i)).toBeInTheDocument();
  });

  it('shows match count when totalMatches > 0', () => {
    render(<ScryingOrb searchQuery="test" onSearchChange={() => {}} totalMatches={3} />);
    expect(screen.getByText('3 incantations found')).toBeInTheDocument();
  });

  it('shows singular for one match', () => {
    render(<ScryingOrb searchQuery="test" onSearchChange={() => {}} totalMatches={1} />);
    expect(screen.getByText('1 incantation found')).toBeInTheDocument();
  });

  it('shows "none found" when no matches', () => {
    render(<ScryingOrb searchQuery="test" onSearchChange={() => {}} totalMatches={0} />);
    expect(screen.getByText('none found')).toBeInTheDocument();
  });

  it('hides result text when query is empty', () => {
    render(<ScryingOrb searchQuery="" onSearchChange={() => {}} totalMatches={0} />);
    expect(screen.queryByText('found')).not.toBeInTheDocument();
    expect(screen.queryByText('none found')).not.toBeInTheDocument();
  });

  it('applies scrying class to orb vessel when searching', () => {
    const { container } = render(<ScryingOrb searchQuery="test" onSearchChange={() => {}} totalMatches={0} />);
    expect(container.querySelector('.orb-vessel')?.className).toContain('scrying');
  });

  it('does not apply scrying class when idle', () => {
    const { container } = render(<ScryingOrb searchQuery="" onSearchChange={() => {}} totalMatches={0} />);
    expect(container.querySelector('.orb-vessel')?.className).not.toContain('scrying');
  });

  it('renders example search chips', () => {
    render(<ScryingOrb searchQuery="" onSearchChange={() => {}} totalMatches={0} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});

describe('LibrariansLedger', () => {
  it('renders ledger entries', () => {
    render(<LibrariansLedger schools={[sampleSchool]} />);
    expect(screen.getByText('Schools of Magic')).toBeInTheDocument();
    expect(screen.getByText('Total Incantations')).toBeInTheDocument();
    expect(screen.getByText('Proven Spells')).toBeInTheDocument();
    expect(screen.getByText('With Synergies')).toBeInTheDocument();
  });

  it('shows correct counts for multiple schools', () => {
    const multiSchool = { ...sampleSchool, spells: [sampleSpell, { ...sampleSpell, name: 'Bisect', skill: 'bisect' }] };
    render(<LibrariansLedger schools={[sampleSchool, multiSchool]} />);
    // 2 schools, 3 total spells, 2 proven
    expect(screen.getByText('Schools of Magic')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows combos count when spells have synergies', () => {
    const withCombos = { ...sampleSchool, spells: [{ ...sampleSpell, combos: ['Bisect Divination'] }] };
    render(<LibrariansLedger schools={[withCombos]} />);
    expect(screen.getByText('With Synergies')).toBeInTheDocument();
    // The combo count "1" appears along with other "1" values; verify by checking parent context
    const combosLabel = screen.getByText('With Synergies');
    const combosEntry = combosLabel.closest('.ledger-entry');
    expect(combosEntry.textContent).toContain('1');
  });
});

describe('LegendOfSigils', () => {
  it('renders the legend toggle button', () => {
    render(<LegendOfSigils />);
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });

  it('opens the legend modal when clicked', () => {
    render(<LegendOfSigils />);
    fireEvent.click(screen.getByText('Legend'));
    expect(screen.getByText('⟐ Legend of Sigils')).toBeInTheDocument();
  });

  it('shows tier information in the modal', () => {
    render(<LegendOfSigils />);
    fireEvent.click(screen.getByText('Legend'));
    expect(screen.getByText('Faded Glyph')).toBeInTheDocument();
    expect(screen.getByText('Apprentice Sigil')).toBeInTheDocument();
    expect(screen.getByText('Archmage Sigil')).toBeInTheDocument();
  });

  it('closes the legend modal', () => {
    render(<LegendOfSigils />);
    fireEvent.click(screen.getByText('Legend'));
    fireEvent.click(screen.getByLabelText('Close legend'));
    expect(screen.queryByText('⟐ Legend of Sigils')).not.toBeInTheDocument();
  });
});

describe('ApprenticeMarginalia', () => {
  it('renders collapsed trigger', () => {
    render(<ApprenticeMarginalia />);
    expect(screen.getByText(/What is a skill/i)).toBeInTheDocument();
  });

  it('expands when clicked', () => {
    render(<ApprenticeMarginalia />);
    fireEvent.click(screen.getByText(/What is a skill/i));
    expect(screen.getByText(/agent skill/i)).toBeInTheDocument();
    expect(screen.getByText(/cookbook for AI behavior/i)).toBeInTheDocument();
  });

  it('collapses when clicked again', () => {
    render(<ApprenticeMarginalia />);
    fireEvent.click(screen.getByText(/What is a skill/i));
    fireEvent.click(screen.getByText(/click to fold/i));
    expect(screen.queryByText(/agent skill/i)).not.toBeInTheDocument();
  });
});

describe('WhispersFromTheVoid', () => {
  it('does not render when there are matches', () => {
    render(<WhispersFromTheVoid searchQuery="test" totalMatches={3} onWizardOpen={() => {}} />);
    expect(screen.queryByText(/The orb grows dark/i)).not.toBeInTheDocument();
  });

  it('does not render when query is empty', () => {
    render(<WhispersFromTheVoid searchQuery="" totalMatches={0} onWizardOpen={() => {}} />);
    expect(screen.queryByText(/The orb grows dark/i)).not.toBeInTheDocument();
  });

  it('renders when search has no matches', () => {
    render(<WhispersFromTheVoid searchQuery="zzznone" totalMatches={0} onWizardOpen={() => {}} />);
    expect(screen.getByText(/The orb grows dark/i)).toBeInTheDocument();
    expect(screen.getByText(/zzznone/)).toBeInTheDocument();
  });

  it('calls onWizardOpen when the button is clicked', () => {
    const onWizardOpen = vi.fn();
    render(<WhispersFromTheVoid searchQuery="zzznone" totalMatches={0} onWizardOpen={onWizardOpen} />);
    fireEvent.click(screen.getByText(/Consult the Witch Doctor/i));
    expect(onWizardOpen).toHaveBeenCalledTimes(1);
  });
});

describe('Observatory', () => {
  it('renders newly added spells', () => {
    const schoolWithNew = {
      ...sampleSchool,
      spells: [{ ...sampleSpell, status: 'New' }],
    };
    render(<Observatory schools={[schoolWithNew]} />);
    expect(screen.getByText('The Observatory')).toBeInTheDocument();
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
  });

  it('shows school symbol and name for each new spell', () => {
    const schoolWithNew = {
      ...sampleSchool,
      spells: [{ ...sampleSpell, status: 'New' }],
    };
    render(<Observatory schools={[schoolWithNew]} />);
    expect(screen.getByText('⚔')).toBeInTheDocument();
    expect(screen.getByText('School of Remediation')).toBeInTheDocument();
  });

  it('does not render when there are no new spells', () => {
    const schoolNoNew = {
      ...sampleSchool,
      spells: [{ ...sampleSpell, status: 'Proven' }],
    };
    const { container } = render(<Observatory schools={[schoolNoNew]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SummoningCircle', () => {
  it('renders the toggle button with count', () => {
    render(<SummoningCircle schools={[sampleSchool]} onSpellClick={() => {}} favorites={[]} onToggleFavorite={() => {}} />);
    expect(screen.getByLabelText('Open Summoning Circle')).toBeInTheDocument();
  });

  it('opens panel when toggle is clicked', () => {
    render(<SummoningCircle schools={[sampleSchool]} onSpellClick={() => {}} favorites={[]} onToggleFavorite={() => {}} />);
    fireEvent.click(screen.getByLabelText('Open Summoning Circle'));
    expect(screen.getByText('The Summoning Circle')).toBeInTheDocument();
    expect(screen.getByText('The circle is silent…')).toBeInTheDocument();
  });

  it('closes panel when close button is clicked', () => {
    render(<SummoningCircle schools={[sampleSchool]} onSpellClick={() => {}} favorites={[]} onToggleFavorite={() => {}} />);
    fireEvent.click(screen.getByLabelText('Open Summoning Circle'));
    fireEvent.click(screen.getByLabelText('Close circle'));
    expect(screen.queryByText('The Summoning Circle')).not.toBeInTheDocument();
  });
});

describe('TomeOfAilments', () => {
  it('renders the tome modal', () => {
    render(<TomeOfAilments schools={[sampleSchool]} onSelectSkill={() => {}} onClose={() => {}} />);
    expect(screen.getByText('⟐ Tome of Common Ailments')).toBeInTheDocument();
    expect(screen.getByText('Fix it')).toBeInTheDocument();
  });

  it('shows situation details after selecting a category', () => {
    render(<TomeOfAilments schools={[sampleSchool]} onSelectSkill={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Fix it'));
    // After clicking "Fix it", the bug category situations should appear
    expect(screen.getByText('Stack trace or error log')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<TomeOfAilments schools={[sampleSchool]} onSelectSkill={() => {}} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close tome'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('RecipeLabExplainer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when not visible', () => {
    render(<RecipeLabExplainer visible={false} onDismiss={() => {}} />);
    expect(screen.queryByText(/The Alchemist's Note/i)).not.toBeInTheDocument();
  });

  it('shows the explainer when visible and not dismissed', () => {
    render(<RecipeLabExplainer visible={true} onDismiss={() => {}} />);
    expect(screen.queryByText(/The Alchemist's Note/i)).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(/The Alchemist's Note/i)).toBeInTheDocument();
    expect(screen.getByText(/brew custom rituals/i)).toBeInTheDocument();
  });

  it('dismisses and stores state in localStorage', () => {
    render(<RecipeLabExplainer visible={true} onDismiss={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.click(screen.getByText(/Understood/i));
    expect(screen.queryByText(/The Alchemist's Note/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('grimoire-lab-explained')).toBe('true');
  });

  it('does not show again after being dismissed', () => {
    localStorage.setItem('grimoire-lab-explained', 'true');
    render(<RecipeLabExplainer visible={true} onDismiss={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByText(/The Alchemist's Note/i)).not.toBeInTheDocument();
  });
});

// ── SpellCard with favorites ───────────────────────────
describe('SpellCard favorites', () => {
  it('does not show star when onToggleFavorite is not provided', () => {
    render(<SpellCard spell={sampleSpell} matched={null} />);
    expect(screen.queryByLabelText('Bind to Summoning Circle')).not.toBeInTheDocument();
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
    expect(screen.getByLabelText('Bind to Summoning Circle')).toBeInTheDocument();
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
    expect(screen.getByLabelText('Unbind from Summoning Circle')).toBeInTheDocument();
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
    fireEvent.click(screen.getByLabelText('Bind to Summoning Circle'));
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
    fireEvent.click(screen.getByLabelText('Bind to Summoning Circle'));
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('RecipeLab', () => {
  const renderWithLang = (ui, lang = 'grimoire') => render(<LanguageProvider>{ui}</LanguageProvider>);

  it('renders the recipe lab title', () => {
    renderWithLang(<RecipeLab schools={[sampleSchool]} />);
    expect(screen.getByText('⚗ Recipe Lab')).toBeInTheDocument();
  });

  it('renders the default copy for the current language', () => {
    renderWithLang(<RecipeLab schools={[sampleSchool]} />);
    expect(screen.getByText('Select 2–5 incantations below and brew a custom ritual')).toBeInTheDocument();
  });
});
