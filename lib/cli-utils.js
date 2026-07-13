'use strict';

const fs = require('fs');
const path = require('path');

const {
  extractSkillName,
  skillHasCompanion,
  topicOrder,
  topicLabel,
  supportedAgents,
  agentConfig,
} = require('./skill-utils');

const SKILLS_DIR = path.resolve(__dirname, '..');
const MCP_DIR = path.join(SKILLS_DIR, 'mcp-servers');

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

function matchSkillCLI(query, allSkills) {
  try {
    return matchSkill(query, allSkills);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
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

  const SUPPORTED_AGENTS = supportedAgents();
  const AGENT_DIRS = {};
  for (const a of SUPPORTED_AGENTS) {
    AGENT_DIRS[a] = agentConfig(a).defaultDest;
  }

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
    destAgent = null;
  }

  const choices = [];
  for (const topic of topicOrder()) {
    const files = allSkills.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
    if (files.length === 0) continue;

    choices.push({ title: `\x1b[1m${topicLabel(topic)}\x1b[0m`, heading: true });

    for (const f of files) {
      const name = extractSkillName(f);
      const tag = f.includes('state-machine') ? 'protocol' : 'framework';
      const scriptTag = skillHasCompanion(SKILLS_DIR, f) ? ' \u2713script' : '';
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

  return { destAgent, destOverride, skills: skillResponse.skills, withScripts, withMCP };
}

module.exports = {
  matchSkill,
  matchSkillCLI,
  listSkillsCLI,
  printHelp,
  interactivePicker,
};
