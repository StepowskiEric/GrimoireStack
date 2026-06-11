// Full app walk — loads the site, dismisses the splash, walks through every
// new feature, and reports pass/fail. Output is a single human-readable summary
// so we can spot what's broken at a glance.
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { chromium } from '@playwright/test';

let baseUrl = process.env.BASE_URL;
let dev;
if (!baseUrl) {
  dev = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
  let devOut = '';
  dev.stdout.on('data', (d) => { devOut += d.toString(); });
  dev.stderr.on('data', (d) => { devOut += d.toString(); });
  for (let i = 0; i < 60; i++) {
    if (/Local:.*http/.test(devOut)) break;
    await wait(500);
  }
  const m = devOut.match(/http:\/\/localhost:\d+/);
  baseUrl = m ? m[0] : 'http://localhost:5173';
}
console.log(`Walking ${baseUrl}\n`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const results = [];
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(`${e.name}: ${e.message}`));

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok ? '✓' : '✗';
  console.log(`  ${mark} ${name}${detail ? ' — ' + detail : ''}`);
}

async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    record(name, false, e.message.split('\n')[0]);
  }
}

console.log('1. Splash + main UI');
await step('page loads with HTTP 200', async () => {
  const resp = await page.goto(baseUrl + '/', { waitUntil: 'load' });
  if (!resp || resp.status() !== 200) throw new Error('status ' + resp?.status());
  record('page loads with HTTP 200', true);
});
await step('Skip Intro button visible', async () => {
  const skip = page.getByRole('button', { name: /skip intro/i });
  await skip.waitFor({ state: 'visible', timeout: 5000 });
  record('Skip Intro button visible', true);
});
await step('Click Skip Intro → h1 appears', async () => {
  await page.getByRole('button', { name: /skip intro/i }).click();
  await page.locator('h1', { hasText: 'GrimoireStack' }).waitFor({ timeout: 5000 });
  record('Click Skip Intro → h1 appears', true);
});
await step('Dismiss ApprenticeWelcome if present', async () => {
  const skip = page.getByRole('button', { name: /skip rite/i });
  if (await skip.isVisible({ timeout: 1500 }).catch(() => false)) {
    await skip.click();
    await page.locator('.welcome-modal').waitFor({ state: 'hidden', timeout: 3000 });
  }
  record('Dismiss ApprenticeWelcome if present', true);
});

console.log('\n2. Hero + library');
await step('Hero subtitle visible', async () => {
  await page.locator('.subtitle').waitFor({ state: 'visible' });
  record('Hero subtitle visible', true);
});
await step("Librarian's Ledger visible", async () => {
  await page.locator('.ledger-wrapper').waitFor({ state: 'visible' });
  record("Librarian's Ledger visible", true);
});
await step('Scrying orb visible', async () => {
  await page.locator('.scrying-orb').waitFor({ state: 'visible' });
  record('Scrying orb visible', true);
});
await step('Filter chips visible (school row)', async () => {
  await page.locator('.filter-chips .filter-row').first().waitFor({ state: 'visible' });
  record('Filter chips visible (school row)', true);
});

console.log('\n3. Language toggle');
await step('Toggle to plain updates subtitle', async () => {
  await page.getByRole('button', { name: /switch to plain english/i }).click();
  await page.locator('.subtitle').filter({ hasText: 'A collection of reusable AI agent skills' }).waitFor();
  record('Toggle to plain updates subtitle', true);
  // toggle back
  await page.getByRole('button', { name: /switch to themed/i }).click();
  await page.locator('.subtitle').filter({ hasText: "Warlock's Tome" }).waitFor();
});

console.log('\n4. Cast the bones');
await step('Cast the bones opens a modal', async () => {
  await page.getByRole('button', { name: /cast the bones/i }).click();
  await page.locator('.modal-wide').waitFor({ state: 'visible', timeout: 5000 });
  record('Cast the bones opens a modal', true);
  await page.keyboard.press('Escape');
  await page.locator('.modal-wide').waitFor({ state: 'hidden', timeout: 5000 });
});

