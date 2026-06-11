// End-to-end tests for the 9 new features added to GrimoireStack.
//
// Covers: Spell Index, Changelog, Spell Graph, Compare Spells,
// Problem Intake, Export (JSON/Markdown), RSS feed, and Community Signal.

import { test, expect } from '@playwright/test';

/**
 * Skip both the BookSplash video overlay and the ApprenticeWelcome modal
 * by pre-setting sessionStorage/localStorage before the page scripts run.
 * Then navigate and wait for the main UI to be interactive.
 */
async function skipOverlays(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('grimoire-splash-seen', '1');
    localStorage.setItem('grimoire-welcome-dismissed', 'true');
  });
}

async function gotoReady(page, url = '/') {
  await skipOverlays(page);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // Wait for the h1 to confirm the app loaded
  await expect(page.locator('h1')).toBeVisible({ timeout: 8000 });
}

// Reusable helper: open the first visible spell card
async function openFirstSpell(page) {
  const card = page.locator('.spell-card').first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page.locator('.modal-wide')).toBeVisible({ timeout: 5000 });
}

// ── Spell Index Tab ──────────────────────────────────
test.describe('Spell Index', () => {
  test('Index tab is visible in the tab bar', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('#tab-index')).toBeVisible();
  });

  test('clicking Index tab renders the alphabetical list', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-index').click();
    await expect(page.locator('#school-index')).toBeVisible();
    await expect(page.locator('.index-header h2')).toHaveText('Spell Index');
  });

  test('alphabetical nav has letter buttons', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-index').click();
    const alphaBtns = page.locator('.index-alpha-btn');
    const count = await alphaBtns.count();
    expect(count).toBeGreaterThanOrEqual(27); // All + A-Z
  });

  test('clicking a letter filters the list', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-index').click();
    // Record unfiltered count first
    const allCount = await page.locator('.index-row').count();
    const letterBtn = page.locator('.index-alpha-btn:not(.empty)', { hasText: 'B' });
    if (await letterBtn.isEnabled()) {
      await letterBtn.click();
      const filteredCount = await page.locator('.index-row').count();
      // Filtered should be fewer than all, and all rows should have B as first letter
      expect(filteredCount).toBeLessThanOrEqual(allCount);
      if (filteredCount > 0) {
        const firstName = await page.locator('.index-row-name').first().textContent();
        expect(firstName).toMatch(/^B/i);
      }
    }
  });

  test('search input filters the list', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-index').click();
    const allCount = await page.locator('.index-row').count();
    await page.locator('.index-search-input').fill('trace');
    // Wait for React re-render
    await expect(page.locator('.index-row')).not.toHaveCount(allCount, { timeout: 3000 });
    const filteredCount = await page.locator('.index-row').count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(allCount);
  });

  test('clicking a row opens the spell modal', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-index').click();
    await page.locator('.index-row').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await page.keyboard.press('Escape');
  });
});

// ── Changelog Tab ────────────────────────────────────
test.describe('Changelog', () => {
  test('Changelog tab is visible', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('#tab-changelog')).toBeVisible();
  });

  test('clicking Changelog tab renders the feed', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-changelog').click();
    await expect(page.locator('#school-changelog')).toBeVisible();
    await expect(page.locator('.changelog-header h2')).toHaveText('Changelog');
  });

  test('changelog shows date groups', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-changelog').click();
    const days = page.locator('.changelog-day');
    const count = await days.count();
    expect(count).toBeGreaterThan(0);
  });

  test('changelog shows stats', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-changelog').click();
    await expect(page.locator('.changelog-stats')).toBeVisible();
    const stats = page.locator('.changelog-stat-value');
    const count = await stats.count();
    expect(count).toBe(3); // curated updates, tracked spells, active dates
  });

  test('clicking a changelog item opens the spell modal', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-changelog').click();
    await page.locator('.changelog-item').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await page.keyboard.press('Escape');
  });
});

// ── Spell Graph Tab ──────────────────────────────────
test.describe('Spell Graph', () => {
  test('Graph tab is visible', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('#tab-graph')).toBeVisible();
  });

  test('clicking Graph tab renders the SVG graph', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-graph').click();
    await expect(page.locator('#school-graph')).toBeVisible();
    await expect(page.locator('.graph-svg')).toBeVisible();
  });

  test('graph has legend items for each school', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-graph').click();
    const items = page.locator('.graph-legend-item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('graph SVG has node elements', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-graph').click();
    const nodes = page.locator('.graph-node');
    const count = await nodes.count();
    expect(count).toBeGreaterThan(20);
  });

  test('graph shows a tooltip on hover', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-graph').click();
    // Use force:true because SVG nodes overlap in the force layout
    const firstNode = page.locator('.graph-node').first();
    await firstNode.hover({ force: true, timeout: 5000 });
    await expect(page.locator('.graph-tooltip')).toBeVisible({ timeout: 3000 });
  });

  test('graph footnote shows node and edge counts', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-graph').click();
    await expect(page.locator('.graph-footnote')).toContainText('nodes');
    await expect(page.locator('.graph-footnote')).toContainText('edges');
  });
});

