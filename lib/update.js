'use strict';

const fs = require('fs');
const path = require('path');

const { extractSkillName } = require('./skill-utils');
const { buildSkillBundle, installMCPServers, cleanStaleSkills, cleanOldSkillVersions, deduplicateSkills } = require('./install');

const SKILLS_DIR = path.resolve(__dirname, '..');

/**
 * Find all skills previously installed from GrimoireStack in a destination directory.
 * Returns an array of { name, installedPath, content } objects.
 */
function findInstalledSkills(dest) {
  const installed = [];

  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const skillFile = path.join(fullPath, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            try {
              const content = fs.readFileSync(skillFile, 'utf8');
              if (content.includes('source: "GrimoireStack"') || content.includes("source: 'GrimoireStack'")) {
                installed.push({
                  name: entry.name,
                  installedPath: skillFile,
                  content,
                });
              }
            } catch {
              // skip unreadable files
            }
          } else {
            scanDir(fullPath);
          }
        }
      }
    } catch {
      // skip inaccessible directories
    }
  }

  scanDir(dest);
  return installed;
}

/**
 * Check if an installed skill differs from the source.
 * Returns { changed: boolean, reason: string }
 */
function checkSkillChanged(installedContent, sourceContent) {
  const normalize = (c) => c
    .replace(/^source:\s*["']GrimoireStack["']\s*$/m, '')
    .replace(/\r\n/g, '\n')
    .trim();

  const normInstalled = normalize(installedContent);
  const normSource = normalize(sourceContent);

  if (normInstalled === normSource) {
    return { changed: false, reason: 'identical' };
  }

  const stripWs = (c) => c.replace(/\s+/g, ' ').trim();
  if (stripWs(normInstalled) === stripWs(normSource)) {
    return { changed: false, reason: 'whitespace only' };
  }

  return { changed: true, reason: 'content differs' };
}

/**
 * Update previously installed skills from GrimoireStack.
 * Only updates skills that have changed in the source.
 */
function updateSkills(dest, allSkills, withScripts, withMCP, flat, agent) {
  allSkills = deduplicateSkills(allSkills);

  const staleRemoved = cleanStaleSkills(dest);
  if (staleRemoved > 0) {
    console.log(`  Cleaned ${staleRemoved} stale skill(s) from previous install`);
  }
  cleanOldSkillVersions(allSkills, dest, flat);

  const installed = findInstalledSkills(dest);

  if (installed.length === 0) {
    console.log(`  No GrimoireStack found in ${dest}`);
    console.log('  Run "npx GrimoireStack install" first to install skills.');
    return 0;
  }

  console.log(`  Found ${installed.length} installed skill(s) in ${dest}\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let scriptsUpdated = 0;

  for (const inst of installed) {
    const sourceFile = allSkills.find((f) => {
      const sourceName = extractSkillName(f);
      return sourceName === inst.name;
    });

    if (!sourceFile) {
      console.log(`  - ${inst.name}  [not in source — removing]`);
      try {
        fs.rmSync(path.dirname(inst.installedPath), { recursive: true, force: true });
        notFound++;
      } catch {
        console.log(`  - ${inst.name}  [failed to remove]`);
        notFound++;
      }
      continue;
    }

    const src = path.join(SKILLS_DIR, sourceFile);
    const sourceContent = fs.readFileSync(src, 'utf8');
    const result = checkSkillChanged(inst.content, sourceContent);

    if (!result.changed) {
      console.log(`  \u2713 ${inst.name}  [${result.reason}]`);
      skipped++;
      continue;
    }

    const bundle = buildSkillBundle(sourceContent, sourceFile, agent || null);
    fs.writeFileSync(inst.installedPath, bundle);
    console.log(`  \u2191 ${inst.name}  [updated]`);
    updated++;

    if (withScripts) {
      const scriptsDir = path.join(path.dirname(src), 'scripts');
      const dstDir = path.dirname(inst.installedPath);
      try {
        for (const entry of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
          if (entry.isFile() && !entry.name.startsWith('.')) {
            const srcFile = path.join(scriptsDir, entry.name);
            const dstFile = path.join(dstDir, entry.name);
            fs.copyFileSync(srcFile, dstFile);
            console.log(`  \u2191 ${entry.name}  [companion]`);
            scriptsUpdated++;
          }
        }
      } catch {
        // no scripts directory
      }
    }
  }

  if (withMCP) {
    installMCPServers(dest);
  }

  console.log(`\nUpdate complete: ${updated} updated, ${skipped} unchanged, ${notFound} removed/not in source`);
  if (withScripts && scriptsUpdated > 0) {
    console.log(`  + ${scriptsUpdated} companion script(s) updated`);
  }
  return updated;
}

module.exports = {
  findInstalledSkills,
  checkSkillChanged,
  updateSkills,
};
