#!/usr/bin/env node

/**
 * skill.mjs — Add or remove skills from GrimoireStack.
 *
 * The filesystem is the single source of truth for which skills exist.
 * Adding a skill creates a SKILL.md in the right topic directory; the
 * registry generator picks it up automatically and writes the
 * schools/spellMetadata entries. No string surgery on data files.
 *
 * Usage:
 *   node scripts/skill.mjs add <skill-id> <topic> "<Display Name>" "[description]"
 *   node scripts/skill.mjs remove <skill-id>
 *
 * Examples:
 *   node scripts/skill.mjs add auth-pipeline-audit software-development "Auth Pipeline Audit" "Deep review of authentication flows"
 *   node scripts/skill.mjs remove test-automation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { REPO_ROOT, APP_DIR, PUBLIC_SKILLS } from './lib/constants.mjs';

const VALID_TOPICS = [
  'debugging', 'execution', 'judgment-and-routing', 'mcp-servers',
  'mlops', 'orchestration', 'output-quality', 'reasoning',
  'software-development', 'systems-and-architecture', 'testing', 'development',
];

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function runRegistryGenerator() {
  execSync('node scripts/generate-registry.mjs', {
    cwd: APP_DIR,
    stdio: 'inherit',
  });
}

function runSkillMapBuilder() {
  execSync('node scripts/build-skill-map.mjs', {
    cwd: APP_DIR,
    stdio: 'inherit',
  });
}

// ─────────────────────────────────────────────
//  ARGS
// ─────────────────────────────────────────────

const [subcommand, ...rest] = process.argv.slice(2);

if (!subcommand || !['add', 'remove'].includes(subcommand)) {
  console.log(`
Usage:
  node scripts/skill.mjs add <skill-id> <topic> "<Display Name>" "[description]"
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
display-name: ${displayName}
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
  console.log(`Created: ${topic}/${skillId}/SKILL.md\n`);

  // 2. Copy to public/skills/ (so the URL works without a rebuild)
  console.log('2. Copying to public/skills/...');
  const destDir = path.join(PUBLIC_SKILLS, topic, skillId);
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(skillFile, path.join(destDir, 'SKILL.md'));
  console.log(`Copied: public/skills/${topic}/${skillId}/\n`);

  // 3. Generate registry (auto-populates schools[] + spellMetadata)
  console.log('3. Generating registry...');
  runRegistryGenerator();
  console.log();

  // 4. Rebuild skill URL map
  console.log('4. Rebuilding skill URL map...');
  runSkillMapBuilder();
  console.log();

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
  if (!/^[a-z0-9-]+$/.test(skillId)) {
    console.error('Error: skill-id must be lowercase letters, numbers, and hyphens only');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════');
  console.log(`  Removing skill: ${skillId}`);
  console.log('═══════════════════════════════════════\n');

  // 1. Find and delete skill directory in the repo
  let found = false;
  for (const topic of VALID_TOPICS) {
    const skillDir = path.join(REPO_ROOT, topic, skillId);
    try {
      const stat = await fs.stat(skillDir);
      if (stat.isDirectory()) {
        await fs.rm(skillDir, { recursive: true, force: true });
        console.log(`Deleted: ${topic}/${skillId}/`);
        found = true;
        break;
      }
    } catch {}
  }
  if (!found) console.log(`  Skill directory for ${skillId} not found in repo\n`);

  // 2. Remove from public/skills/ (try all topics)
  let publicRemoved = false;
  for (const topic of VALID_TOPICS) {
    const publicDir = path.join(PUBLIC_SKILLS, topic, skillId);
    try {
      await fs.rm(publicDir, { recursive: true, force: true });
      console.log(`Deleted: public/skills/${topic}/${skillId}/`);
      publicRemoved = true;
    } catch {}
  }
  if (!publicRemoved) console.log('  No public copy found');
  console.log();

  // 3. Regenerate registry (auto-removes the skill from schools + spellMetadata)
  console.log('3. Regenerating registry...');
  runRegistryGenerator();
  console.log();

  // 4. Rebuild skill URL map
  console.log('4. Rebuilding skill URL map...');
  runSkillMapBuilder();
  console.log();

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
