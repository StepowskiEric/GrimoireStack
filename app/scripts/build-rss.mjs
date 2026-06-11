/**
 * Generate dist/rss/feed.xml — an RSS feed of recently updated spells.
 * Run after `vite build`. Wire from `npm run build`.
 */

import { writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import schools from '../src/data/schools.js';
import { getRecentlyUpdated } from '../src/data/spellMetadata.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..');
const DIST = process.env.DIST_DIR || join(APP_ROOT, 'dist');
const ORIGIN = process.env.SITE_ORIGIN || 'https://grimoirestack.dev';
const RSS_MAX_ITEMS = 30;

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRssXml(items) {
  const now = new Date().toUTCString();
  const base = String(ORIGIN).replace(/\/$/, '');

  const rssItems = items
    .map((e) => {
      const pubDate = e.lastUpdated
        ? new Date(e.lastUpdated + 'T12:00:00Z').toUTCString()
        : now;
      const link = `${escapeXml(base)}/s/${escapeXml(e.skill)}`;
      const desc = e.note
        ? `${escapeXml(e.spell?.effect || '')} — ${escapeXml(e.note)}`
        : escapeXml(e.spell?.effect || '');
      return `    <item>
      <title>${escapeXml(e.name)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(e.school?.name || '')}</category>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GrimoireStack — Recently Updated Incantations</title>
    <link>${escapeXml(base)}</link>
    <description>Recently inscribed and revised spells in the GrimoireStack catalog.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(base)}/rss/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;
}

function getSpell(skill) {
  for (const school of schools) {
    for (const sp of school.spells) {
      if (sp.skill === skill) return { spell: sp, school };
    }
  }
  return null;
}

async function main() {
  await stat(DIST).catch(() => {
    throw new Error(`[rss] dist/ not found at ${DIST}. Run \`vite build\` first.`);
  });

  const recent = getRecentlyUpdated(RSS_MAX_ITEMS);
  const items = recent.map((entry) => {
    const found = getSpell(entry.skill);
    return {
      ...entry,
      spell: found?.spell || null,
      school: found?.school || null,
    };
  });

  const xml = buildRssXml(items);

  const rssDir = join(DIST, 'rss');
  await mkdir(rssDir, { recursive: true });
  await writeFile(join(rssDir, 'feed.xml'), xml, 'utf8');
  console.log(`[rss] wrote ${items.length} items to ${join(rssDir, 'feed.xml')}`);
}

main().catch((err) => {
  console.error('[rss] failed:', err);
  process.exit(1);
});
