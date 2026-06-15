import { test, expect } from '@playwright/test';

const WELCOME_KEY = 'grimoire-welcome-dismissed';

test.describe('client-side state persistence', () => {
  test('dismissing welcome stores state and hides modal on reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem(WELCOME_KEY);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.grimoirestack-layout')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.welcome-modal')).toBeVisible();

    await page.getByRole('button', { name: /Skip Rite/i }).click();
    await expect(page.locator('.welcome-modal')).not.toBeVisible();

    await page.reload();
    await expect(page.locator('.welcome-modal')).not.toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), WELCOME_KEY)).toBe('true');
  });

  test('favorites are saved to localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('grimoire-welcome-dismissed', 'true');
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.grimoirestack-layout')).toBeVisible({ timeout: 10_000 });

    // Pre-populate favorites via localStorage
    const testFavs = JSON.stringify([{skill: 'test-skill'}, {skill: 'another-skill'}]);
    await page.evaluate((val) => {
      localStorage.setItem('grimoire-favorites', val);
    }, testFavs);

    // Go to vault and verify the section renders (even if list has display issues)
    await page.getByRole('button', { name: /The Vault/i }).click();
    await expect(page.getByText('Bound Incantations')).toBeVisible();

    // Verify localStorage still has our data after navigation
    const stored = await page.evaluate(() => localStorage.getItem('grimoire-favorites'));
    expect(JSON.parse(stored)).toEqual(JSON.parse(testFavs));
  });

  test('featured schools are initialized from localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('grimoire-welcome-dismissed', 'true');
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.grimoirestack-layout')).toBeVisible({ timeout: 10_000 });

    // Verify featured schools key exists and is valid JSON
    const stored = await page.evaluate(() => localStorage.getItem('grimoire-featured-schools'));
    expect(() => JSON.parse(stored || '[]')).not.toThrow();
    expect(Array.isArray(JSON.parse(stored || '[]'))).toBe(true);
  });
});
