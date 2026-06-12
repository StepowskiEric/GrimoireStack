import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const dev = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
let devOut = '';
dev.stdout.on('data', (d) => { devOut += d.toString(); });
dev.stderr.on('data', (d) => { devOut += d.toString(); });

for (let i = 0; i < 60; i++) {
  if (/Local:.*http/.test(devOut)) break;
  await wait(500);
}
const match2 = devOut.match(/http:\/\/localhost:\d+/);
const url = match2 ? match2[0] : 'http://localhost:5173';
console.log(`Dev server at ${url}`);

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then((c) => c.newPage());

const events = [];
page.on('console', (consoleMsg) => events.push(`[console.${consoleMsg.type()}] ${consoleMsg.text()}`));
page.on('pageerror', (e) => events.push(`[pageerror] ${e.name}: ${e.message}\n${e.stack || ''}`));
page.on('requestfailed', (r) => events.push(`[requestfailed] ${r.url()} — ${r.failure()?.errorText}`));

await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await wait(8000);

const dom = await page.evaluate(() => {
  const root = document.getElementById('root');
  return {
    title: document.title,
    rootHtml: (root?.innerHTML || '').slice(0, 1000),
    rootChildren: root?.children.length,
    bodyClasses: document.body.className,
    skipLinkExists: !!document.querySelector('.skip-link'),
    scriptCount: document.scripts.length,
    videoEl: !!document.querySelector('video'),
    h1Text: document.querySelector('h1')?.textContent,
  };
});
await page.screenshot({ path: 'diagnose-detailed.png', fullPage: false });

console.log('--- DOM ---');
console.log(JSON.stringify(dom, null, 2));
console.log('--- EVENTS (' + events.length + ') ---');
events.forEach((e) => console.log('  ' + e));

await browser.close();
dev.kill();
