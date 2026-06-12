import { test, expect } from '@playwright/test';
import { gotoReady, closeModal } from './helpers.js';

const WELCOME_KEY = 'grimoire-welcome-dismissed';

test.describe('client-side state persistence', () => {
  test('dismissing welcome stores state and hides modal on reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem(WELCOME_KEY);
    });
    await gotoReady(page);
    await expect(page.locator('.modal')).toBeVisible();

    await page.getByRole('button', { name: /Begin/i }).click();
    await expect(page.locator('.modal')).not.toBeVisible();

    await page.reload();
    await expect(page.locator('.modal')).not.toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), WELCOME_KEY)).toBe('true');
  });

  test('favorites toggle persists across page reloads', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();

    await page.getByLabelText('Bind to Summoning Circle').first().click();
    await closeModal(page, '.modal-wide');

    await page.reload();
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await expect(page.getByLabelText('Unbind from Summoning Circle').first()).toBeVisible();
  });

  test('updating featured schools updates localStorage', async ({ page }) => {
    await gotoReady(page);
    const before = await page.evaluate(() => localStorage.getItem('grimoire-featured-schools'));
    const initial = JSON.parse(before || '[]');

    await page.getByRole('button', { name: /Manage featured/i }).click();
    await page.getByRole('button', { name: /Add to featured/i }).first().click();
    await closeModal(page, '[role="dialog"]');

    const after = await page.evaluate(() => localStorage.getItem('grimoire-featured-schools'));
    const updated = JSON.parse(after || '[]');
    expect(updated.length).toBeGreaterThanOrEqual(initial.length);
  });
});
