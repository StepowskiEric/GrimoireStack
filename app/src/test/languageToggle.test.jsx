import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { LanguageProvider } from '../i18n/LanguageContext';

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles between grimoire and plain language modes', async () => {
    render(<LanguageToggle />);
    const toggle = screen.getByRole('button', { name: /switch to plain english/i });
    expect(toggle.textContent).toBe('Plain');

    await act(async () => { fireEvent.click(toggle); });
    expect(toggle.textContent).toBe('Grimoire');
    expect(localStorage.getItem('grimoire-lang')).toBe('plain');

    await act(async () => { fireEvent.click(toggle); });
    expect(toggle.textContent).toBe('Plain');
    expect(localStorage.getItem('grimoire-lang')).toBe('grimoire');
  });

  it('respects persisted language when wrapped in LanguageProvider', async () => {
    localStorage.setItem('grimoire-lang', 'plain');
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );
    const toggle = screen.getByRole('button', { name: /switch to themed language/i });
    expect(toggle.textContent).toBe('Grimoire');

    await act(async () => { fireEvent.click(toggle); });
    expect(toggle.textContent).toBe('Plain');
    expect(localStorage.getItem('grimoire-lang')).toBe('grimoire');
  });
});
