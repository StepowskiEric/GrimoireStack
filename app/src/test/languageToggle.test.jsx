import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';

function LangProbe() {
  const { lang, t } = useLanguage();
  return (
    <span data-testid="probe">
      {lang}|{t('appTitle')}
    </span>
  );
}

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles between plain and grimoire language modes and updates the i18n context', async () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
        <LangProbe />
      </LanguageProvider>,
    );
    const toggle = screen.getByRole('button', { name: /switch to themed/i });
    expect(toggle.textContent).toContain('Plain');
    expect(screen.getByTestId('probe').textContent).toBe('plain|Agent Skills Catalog');

    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.textContent).toContain('Grimoire');
    expect(screen.getByTestId('probe').textContent).toBe('grimoire|GrimoireStack');
    expect(localStorage.getItem('grimoire-lang')).toBe('grimoire');

    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.textContent).toContain('Plain');
    expect(screen.getByTestId('probe').textContent).toBe('plain|Agent Skills Catalog');
    expect(localStorage.getItem('grimoire-lang')).toBe('plain');
  });

  it('respects persisted language on mount', async () => {
    localStorage.setItem('grimoire-lang', 'grimoire');
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );
    const toggle = screen.getByRole('button', { name: /switch to plain english/i });
    expect(toggle.textContent).toContain('Grimoire');

    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.textContent).toContain('Plain');
    expect(localStorage.getItem('grimoire-lang')).toBe('plain');
  });
});
