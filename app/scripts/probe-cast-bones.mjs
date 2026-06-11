// Specter probe: reproduce the walk's exact sequence up to the cast-bones click,
// then dump everything about the button and the click target.
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { chromium } from '@playwright/test';

let baseUrl = process.env.BASE_URL;
let dev;
if (!baseUrl) {
  dev = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
  let out = '';
  dev.stdout.on('data', (d) => { out += d.toString(); });
  dev.stderr.on('data', (d) => { out += d.toString(); });
  for (let i = 0; i < 60; i++) {
    if (/Local:.*http/.test(out)) break;
    await wait(500);
  }
  baseUrl = (out.match(/http:\/\/localhost:\d+/) || ['http://localhost:5173'])[0];
}

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then((c) => c.newPage());
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

await page.goto(baseUrl + '/', { waitUntil: 'load' });
await page.getByRole('button', { name: /skip intro/i }).click();
await page.locator('h1', { hasText: 'GrimoireStack' }).waitFor();

// Dismiss welcome if up
const skipRite = page.getByRole('button', { name: /skip rite/i });
if (await skipRite.isVisible({ timeout: 1500 }).catch(() => false)) {
  await skipRite.click();
  await page.locator('.welcome-modal').waitFor({ state: 'hidden' });
}

// Reproduce the toggle sequence
await page.getByRole('button', { name: /switch to plain english/i }).click();
await page.locator('.subtitle').filter({ hasText: 'A collection of reusable AI agent skills' }).waitFor();
await page.getByRole('button', { name: /switch to themed/i }).click();
await page.locator('.subtitle').filter({ hasText: "Warlock's Tome" }).waitFor();

// Now snapshot the cast-bones button
const probe = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(
    (b) => /cast the bones/i.test(b.textContent || '')
  );
  if (!btn) return { found: false };
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const topEl = document.elementFromPoint(cx, cy);
  return {
    found: true,
    text: btn.textContent.trim(),
    visible: rect.width > 0 && rect.height > 0,
    rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
    inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
    disabled: btn.disabled,
    ariaHidden: btn.getAttribute('aria-hidden'),
    ariaLabel: btn.getAttribute('aria-label'),
    topElAtCenter: topEl ? { tag: topEl.tagName, cls: topEl.className, text: (topEl.textContent || '').slice(0, 60) } : null,
    isTopEl: topEl === btn || btn.contains(topEl),
    bodyScroll: { x: window.scrollX, y: window.scrollY },
    modalOverlays: document.querySelectorAll('.modal-overlay').length,
    scrollY: window.scrollY,
    docHeight: document.documentElement.scrollHeight,
    viewport: { w: window.innerWidth, h: window.innerHeight },
  };
});
console.log('--- PROBE ---');
console.log(JSON.stringify(probe, null, 2));

// Attempt the click ourselves with force+short timeout to see exact error
const btn = page.getByRole('button', { name: /cast the bones/i });
console.log('locator count:', await btn.count());
try {
  await btn.click({ timeout: 5000, trial: true });
  console.log('trial click: OK');
} catch (e) {
  console.log('trial click failed:', e.message.split('\n')[0]);
}
try {
  await btn.click({ timeout: 5000 });
  console.log('real click: OK');
} catch (e) {
  console.log('real click failed:', e.message.split('\n')[0]);
}

await page.screenshot({ path: 'probe-cast-bones.png' });
await browser.close();
if (dev) dev.kill();
