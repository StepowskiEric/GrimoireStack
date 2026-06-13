/**
 * Auto-update changelog when new skills are added.
 *
 * This script:
 * 1. Copies new skills from repo root to public/skills/
 * 2. Adds changelog entries for new skills
 * 3. Updates the skill map
 *
 * Run as part of the build process or as a pre-commit hook.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const PUBLIC_SKILLS = path.resolve(__dirname, '../public/skills');
const SPELL_METADATA = path.resolve(__dirname, '../src/data/spellMetadata.js');

// Top-level directories to scan (matching the repo structure)
const SCAN_DIRS = [
  'debugging',
  'execution',
  'judgment-and-routing',
  'mcp-servers',
  'mlops',
  'orchestration',
  'output-quality',
  'reasoning',
  'software-development',
  'systems-and-architecture',
  'testing',
  'development',
];

async function findSkillFiles(dir) {
  const results = [];
  for (const scanDir of SCAN_DIRS) {
    const rootPath = path.join(dir, scanDir);
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
        // Check for SKILL.md inside
        const skillMd = path.join(fullPath, 'SKILL.md');
        try {
          await fs.access(skillMd);
          results.push({ skillId: ent.name, src: skillMd, relDir: `${scanDir}/${ent.name}` });
        } catch {
          // Also scan one level deeper for .md files in subdirectories
          const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
          for (const sub of subEntries) {
            if (sub.isDirectory()) {
              const subSkillMd = path.join(fullPath, sub.name, 'SKILL.md');
              try {
                await fs.access(subSkillMd);
                results.push({ skillId: sub.name, src: subSkillMd, relDir: `${scanDir}/${ent.name}/${sub.name}` });
              } catch {}
            } else if (sub.name.endsWith('.md') && sub.name !== 'README.md') {
              const skillId = sub.name.replace(/\.md$/, '');
              results.push({ skillId, src: path.join(fullPath, sub.name), relDir: `${scanDir}/${ent.name}` });
            }
          }
        }
      } else if (ent.name.endsWith('.md') && ent.name !== 'README.md') {
        const skillId = ent.name.replace(/\.md$/, '');
        results.push({ skillId, src: fullPath, relDir: scanDir });
      }
    }
  }
  return results;
}

async function getExistingSkills() {
  try {
    const mapFile = path.join(PUBLIC_SKILLS, '_map.json');
    const content = await fs.readFile(mapFile, 'utf8');
    return Object.keys(JSON.parse(content));
  } catch {
    return [];
  }
}

async function updateSpellMetadata(newSkills) {
  if (newSkills.length === 0) return;
  
  const content = await fs.readFile(SPELL_METADATA, 'utf8');
  
  // Find the EXPLICIT object closing brace
  const explicitStart = content.indexOf('const EXPLICIT = {');
  const explicitEnd = content.indexOf('};', explicitStart);
  
  if (explicitStart === -1 || explicitEnd === -1) {
    console.error('Could not find EXPLICIT object in spellMetadata.js');
    return;
  }
  
  // Generate new entries
  const today = new Date().toISOString().slice(0, 10);
  const newEntries = newSkills.map(skillId => {
    // Convert skill ID to a readable name
    const readableName = skillId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `  '${skillId}': { lastUpdated: '${today}', note: 'New entry — ${readableName}.' },`;
  }).join('\n');
  
  // Insert before the closing brace
  const updatedContent = content.slice(0, explicitEnd) + newEntries + '\n' + content.slice(explicitEnd);
  
  await fs.writeFile(SPELL_METADATA, updatedContent, 'utf8');
  console.log(`Added ${newSkills.length} new skills to changelog`);
}

async function main() {
  console.log('Checking for new skills...');
  
  // Get existing skills from public directory
  const existingSkills = await getExistingSkills();
  
  // Find all skills in repo root
  const allSkills = await findSkillFiles(REPO_ROOT);
  
  // Find new skills (not in public directory)
  const newSkills = allSkills
    .filter(skill => !existingSkills.includes(skill.skillId))
    .map(skill => skill.skillId);
  
  if (newSkills.length === 0) {
    console.log('No new skills found.');
    return;
  }
  
  console.log(`Found ${newSkills.length} new skills: ${newSkills.join(', ')}`);
  
  // Update changelog
  await updateSpellMetadata(newSkills);
  
  // Copy new skills to public directory
  for (const skill of allSkills.filter(s => newSkills.includes(s.skillId))) {
    const destDir = path.join(PUBLIC_SKILLS, skill.relDir);
    await fs.mkdir(destDir, { recursive: true });
    const destFile = path.join(destDir, path.basename(skill.src));
    await fs.copyFile(skill.src, destFile);
    console.log(`Copied ${skill.skillId} to public/skills/`);
  }
  
  console.log('Changelog updated automatically!');
}

main().catch(err => {
  console.error('Error updating changelog:', err);
  process.exit(1);
});
