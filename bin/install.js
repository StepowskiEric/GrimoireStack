#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_DIR = path.resolve(__dirname, '..');
const MCP_DIR = path.join(SKILLS_DIR, 'mcp-servers');
const skillUtils = require('../lib/skill-utils');
const {
  discoverSkills,
  extractSkillName,
  getSkillBundlePath,
  skillHasCompanion,
  listSkills,
  topicOrder,
  topicLabel,
  supportedAgents,
  agentConfig,
} = skillUtils;

function matchSkillCLI(query, allSkills) {
  try {
    return matchSkill(query, allSkills);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const AGENT_DIRS = {
  codex: path.join(os.homedir(), '.agents', 'skills'),
  hermes: path.join(os.homedir(), '.hermes', 'skills'),
  claude: path.join(os.homedir(), '.claude', 'skills'),
  antigravity: path.join(os.homedir(), '.antigravity', 'skills'),
  copilot: path.join(os.homedir(), '.agents', 'skills'),
  pi: path.join(os.homedir(), '.pi', 'agent', 'skills'),
};

const SUPPORTED_AGENTS = Object.keys(AGENT_DIRS);

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
    if (seen.has(name)) {
      return false;
    }
    seen.add(name);
    return true;
  });
}

function cleanOldSkillVersions(skills, dest, flat) {
  for (const file of skills) {
    const name = extractSkillName(file);
    if (!name.endsWith('-skill')) {
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
          console.log(`  ✗ ${path.relative(dest, oldPath)}  [removed old -skill version]`);
        }
      } catch {
        // ignore cleanup errors
      }
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
      console.log(`  ✓ mcp-servers/${entry.name}/`);
      copied++;
    }
  }

  console.log(`  Installed ${copied} MCP server(s) to ${mcpDest}`);
  return copied;
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
    console.log(`  ✓ ${getSkillBundlePath(file, flat)}`);
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
            console.log(`  ✓ ${relPath}  [companion]`);
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

/**
 * Find all skills previously installed from GrimoireStack in a destination directory.
 * Returns an array of { name, installedPath, source } objects.
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
  // Normalize both for comparison (strip source field since we add it during install)
  const normalize = (c) => c
    .replace(/^source:\s*["']GrimoireStack["']\s*$/m, '')
    .replace(/\r\n/g, '\n')
    .trim();

  const normInstalled = normalize(installedContent);
  const normSource = normalize(sourceContent);

  if (normInstalled === normSource) {
    return { changed: false, reason: 'identical' };
  }

  // Check if only whitespace/line endings differ
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
    // Try to find matching source skill
    const sourceFile = allSkills.find((f) => {
      const sourceName = extractSkillName(f);
      return sourceName === inst.name;
    });

    if (!sourceFile) {
      console.log(`  - ${inst.name}  [not in source — skipping]`);
      notFound++;
      continue;
    }

    const src = path.join(SKILLS_DIR, sourceFile);
    const sourceContent = fs.readFileSync(src, 'utf8');
    const result = checkSkillChanged(inst.content, sourceContent);

    if (!result.changed) {
      console.log(`  ✓ ${inst.name}  [${result.reason}]`);
      skipped++;
      continue;
    }

    // Update the skill
    const bundle = buildSkillBundle(sourceContent, sourceFile, agent || null);
    fs.writeFileSync(inst.installedPath, bundle);
    console.log(`  ↑ ${inst.name}  [updated]`);
    updated++;

    // Update companion scripts if requested
    if (withScripts) {
      const scriptsDir = path.join(path.dirname(src), 'scripts');
      const dstDir = path.dirname(inst.installedPath);
      try {
        for (const entry of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
          if (entry.isFile() && !entry.name.startsWith('.')) {
            const srcFile = path.join(scriptsDir, entry.name);
            const dstFile = path.join(dstDir, entry.name);
            fs.copyFileSync(srcFile, dstFile);
            console.log(`  ↑ ${entry.name}  [companion]`);
            scriptsUpdated++;
          }
        }
      } catch {
        // no scripts directory
      }
    }
  }

  // Update MCP servers if requested
  if (withMCP) {
    installMCPServers(dest);
  }

  console.log(`\nUpdate complete: ${updated} updated, ${skipped} unchanged, ${notFound} not in source`);
  if (withScripts && scriptsUpdated > 0) {
    console.log(`  + ${scriptsUpdated} companion script(s) updated`);
  }
  return updated;
}

function installTo(agent, skills, destOverride, withScripts, withMCP) {
  const dest = destOverride || agentConfig(agent).defaultDest;
  if (!dest) {
    console.error(`Unknown agent "${agent}". Supported agents: ${supportedAgents().join(', ')}`);
    process.exit(1);
  }
  const config = agentConfig(agent);
  return installSkills(skills, dest, config.flat, agent, withScripts, withMCP);
}

/**
 * Match a user-supplied skill name against available skill files.
 * Accepts:
 *   - Full path:  "execution/how-to-solve-it-state-machine"
 *   - Just name:  "how-to-solve-it-state-machine"
 *   - With .md:   "execution/how-to-solve-it-state-machine.md"
 *   - Partial:    "how-to-solve-it" (matches if unique)
 */
