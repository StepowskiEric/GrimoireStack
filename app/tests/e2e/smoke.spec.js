import { test, expect } from '@playwright/test';

async function gotoReady(page, url = '/') {
  await page.addInitScript(() => {
    localStorage.setItem('grimoire-welcome-dismissed', 'true');
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await expect(page.locator('.grimoirestack-layout')).toBeVisible({ timeout: 15_000 });
}

async function closeModal(page, modalSelector) {
  await page.keyboard.press('Escape');
  await expect(page.locator(modalSelector)).toBeHidden({ timeout: 10_000 });
}

test.describe('app shell', () => {
  test('renders the main layout and navigation', async ({ page }) => {
    await gotoReady(page);

    await expect(page.getByRole('button', { name: /^ARCHIVE$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^THE VAULT$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^RITUALS$/ })).toBeVisible();
  });
});

test.describe('search and navigation', () => {
  test('opens a school then a spell and closes the modal', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.school-card').first().click();
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

