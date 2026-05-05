#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// Skills directory: when installed via npx, __dirname is inside the package.
// When run locally from the repo root, __dirname is the bin/ folder.
const SKILLS_DIR = path.resolve(__dirname, '..');
const MCP_DIR = path.join(SKILLS_DIR, 'mcp-servers');

const AGENT_DIRS = {
  codex: path.join(os.homedir(), '.agents', 'skills'),
  hermes: path.join(os.homedir(), '.hermes', 'skills'),
  claude: path.join(os.homedir(), '.claude', 'skills'),
  antigravity: path.join(os.homedir(), '.antigravity', 'skills'),
  copilot: path.join(os.homedir(), '.agents', 'skills'),
  pi: path.join(os.homedir(), '.pi', 'agent', 'skills'),
};

const SUPPORTED_AGENTS = Object.keys(AGENT_DIRS);

// Directories that should never be scanned for skills
const SKIP_DIRS = new Set(['docs', 'node_modules', 'scripts', '.git', '.agents', '.worktrees', '.code-review-graph', 'benchmarks']);

function getSkillFiles(dir, base) {
  base = base || dir;
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      // Skip subdirectory if a sibling .md file already covers this skill
      // e.g. skip execution/step-level-verification-protocol/ when
      //      execution/step-level-verification-protocol.md exists
      const parentFiles = fs.readdirSync(dir);
      const hasSiblingMd = parentFiles.some(
        (f) => f.endsWith('.md') && f !== 'README.md' && f.startsWith(entry.name)
      );
      if (hasSiblingMd) {
        continue;
      }
      results = results.concat(getSkillFiles(path.join(dir, entry.name), base));
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      results.push(path.relative(base, path.join(dir, entry.name)));
    }
  }
  return results.sort();
}

/**
 * Extract the skill name from a file path.
 * For SKILL.md files (already in agent skills format), use the parent directory name.
 * For regular .md files, strip the extension.
 */
function extractSkillName(file) {
  const base = path.basename(file, '.md');
  if (base === 'SKILL') {
    return path.basename(path.dirname(file));
  }
  return base;
}

/**
 * Compute the destination bundle path for a skill file.
 *
 * For regular .md files: dirname/skill-name/SKILL.md (non-flat) or skill-name/SKILL.md (flat)
 * For SKILL.md source files (already bundled): install as-is preserving directory structure
 *
 * Codex uses non-flat (topic-grouped subdirectories).
 * VS Code Copilot uses flat (skill-name/SKILL.md directly under skills root).
 * Both follow the Agent Skills open standard: skill folder contains SKILL.md,
 * and the folder name must match the `name` field in frontmatter.
 */
