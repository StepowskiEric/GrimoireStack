import { test, expect } from '@playwright/test';
import { gotoReady, checkA11y } from './helpers.js';

test.describe('accessibility baseline', () => {
  test('home page is accessible', async ({ page }) => {
    await gotoReady(page);
    await checkA11y(page);
  });

  test('modal open state is accessible', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await checkA11y(page);
  });

  test('shortcuts modal is accessible', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /Shortcuts/i }).click();
    await expect(page.locator('.shortcuts-modal')).toBeVisible();
    await checkA11y(page);
  });

  test('compare modal is accessible', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();
    await expect(page.locator('.compare-modal')).toBeVisible();
    await checkA11y(page);
  });

  test('search-no-results state is accessible', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.pupil-search__input').fill('zzznone');
    await page.getByRole('button', { name: /Consult the Witch Doctor/i }).click();
    await expect(page.locator('.witch-doctor-modal')).toBeVisible();
    await checkA11y(page);
  });
});