function matchSkill(query, allSkills) {
  const normalized = query.replace(/\.md$/, '');

  const exactPath = allSkills.find((f) => f.replace(/\.md$/, '') === normalized);
  if (exactPath) return exactPath;

  const byName = allSkills.filter((f) => extractSkillName(f) === normalized);
  if (byName.length === 1) return byName[0];
  if (byName.length > 1) {
    throw new Error(`Ambiguous skill "${query}". Matches:\n${byName.map((f) => `  ${f}`).join('\n')}`);
  }

  const byPartial = allSkills.filter((f) => extractSkillName(f).includes(normalized));
  if (byPartial.length === 1) return byPartial[0];
  if (byPartial.length > 1) {
    throw new Error(`Ambiguous skill "${query}". Matches:\n${byPartial.map((f) => `  ${f}`).join('\n')}`);
  }

  throw new Error(`No skill found matching "${query}".`);
}

function listSkillsCLI(skillsDir, allSkills) {
  console.log(`\nGrimoireStack (${allSkills.length} total)\n`);

  for (const topic of topicOrder()) {
    const files = allSkills.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
    if (files.length === 0) continue;

    console.log(`${topicLabel(topic)}:`);
    for (const f of files) {
      const name = extractSkillName(f);
      const tag = f.includes('state-machine') ? ' [protocol]' : ' [framework]';
      const scriptTag = skillHasCompanion(skillsDir, f) ? ' [scripted]' : '';
      console.log(`  ${name}${tag}${scriptTag}`);
    }
    console.log('');
  }

  const categorized = topicOrder().flatMap((t) =>
    allSkills.filter((f) => f.startsWith(t + '/') || f.startsWith(t + path.sep))
  );
  const uncategorized = allSkills.filter((f) => !categorized.includes(f));
  if (uncategorized.length > 0) {
    console.log('Other:');
    uncategorized.forEach((f) => console.log(`  ${extractSkillName(f)}`));
    console.log('');
  }
}

function printHelp() {
  const supported = supportedAgents();
  const defaultPaths = supported.map((a) => {
    const dest = agentConfig(a).defaultDest;
    return `  ${a.padEnd(12)} ${dest}`;
  });

  console.log(`\ngrimoirestack — install agent skill files into your AI agent

Usage:
  npx grimoirestack install [options]
  npx grimoirestack install --agent <name> [--skill <name>] [--skill <name2>]
  npx grimoirestack install --all
  npx grimoirestack update [options]
  npx grimoirestack list
  npx grimoirestack help

Commands:
  install   Copy skill bundles to the agent's skills directory
  update    Update previously installed skills that have changed in the source
  list      List all available skill files
  help      Show this help message

Options:
  --agent         Target agent: ${supported.join(', ')}
  --all           Install/update to all supported agents
  --skill         Install a specific skill (repeatable). Accepts full path or name.
  --dest          Override the destination directory
  --with-scripts  Also copy companion scripts bundled with skills (e.g. .py files)
  --with-mcp      Also copy MCP servers to the destination (mcp-servers/ directory)

Default install paths:
${defaultPaths.join('\n')}

Skill format (Agent Skills open standard):
  Each skill installs as a directory containing SKILL.md with YAML frontmatter.
  Copilot uses flat layout (skill-name/SKILL.md at root).
  Codex uses grouped layout (topic/skill-name/SKILL.md).

Examples:
  npx grimoirestack install                            # interactive picker
  npx grimoirestack install --agent copilot            # install all skills to copilot
  npx grimoirestack install --agent codex --skill how-to-solve-it-state-machine
  npx grimoirestack install --agent claude --skill purify-test-output --with-scripts
  npx grimoirestack install --all                      # install all to all agents
  npx grimoirestack install --agent hermes --with-mcp  # install all skills + MCP servers to hermes
  npx grimoirestack update --agent hermes              # update installed skills for hermes
  npx grimoirestack update --all                       # update all agents
  npx grimoirestack list
`);
}

