import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';

function LangProbe() {
  const { lang, t } = useLanguage();
  return <span data-testid="probe">{lang}|{t('appTitle')}</span>;
}

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles between grimoire and plain language modes and updates the i18n context', async () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
        <LangProbe />
      </LanguageProvider>
    );
    const toggle = screen.getByRole('button', { name: /switch to plain english/i });
    expect(toggle.textContent).toContain('Grimoire');
    expect(screen.getByTestId('probe').textContent).toBe('grimoire|GrimoireStack');

    await act(async () => { fireEvent.click(toggle); });
    expect(toggle.textContent).toContain('Plain');
    expect(screen.getByTestId('probe').textContent).toBe('plain|Agent Skills Catalog');
    expect(localStorage.getItem('grimoire-lang')).toBe('plain');

    await act(async () => { fireEvent.click(toggle); });
    expect(toggle.textContent).toContain('Grimoire');
    expect(screen.getByTestId('probe').textContent).toBe('grimoire|GrimoireStack');
    expect(localStorage.getItem('grimoire-lang')).toBe('grimoire');
  });

  it('respects persisted language on mount', async () => {
    localStorage.setItem('grimoire-lang', 'plain');
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    );
    const toggle = screen.getByRole('button', { name: /switch to themed/i });
    expect(toggle.textContent).toContain('Plain');

    await act(async () => { fireEvent.click(toggle); });
    expect(toggle.textContent).toContain('Grimoire');
    expect(localStorage.getItem('grimoire-lang')).toBe('grimoire');
  });
});
