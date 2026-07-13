/**
 * index.mjs — Orchestrate registry generation.
 *
 * Steps:
 *   1. Discover skills in the filesystem (reuses scripts/lib/helpers.mjs)
 *   2. Parse frontmatter and derive display name / effect / lastUpdated
 *   3. Emit app/src/data/schoolsRegistry.js
 *   4. Emit app/src/data/spellMetadata.js (data only)
 *
 * Reads:  repo skills/
 * Writes: app/src/data/schoolsRegistry.js, app/src/data/spellMetadata.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { APP_DIR, REPO_ROOT } from '../../../scripts/lib/constants.mjs';
import { discoverSkills } from '../../../scripts/lib/helpers.mjs';
import { deriveDisplayName, deriveEffect, fileMtime, isoDate } from './derive.mjs';
import { buildExplicit, renderMetadataSource } from './emit-metadata.mjs';
import { buildSchools, renderSchoolsSource } from './emit-schools.mjs';
import { parseFrontmatter } from './frontmatter.mjs';

const SCHOOLS_REGISTRY = path.join(APP_DIR, 'src', 'data', 'schoolsRegistry.js');
const SPELL_METADATA = path.join(APP_DIR, 'src', 'data', 'spellMetadata.js');

async function main() {
  const discovered = await discoverSkills();
  const records = await parseAll(discovered);
  const deduped = dedupRecords(records);

  await Promise.all([writeSchools(deduped), writeMetadata(deduped)]);
  console.log(
    `[registry] wrote ${deduped.length} skills across ${new Set(deduped.map((r) => r.topic)).size} topics`,
  );
}

/**
 * Deduplicate records by skill id, keeping the entry with the
 * most recent lastUpdated timestamp. This handles the case where
 * a skill exists in multiple locations (e.g., both a flat .md
 * file and a directory-based SKILL.md after a partial migration).
 */
function dedupRecords(records) {
  const bySkill = new Map();
  for (const r of records) {
    const existing = bySkill.get(r.skill);
    if (!existing || r.lastUpdated > existing.lastUpdated) {
      bySkill.set(r.skill, r);
    }
  }
  return [...bySkill.values()];
}

async function parseAll(discovered) {
  return Promise.all(discovered.map((s) => parseOne(s)));
}

async function parseOne(s) {
  const [content, mtime] = await Promise.all([fs.readFile(s.src, 'utf8'), fileMtime(s.src)]);
  const { meta, body, hasFrontmatter } = parseFrontmatter(content);
  return {
    skill: s.skillId,
    topic: s.topic,
    name: deriveDisplayName(meta, s.skillId, body),
    effect: deriveEffect(meta, body, hasFrontmatter),
    status: meta.status || '—',
    note: meta.note || null,
    combos: Array.isArray(meta.combos) ? meta.combos : null,
    lastUpdated: meta['last-updated'] || isoDate(mtime),
  };
}

async function writeSchools(records) {
  const schools = buildSchools(records);
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

main().catch((err) => {
  console.error('[registry] failed:', err);
  process.exit(1);
});
