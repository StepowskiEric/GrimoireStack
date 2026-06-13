#!/usr/bin/env node

/**
 * skill.mjs — Add or remove skills from GrimoireStack
 *
 * Usage:
 *   node scripts/skill.mjs add <skill-id> <topic> <display-name> [description]
 *   node scripts/skill.mjs remove <skill-id>
 *
 * Examples:
 *   node scripts/skill.mjs add critical-system-interrogation software-development "Critical System Interrogation" "Deep-dive investigation"
 *   node scripts/skill.mjs remove test-automation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REPO_ROOT, PUBLIC_SKILLS } from './lib/constants.mjs';
import {
  discoverSkills, getExistingSkillIds, findSkillDir, rebuildSkillMap,
  addSpellToSchools, removeSpellFromSchools,
  addToSpellMetadata, removeFromSpellMetadata, removeFromPublic,
} from './lib/helpers.mjs';

const VALID_TOPICS = [
  'debugging', 'execution', 'judgment-and-routing', 'mcp-servers',
  'mlops', 'orchestration', 'output-quality', 'reasoning',
  'software-development', 'systems-and-architecture', 'testing', 'development',
];

// ─────────────────────────────────────────────
//  ARGS
// ─────────────────────────────────────────────

const [subcommand, ...rest] = process.argv.slice(2);

if (!subcommand || !['add', 'remove'].includes(subcommand)) {
  console.log(`
Usage:
  node scripts/skill.mjs add <skill-id> <topic> <display-name> [description]
  node scripts/skill.mjs remove <skill-id>

Add example:
  node scripts/skill.mjs add auth-pipeline-audit software-development "Auth Pipeline Audit" "Deep review of authentication flows"

Remove example:
  node scripts/skill.mjs remove test-automation
`);
  process.exit(1);
}

// ─────────────────────────────────────────────
//  ADD
// ─────────────────────────────────────────────

async function addSkill(skillId, topic, displayName, description = '') {
  // Validate
  if (!/^[a-z0-9-]+$/.test(skillId)) {
    console.error('Error: skill-id must be lowercase letters, numbers, and hyphens only');
    process.exit(1);
  }
  if (!VALID_TOPICS.includes(topic)) {
    console.error(`Error: topic must be one of: ${VALID_TOPICS.join(', ')}`);
    process.exit(1);
  }

  console.log('═══════════════════════════════════════');
  console.log(`  Adding skill: ${skillId}`);
  console.log(`  Topic: ${topic}`);
  console.log(`  Name: ${displayName}`);
  console.log('═══════════════════════════════════════\n');

  // 1. Create skill file
  console.log('1. Creating skill file...');
  const skillDir = path.join(REPO_ROOT, topic, skillId);
  await fs.mkdir(skillDir, { recursive: true });

  const content = `---
name: ${skillId}
description: ${description || displayName}
---

# ${displayName}

${description ? `## Purpose\n\n${description}\n\n` : ''}## When to Use

<!-- Describe when this skill should be activated -->

## Instructions

<!-- Write the skill instructions here -->

## Examples

<!-- Add examples of the skill in action -->
`;

  const skillFile = path.join(skillDir, 'SKILL.md');
  await fs.writeFile(skillFile, content, 'utf8');
  console.log(`Created: ${topic}/${skillId}/SKILL.md`);
  console.log();

  // 2. Update schools.js
  console.log('2. Updating schools.js...');
  await addSpellToSchools(skillId, displayName, description);
  console.log();

  // 3. Update spellMetadata.js
  console.log('3. Updating spellMetadata.js...');
  await addToSpellMetadata(skillId, displayName);
  console.log();

  // 4. Copy to public
  console.log('4. Copying to public/skills/...');
  const destDir = path.join(PUBLIC_SKILLS, topic, skillId);
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(skillFile, path.join(destDir, 'SKILL.md'));
  console.log(`Copied: public/skills/${topic}/${skillId}/`);
  console.log();

  // 5. Rebuild skill map
  console.log('5. Rebuilding skill map...');
  await rebuildSkillMap();
  console.log();

  // Done
  console.log('═══════════════════════════════════════');
  console.log('  Done! Skill added successfully.');
  console.log('═══════════════════════════════════════\n');

  console.log('Next steps:');
  console.log(`  1. Edit: ${topic}/${skillId}/SKILL.md`);
  console.log(`  2. Run: cd app && npm run dev`);
  console.log(`  3. Preview: http://localhost:5173/s/${skillId}`);
  console.log(`  4. Commit: git add . && git commit -m "feat: add ${displayName} skill"`);
}

// ─────────────────────────────────────────────
//  REMOVE
// ─────────────────────────────────────────────

async function removeSkill(skillId) {
  console.log('═══════════════════════════════════════');
  console.log(`  Removing skill: ${skillId}`);
  console.log('═══════════════════════════════════════\n');

  // 1. Find and delete skill directory
  console.log('1. Finding skill directory...');
  const skillDir = await findSkillDir(skillId);
  if (skillDir) {
    await fs.rm(skillDir, { recursive: true, force: true });
    const rel = path.relative(REPO_ROOT, skillDir);
    console.log(`Deleted: ${rel}/`);
  } else {
    console.log(`  Skill directory for ${skillId} not found in repo`);
  }
  console.log();

  // 2. Remove from schools.js
  console.log('2. Removing from schools.js...');
  await removeSpellFromSchools(skillId);
  console.log();

  // 3. Remove from spellMetadata.js
  console.log('3. Removing from spellMetadata.js...');
  await removeFromSpellMetadata(skillId);
  console.log();

  // 4. Remove from public/skills/
  console.log('4. Removing from public/skills/...');
  await removeFromPublic(skillId);
  console.log();

  // 5. Rebuild skill map
  console.log('5. Rebuilding skill map...');
  await rebuildSkillMap();
  console.log();

  // Done
  console.log('═══════════════════════════════════════');
  console.log(`  Done! ${skillId} removed.`);
  console.log('═══════════════════════════════════════\n');

  console.log('Next steps:');
  console.log(`  1. Run: cd app && npm run dev`);
  console.log(`  2. Commit: git add . && git commit -m "chore: remove ${skillId} skill"`);
}

// ─────────────────────────────────────────────
//  DISPATCH
// ─────────────────────────────────────────────

if (subcommand === 'add') {
  const [skillId, topic, displayName, ...descParts] = rest;
  const description = descParts.join(' ');

  if (!skillId || !topic || !displayName) {
    console.error('Error: add requires <skill-id> <topic> <display-name>');
    process.exit(1);
  }

  addSkill(skillId, topic, displayName, description).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
} else if (subcommand === 'remove') {
  const [skillId] = rest;

  if (!skillId) {
    console.error('Error: remove requires <skill-id>');
    process.exit(1);
  }

  removeSkill(skillId).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
