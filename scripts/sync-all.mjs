#!/usr/bin/env node

/**
 * sync-all.mjs — One command to sync the repo's skills to the app.
 *
 * Usage:
 *   node scripts/sync-all.mjs          # sync everything
 *   node scripts/sync-all.mjs --dry    # preview changes without writing
 *
 * What it does:
 *   1. Discovers all skills in the repo
 *   2. Copies new skills to app/public/skills/ (for URL routing)
 *   3. Updates the README skill count
 *   4. Updates docs/skill-catalog.md
 *   5. Regenerates the registry (auto-populates schools + spellMetadata)
 *   6. Rebuilds the skill URL map (_map.json)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { REPO_ROOT, APP_DIR, PUBLIC_SKILLS, README, SKILL_CATALOG } from './lib/constants.mjs';
import { discoverSkills, getExistingSkillIds } from './lib/helpers.mjs';

const DRY_RUN = process.argv.includes('--dry');

function runInApp(scriptPath) {
  if (DRY_RUN) {
    console.log(`  [dry] Would run: node ${scriptPath}`);
    return;
  }
  execSync(`node ${scriptPath}`, { cwd: APP_DIR, stdio: 'inherit' });
}

// ─────────────────────────────────────────────
//  1. COPY NEW SKILLS
// ─────────────────────────────────────────────

async function copyNewSkills(newSkills) {
  let copied = 0;
  for (const skill of newSkills) {
    const destDir = path.join(PUBLIC_SKILLS, skill.relDir);
    if (!DRY_RUN) {
      await fs.mkdir(destDir, { recursive: true });
      await fs.copyFile(skill.src, path.join(destDir, 'SKILL.md'));
    }
    console.log(`  ${DRY_RUN ? '[dry] ' : ''}Copied ${skill.skillId} → public/skills/${skill.relDir}/`);
    copied++;
  }
  return copied;
}

// ─────────────────────────────────────────────
//  2. UPDATE README
// ─────────────────────────────────────────────

async function updateReadme(allSkills) {
  const content = await fs.readFile(README, 'utf8');
  const totalSkills = allSkills.length;

  // Find and update any "X skills" count in the intro
  const countMatch = content.match(/(\d+)\s+skills/i);
  if (!countMatch) return 0;

  if (!DRY_RUN) {
    const newContent = content.replace(
      new RegExp(`${countMatch[1]}\\s+skills`, 'i'),
      `${totalSkills} skills`
    );
    await fs.writeFile(README, newContent, 'utf8');
  }
  console.log(`  ${DRY_RUN ? '[dry] ' : ''}Updated README skill count → ${totalSkills}`);
  return 1;
}

// ─────────────────────────────────────────────
//  3. UPDATE SKILL CATALOG
// ─────────────────────────────────────────────

async function updateSkillCatalog(newSkills) {
  if (newSkills.length === 0) return 0;

  let content;
  try {
    content = await fs.readFile(SKILL_CATALOG, 'utf8');
  } catch {
    console.log('  skill-catalog.md not found, skipping');
    return 0;
  }

  // Group new skills by topic
  const byTopic = {};
  for (const skill of newSkills) {
    if (!byTopic[skill.topic]) byTopic[skill.topic] = [];
    byTopic[skill.topic].push(skill);
  }

  let updatedContent = content;
  let added = 0;

  for (const [topic, skills] of Object.entries(byTopic)) {
    const topicRegex = new RegExp(`## ${topic.replace(/-/g, '[- ]')}\\b`, 'i');
    const topicMatch = updatedContent.match(topicRegex);

    if (topicMatch) {
      const topicStart = updatedContent.indexOf(topicMatch[0]);
      const nextTopic = updatedContent.indexOf('\n## ', topicStart + topicMatch[0].length);
      const insertPos = nextTopic === -1 ? updatedContent.length : nextTopic;

      const newEntries = skills.map(skill => {
        const readableName = skill.skillId
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        return `- **${readableName}** — \`skill:'${skill.skillId}'\``;
      }).join('\n');

      if (!DRY_RUN) {
        updatedContent = updatedContent.slice(0, insertPos) +
          '\n' + newEntries + '\n' +
          updatedContent.slice(insertPos);
      }
      added += skills.length;
      console.log(`  ${DRY_RUN ? '[dry] ' : ''}Added ${skills.length} skills to catalog under "${topic}"`);
    }
  }

  if (!DRY_RUN && added > 0) {
    await fs.writeFile(SKILL_CATALOG, updatedContent, 'utf8');
  }
  return added;
}

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  GrimoireStack Sync');
  console.log(DRY_RUN ? '  (dry run — no files written)' : '');
  console.log('═══════════════════════════════════════\n');

  // 1. Discover
  console.log('1. Discovering skills...');
  const allSkills = await discoverSkills();
  console.log(`   Found ${allSkills.length} skills in repo\n`);

  // 2. Find new (skills in repo but not in public/skills/)
  console.log('2. Checking for new skills...');
  const existingIds = await getExistingSkillIds();
  const newSkills = allSkills.filter(s => !existingIds.includes(s.skillId));

  if (newSkills.length === 0) {
    console.log('   No new skills — proceeding to registry regen.\n');
  } else {
    console.log(`   Found ${newSkills.length} new skills: ${newSkills.map(s => s.skillId).join(', ')}\n`);

    // 3. Copy new skills to public/
    console.log('3. Copying new skills...');
    await copyNewSkills(newSkills);
    console.log();
  }

  // 4. README
  console.log(`${newSkills.length > 0 ? 4 : 3}. Updating README...`);
  await updateReadme(allSkills);
  console.log();

  // 5. Catalog
  console.log(`${newSkills.length > 0 ? 5 : 4}. Updating skill catalog...`);
  await updateSkillCatalog(newSkills);
  console.log();

  // 6. Regenerate registry (auto-populates schools[] + spellMetadata)
  const stepN = newSkills.length > 0 ? 6 : 5;
  console.log(`${stepN}. Regenerating registry...`);
  runInApp('scripts/generate-registry.mjs');
  console.log();

  // 7. Rebuild skill URL map
  console.log(`${stepN + 1}. Rebuilding skill URL map...`);
  runInApp('scripts/build-skill-map.mjs');

  console.log('\n═══════════════════════════════════════');
  console.log('  Done! All files synced.');
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
