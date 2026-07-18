/**
 * Shared helpers for GrimoireStack skill scripts.
 *
 * These helpers focus on filesystem discovery and lookup. The data
 * files (schoolsRegistry.js, spellMetadata.js) are now auto-generated
 * by app/scripts/generate-registry.mjs, so we no longer need any
 * string-surgery helpers for them.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { PUBLIC_SKILLS, SCAN_DIRS } from './constants.mjs';

/**
 * Discover all skills in the repo by scanning SCAN_DIRS.
 * Returns an array of { skillId, src, relDir, topic }.
 */
export async function discoverSkills() {
  const results = [];
  for (const scanDir of SCAN_DIRS) {
    const rootPath = path.join(PUBLIC_SKILLS, scanDir);
    let entries;
    try {
      entries = await fs.readdir(rootPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue;
      const fullPath = path.join(rootPath, ent.name);
      if (ent.isDirectory()) {
        const skillMd = path.join(fullPath, 'SKILL.md');
        let hasSkillMd = false;
        try {
          await fs.access(skillMd);
          hasSkillMd = true;
          results.push({
            skillId: ent.name,
            src: skillMd,
            relDir: `${scanDir}/${ent.name}`,
            topic: scanDir,
          });
        } catch {}
        if (!hasSkillMd) {
          // Scan one level deeper for nested skills when parent lacks SKILL.md
          const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
          for (const sub of subEntries) {
            if (sub.isDirectory()) {
              const subSkillMd = path.join(fullPath, sub.name, 'SKILL.md');
              try {
                await fs.access(subSkillMd);
                results.push({
                  skillId: sub.name,
                  src: subSkillMd,
                  relDir: `${scanDir}/${ent.name}/${sub.name}`,
                  topic: scanDir,
                });
              } catch {}
            } else if (sub.name.endsWith('.md') && sub.name !== 'README.md') {
              const skillId = sub.name.replace(/\.md$/, '');
              results.push({
                skillId,
                src: path.join(fullPath, sub.name),
                relDir: `${scanDir}/${ent.name}`,
                topic: scanDir,
              });
            }
          }
        }
        // Always scan subdirectories for nested skills
        const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isDirectory()) {
            const subSkillMd = path.join(fullPath, sub.name, 'SKILL.md');
            try {
              await fs.access(subSkillMd);
              // Avoid duplicate if already added above
              const already = results.some(r => r.src === subSkillMd);
              if (!already) {
                results.push({
                  skillId: sub.name,
                  src: subSkillMd,
                  relDir: `${scanDir}/${ent.name}/${sub.name}`,
                  topic: scanDir,
                });
              }
            } catch {}
          }
        }
      } else if (ent.name.endsWith('.md') && ent.name !== 'README.md') {
        const skillId = ent.name.replace(/\.md$/, '');
        results.push({
          skillId,
          src: fullPath,
          relDir: scanDir,
          topic: scanDir,
        });
      }
    }
  }
  return results;
}

/**
 * Get skill IDs from the existing _map.json.
 */
export async function getExistingSkillIds() {
  try {
    const mapFile = path.join(PUBLIC_SKILLS, '_map.json');
    const content = await fs.readFile(mapFile, 'utf8');
    return Object.keys(JSON.parse(content));
  } catch {
    return [];
  }
}