// ── Compare Spells Modal ─────────────────────────────
test.describe('Compare Spells', () => {
  test('Compare button is visible in the action row', async ({ page }) => {
    await gotoReady(page);
    await expect(page.getByRole('button', { name: /compare two spells/i })).toBeVisible();
  });

  test('clicking Compare opens the modal', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();
    await expect(page.locator('.compare-modal')).toBeVisible();
    await expect(page.locator('.compare-modal .modal-title')).toContainText('Compare');
  });

  test('modal shows two empty slots', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();
    const slots = page.locator('.compare-slot-empty');
    const count = await slots.count();
    expect(count).toBe(2);
  });

  test('clicking an empty slot opens the spell picker', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();
    await page.locator('.compare-slot-empty').first().click();
    await expect(page.locator('.compare-picker')).toBeVisible();
    await expect(page.locator('.compare-picker-input')).toBeVisible();
  });

  test('selecting two spells shows a comparison table', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();

    // Pick left spell
    await page.locator('.compare-slot-empty').first().click();
    await page.locator('.compare-picker-input').fill('trace');
    await page.locator('.compare-picker-row').first().click();

    // Pick right spell
    await page.locator('.compare-slot-empty').first().click();
    await page.locator('.compare-picker-input').fill('bisect');
    await page.locator('.compare-picker-row').first().click();

    // Table should appear
    await expect(page.locator('.compare-table')).toBeVisible();
    const rows = page.locator('.compare-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(3);
  });

  test('different fields are highlighted with diff dot', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();

    // Pick left
    await page.locator('.compare-slot-empty').first().click();
    await page.locator('.compare-picker-row').first().click();

    // Pick right
    await page.locator('.compare-slot-empty').first().click();
    const secondRow = page.locator('.compare-picker-row').nth(1);
    if (await secondRow.isVisible()) {
      await secondRow.click();
      const diffs = page.locator('.compare-table-row.diff');
      const diffCount = await diffs.count();
      expect(diffCount).toBeGreaterThan(0);
    }
  });

  test('Escape closes the compare modal', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /compare two spells/i }).click();
    await expect(page.locator('.compare-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.compare-modal')).not.toBeVisible();
  });
});

// ── Problem Intake Modal ─────────────────────────────
test.describe('Problem Intake', () => {
  test('Describe Your Problem button is visible', async ({ page }) => {
    await gotoReady(page);
    await expect(page.getByRole('button', { name: /describe your problem/i })).toBeVisible();
  });

  test('clicking it opens the intake modal', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /describe your problem/i }).click();
    await expect(page.locator('.intake-modal')).toBeVisible();
    await expect(page.locator('.intake-modal .modal-title')).toHaveText('What Ails You?');
  });

  test('modal shows a textarea and sample problems', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /describe your problem/i }).click();
    await expect(page.locator('.intake-textarea')).toBeVisible();
    await expect(page.locator('.intake-examples-list')).toBeVisible();
    const examples = page.locator('.intake-example');
    const count = await examples.count();
    expect(count).toBeGreaterThan(3);
  });

  test('clicking a sample problem fills the textarea', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /describe your problem/i }).click();
    await page.locator('.intake-example').first().click();
    const value = await page.locator('.intake-textarea').inputValue();
    expect(value.length).toBeGreaterThan(10);
  });

  test('typing a query shows suggested spells', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /describe your problem/i }).click();
    await page.locator('.intake-textarea').fill('flaky test failing CI');
    const results = page.locator('.intake-result');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
    await expect(page.locator('.intake-results-title')).toContainText(/suggested/i);
  });

  test('clicking a suggested spell opens the spell modal', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /describe your problem/i }).click();
    await page.locator('.intake-textarea').fill('debugging bug crash');
    await page.locator('.intake-result').first().click();
    await expect(page.locator('.modal-wide')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('Escape closes the intake modal', async ({ page }) => {
    await gotoReady(page);
    await page.getByRole('button', { name: /describe your problem/i }).click();
    await expect(page.locator('.intake-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.intake-modal')).not.toBeVisible();
  });
});

