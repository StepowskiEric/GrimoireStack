// Quick diagnostic: load the deployed page, capture console + network errors, and screenshot
import { chromium } from '@playwright/test';

const url = process.env.URL || 'https://c373f5ec.grimoirestack.pages.dev';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const consoleMsgs = [];
page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));

const networkFails = [];
page.on('requestfailed', (req) => networkFails.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`));

const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${e.name}: ${e.message}`));

console.log(`Visiting ${url} ...`);
const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
console.log(`HTTP status: ${resp?.status()}`);

// Wait a moment for splash to play or error
await page.waitForTimeout(3000);

const splashVisible = await page.evaluate(() => {
  const v = document.querySelector('video');
  const root = document.getElementById('root');
  return {
    hasVideo: !!v,
    videoReadyState: v?.readyState,
    videoError: v?.error ? `code ${v.error.code}: ${v.error.message}` : null,
    rootChildCount: root?.childElementCount ?? 0,
    rootText: (root?.textContent || '').slice(0, 200),
    bodyClass: document.body.className,
    title: document.title,
  };
});

await page.screenshot({ path: 'diagnose-splash.png', fullPage: false });

console.log('--- splash state ---');
console.log(JSON.stringify(splashVisible, null, 2));
console.log('--- console (' + consoleMsgs.length + ') ---');
consoleMsgs.forEach((m) => console.log('  ' + m));
console.log('--- network failures (' + networkFails.length + ') ---');
networkFails.forEach((m) => console.log('  ' + m));
console.log('--- page errors (' + pageErrors.length + ') ---');
pageErrors.forEach((m) => console.log('  ' + m));

await browser.close();
