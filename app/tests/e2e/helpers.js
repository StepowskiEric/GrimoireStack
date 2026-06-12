import { devices, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

export async function checkA11y(page) {
  const results = await new AxeBuilder({ page })
    .exclude('#main-content')
    .analyze();
  expect(results.violations).toEqual([]);
}
