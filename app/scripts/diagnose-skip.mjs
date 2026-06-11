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
const m = devOut.match(/http:\/\/localhost:\d+/);
const url = m ? m[0] : 'http://localhost:5173';

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then((c) => c.newPage());

page.on('pageerror', (e) => console.log('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'load' });
await wait(2000);

// Inspect all buttons on the page
const buttons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button')).map((b) => ({
    text: (b.textContent || '').trim().slice(0, 80),
    visible: b.offsetParent !== null,
    disabled: b.disabled,
    rect: b.getBoundingClientRect().toJSON(),
  }));
});
console.log('--- BUTTONS (' + buttons.length + ') ---');
console.log(JSON.stringify(buttons, null, 2));

// Try to click the skip button
const skip = page.getByRole('button', { name: /skip intro/i });
const skipCount = await skip.count();
console.log('Skip button count:', skipCount);
if (skipCount > 0) {
  await skip.click({ timeout: 2000 }).catch((e) => console.log('click error:', e.message));
  await wait(2000);
  const h1 = await page.locator('h1').count();
  const h1Text = await page.locator('h1').first().textContent().catch(() => null);
  console.log('h1 count after click:', h1, 'text:', h1Text);
} else {
  // Print all roles for debugging
  const allRoles = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach((el) => {
      if (el.tagName === 'BUTTON' || el.getAttribute('role')) {
        out.push({ tag: el.tagName, role: el.getAttribute('role'), text: (el.textContent || '').slice(0, 50) });
      }
    });
    return out;
  });
  console.log('--- all role-bearing elements ---');
  console.log(JSON.stringify(allRoles, null, 2));
}

await browser.close();
dev.kill();