console.log('\n5. Spell modal');
await step('Click first spell card opens modal', async () => {
  await page.locator('.spell-card').first().click();
  await page.locator('.modal-wide').waitFor({ state: 'visible' });
  record('Click first spell card opens modal', true);
});
await step('Modal shows Share + Inscribe + Marginalia', async () => {
  const share = await page.locator('.modal-share').count();
  const inscribe = await page.locator('.modal-inscribe').count();
  const marginalia = await page.locator('.marginalia-textarea').count();
  if (share < 1 || inscribe < 1 || marginalia < 1) {
    throw new Error(`share=${share} inscribe=${inscribe} marginalia=${marginalia}`);
  }
  record('Modal shows Share + Inscribe + Marginalia', true);
});
await step('Marginalia textarea accepts text', async () => {
  const ta = page.locator('.marginalia-textarea');
  await ta.fill('Walk-test note');
  await wait(500);
  const stored = await page.evaluate(() => localStorage.getItem('grimoire-marginalia'));
  if (!stored || !stored.includes('Walk-test note')) throw new Error('not persisted');
  record('Marginalia textarea accepts text', true);
});
await step('URL updates to /s/<skill>', async () => {
  const url = page.url();
  if (!/\/s\/[\w.-]+$/.test(url)) throw new Error('url=' + url);
  record('URL updates to /s/<skill>', true, url);
});
await step('Close modal with Escape', async () => {
  await page.keyboard.press('Escape');
  await page.locator('.modal-wide').waitFor({ state: 'hidden' });
  record('Close modal with Escape', true);
});

console.log('\n6. Recently cast (Summoning Circle)');
await step('Open Summoning Circle, see Recently Cast tab', async () => {
  await page.locator('.circle-toggle').click();
  await page.locator('.circle-panel').waitFor({ state: 'visible' });
  const tab = page.getByRole('tab', { name: /recently cast/i });
  if ((await tab.count()) < 1) throw new Error('tab missing');
  record('Open Summoning Circle, see Recently Cast tab', true);
  // close panel
  await page.locator('.circle-close').click();
});

console.log('\n7. Keyboard shortcuts');
await step('? opens the cheatsheet', async () => {
  await page.keyboard.press('?');
  await page.locator('.shortcuts-modal').waitFor({ state: 'visible' });
  record('? opens the cheatsheet', true);
  await page.keyboard.press('Escape');
  await page.locator('.shortcuts-modal').waitFor({ state: 'hidden' });
});
await step('/ focuses the search input', async () => {
  await page.keyboard.press('/');
  await wait(200);
  const id = await page.evaluate(() => document.activeElement?.id);
  if (id !== 'searchInput') throw new Error('focused=' + id);
  record('/ focuses the search input', true);
});

console.log('\n8. Stale-link banner');
await step('Visiting unknown /s/<x> shows not-found banner', async () => {
  await page.goto(baseUrl + '/s/totally-unknown-skill', { waitUntil: 'load' });
  await page.locator('.notfound-banner').waitFor({ state: 'visible', timeout: 5000 });
  record('Visiting unknown /s/<x> shows not-found banner', true);
});

console.log('\n9. PWA / SEO assets (request only, no browser)');
const apiCtx = await browser.newContext();
for (const path of ['/manifest.webmanifest', '/robots.txt', '/sitemap.xml']) {
  await step(`${path} returns 200`, async () => {
    const res = await apiCtx.request.get(baseUrl + path);
    if (res.status() !== 200) throw new Error('status ' + res.status());
    record(`${path} returns 200`, true);
  });
}

await browser.close();
if (dev) dev.kill();

console.log('\n=== Summary ===');
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`Passed: ${passed} / ${results.length}`);
if (failed > 0) {
  console.log('Failed:');
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
}
console.log(`Console errors: ${consoleErrors.length}`);
consoleErrors.forEach((e) => console.log('  ' + e));
console.log(`Page errors: ${pageErrors.length}`);
pageErrors.forEach((e) => console.log('  ' + e));

process.exit(failed > 0 || pageErrors.length > 0 ? 1 : 0);
