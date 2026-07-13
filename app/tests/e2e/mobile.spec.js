import { expect, test } from '@playwright/test';
import { checkA11y, closeModal, gotoReady } from './helpers.js';

const mobileViewports = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 14 Pro': { width: 393, height: 852 },
};

for (const [deviceName, viewport] of Object.entries(mobileViewports)) {
  test.describe(`mobile — ${deviceName}`, () => {
    test.use({ viewport });

    test('renders shell and navigation', async ({ page }) => {
      await gotoReady(page);
      await expect(page.getByRole('button', { name: /^ARCHIVE$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^THE VAULT$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /^RITUALS$/ })).toBeVisible();
    });

    test('search and spell modal flow', async ({ page }) => {
      await gotoReady(page);
      await page.locator('.pupil-search__input').fill('debug');
      await expect(page.locator('.spell-card').first()).toBeVisible();
      await page.locator('.spell-card').first().click();
      await expect(page.locator('.modal-wide')).toBeVisible();
      await closeModal(page, '.modal-wide');
      await expect(page.locator('.modal-wide')).not.toBeVisible();
    });

    test('shortcuts and compare modals open', async ({ page }) => {
      await gotoReady(page);
      await page.getByRole('button', { name: /Shortcuts/i }).click();
      await expect(page.locator('.shortcuts-modal')).toBeVisible();
      await closeModal(page, '.shortcuts-modal');

      await page.getByRole('button', { name: /compare two spells/i }).click();
      await expect(page.locator('.compare-modal')).toBeVisible();
      await closeModal(page, '.compare-modal');
    });

    test('accessibility baseline on mobile', async ({ page }) => {
      await gotoReady(page);
      await checkA11y(page);
    });
  });
}
