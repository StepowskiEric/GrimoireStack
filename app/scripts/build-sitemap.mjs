/**
 * Generate dist/sitemap.xml from the spell catalog.
 * Run after `vite build`. Wire from `npm run build`.
 */

import { writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import schools from '../src/data/schools.js';
import { buildSitemapXml } from './sitemap-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..');
const DIST = process.env.DIST_DIR || join(APP_ROOT, 'dist');
const ORIGIN = process.env.SITE_ORIGIN || 'https://grimoirestack.dev';

async function main() {
  const distDir = DIST;
  await stat(distDir).catch(() => {
    throw new Error(`[sitemap] dist/ not found at ${distDir}. Run \`vite build\` first.`);
  });

  const paths = schools.flatMap((s) => s.spells.map((sp) => `/s/${sp.skill}`));
  const xml = buildSitemapXml({ origin: ORIGIN, paths });
  await writeFile(join(distDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] wrote ${paths.length + 1} URLs to ${join(distDir, 'sitemap.xml')}`);
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
