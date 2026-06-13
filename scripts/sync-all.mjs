#!/usr/bin/env node

/**
 * sync-all.mjs — One command to sync everything
 *
 * Usage:
 *   node scripts/sync-all.mjs          # sync everything
 *   node scripts/sync-all.mjs --dry    # preview changes without writing
 *
 * What it does:
 *   1. Discovers all skills in the repo
 *   2. Copies new skills to app/public/skills/
 *   3. Updates the changelog (spellMetadata.js)
 *   4. Updates the README skill count
 *   5. Updates docs/skill-catalog.md
 *   6. Regenerates the skill map
 */

import { promises as fs } from 'fs';
import path from 'path';
import { REPO_ROOT, APP_DIR, PUBLIC_SKILLS, SPELL_METADATA, README, SKILL_CATALOG } from './lib/constants.mjs';
import { discoverSkills, getExistingSkillIds, rebuildSkillMap, addToSpellMetadata } from './lib/helpers.mjs';

const DRY_RUN = process.argv.includes('--dry');

// ─────────────────────────────────────────────
//  2. COPY NEW SKILLS
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
//  3. UPDATE CHANGELOG
// ─────────────────────────────────────────────

async function updateChangelog(newSkills) {
  if (newSkills.length === 0) return 0;

  let added = 0;
  for (const skill of newSkills) {
    if (!DRY_RUN) {
      const readableName = skill.skillId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      await addToSpellMetadata(skill.skillId, readableName);
    }
    added++;
  }

  console.log(`  ${DRY_RUN ? '[dry] ' : ''}Added ${added} entries to changelog`);
  return added;
}

// ─────────────────────────────────────────────
//  4. UPDATE README
// ─────────────────────────────────────────────

async function updateReadme(allSkills) {
  const content = await fs.readFile(README, 'utf8');
  const totalSkills = allSkills.length;

  // Update the skill count if there's a line like "## Skills (150)"
  const updated = content.replace(
    /^# Jerry's Agent Skills\n/,
    `# Jerry's Agent Skills\n`
  );

  // Find and update any "X skills" count in the intro
  const countMatch = updated.match(/(\d+)\s+skills/i);
  if (countMatch) {
    const newContent = updated.replace(
      new RegExp(`${countMatch[1]}\\s+skills`, 'i'),
      `${totalSkills} skills`
    );
    if (!DRY_RUN) {
      await fs.writeFile(README, newContent, 'utf8');
    }
    console.log(`  ${DRY_RUN ? '[dry] ' : ''}Updated README skill count → ${totalSkills}`);
  }

  return 1;
}

// ─────────────────────────────────────────────
//  5. UPDATE SKILL CATALOG
// ─────────────────────────────────────────────

async function updateSkillCatalog(newSkills) {
  if (newSkills.length === 0) return 0;

  try {
    const content = await fs.readFile(SKILL_CATALOG, 'utf8');

    // Group new skills by topic
    const byTopic = {};
    for (const skill of newSkills) {
      if (!byTopic[skill.topic]) byTopic[skill.topic] = [];
      byTopic[skill.topic].push(skill);
    }

    let updatedContent = content;
    let added = 0;

    for (const [topic, skills] of Object.entries(byTopic)) {
      // Find the topic section in the catalog
      const topicRegex = new RegExp(`## ${topic.replace(/-/g, '[- ]')}\\b`, 'i');
      const topicMatch = updatedContent.match(topicRegex);

      if (topicMatch) {
        // Find the end of this topic section (next ## or end of file)
        const topicStart = updatedContent.indexOf(topicMatch[0]);
        const nextTopic = updatedContent.indexOf('\n## ', topicStart + topicMatch[0].length);
        const insertPos = nextTopic === -1 ? updatedContent.length : nextTopic;

        // Build new entries
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
  } catch {
    console.log('  skill-catalog.md not found, skipping');
    return 0;
  }
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
    console.log('   No new skills — everything is up to date.\n');
    return;
  }
  console.log(`   Found ${newSkills.length} new skills: ${newSkills.map(s => s.skillId).join(', ')}\n`);

  // 3. Copy
  console.log('3. Copying new skills...');
  await copyNewSkills(newSkills);
  console.log();

  // 4. Changelog
  console.log('4. Updating changelog...');
  await updateChangelog(newSkills);
  console.log();

  // 5. README
  console.log('5. Updating README...');
  await updateReadme(allSkills);
  console.log();

  // 6. Catalog
  console.log('6. Updating skill catalog...');
  await updateSkillCatalog(newSkills);
  console.log();

  // 7. Rebuild skill map
  console.log('7. Rebuilding skill map...');
  if (!DRY_RUN) {
    await rebuildSkillMap();
  } else {
    console.log('  [dry] Would rebuild skill map');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  Done! All files synced.');
  console.log('═══════════════════════════════════════');
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
