import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173/gaze-preview';
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const OUT = new URL('../../specs/gaze-eye/assets/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const results = [];

async function frame(browser, { gaze, reduced, file }) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  // Suppress the onboarding welcome modal so it never covers the fixture.
  await context.addInitScript(() => {
    try { localStorage.setItem('grimoire-welcome-dismissed', 'true'); } catch {}
  });
  const page = await context.newPage();
  await page.goto(`${BASE}?gaze=${gaze}`, { waitUntil: 'networkidle' });
  // Wait for the eye fixture to mount.
  await page.waitForSelector('.gaze-preview__stage', { timeout: 10000 }).catch(() => {});
  // Give the void-incantations form (gaze>=0.8) a tick to render.
  await page.waitForTimeout(600);
  const present = await page.evaluate(() => !!document.querySelector('.void-incantations'));
  const labelText = await page.evaluate(() => {
    const el = document.querySelector('.void-incantations');
    return el ? (el.querySelector('label')?.textContent ?? '').trim() : null;
  });
  const animApplied = await page.evaluate(() => {
    const el = document.querySelector('.void-incantations');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return cs.animationName !== 'none' && cs.animationName !== '';
  });
  await page.screenshot({ path: OUT + file });
  await context.close();
  return { gaze, reduced, file, present, labelText, animApplied };
}

const browser = await chromium.launch({ executablePath: BRAVE, args: ['--no-sandbox'] });
try {
  results.push(await frame(browser, { gaze: 1.0, reduced: false, file: 'slice10-gaze1.0.png' }));
  results.push(await frame(browser, { gaze: 0.7, reduced: false, file: 'slice10-gaze0.7.png' }));
  results.push(await frame(browser, { gaze: 1.0, reduced: true, file: 'slice10-gaze1-reduced.png' }));
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
