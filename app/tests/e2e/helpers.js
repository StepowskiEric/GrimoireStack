import AxeBuilder from '@axe-core/playwright';
import { devices, expect } from '@playwright/test';

export const MOBILE_DEVICES = {
  'iPhone SE': devices['iPhone SE'],
  'iPhone 14 Pro': devices['iPhone 14 Pro'],
};

export async function gotoReady(page, url = '/') {
  await page.addInitScript(() => {
    localStorage.setItem('grimoire-welcome-dismissed', 'true');
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.grimoirestack-layout')).toBeVisible({ timeout: 10_000 });
}

export async function checkA11y(page, options = {}) {
  const { excludeRules = [] } = options;
  const builder = new AxeBuilder({ page }).exclude('#main-content');
  for (const rule of excludeRules) {
    builder.disableRules([rule]);
  }
  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}

export async function closeModal(page, modalSelector) {
  await page.keyboard.press('Escape');
  await expect(page.locator(modalSelector)).toBeHidden({ timeout: 10_000 });
}
