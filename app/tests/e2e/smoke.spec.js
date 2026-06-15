import { test, expect } from '@playwright/test';
import { gotoReady, closeModal } from './helpers.js';

test.describe('app shell', () => {
  test('renders the main layout and navigation', async ({ page }) => {
    await gotoReady(page);

    await expect(page.getByRole('button', { name: /The Spine/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Vault/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Crucible/i })).toBeVisible();
  });
});

test.describe('search and navigation', () => {
  test('opens a school then a spell and closes the modal', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await closeModal(page, '.modal-wide');
    await expect(page.locator('.modal-wide')).not.toBeVisible();
  });
});

test.describe('actions', () => {
  test('opens shortcuts modal and closes it', async ({ page }) => {
    await gotoReady(page);

    await page.getByRole('button', { name: /Shortcuts/i }).click();
    await expect(page.locator('.shortcuts-modal')).toBeVisible();
    await closeModal(page, '.shortcuts-modal');
    await expect(page.locator('.shortcuts-modal')).not.toBeVisible();
  });
});
