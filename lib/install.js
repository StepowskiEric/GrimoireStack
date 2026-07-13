'use strict';

const fs = require('fs');
const path = require('path');

const { extractSkillName, getSkillBundlePath, agentConfig } = require('./skill-utils');

const SKILLS_DIR = path.resolve(__dirname, '..');
const MCP_DIR = path.join(SKILLS_DIR, 'mcp-servers');

function buildSkillBundle(content, file, agent) {
  const name = extractSkillName(file);

  if (content.trimStart().startsWith('---')) {
    let result = content;
    if (!result.includes('source: "GrimoireStack"') && !result.includes("source: 'GrimoireStack'")) {
      result = result.replace(/^---\r?\n/, `---\nsource: "GrimoireStack"\n`);
    }
    if (agent === 'copilot') {
      result = result.replace(/^name:.*$/m, `name: ${JSON.stringify(name)}`);
    }
    return result;
  }

  const description = extractSkillDescription(content);
  return `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(description)}\nsource: "GrimoireStack"\n---\n\n${content}`;
}

function extractSkillDescription(content) {
  const lines = content.split(/\r?\n/);
  let inPurpose = false;
  const paragraphs = [];
  let current = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '## Purpose') {
      inPurpose = true;
      current = [];
      continue;
    }
    if (line.startsWith('## ')) {
      if (inPurpose) break;
      continue;
    }
    if (!inPurpose) continue;
    if (line.length === 0) {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        break;
      }
      continue;
    }
    current.push(line);
  }

  const description = paragraphs[0] || current.join(' ') || 'Skill instructions for an AI agent to follow.';
  return description.replace(/\s+/g, ' ').trim();
}

function deduplicateSkills(skills) {
  const seen = new Set();
  return skills.filter((file) => {
    const name = extractSkillName(file);
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
}

function cleanOldSkillVersions(skills, dest, flat) {
  for (const file of skills) {
    const name = extractSkillName(file);
    const oldName = name + '-skill';
    let oldPath;
    if (flat) {
      oldPath = path.join(dest, oldName);
    } else {
      const topicDir = path.dirname(file);
      oldPath = path.join(dest, topicDir, oldName);
    }
    try {
      if (fs.existsSync(oldPath)) {
        fs.rmSync(oldPath, { recursive: true, force: true });
        console.log(`  \u2717 ${path.relative(dest, oldPath)}  [removed old -skill version]`);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}

function cleanStaleSkills(dest) {
  let cleaned = 0;

  function cleanDir(dir) {
    let localCleaned = 0;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const fullPath = path.join(dir, entry.name);
        localCleaned += cleanDir(fullPath);

        const skillFile = path.join(fullPath, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          try {
            const content = fs.readFileSync(skillFile, 'utf8');
            if (content.includes('source: "GrimoireStack"') || content.includes("source: 'GrimoireStack'")) {
              fs.rmSync(fullPath, { recursive: true, force: true });
              localCleaned++;
              continue;
            }
          } catch {
            // Can't read — skip
          }
        }
      }
    } catch {
      // Can't access — skip
    }
    return localCleaned;
  }

  try {
    cleaned = cleanDir(dest);
  } catch {
    // dest doesn't exist yet — nothing to clean
  }
  return cleaned;
}

function copyDirectory(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

function installMCPServers(dest) {
  if (!fs.existsSync(MCP_DIR)) {
    console.log('  No MCP servers found in repository.');
    return 0;
  }

  const mcpDest = path.join(dest, 'mcp-servers');
  fs.mkdirSync(mcpDest, { recursive: true });

  let copied = 0;
  const mcpServers = fs.readdirSync(MCP_DIR, { withFileTypes: true });

  for (const entry of mcpServers) {
    if (entry.isDirectory()) {
      const srcDir = path.join(MCP_DIR, entry.name);
      const dstDir = path.join(mcpDest, entry.name);

      if (fs.existsSync(dstDir)) {
        fs.rmSync(dstDir, { recursive: true, force: true });
      }

      copyDirectory(srcDir, dstDir);
      console.log(`  \u2713 mcp-servers/${entry.name}/`);
      copied++;
    }
  }

  console.log(`  Installed ${copied} MCP server(s) to ${mcpDest}`);
  return copied;
}

function installSkills(skills, dest, flat, agent, withScripts, withMCP) {
  fs.mkdirSync(dest, { recursive: true });
  skills = deduplicateSkills(skills);
  const staleRemoved = cleanStaleSkills(dest);
  if (staleRemoved > 0) {
    console.log(`  Cleaned ${staleRemoved} stale skill(s) from previous install`);
  }
  cleanOldSkillVersions(skills, dest, flat);
  let installed = 0;
  let scriptsInstalled = 0;

  for (const file of skills) {
    const src = path.join(SKILLS_DIR, file);
    const dst = path.join(dest, getSkillBundlePath(file, flat));
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    const bundle = buildSkillBundle(fs.readFileSync(src, 'utf8'), file, agent);
    fs.writeFileSync(dst, bundle);
    console.log(`  \u2713 ${getSkillBundlePath(file, flat)}`);
    installed++;

    if (withScripts) {
      const scriptsDir = path.join(path.dirname(src), 'scripts');
      const dstDir = path.dirname(dst);
      try {
        for (const entry of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
          if (entry.isFile() && !entry.name.startsWith('.')) {
            const srcFile = path.join(scriptsDir, entry.name);
            const dstFile = path.join(dstDir, entry.name);
            fs.copyFileSync(srcFile, dstFile);
            const relPath = path.join(path.dirname(getSkillBundlePath(file, flat)), entry.name);
            console.log(`  \u2713 ${relPath}  [companion]`);
            scriptsInstalled++;
          }
        }
      } catch {
        // no scripts directory, skip silently
      }
    }
  }

  let mcpInstalled = 0;
  if (withMCP) {
    mcpInstalled = installMCPServers(dest);
  }

  console.log(`\nInstalled ${installed} skill(s)${withScripts ? ` + ${scriptsInstalled} companion script(s)` : ''}${withMCP ? ` + ${mcpInstalled} MCP server(s)` : ''} to ${dest}`);
  return installed;
}

function installTo(agent, skills, destOverride, withScripts, withMCP) {
  const config = agentConfig(agent);
  const dest = destOverride || config.defaultDest;
  if (!dest) {
    console.error(`Unknown agent "${agent}". Supported agents: ${Object.keys(agentConfig).join(', ')}`);
    process.exit(1);
  }
  return installSkills(skills, dest, config.flat, agent, withScripts, withMCP);
}

module.exports = {
  buildSkillBundle,
  extractSkillDescription,
  deduplicateSkills,
  cleanOldSkillVersions,
  cleanStaleSkills,
  copyDirectory,
  installMCPServers,
  installSkills,
  installTo,
};
