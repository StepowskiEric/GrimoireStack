/**
 * index.mjs — Orchestrate registry generation.
 *
 * Steps:
 *   1. Discover skills in the filesystem (reuses scripts/lib/helpers.mjs)
 *   2. Load the hand-maintained curated overlay (displayName/status/note/combos)
 *   3. Parse frontmatter and derive display name / effect / lastUpdated
 *   4. Emit app/src/data/schoolsRegistry.js
 *   5. Emit app/src/data/spellMetadata.js (data only)
 *
 * Reads:  repo skills/, app/src/data/curatedOverlay.js
 * Writes: app/src/data/schoolsRegistry.js, app/src/data/spellMetadata.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { REPO_ROOT, APP_DIR } from '../../../scripts/lib/constants.mjs';
import { discoverSkills } from '../../../scripts/lib/helpers.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { deriveDisplayName, deriveEffect, fileMtime, isoDate } from './derive.mjs';
import { buildSchools, renderSchoolsSource } from './emit-schools.mjs';
import { buildExplicit, renderMetadataSource } from './emit-metadata.mjs';

const SCHOOLS_REGISTRY = path.join(APP_DIR, 'src', 'data', 'schoolsRegistry.js');
const SPELL_METADATA = path.join(APP_DIR, 'src', 'data', 'spellMetadata.js');
const CURATED_OVERLAY = path.join(APP_DIR, 'src', 'data', 'curatedOverlay.js');

async function main() {
  const [discovered, overlay] = await Promise.all([
    discoverSkills(),
    loadOverlay(),
  ]);
  const records = await parseAll(discovered, overlay);

  await Promise.all([
    writeSchools(records, overlay),
    writeMetadata(records),
  ]);
  console.log(`[registry] wrote ${records.length} skills across ${new Set(records.map(r => r.topic)).size} topics`);
}

async function loadOverlay() {
  try {
    const url = new URL(`file://${CURATED_OVERLAY}`);
    const mod = await import(url.href);
    return {
      spells: mod.CURATED_OVERLAY || {},
      schools: mod.CURATED_SCHOOLS || {},
    };
  } catch (err) {
    console.warn(`[registry] no curated overlay (${err.message}); using built-in defaults`);
    return { spells: {}, schools: {} };
  }
}

async function parseAll(discovered, overlay) {
  return Promise.all(discovered.map(s => parseOne(s, overlay)));
}

async function parseOne(s, overlay) {
  const [content, mtime] = await Promise.all([
    fs.readFile(s.src, 'utf8'),
    fileMtime(s.src),
  ]);
  const { meta, body, hasFrontmatter } = parseFrontmatter(content);
  const curated = overlay.spells[s.skillId] || {};
  return {
    skill: s.skillId,
    topic: s.topic,
    name: curated.displayName || deriveDisplayName(meta, s.skillId, body),
    effect: deriveEffect(meta, body, hasFrontmatter),
    status: curated.status || meta.status || '—',
    note: curated.note || meta.note || null,
    combos: curated.combos || (Array.isArray(meta.combos) ? meta.combos : null),
    lastUpdated: meta['last-updated'] || isoDate(mtime),
  };
}

async function writeSchools(records, overlay) {
  const schools = buildSchools(records, overlay);
  const source = renderSchoolsSource(schools);
  await fs.writeFile(SCHOOLS_REGISTRY, source, 'utf8');
  const rel = path.relative(REPO_ROOT, SCHOOLS_REGISTRY);
  console.log(`[registry] wrote ${schools.length} schools, ${records.length} spells to ${rel}`);
}

async function writeMetadata(records) {
  const explicit = buildExplicit(records);
  const source = renderMetadataSource(explicit);
  await fs.writeFile(SPELL_METADATA, source, 'utf8');
  const rel = path.relative(REPO_ROOT, SPELL_METADATA);
  console.log(`[registry] wrote ${Object.keys(explicit).length} metadata entries to ${rel}`);
}

main().catch(err => {
  console.error('[registry] failed:', err);
  process.exit(1);
});
