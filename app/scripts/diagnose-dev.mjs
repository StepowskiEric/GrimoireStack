// Run the dev server, load it with Playwright, capture the actual unminified error
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const dev = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
let devOut = '';
dev.stdout.on('data', (d) => { devOut += d.toString(); });
dev.stderr.on('data', (d) => { devOut += d.toString(); });

// Wait for Vite to be ready
for (let i = 0; i < 60; i++) {
  if (/Local:.*http/.test(devOut)) break;
  await wait(500);
}
const m = devOut.match(/http:\/\/localhost:\d+/);
const url = m ? m[0] : 'http://localhost:5173';
console.log(`Dev server at ${url}`);

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then((c) => c.newPage());

const consoleMsgs = [];
page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${e.name}: ${e.message}\n${e.stack || ''}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

const renderState = await page.evaluate(() => {
  const root = document.getElementById('root');
  return {
    rootChildCount: root?.childElementCount ?? 0,
    rootText: (root?.textContent || '').slice(0, 300),
    hasH1: !!document.querySelector('h1'),
    h1Text: document.querySelector('h1')?.textContent || null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
});
await page.screenshot({ path: 'diagnose-splash.png' });

console.log('--- render state ---');
console.log(JSON.stringify(renderState, null, 2));
console.log('--- console (' + consoleMsgs.length + ') ---');
consoleMsgs.slice(0, 20).forEach((m) => console.log('  ' + m));
console.log('--- page errors (' + pageErrors.length + ') ---');
pageErrors.slice(0, 3).forEach((m) => console.log('  ' + m));

await browser.close();
dev.kill();