/**
 * Interactive picker for selecting agent and skills.
 * Uses 'prompts' if available, falls back to --help output.
 */
async function interactivePicker(allSkills) {
  let prompts;
  try {
    prompts = require('prompts');
  } catch (e) {
    console.error('Interactive mode requires the "prompts" package.');
    console.error('Either install it: npm install prompts');
    console.error('Or use flags: npx grimoirestack install --agent copilot --skill <name>');
    printHelp();
    process.exit(1);
  }

  // Step 1: Pick agent
  const agentChoices = SUPPORTED_AGENTS.map((a) => ({
    title: `${a}  (${AGENT_DIRS[a]})`,
    value: a,
  }));
  agentChoices.push({ title: 'custom path...', value: '__custom__' });

  const agentResponse = await prompts({
    type: 'select',
    name: 'agent',
    message: 'Which agent are you installing for?',
    choices: agentChoices,
  });

  if (!agentResponse.agent) {
    console.log('Cancelled.');
    process.exit(0);
  }

  let destAgent = agentResponse.agent;
  let destOverride = null;

  if (destAgent === '__custom__') {
    const pathResponse = await prompts({
      type: 'text',
      name: 'dest',
      message: 'Enter the destination directory:',
      validate: (v) => (v.trim().length > 0 ? true : 'Path is required'),
    });
    if (!pathResponse.dest) {
      console.log('Cancelled.');
      process.exit(0);
    }
    destOverride = pathResponse.dest;
    destAgent = null; // custom path, no agent name
  }

  // Step 2: Pick skills grouped by topic
  const choices = [];

  for (const topic of topicOrder()) {
    const files = allSkills.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
    if (files.length === 0) continue;

    choices.push({ title: `\x1b[1m${topicLabel(topic)}\x1b[0m`, heading: true });

    for (const f of files) {
      const name = extractSkillName(f);
      const tag = f.includes('state-machine') ? 'protocol' : 'framework';
      const scriptTag = skillHasCompanion(SKILLS_DIR, f) ? ' ✓script' : '';
      choices.push({
        title: `  ${name}  [${tag}]${scriptTag}`,
        value: f,
      });
    }
  }

  const skillResponse = await prompts({
    type: 'multiselect',
    name: 'skills',
    message: 'Select skills to install (Space to toggle, Enter to confirm):',
    choices: choices,
    hint: '- Space to toggle. Return to submit',
    instructions: false,
  });

  if (!skillResponse.skills || skillResponse.skills.length === 0) {
    console.log('No skills selected. Cancelled.');
    process.exit(0);
  }

  // Step 3: Ask about companion scripts if any selected skill has them
  const hasCompanions = skillResponse.skills.some((f) => skillHasCompanion(SKILLS_DIR, f));
  let withScripts = false;
  if (hasCompanions) {
    const scriptResponse = await prompts({
      type: 'confirm',
      name: 'withScripts',
      message: 'Some selected skills have companion scripts. Install them too?',
      initial: false,
    });
    withScripts = scriptResponse.withScripts || false;
  }

  let withMCP = false;
  const mcpDirExists = fs.existsSync(MCP_DIR) && fs.readdirSync(MCP_DIR).length > 0;
  if (mcpDirExists) {
    const mcpResponse = await prompts({
      type: 'confirm',
      name: 'withMCP',
      message: 'Also install MCP servers (mcp-servers/ directory)?',
      initial: false,
    });
    withMCP = mcpResponse.withMCP || false;
  }

  // Step 4: Install
  console.log('');
  if (destAgent) {
    console.log(`Installing ${skillResponse.skills.length} skill(s) for ${destAgent}...`);
    installTo(destAgent, skillResponse.skills, destOverride, withScripts, withMCP);
  } else {
    console.log(`Installing ${skillResponse.skills.length} skill(s)...`);
    installSkills(skillResponse.skills, destOverride, true, null, withScripts, withMCP);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'list') {
    const all = discoverSkills(SKILLS_DIR);
    listSkillsCLI(SKILLS_DIR, all);
    return;
  }

  if (command === 'update') {
    // Parse flags for update
    const allFlag = args.includes('--all');
    const withScripts = args.includes('--with-scripts');
    const withMCP = args.includes('--with-mcp');
    const agentIdx = args.indexOf('--agent');
    const destIdx = args.indexOf('--dest');
    const destOverride = destIdx !== -1 ? args[destIdx + 1] : null;

    const hasAgent = agentIdx !== -1 && args[agentIdx + 1];
    const all = discoverSkills(SKILLS_DIR);

    if (allFlag) {
      console.log("Updating installed skills for all supported agents...\n");
      for (const agent of SUPPORTED_AGENTS) {
        const dest = agentConfig(agent).defaultDest;
        console.log(`[${agent}]`);
        updateSkills(dest, all, withScripts, withMCP, agentConfig(agent).flat, agent);
        console.log('');
      }
      return;
    }

    if (hasAgent) {
      const agent = args[agentIdx + 1];
      if (!SUPPORTED_AGENTS.includes(agent)) {
        console.error(`Unknown agent "${agent}". Supported: ${SUPPORTED_AGENTS.join(', ')}`);
        process.exit(1);
      }
      const dest = destOverride || agentConfig(agent).defaultDest;
      console.log(`Updating installed skills for ${agent}...\n`);
      updateSkills(dest, all, withScripts, withMCP, agentConfig(agent).flat, agent);
      return;
    }

    if (destOverride) {
      console.log(`Updating installed skills in ${destOverride}...\n`);
      updateSkills(destOverride, all, withScripts, withMCP, false, null);
      return;
    }

    // Default: update for all agents
    console.log("Updating installed skills for all supported agents...\n");
    for (const agent of SUPPORTED_AGENTS) {
      const dest = agentConfig(agent).defaultDest;
      console.log(`[${agent}]`);
      updateSkills(dest, all, withScripts, withMCP, agentConfig(agent).flat, agent);
      console.log('');
    }
    return;
  }

  if (command !== 'install') {
    console.error(`Unknown command "${command}".\n`);
    printHelp();
    process.exit(1);
  }

  // Parse flags
  const allFlag = args.includes('--all');
  const withScripts = args.includes('--with-scripts');
  const withMCP = args.includes('--with-mcp');
  const agentIdx = args.indexOf('--agent');
  const destIdx = args.indexOf('--dest');
  const destOverride = destIdx !== -1 ? args[destIdx + 1] : null;

  const skillNames = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skill' && args[i + 1]) {
      skillNames.push(args[i + 1]);
    }
  }

  const hasAgent = agentIdx !== -1 && args[agentIdx + 1];
  const hasSkills = skillNames.length > 0;

  if (allFlag) {
    const all = discoverSkills(SKILLS_DIR);
    console.log("Installing all skills to all supported agents...\n");
    for (const agent of SUPPORTED_AGENTS) {
      console.log(`[${agent}]`);
      installTo(agent, all, destOverride ? path.join(destOverride, agent) : null, withScripts, withMCP);
      console.log('');
    }
    return;
  }

  if (hasAgent) {
    const agent = args[agentIdx + 1];
    if (!SUPPORTED_AGENTS.includes(agent)) {
      console.error(`Unknown agent "${agent}". Supported: ${SUPPORTED_AGENTS.join(', ')}`);
      process.exit(1);
    }

    const all = discoverSkills(SKILLS_DIR);

    if (hasSkills) {
      const matched = skillNames.map((name) => matchSkillCLI(name, all));
      console.log(`Installing ${matched.length} skill(s) for ${agent}...\n`);
      installTo(agent, matched, destOverride, withScripts, withMCP);
    } else {
      console.log(`Installing all skills for ${agent}...\n`);
      installTo(agent, all, destOverride, withScripts, withMCP);
    }
    return;
  }

  if (hasSkills && !hasAgent) {
    const all = discoverSkills(SKILLS_DIR);
    const matched = skillNames.map((name) => matchSkillCLI(name, all));

    if (destOverride) {
      console.log(`Installing ${matched.length} skill(s)...\n`);
      installSkills(matched, destOverride, false, null, withScripts, withMCP);
    } else {
      console.error('Error: --skill requires --agent or --dest.\n');
      printHelp();
      process.exit(1);
    }
    return;
  }

  const all = discoverSkills(SKILLS_DIR);
  interactivePicker(all).catch((err) => {
    console.error('Interactive picker failed:', err.message);
    printHelp();
    process.exit(1);
  });
}

main();
