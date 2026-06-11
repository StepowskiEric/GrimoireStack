// End-to-end smoke tests for GrimoireStack.
//
// The BookSplash is a fixed full-screen video overlay. In headless browsers
// the autoplay typically fails (no user gesture), so each test first tries
// to dismiss the splash by clicking "Skip Intro".

import { test, expect } from '@playwright/test';

async function dismissSplash(page, url = '/') {
  await page.goto(url);
  const skip = page.getByRole('button', { name: /skip intro/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
  }
  // Wait for main UI to appear (h1) — bounded so we fail fast if splash won't go.
  await expect(page.locator('h1', { hasText: 'GrimoireStack' })).toBeVisible({ timeout: 5000 });
}

test.describe('app shell', () => {
  test('renders the grimoire without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

    await dismissSplash(page);

    await expect(page.locator('h1', { hasText: 'GrimoireStack' })).toBeVisible();
    await expect(page.locator('text=The Warlock\'s Tome of Agent Incantations')).toBeVisible();
    await expect(page.locator('.scrying-orb')).toBeVisible();
    await expect(page.locator('.ledger-wrapper')).toBeVisible();

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('language toggle actually switches the i18n context', async ({ page }) => {
    await dismissSplash(page);

    const subtitle = page.locator('.subtitle');
    await expect(subtitle).toHaveText("The Warlock's Tome of Agent Incantations");

    await page.getByRole('button', { name: /switch to plain english/i }).click();
    await expect(subtitle).toHaveText('A collection of reusable AI agent skills');

    await page.getByRole('button', { name: /switch to themed/i }).click();
    await expect(subtitle).toHaveText("The Warlock's Tome of Agent Incantations");
  });
});

test.describe('search and filters', () => {
  test('text search filters the spell grid', async ({ page }) => {
    await dismissSplash(page);
    await page.locator('#searchInput').fill('debug');
    await expect(page.locator('.orb-result')).toContainText(/incantations? found/);
  });

  test('filter chip toggles narrow the result set', async ({ page }) => {
    await dismissSplash(page);

    const filterChips = page.locator('.filter-chip');
    await expect(filterChips.first()).toBeVisible();
    // Click the Favorites filter
    await page.getByRole('button', { name: /favorites/i }).first().click();
    await expect(page.locator('.filter-chip.active')).toContainText(/favorites/i);
  });

  test('"Cast the bones" opens a random spell modal', async ({ page }) => {
    await dismissSplash(page);
    await page.getByRole('button', { name: /cast the bones/i }).click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await page.keyboard.press('Escape');
  });
});

test.describe('spell modal', () => {
  test('clicking a spell card opens the modal', async ({ page }) => {
    await dismissSplash(page);
    const firstCard = page.locator('.spell-card').first();
    await firstCard.click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await expect(page.locator('.modal-share')).toContainText(/share/i);
    await page.keyboard.press('Escape');
  });

  test('marginalia note persists in localStorage', async ({ page }) => {
    await dismissSplash(page);
    await page.locator('.spell-card').first().click();
    const ta = page.locator('.marginalia-textarea');
    await ta.fill('Remember: combine with Trace Sight for prod incidents');
    // wait for debounced save
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() => localStorage.getItem('grimoire-marginalia'));
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored)).toHaveProperty(
      Object.keys(JSON.parse(stored))[0],
      'Remember: combine with Trace Sight for prod incidents'
    );
  });
});

test.describe('keyboard shortcuts', () => {
  test('? opens the shortcuts cheatsheet', async ({ page }) => {
    await dismissSplash(page);
    await page.keyboard.press('?');
    await expect(page.locator('.shortcuts-modal')).toBeVisible();
    await expect(page.locator('.shortcuts-list')).toContainText(/Focus the Scrying Orb/);
    await page.keyboard.press('Escape');
  });

  test('/ focuses the search input', async ({ page }) => {
    await dismissSplash(page);
    await page.keyboard.press('/');
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('searchInput');
  });
});

test.describe('per-spell URL routing', () => {
  test('visiting /s/<skill> opens the modal for that spell', async ({ page }) => {
    await dismissSplash(page, '/s/log-trace-correlation');
    await expect(page.locator('.modal-wide')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText(/Trace Sight/);
  });

  test('opening a spell updates the address bar to /s/<skill>', async ({ page }) => {
    await dismissSplash(page);
    await page.locator('.spell-card').first().click();
    await page.waitForURL(/\/s\//);
    expect(page.url()).toMatch(/\/s\/[\w.-]+$/);
  });
});

test.describe('SEO + PWA', () => {
  test('home page exposes OG and Twitter meta tags', async ({ page }) => {
    await dismissSplash(page);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toMatch(/GrimoireStack/);
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');
  });

  test('per-spell page exposes a per-spell og:title', async ({ page, request }) => {
    const res = await request.get('/s/log-trace-correlation');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>GrimoireStack — Trace Sight</title>');
    expect(html).toContain('og:title" content="Trace Sight — GrimoireStack"');
  });

  test('manifest.webmanifest is served and valid', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('GrimoireStack');
    expect(body.start_url).toBe('/');
  });

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/User-agent:\s*\*/);
  });

  test('sitemap.xml lists skills', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('<loc>https://grimoirestack.dev/</loc>');
    expect(text).toMatch(/<loc>https:\/\/grimoirestack\.dev\/s\/[\w.-]+<\/loc>/);
  });
});