function getSkillBundlePath(file, flat) {
  const name = extractSkillName(file);

  if (flat) {
    // Flat mode (Copilot): skill-name/SKILL.md at root
    return path.join(name, 'SKILL.md');
  }

  // For SKILL.md source files, the directory structure is already correct
  // e.g. debugging/log-trace-correlation/SKILL.md -> debugging/log-trace-correlation/SKILL.md
  if (path.basename(file) === 'SKILL.md') {
    return file;
  }

  // Non-flat mode (Codex, Hermes, etc.): dirname/skill-name/SKILL.md
  return path.join(path.dirname(file), name, 'SKILL.md');
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

function buildSkillBundle(content, file, agent) {
  const name = extractSkillName(file);

  // If content already has frontmatter, don't double-wrap.
  // Just ensure source marker is present.
  if (content.trimStart().startsWith('---')) {
    let result = content;
    // Add source marker if not present
    if (!result.includes('source: "jerry-skills"') && !result.includes("source: 'jerry-skills'")) {
      result = result.replace(/^---\r?\n/, `---\nsource: "jerry-skills"\n`);
    }
    // For copilot, name field MUST be slug-format matching the directory
    if (agent === 'copilot') {
      result = result.replace(/^name:.*$/m, `name: ${JSON.stringify(name)}`);
    }
    return result;
  }

  const description = extractSkillDescription(content);
  return `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(description)}\nsource: "jerry-skills"\n---\n\n${content}`;
}

/**
 * Remove duplicate skills based on extracted name. Keeps the first occurrence.
 */
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

/**
 * Clean up old `-skill` suffixed versions of installed skills.
 * When a skill was renamed from `foo-skill` to `foo`, the old directory
 * `foo-skill/` may still exist in the destination. Remove it.
 */
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

/**
 * Remove old jerry-skills installations from the destination before installing.
 * Scans for SKILL.md files with `source: "jerry-skills"` in their frontmatter
 * and removes those directories. This prevents stale skills from accumulating
 * when re-running the installer after skills are renamed or removed.
 */
function cleanStaleSkills(dest) {
  let cleaned = 0;
  try {
    const entries = fs.readdirSync(dest, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(dest, entry.name);

      // Check if this directory contains a SKILL.md
      const skillFile = path.join(dir, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        try {
          const content = fs.readFileSync(skillFile, 'utf8');
          if (content.includes('source: "jerry-skills"') || content.includes("source: 'jerry-skills'")) {
            fs.rmSync(dir, { recursive: true, force: true });
            cleaned++;
          }
        } catch {
          // Can't read — skip
        }
      }

      // Also check one level deeper (topic/skill-name/SKILL.md)
      if (entry.isDirectory()) {
        try {
          const subs = fs.readdirSync(dir, { withFileTypes: true });
          for (const sub of subs) {
            if (!sub.isDirectory()) continue;
            const subDir = path.join(dir, sub.name);
            const subSkill = path.join(subDir, 'SKILL.md');
            if (fs.existsSync(subSkill)) {
              try {
                const content = fs.readFileSync(subSkill, 'utf8');
                if (content.includes('source: "jerry-skills"') || content.includes("source: 'jerry-skills'")) {
                  fs.rmSync(subDir, { recursive: true, force: true });
                  cleaned++;
                }
              } catch {
                // Can't read — skip
              }
            }
          }
        } catch {
          // Can't scan — skip
        }
      }
    }
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
      
      // Clean existing destination first
      if (fs.existsSync(dstDir)) {
        fs.rmSync(dstDir, { recursive: true, force: true });
      }
      
      // Copy the entire directory recursively
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

  console.log(`\\nInstalled ${installed} skill(s)${withScripts ? ` + ${scriptsInstalled} companion script(s)` : ''}${withMCP ? ` + ${mcpInstalled} MCP server(s)` : ''} to ${dest}`);
  return installed;
}

function installTo(agent, skills, destOverride, withScripts, withMCP) {
  const dest = destOverride || AGENT_DIRS[agent];
  if (!dest) {
    console.error(`Unknown agent \"${agent}\". Supported agents: ${SUPPORTED_AGENTS.join(', ')}`);
    process.exit(1);
  }
  // Copilot and Pi require flat structure (no topic subdirectories)
  const flat = agent === 'copilot' || agent === 'pi';
  return installSkills(skills, dest, flat, agent, withScripts, withMCP);
}

/**
 * Match a user-supplied skill name against available skill files.
 * Accepts:
 *   - Full path:  \"execution/how-to-solve-it-state-machine\"
 *   - Just name:  \"how-to-solve-it-state-machine\"
 *   - With .md:   \"execution/how-to-solve-it-state-machine.md\"
 *   - Partial:    \"how-to-solve-it\" (matches if unique)
 */
function matchSkill(query, allSkills) {
  const normalized = query.replace(/\.md$/, '');

  // Exact full path match (without .md)
  const exactPath = allSkills.find((f) => f.replace(/\.md$/, '') === normalized);
  if (exactPath) return exactPath;

  // Exact name match (handles SKILL.md parent dir names too)
  const byName = allSkills.filter((f) => extractSkillName(f) === normalized);
  if (byName.length === 1) return byName[0];
  if (byName.length > 1) {
    console.error(`Ambiguous skill \"${query}\". Matches:\n${byName.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }

  // Partial / substring match
  const byPartial = allSkills.filter((f) => extractSkillName(f).includes(normalized));
  if (byPartial.length === 1) return byPartial[0];
  if (byPartial.length > 1) {
    console.error(`Ambiguous skill \"${query}\". Matches:\n${byPartial.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }

  console.error(`No skill found matching \"${query}\".`);
  console.error(`Run \"npx jerry-skills list\" to see available skills.`);
  process.exit(1);
}

const TOPIC_DIRS = [
  'execution',
  'judgment-and-routing',
  'output-quality',
  'systems-and-architecture',
  'orchestration',
  'debugging',
  'mlops',
  'reasoning',
  'software-development',
  'development',
  'testing',
];

const TOPIC_LABELS = {
  'execution': 'Execution — how-to-do-the-work protocols',
  'judgment-and-routing': 'Judgment & Routing — deciding what to do and how rigorously',
  'output-quality': 'Output Quality — improving what the agent produces',
  'systems-and-architecture': 'Systems & Architecture — thinking about structure and scale',
  'orchestration': 'Orchestration — agent coordination and workflow control',
  'debugging': 'Debugging — log trace correlation and problem solving',
  'mlops': 'MLOps — local LLM tooling and model management',
  'reasoning': 'Reasoning — faithfulness and reasoning verification',
  'software-development': 'Software Development — practical development workflows',
  'development': 'Development — skill building and repository management',
  'testing': 'Testing — test patterns, mocking, and evaluation',
};

function skillHasCompanion(file) {
  const scriptsDir = path.join(SKILLS_DIR, path.dirname(file), 'scripts');
  try {
    return fs.readdirSync(scriptsDir, { withFileTypes: true })
      .some((e) => e.isFile() && !e.name.startsWith('.'));
  } catch {
    return false;
  }
}

function listSkills() {
  const all = getSkillFiles(SKILLS_DIR);
  console.log(`\nJerry's Agent Skills (${all.length} total)\n`);

  for (const topic of TOPIC_DIRS) {
    const files = all.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
    if (files.length === 0) continue;

    console.log(`${TOPIC_LABELS[topic] || topic}:`);
    for (const f of files) {
      const name = extractSkillName(f);
      const tag = f.includes('state-machine') ? ' [protocol]' : ' [framework]';
      const scriptTag = skillHasCompanion(f) ? ' [scripted]' : '';
      console.log(`  ${name}${tag}${scriptTag}`);
    }
    console.log('');
  }

  // Catch any files not in a known topic dir
  const categorized = TOPIC_DIRS.flatMap((t) =>
    all.filter((f) => f.startsWith(t + '/') || f.startsWith(t + path.sep))
  );
  const uncategorized = all.filter((f) => !categorized.includes(f));
  if (uncategorized.length > 0) {
    console.log('Other:');
    uncategorized.forEach((f) => console.log(`  ${extractSkillName(f)}`));
    console.log('');
  }
}

function printHelp() {
  console.log(`\njerry-skills — install Jerry's agent skill files into your AI agent

Usage:
  npx jerry-skills install [options]
  npx jerry-skills install --agent <name> [--skill <name>] [--skill <name2>]
  npx jerry-skills install --all
  npx jerry-skills list
  npx jerry-skills help

Commands:
  install   Copy skill bundles to the agent's skills directory
  list      List all available skill files
  help      Show this help message

Options:
  --agent         Target agent: ${SUPPORTED_AGENTS.join(', ')}
  --all           Install to all supported agents
  --skill         Install a specific skill (repeatable). Accepts full path or name.
  --dest          Override the destination directory
  --with-scripts  Also copy companion scripts bundled with skills (e.g. .py files)
  --with-mcp      Also copy MCP servers to the destination (mcp-servers/ directory)

Default install paths:
${SUPPORTED_AGENTS.map((a) => `  ${a.padEnd(12)} ${AGENT_DIRS[a]}`).join('\n')}

Skill format (Agent Skills open standard):
  Each skill installs as a directory containing SKILL.md with YAML frontmatter.
  Copilot uses flat layout (skill-name/SKILL.md at root).
  Codex uses grouped layout (topic/skill-name/SKILL.md).

Examples:
  npx jerry-skills install                            # interactive picker
  npx jerry-skills install --agent copilot            # install all skills to copilot
  npx jerry-skills install --agent codex --skill how-to-solve-it-state-machine
  npx jerry-skills install --agent claude --skill purify-test-output --with-scripts
  npx jerry-skills install --all                      # install all to all agents
  npx jerry-skills install --agent hermes --with-mcp  # install all skills + MCP servers to hermes
  npx jerry-skills list
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
    console.error('Or use flags: npx jerry-skills install --agent copilot --skill <name>');
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

  for (const topic of TOPIC_DIRS) {
    const files = allSkills.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
    if (files.length === 0) continue;

    // Topic separator (not selectable)
    choices.push({ title: `\x1b[1m${TOPIC_LABELS[topic]}\x1b[0m`, heading: true });

    for (const f of files) {
      const name = extractSkillName(f);
      const tag = f.includes('state-machine') ? 'protocol' : 'framework';
      const scriptTag = skillHasCompanion(f) ? ' ✓script' : '';
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
  const hasCompanions = skillResponse.skills.some((f) => skillHasCompanion(f));
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

  // NEW: Ask about MCP servers
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
    // Custom path: use flat structure (works for all agents)
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
    listSkills();
    return;
  }

  if (command !== 'install') {
    console.error(`Unknown command \"${command}\".\n`);
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

  // Collect all --skill values (repeatable)
  const skillNames = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skill' && args[i + 1]) {
      skillNames.push(args[i + 1]);
    }
  }

  const hasAgent = agentIdx !== -1 && args[agentIdx + 1];
  const hasSkills = skillNames.length > 0;

  // --all: install everything to all agents
  if (allFlag) {
    const all = getSkillFiles(SKILLS_DIR);
    console.log("Installing all skills to all supported agents...\n");
    for (const agent of SUPPORTED_AGENTS) {
      console.log(`[${agent}]`);
      installTo(agent, all, destOverride ? path.join(destOverride, agent) : null, withScripts, withMCP);
      console.log('');
    }
    return;
  }

  // --agent with optional --skill flags
  if (hasAgent) {
    const agent = args[agentIdx + 1];
    if (!SUPPORTED_AGENTS.includes(agent)) {
      console.error(`Unknown agent \"${agent}\". Supported: ${SUPPORTED_AGENTS.join(', ')}`);
      process.exit(1);
    }

    const all = getSkillFiles(SKILLS_DIR);

    if (hasSkills) {
      // Install only specified skills
      const matched = skillNames.map((name) => matchSkill(name, all));
      console.log(`Installing ${matched.length} skill(s) for ${agent}...\n`);
      installTo(agent, matched, destOverride, withScripts, withMCP);
    } else {
      // Install all skills to this agent
      console.log(`Installing all skills for ${agent}...\n`);
      installTo(agent, all, destOverride, withScripts, withMCP);
    }
    return;
  }

  // --skill without --agent: need to ask for destination
  if (hasSkills && !hasAgent) {
    const all = getSkillFiles(SKILLS_DIR);
    const matched = skillNames.map((name) => matchSkill(name, all));

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

  // No flags: launch interactive picker
  const all = getSkillFiles(SKILLS_DIR);
  interactivePicker(all).catch((err) => {
    console.error('Interactive picker failed:', err.message);
    printHelp();
    process.exit(1);
  });
}

main();
