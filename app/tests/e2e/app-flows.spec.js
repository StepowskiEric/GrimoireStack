import { test, expect } from '@playwright/test';
import { gotoReady, closeModal } from './helpers.js';

const SETTINGS_TAB = 'Settings';
const VAULT_TAB = 'The Vault';
const RITUALS_TAB = 'The Crucible';
const BESTIARY_TAB = 'The Bestiary';
const SPELL_WEB_TAB = 'Spell Web';
const CHANGELOG_TAB = 'Changelog';
const ABOUT_TAB = 'The Tome';
const SEANCE_TAB = 'The Séance';

test.describe('tab navigation', () => {
  test('each sidebar tab loads its view', async ({ page }) => {
    await gotoReady(page);

    const tabs = [
      { name: ABOUT_TAB, route: '/about', heading: 'GrimoireStack' },
      { name: VAULT_TAB, route: '/vault', heading: 'The Vault' },
      { name: RITUALS_TAB, route: '/rituals', heading: 'Rituals' },
      { name: BESTIARY_TAB, route: '/bestiary', heading: 'The Bestiary Codex' },
      { name: SPELL_WEB_TAB, route: '/spellweb', heading: 'Spell Web' },
      { name: CHANGELOG_TAB, route: '/changelog', heading: 'Changelog' },
      { name: SETTINGS_TAB, route: '/settings', heading: 'Ritual Chamber' },
      { name: SEANCE_TAB, route: '/commune', heading: 'The Séance' },
    ];

    for (const tab of tabs) {
      await page.getByRole('button', { name: tab.name }).click();
      await expect(page).toHaveURL(new RegExp(tab.route));
      await expect(page.getByRole('heading', { name: tab.heading })).toBeVisible();
    }
  });

  test('back to library from a sub-tab returns home', async ({ page }) => {
    await gotoReady(page);

    await page.getByRole('button', { name: VAULT_TAB }).click();
    await expect(page).toHaveURL(/\/vault/);

    await page.getByRole('button', { name: ABOUT_TAB }).click();
    await expect(page).toHaveURL(/\/about/);

    await page.getByRole('button', { name: /The Spine/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('tab navigation (mobile)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile bottom navigation switches tabs', async ({ page }) => {
    await gotoReady(page);

    await page.getByRole('button', { name: VAULT_TAB }).click();
    await expect(page).toHaveURL(/\/vault/);
    await expect(page.getByRole('heading', { name: 'The Vault' })).toBeVisible();
  });
});

test.describe('settings', () => {
  test('toggles audio and cast settings', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: SETTINGS_TAB }).click();
    await expect(page.getByRole('heading', { name: 'Ritual Chamber' })).toBeVisible();

    await page.getByRole('button', { name: 'Display' }).click();

    const audioToggle = page.getByLabel('Enable sounds');
    const castToggle = page.getByLabel('Cast animation');

    await expect(audioToggle).toBeVisible();
    await expect(castToggle).toBeVisible();

    await audioToggle.uncheck();
    await expect(audioToggle).not.toBeChecked();

    await castToggle.uncheck();
    await expect(castToggle).not.toBeChecked();
  });

  test('export buttons show toast feedback', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: SETTINGS_TAB }).click();

    await page.getByRole('button', { name: 'Data' }).click();

    await page.getByRole('button', { name: 'Export as JSON' }).click();
    await expect(page.getByText('JSON copied!')).toBeVisible();

    await page.getByRole('button', { name: 'Export as Markdown' }).click();
    await expect(page.getByText('Markdown copied!')).toBeVisible();
  });

  test('language section switches between Grimoire and Plain', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: SETTINGS_TAB }).click();

    const langSelect = page.locator('#lang-select');
    await expect(langSelect).toHaveValue('grimoire');

    await langSelect.selectOption('plain');
    await expect(langSelect).toHaveValue('plain');

    await langSelect.selectOption('grimoire');
    await expect(langSelect).toHaveValue('grimoire');
  });
});

test.describe('favorites vault', () => {
  test('empty state shows guidance text', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: VAULT_TAB }).click();

    await expect(page.getByText('The circle is silent')).toBeVisible();
  });

  test('vault renders favorites, recent, and marginalia sections', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: VAULT_TAB }).click();

    await expect(page.getByText('Bound Incantations')).toBeVisible();
    await expect(page.getByText('Trail of Recent Summons')).toBeVisible();
    await expect(page.getByText('Marginalia — Your Annotations')).toBeVisible();
  });
});

test.describe('recipe lab', () => {
  test('selecting two spells enables compare button', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: RITUALS_TAB }).click();
    await expect(page.getByText('Cauldron (0/2)')).toBeVisible();

    const spellCards = page.locator('.recipe-lab-view__spell-card');
    await spellCards.first().click();
    await expect(page.getByText('Cauldron (1/2)')).toBeVisible();

    await spellCards.nth(1).click();
    await expect(page.getByText('Cauldron (2/2)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare These Incantations' })).toBeVisible();
  });

  test('compare flow opens the compare modal', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: RITUALS_TAB }).click();

    const spellCards = page.locator('.recipe-lab-view__spell-card');
    await spellCards.first().click();
    await spellCards.nth(1).click();

    await page.getByRole('button', { name: 'Compare These Incantations' }).click();
    await expect(page.locator('.compare-modal')).toBeVisible();
    await closeModal(page, '.compare-modal');
  });

  test('search filters spells in the recipe lab', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: RITUALS_TAB }).click();

    const searchInput = page.getByPlaceholder('Scry by name, skill, effect, or school…');
    await searchInput.fill('debug');
    await expect(page.locator('.recipe-lab-view__count')).toContainText(/incantation/);
  });

  test('pagination navigates pages', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: RITUALS_TAB }).click();

    const pager = page.locator('.recipe-lab-view__pager');
    const pageCountText = await page.locator('.recipe-lab-view__count').textContent();
    if (!pageCountText || !pageCountText.includes('page 1 of')) {
      test.skip(true, 'Not enough spells to trigger pagination');
      return;
    }

    await page.getByRole('button', { name: 'Later →' }).click();
    await expect(page.locator('.recipe-lab-view__count')).toContainText('page 2');
  });
});

test.describe('bestiary', () => {
  test('search filters entities', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: BESTIARY_TAB }).click();
    await expect(page.getByRole('heading', { name: 'The Bestiary Codex' })).toBeVisible();

    const searchInput = page.getByPlaceholder(/Scry by name/i);
    await searchInput.fill('debug');
    await expect(page.locator('.bestiary-codex__search-input')).toHaveValue('debug');
  });
});

test.describe('spell web', () => {
  test('renders the spell web view', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: SPELL_WEB_TAB }).click();
    await expect(page).toHaveURL(/\/spellweb/);
  });
});

test.describe('changelog', () => {
  test('renders changelog entries', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: CHANGELOG_TAB }).click();
    await expect(page).toHaveURL(/\/changelog/);
  });
});

test.describe('about', () => {
  test('renders about content', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: ABOUT_TAB }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: 'GrimoireStack', level: 2 })).toBeVisible();
  });
});

test.describe('commune', () => {
  test('lazy-loads the commune view', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: SEANCE_TAB }).click();
    await expect(page).toHaveURL(/\/commune/);
  });
});


test.describe('keyboard interactions', () => {
  test('escape closes spell modal', async ({ page }) => {
    await gotoReady(page);

    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await closeModal(page, '.modal-wide');
    await expect(page.locator('.modal-wide')).not.toBeVisible();
  });
});
