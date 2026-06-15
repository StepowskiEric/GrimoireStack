import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import CommuneView from '../components/CommuneView.jsx';
import { SEANCE_QUESTIONS } from '../data/consultationData.js';

// Stub the audio module so the dynamic import inside CommuneView's
// effect does not actually try to schedule audio during tests.
vi.mock('../audio/sounds.js', () => ({
  startWhispers: vi.fn(),
  setAudioEnabled: vi.fn(),
}));

function renderCommune(props = {}) {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <CommuneView audioEnabled={false} {...props} />
      </LanguageProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CommuneView — sigil stage', () => {
  it('renders the title and sigil picker initially', () => {
    renderCommune();
    expect(screen.getByText('The S\u00e9ance')).toBeInTheDocument();
    expect(screen.getByText('Choose the Sigil That Calls You')).toBeInTheDocument();
  });

  it('renders 6 sigil cards, one per school', () => {
    renderCommune();
    const picker = screen.getByText('Choose the Sigil That Calls You').closest('.seance-sigil-picker');
    const cards = within(picker).getAllByRole('button');
    expect(cards).toHaveLength(6);
  });

  it('shows the Sanity meter at full (5 pips filled)', () => {
    renderCommune();
    const meter = screen.getByRole('meter', { name: 'Sanity' });
    expect(meter).toHaveAttribute('aria-valuenow', '5');
    const filled = meter.querySelectorAll('.seance-sanity__pip--filled');
    expect(filled).toHaveLength(5);
  });
});

describe('CommuneView — picking a sigil', () => {
  it('advances to the asking stage and renders the first narrowing question', () => {
    renderCommune();
    const card = screen.getByText('The Beckoning Bell').closest('button');
    fireEvent.click(card);
    // Should now show a narrowing question for the debugging school
    const debugPool = SEANCE_QUESTIONS.debugging.narrowing;
    expect(screen.getByText(debugPool[0].question)).toBeInTheDocument();
  });

  it('drops sanity to 4 after picking a sigil', () => {
    renderCommune();
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    const meter = screen.getByRole('meter', { name: 'Sanity' });
    expect(meter).toHaveAttribute('aria-valuenow', '4');
  });
});

describe('CommuneView — answering questions', () => {
  it('tapping an option advances to the next question and drops sanity', () => {
    renderCommune();
    // Pick debugging sigil
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    // Tap the first option
    const firstOpt = screen.getByText(/A clear trace/i).closest('button');
    fireEvent.click(firstOpt);
    // Sanity should be 3
    const meter = screen.getByRole('meter', { name: 'Sanity' });
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    // A new question should be visible (dbg-n2)
    expect(screen.getByText(SEANCE_QUESTIONS.debugging.narrowing[1].question)).toBeInTheDocument();
  });

  it('drops sanity by 1 per tap, with a 3-tap flow ending at sanity 1', () => {
    renderCommune();
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    fireEvent.click(screen.getByText(/A clear trace/i).closest('button'));         // dbg-n1-a (narrowing)
    fireEvent.click(screen.getByText(/A test that should exist/i).closest('button')); // dbg-n2-c (narrowing)
    fireEvent.click(screen.getByText(/The first commit, still bleeding/i).closest('button')); // dbg-d1-a (darker; sanity now 1)
    // 3 narrowing taps: sanity 4 -> 3 -> 2 -> 1
    const meter = screen.getByRole('meter', { name: 'Sanity' });
    expect(meter).toHaveAttribute('aria-valuenow', '1');
  });
});

describe('CommuneView — Beasthood ending at Sanity 0', () => {
  // Sanity starts at 5. The sigil pick costs 1 (5→4); each narrowing
  // tap costs 1. After 4 narrowing taps sanity reaches 0, which forces
  // the Beasthood ending. The four specific picks below are chosen
  // from the data so the consultation reaches the result stage via
  // isForced rather than via convergence.
  it('ends with a beasthood result after 4 narrowing taps', () => {
    renderCommune();
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    fireEvent.click(screen.getByText(/A wound that returns/i).closest('button'));               // dbg-n1-c
    fireEvent.click(screen.getByText(/A failing test, plain to see/i).closest('button'));        // dbg-n2-a
    fireEvent.click(screen.getByText(/The many truths, all fighting for the throat/i).closest('button')); // dbg-d1-c
    fireEvent.click(screen.getByText(/Patience beyond reason/i).closest('button'));              // dbg-d2-a
    const result = document.querySelector('.seance-result');
    expect(result).toBeTruthy();
    expect(result.dataset.beasthood).toBe('true');
    expect(result.className).toMatch(/seance-result--beasthood/);
  });
});

describe('CommuneView — reset', () => {
  it('returns to the sigil picker when Abandon the Ritual is clicked', () => {
    renderCommune();
    // Quick path: sigil -> 1 question
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    fireEvent.click(screen.getByText(/A clear trace/i).closest('button'));
    const abandon = screen.getByText(/Abandon the Ritual/i).closest('button');
    fireEvent.click(abandon);
    // Back at sigil picker
    expect(screen.getByText('Choose the Sigil That Calls You')).toBeInTheDocument();
    const meter = screen.getByRole('meter', { name: 'Sanity' });
    expect(meter).toHaveAttribute('aria-valuenow', '5');
  });
});

describe('CommuneView — result card', () => {
  it('displays a result with a Reveal the Spell and Begin Again button', () => {
    renderCommune();
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    fireEvent.click(screen.getByText(/A wound that returns/i).closest('button'));               // dbg-n1-c
    fireEvent.click(screen.getByText(/A failing test, plain to see/i).closest('button'));        // dbg-n2-a
    fireEvent.click(screen.getByText(/The many truths, all fighting for the throat/i).closest('button')); // dbg-d1-c
    fireEvent.click(screen.getByText(/Patience beyond reason/i).closest('button'));              // dbg-d2-a
    expect(screen.getByText(/Reveal the Spell/i)).toBeInTheDocument();
    expect(screen.getByText(/Begin Again/i)).toBeInTheDocument();
  });

  it('calls onSpellClick with the resolved entry when Reveal the Spell is pressed', () => {
    const onSpellClick = vi.fn();
    renderCommune({ onSpellClick });
    fireEvent.click(screen.getByText('The Beckoning Bell').closest('button'));
    fireEvent.click(screen.getByText(/A wound that returns/i).closest('button'));               // dbg-n1-c
    fireEvent.click(screen.getByText(/A failing test, plain to see/i).closest('button'));        // dbg-n2-a
    fireEvent.click(screen.getByText(/The many truths, all fighting for the throat/i).closest('button')); // dbg-d1-c
    fireEvent.click(screen.getByText(/Patience beyond reason/i).closest('button'));              // dbg-d2-a
    fireEvent.click(screen.getByText(/Reveal the Spell/i).closest('button'));
    expect(onSpellClick).toHaveBeenCalledTimes(1);
    const [spell, school] = onSpellClick.mock.calls[0];
    expect(spell).toHaveProperty('skill');
    expect(school).toHaveProperty('id');
  });
});
