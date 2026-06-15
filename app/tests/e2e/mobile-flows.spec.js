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

test.use({ viewport: { width: 375, height: 667 } });

test.describe('mobile navigation', () => {
  test('bottom nav is visible and switches tabs', async ({ page }) => {
    await gotoReady(page);

    // Bottom nav should be visible on mobile
    await expect(page.locator('.eye-bottom-nav')).toBeVisible();

    await page.getByRole('button', { name: VAULT_TAB }).click();
    await expect(page).toHaveURL(/\/vault/);
    await expect(page.getByRole('heading', { name: 'The Vault' })).toBeVisible();

    await page.getByRole('button', { name: ABOUT_TAB }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('sidebar nav is hidden on mobile', async ({ page }) => {
    await gotoReady(page);
    // The sidebar nav is hidden on mobile (tabs move to bottom nav)
    await expect(page.locator('.eye-sidebar__nav')).not.toBeVisible();
  });
});

test.describe('mobile search', () => {
  test('search input is visible and functional', async ({ page }) => {
    await gotoReady(page);

    const searchInput = page.locator('.pupil-search__input');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('debug');
    await expect(searchInput).toHaveValue('debug');
  });
});

test.describe('mobile modals', () => {
  test('spell modal opens and closes', async ({ page }) => {
    await gotoReady(page);

    // Navigate to a school first
    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();

    await expect(page.locator('.modal-wide')).toBeVisible();
    await closeModal(page, '.modal-wide');
    await expect(page.locator('.modal-wide')).not.toBeVisible();
  });

  test('shortcuts modal opens and closes', async ({ page }) => {
    await gotoReady(page);

    await page.getByRole('button', { name: /Shortcuts/i }).click();
    await expect(page.locator('.shortcuts-modal')).toBeVisible();
    await closeModal(page, '.shortcuts-modal');
    await expect(page.locator('.shortcuts-modal')).not.toBeVisible();
  });
});

test.describe('mobile settings', () => {
  test('settings page loads', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: SETTINGS_TAB }).click();

    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: 'Ritual Chamber' })).toBeVisible();
  });
});

test.describe('mobile recipe lab', () => {
  test('recipe lab loads and shows cauldron', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: RITUALS_TAB }).click();

    await expect(page).toHaveURL(/\/rituals/);
    await expect(page.getByText('Cauldron (0/2)')).toBeVisible();
  });

  test('spell selection works on mobile', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: RITUALS_TAB }).click();

    const spellCards = page.locator('.recipe-lab-view__spell-card');
    await spellCards.first().click();
    await expect(page.getByText('Cauldron (1/2)')).toBeVisible();
  });
});

test.describe('mobile bestiary', () => {
  test('bestiary loads and search works', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: BESTIARY_TAB }).click();

    await expect(page).toHaveURL(/\/bestiary/);
    await expect(page.getByRole('heading', { name: 'The Bestiary Codex' })).toBeVisible();

    const searchInput = page.getByPlaceholder(/Scry by name/i);
    await searchInput.fill('debug');
    await expect(page.locator('.bestiary-codex__search-input')).toHaveValue('debug');
  });
});
