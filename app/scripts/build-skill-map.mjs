/**
 * Generate public/skills/_map.json from the .md files on disk.
 *
 * Scans every *.md file under public/skills/, parses the YAML frontmatter
 * `name:` field, and writes a map of { skillId: "/skills/<category>/<path>" }.
 * Run as part of `npm run build` so the map always reflects the actual files.
 */

import { readdir, writeFile } from 'node:fs/promises';
import { join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SKILLS_DIR = join(__dirname, '..', 'public', 'skills');
const OUT = join(SKILLS_DIR, '_map.json');

/** Derive skill ID from the file path: directory name for SKILL.md, filename stem otherwise. */
function deriveSkillId(filePath) {
  const base = filePath.split(/[/\\]/).pop(); // e.g. "SKILL.md" or "debug-to-fix-pipeline.md"
  if (base === 'SKILL.md') {
    // Use the parent directory name
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 2];
  }
  // Strip .md extension from filename
  return base.replace(/\.md$/, '');
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.name.endsWith('.md') && entry.name !== '_map.json') {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const mdFiles = await walk(SKILLS_DIR);
  const map = {};

  for (const filePath of mdFiles) {
    // Always derive the key from the file path (directory or filename stem).
    // This ensures keys are consistent slugs, not arbitrary frontmatter text.
    const name = deriveSkillId(filePath);
    if (!name) continue;

    // Path relative to public/, using POSIX separators for browser URLs
    const rel = '/' + posix.join('skills', relative(SKILLS_DIR, filePath).split('\\').join('/'));
    map[name] = rel;
  }

  const sorted = Object.keys(map)
    .sort()
    .reduce((acc, key) => {
      acc[key] = map[key];
      return acc;
    }, {});

  await writeFile(OUT, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log(`[skill-map] wrote ${Object.keys(sorted).length} entries to ${OUT}`);
}

main().catch((err) => {
  console.error('[skill-map] failed:', err);
  process.exit(1);
});
