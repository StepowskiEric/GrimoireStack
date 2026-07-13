/**
 * Static prerender step.
 * Reads the built dist/index.html shell and emits dist/s/<skill>/index.html
 * for every spell, with per-spell <title>, description, og:*, twitter:*, canonical.
 *
 * Run after `vite build`. Wire from `npm run build`.
 */

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import schools from '../src/data/schools.ts';
import { injectSpellMeta } from './prerender-helpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..');
const DIST = process.env.DIST_DIR || join(APP_ROOT, 'dist');
const ORIGIN = process.env.SITE_ORIGIN || 'https://grimoirestack.dev';

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const indexPath = join(DIST, 'index.html');
  if (!(await exists(indexPath))) {
    console.error(
      `[prerender] dist/index.html not found at ${indexPath}. Run \`vite build\` first.`,
    );
    process.exit(1);
  }
  const shell = await readFile(indexPath, 'utf8');

  let count = 0;
  for (const school of schools) {
    for (const spell of school.spells) {
      const outDir = join(DIST, 's', spell.skill);
      const outFile = join(outDir, 'index.html');
      const html = injectSpellMeta(shell, {
        name: spell.name,
        effect: spell.effect,
        skill: spell.skill,
        origin: ORIGIN,
      });
      await mkdir(outDir, { recursive: true });
      await writeFile(outFile, html, 'utf8');
      count += 1;
    }
  }
  console.log(`[prerender] wrote ${count} per-spell HTML files to ${DIST}/s/`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
