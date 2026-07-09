import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const DIR = '../../specs/gaze-eye/assets/';
const A = resolve(import.meta.dirname, DIR + 'slice09-gaze1.png');
const B = resolve(import.meta.dirname, DIR + 'slice10-gaze1.0.png');
const ARED = resolve(import.meta.dirname, DIR + 'slice09-gaze1-reduced.png');
const BRED = resolve(import.meta.dirname, DIR + 'slice10-gaze1-reduced.png');
const CROP = resolve(import.meta.dirname, DIR + 'slice10-void-crop.png');

async function diffPair(page, aPath, bPath, region = null) {
  const aB64 = readFileSync(aPath).toString('base64');
  const bB64 = readFileSync(bPath).toString('base64');
  await page.setContent(
    `<img id="a" src="data:image/png;base64,${aB64}"><img id="b" src="data:image/png;base64,${bB64}">`
  );
  return page.evaluate(async (_cropRegion) => {
    const load = (id) => new Promise((res, rej) => {
      const img = document.getElementById(id);
      if (img.complete && img.naturalWidth) return res(img);
      img.onload = () => res(img);
      img.onerror = rej;
    });
    const imgA = await load('a');
    const imgB = await load('b');
    const full = {
      x: 0, y: 0,
      w: Math.min(imgA.naturalWidth, imgB.naturalWidth),
      h: Math.min(imgA.naturalHeight, imgB.naturalHeight),
    };
    const r = region || full;
    const cA = document.createElement('canvas'); cA.width = r.w; cA.height = r.h;
    const cB = document.createElement('canvas'); cB.width = r.w; cB.height = r.h;
    const ctxA = cA.getContext('2d'); const ctxB = cB.getContext('2d');
    ctxA.drawImage(imgA, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    ctxB.drawImage(imgB, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    const dA = ctxA.getImageData(0, 0, r.w, r.h).data;
    const dB = ctxB.getImageData(0, 0, r.w, r.h).data;
    let diff = 0;
    const total = r.w * r.h;
    for (let i = 0; i < dA.length; i += 4) {
      if (Math.abs(dA[i] - dB[i]) + Math.abs(dA[i + 1] - dB[i + 1]) + Math.abs(dA[i + 2] - dB[i + 2]) > 30) diff++;
    }
    return { region: r, diffPixels: diff, diffPct: +(100 * diff / total).toFixed(3) };
  }, region);
}

const BAND = { x: 0, y: 560, w: 1280, h: 240 };

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const animated = await diffPair(page, A, B);
const reduced = await diffPair(page, ARED, BRED);
const bandReduced = await diffPair(page, ARED, BRED, BAND);
await page.goto('file://' + B);
await page.screenshot({ path: CROP, clip: { x: 0, y: 600, width: 1280, height: 200 } });
await browser.close();
console.log(JSON.stringify({ animated, reduced, bandReduced }, null, 2));
console.log('crop:', CROP);