// ── Export (JSON / Markdown) ─────────────────────────
test.describe('Export', () => {
  test('Footer shows export buttons', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('.footer-export-label')).toBeVisible();
    await expect(page.locator('.footer-export-btn', { hasText: 'JSON' })).toBeVisible();
    await expect(page.locator('.footer-export-btn', { hasText: 'Markdown' })).toBeVisible();
  });

  test('export JSON button shows toast on click', async ({ page }) => {
    await gotoReady(page);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('.footer-export-btn', { hasText: 'JSON' }).click();
    await expect(page.locator('.export-toast')).toBeVisible({ timeout: 3000 });
  });

  test('export Markdown button shows toast on click', async ({ page }) => {
    await gotoReady(page);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('.footer-export-btn', { hasText: 'Markdown' }).click();
    await expect(page.locator('.export-toast')).toBeVisible({ timeout: 3000 });
  });
});

// ── RSS Feed ─────────────────────────────────────────
test.describe('RSS feed', () => {
  test('RSS link is in the HTML head', async ({ page }) => {
    await gotoReady(page);
    const rssLink = page.locator('link[rel="alternate"][type="application/rss+xml"]');
    // RSS link is only in the built HTML, not in dev server
    const visible = await rssLink.isVisible().catch(() => false);
    if (!visible) {
      test.skip(true, 'RSS link not in dev server HTML — run npm run build first');
      return;
    }
    const href = await rssLink.getAttribute('href');
    expect(href).toContain('/rss/feed.xml');
  });

  test('RSS feed XML is served and valid', async ({ request }) => {
    // RSS is only generated during `npm run build`, not in dev server
    const res = await request.get('/rss/feed.xml');
    const text = await res.text();
    // Dev server returns index.html (SPA fallback) — skip if not real XML
    if (!text.includes('<?xml version="1.0"')) {
      test.skip(true, 'RSS feed not available in dev server — run npm run build first');
      return;
    }
    expect(res.status()).toBe(200);
    expect(text).toContain('<rss version="2.0"');
    expect(text).toContain('GrimoireStack');
    expect(text).toContain('<item>');
  });
});

// ── Community Signal ─────────────────────────────────
test.describe('Community Signal', () => {
  test('spell modal shows Did this help with thumbs', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spell-card').first().click();
    await expect(page.locator('.signal-section')).toBeVisible();
    await expect(page.locator('.signal-question')).toHaveText('Did this help?');
    await expect(page.locator('.signal-up')).toBeVisible();
    await expect(page.locator('.signal-down')).toBeVisible();
  });

  test('clicking thumbs up toggles active state', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spell-card').first().click();
    await page.locator('.signal-up').click();
    await expect(page.locator('.signal-up')).toHaveClass(/active/);
    // Click again to un-toggle
    await page.locator('.signal-up').click();
    await expect(page.locator('.signal-up')).not.toHaveClass(/active/);
  });

  test('clicking thumbs down toggles active state', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spell-card').first().click();
    await page.locator('.signal-down').click();
    await expect(page.locator('.signal-down')).toHaveClass(/active/);
  });

  test('signal persists in localStorage', async ({ page }) => {
    await gotoReady(page);
    await page.locator('.spell-card').first().click();
    await page.locator('.signal-up').click();
    const stored = await page.evaluate(() => localStorage.getItem('grimoire-signals'));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    const keys = Object.keys(parsed);
    expect(keys.length).toBeGreaterThan(0);
    expect(parsed[keys[0]]).toBe('up');
  });
});

// ── New hero-desc text ───────────────────────────────
test.describe('Updated copy', () => {
  test('hero description mentions new features', async ({ page }) => {
    await gotoReady(page);
    const hero = page.locator('.hero-desc');
    await expect(hero).toContainText('compare spells');
    await expect(hero).toContainText('spell web');
  });
});

// ── Tab navigation for new tabs ──────────────────────
test.describe('New tabs', () => {
  test('Index, Graph, Changelog tabs exist', async ({ page }) => {
    await gotoReady(page);
    await expect(page.locator('#tab-index')).toBeVisible();
    await expect(page.locator('#tab-graph')).toBeVisible();
    await expect(page.locator('#tab-changelog')).toBeVisible();
  });

  test('clicking each tab renders its section', async ({ page }) => {
    await gotoReady(page);

    await page.locator('#tab-index').click();
    await expect(page.locator('#school-index')).toBeVisible();

    await page.locator('#tab-graph').click();
    await expect(page.locator('#school-graph')).toBeVisible();

    await page.locator('#tab-changelog').click();
    await expect(page.locator('#school-changelog')).toBeVisible();
  });

  test('switching away from a special tab hides its section', async ({ page }) => {
    await gotoReady(page);
    await page.locator('#tab-index').click();
    await expect(page.locator('#school-index')).toBeVisible();
    // Click back to a school tab
    await page.locator('#tab-debugging').click();
    await expect(page.locator('#school-index')).not.toBeVisible();
  });
});
