import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpellCard from '../components/SpellCard.jsx';
import SchoolSection from '../components/SchoolSection.jsx';
import ScryingOrb from '../components/ScryingOrb.jsx';

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

  it('shows the status tier when status is set', () => {
    const { container } = render(<SpellCard spell={sampleSpell} matched={null} />);
    const tiers = container.querySelectorAll('.spell-tier');
    expect(tiers.length).toBe(1);
    expect(tiers[0].textContent).toBe('✧ Proven');
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
    const { container } = render(<SpellCard spell={noStatus} matched={null} />);
    expect(screen.getByText('common')).toBeInTheDocument();
    expect(container.querySelector('.spell-tier')).toBeNull();
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
