import { expect, test } from '@playwright/test';
import { checkA11y, gotoReady } from './helpers.js';

test.describe('accessibility baseline', () => {
  test('home page is accessible', async ({ page }) => {
    await gotoReady(page);
    await checkA11y(page);
  });

  test('spell modal is accessible', async ({ page }) => {
    await gotoReady(page);
    // Navigate to a school first to see spell cards
    await page.locator('.spine-card').first().click();
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await checkA11y(page, { excludeRules: ['scrollable-region-focusable'] });
  });

  test('shortcuts modal is accessible', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /Shortcuts/i }).click();
    await expect(page.locator('.shortcuts-modal')).toBeVisible();
    await checkA11y(page);
  });

  test('compare modal is accessible', async ({ page }) => {
    await gotoReady(page);
    // Use the Rituals tab to compare two spells
    await page.getByRole('button', { name: /The Crucible/i }).click();
    const spellCards = page.locator('.recipe-lab-view__spell-card');
    await spellCards.first().click();
    await spellCards.nth(1).click();
    await page.getByRole('button', { name: 'Compare These Incantations' }).click();
    await expect(page.locator('.compare-modal')).toBeVisible();
    await checkA11y(page);
  });

  test('empty search state is accessible', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.pupil-search__input').fill('zzznonexistent');
    // Just verify the search results area is accessible
    await checkA11y(page);
  });
});
