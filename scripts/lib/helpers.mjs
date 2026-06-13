/**
 * Shared helpers for GrimoireStack skill scripts.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { REPO_ROOT, PUBLIC_SKILLS, SCHOOLS_JS, SPELL_METADATA, SCAN_DIRS } from './constants.mjs';

/**
 * Discover all skills in the repo by scanning SCAN_DIRS.
 * Returns an array of { skillId, src, relDir, topic }.
 */
export async function discoverSkills() {
  const results = [];
  for (const scanDir of SCAN_DIRS) {
    const rootPath = path.join(REPO_ROOT, scanDir);
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
        try {
          await fs.access(skillMd);
          results.push({
            skillId: ent.name,
            src: skillMd,
            relDir: `${scanDir}/${ent.name}`,
            topic: scanDir,
          });
        } catch {
          // Scan one level deeper
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

/**
 * Find a skill directory in the repo by skill ID.
 * Returns the absolute path or null.
 */
export async function findSkillDir(skillId) {
  for (const scanDir of SCAN_DIRS) {
    const rootPath = path.join(REPO_ROOT, scanDir);
    let entries;
    try {
      entries = await fs.readdir(rootPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (ent.name === skillId) {
        return path.join(rootPath, ent.name);
      }
      // Check one level deeper
      const subPath = path.join(rootPath, ent.name);
      try {
        const subEntries = await fs.readdir(subPath, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isDirectory() && sub.name === skillId) {
            return path.join(subPath, sub.name);
          }
        }
      } catch {}
    }
  }
  return null;
}

/**
 * Rebuild the skill map by running build-skill-map.mjs.
 */
export async function rebuildSkillMap() {
  const { execSync } = await import('child_process');
  const APP_DIR = path.join(REPO_ROOT, 'app');
  execSync('node scripts/build-skill-map.mjs', { cwd: APP_DIR, stdio: 'inherit' });
  console.log(`Rebuilt: skill map`);
}

/**
 * Read schools.js and return the parsed schools array and WIZARD_DATA array.
 * Uses dynamic import to get the actual data.
 */
export async function readSchoolsData() {
  const { default: schools } = await import(path.join(REPO_ROOT, 'app', 'src', 'data', 'schools.js'));
  const { WIZARD_DATA } = await import(path.join(REPO_ROOT, 'app', 'src', 'data', 'schools.js'));
  return { schools, WIZARD_DATA };
}

/**
 * Add a spell entry to the code-review school in schools.js.
 * This modifies the file by finding the code-review school and adding the entry.
 */
export async function addSpellToSchools(skillId, displayName, description) {
  const content = await fs.readFile(SCHOOLS_JS, 'utf8');

  // Find the code-review school's spells array
  const codeReviewMarker = "id:'code-review',real:'Code Review & Quality'";
  const codeReviewStart = content.indexOf(codeReviewMarker);

  if (codeReviewStart === -1) {
    console.error('Could not find code-review school in schools.js');
    return false;
  }

  // Find the closing of the spells array for code-review
  const spellsStart = content.indexOf('spells:[', codeReviewStart);
  const spellsArrayStart = content.indexOf('[', spellsStart);

  // Find the matching closing bracket
  let bracketCount = 0;
  let spellsArrayEnd = spellsArrayStart;
  for (let i = spellsArrayStart; i < content.length; i++) {
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;
    if (bracketCount === 0) {
      spellsArrayEnd = i;
      break;
    }
  }

  // Insert new spell before the closing bracket
  const newSpell = `      {name:'${displayName}',skill:'${skillId}',effect:'${description || displayName}.',status:'New'},\n`;

  const updatedContent =
    content.slice(0, spellsArrayEnd) +
    '\n' + newSpell +
    content.slice(spellsArrayEnd);

  await fs.writeFile(SCHOOLS_JS, updatedContent, 'utf8');
  console.log(`Updated: schools.js (added to code-review school)`);
  return true;
}

/**
 * Remove a spell entry from schools.js (all schools + WIZARD_DATA).
 */
export async function removeSpellFromSchools(skillId) {
  let content = await fs.readFile(SCHOOLS_JS, 'utf8');
  const original = content;

  // Remove from spells arrays: lines containing skill:'<skillId>'
  const spellRegex = new RegExp(
    `^[ \\t]*\\{name:'[^']*',skill:'${skillId}',effect:'[^']*',status:'[^']*'\\},?\\n`,
    'gm'
  );
  content = content.replace(spellRegex, '');

  // Remove from WIZARD_DATA situations: lines containing skill:'<skillId>'
  const situationRegex = new RegExp(
    `^[ \\t]*\\{[^}]*skill:'${skillId}'[^}]*\\},?\\n`,
    'gm'
  );
  content = content.replace(situationRegex, '');

  if (content !== original) {
    await fs.writeFile(SCHOOLS_JS, content, 'utf8');
    console.log(`Updated: schools.js (removed all references to ${skillId})`);
    return true;
  } else {
    console.log(`  No references to ${skillId} found in schools.js`);
    return false;
  }
}

/**
 * Add an entry to spellMetadata.js.
 */
export async function addToSpellMetadata(skillId, displayName) {
  const content = await fs.readFile(SPELL_METADATA, 'utf8');

  const explicitStart = content.indexOf('const EXPLICIT = {');
  const explicitEnd = content.indexOf('};', explicitStart);

  if (explicitStart === -1 || explicitEnd === -1) {
    console.error('Could not find EXPLICIT object in spellMetadata.js');
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);
  const newEntry = `  '${skillId}': { lastUpdated: '${today}', note: 'New entry — ${displayName}.' },\n`;

  const updatedContent =
    content.slice(0, explicitEnd) +
    newEntry +
    content.slice(explicitEnd);

  await fs.writeFile(SPELL_METADATA, updatedContent, 'utf8');
  console.log(`Updated: spellMetadata.js (added changelog entry)`);
  return true;
}

/**
 * Remove an entry from spellMetadata.js.
 */
export async function removeFromSpellMetadata(skillId) {
  let content = await fs.readFile(SPELL_METADATA, 'utf8');
  const original = content;

  // Remove the line: 'skill-id': { lastUpdated: ... },
  const regex = new RegExp(
    `^[ \\t]*'${skillId}': \\{[^}]*\\},?\\n`,
    'gm'
  );
  content = content.replace(regex, '');

  if (content !== original) {
    await fs.writeFile(SPELL_METADATA, content, 'utf8');
    console.log(`Updated: spellMetadata.js (removed ${skillId})`);
    return true;
  } else {
    console.log(`  No entry for ${skillId} found in spellMetadata.js`);
    return false;
  }
}

/**
 * Remove a skill from public/skills/ using the _map.json.
 */
export async function removeFromPublic(skillId) {
  const mapFile = path.join(PUBLIC_SKILLS, '_map.json');
  try {
    const mapContent = await fs.readFile(mapFile, 'utf8');
    const map = JSON.parse(mapContent);

    if (skillId in map) {
      // map[skillId] is like "/skills/topic/skill-name/SKILL.md"
      // We need to strip "/skills/" prefix and join with PUBLIC_SKILLS
      const relativePath = map[skillId].replace(/^\/skills\//, '');
      const skillPath = path.join(PUBLIC_SKILLS, relativePath);
      await fs.rm(path.dirname(skillPath), { recursive: true, force: true });
      console.log(`Deleted: public/skills/${path.dirname(relativePath)}/`);
      return true;
    } else {
      console.log(`  ${skillId} not found in public/skills/`);
      return false;
    }
  } catch {
    console.log('  Could not read skill map');
    return false;
  }
}
