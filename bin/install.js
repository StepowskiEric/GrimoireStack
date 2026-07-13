#!/usr/bin/env node

'use strict';

const path = require('path');

const skillUtils = require('../lib/skill-utils');
const { installTo, installSkills } = require('../lib/install');
const { updateSkills } = require('../lib/update');
const { matchSkillCLI, listSkillsCLI, printHelp, interactivePicker } = require('../lib/cli-utils');

const SKILLS_DIR = path.resolve(__dirname, '..');

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'list') {
    const all = skillUtils.discoverSkills(SKILLS_DIR);
    listSkillsCLI(SKILLS_DIR, all);
    return;
  }

  if (command === 'update') {
    return handleUpdate(args);
  }

  if (command !== 'install') {
    console.error(`Unknown command "${command}".\n`);
    printHelp();
    process.exit(1);
  }

  return handleInstall(args);
}

function handleUpdate(args) {
  const allFlag = args.includes('--all');
  const withScripts = args.includes('--with-scripts');
  const withMCP = args.includes('--with-mcp');
  const agentIdx = args.indexOf('--agent');
  const destIdx = args.indexOf('--dest');
  const destOverride = destIdx !== -1 ? args[destIdx + 1] : null;
  const hasAgent = agentIdx !== -1 && args[agentIdx + 1];
  const all = skillUtils.discoverSkills(SKILLS_DIR);
  const SUPPORTED_AGENTS = skillUtils.supportedAgents();

  if (allFlag) {
    console.log("Updating installed skills for all supported agents...\n");
    for (const agent of SUPPORTED_AGENTS) {
      const dest = skillUtils.agentConfig(agent).defaultDest;
      console.log(`[${agent}]`);
      updateSkills(dest, all, withScripts, withMCP, skillUtils.agentConfig(agent).flat, agent);
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
    const dest = destOverride || skillUtils.agentConfig(agent).defaultDest;
    console.log(`Updating installed skills for ${agent}...\n`);
    updateSkills(dest, all, withScripts, withMCP, skillUtils.agentConfig(agent).flat, agent);
    return;
  }

  if (destOverride) {
    console.log(`Updating installed skills in ${destOverride}...\n`);
    updateSkills(destOverride, all, withScripts, withMCP, false, null);
    return;
  }

  // Default: update all agents
  console.log("Updating installed skills for all supported agents...\n");
  for (const agent of SUPPORTED_AGENTS) {
    const dest = skillUtils.agentConfig(agent).defaultDest;
    console.log(`[${agent}]`);
    updateSkills(dest, all, withScripts, withMCP, skillUtils.agentConfig(agent).flat, agent);
    console.log('');
  }
}

function handleInstall(args) {
  const allFlag = args.includes('--all');
  const withScripts = args.includes('--with-scripts');
  const withMCP = args.includes('--with-mcp');
  const agentIdx = args.indexOf('--agent');
  const destIdx = args.indexOf('--dest');
  const destOverride = destIdx !== -1 ? args[destIdx + 1] : null;
  const SUPPORTED_AGENTS = skillUtils.supportedAgents();

  const skillNames = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skill' && args[i + 1]) {
      skillNames.push(args[i + 1]);
    }
  }

  const hasAgent = agentIdx !== -1 && args[agentIdx + 1];
  const hasSkills = skillNames.length > 0;

  if (allFlag) {
    const all = skillUtils.discoverSkills(SKILLS_DIR);
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

    const all = skillUtils.discoverSkills(SKILLS_DIR);

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
    const all = skillUtils.discoverSkills(SKILLS_DIR);
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

  const all = skillUtils.discoverSkills(SKILLS_DIR);
  interactivePicker(all).then((result) => {
    console.log('');
    if (result.destAgent) {
      console.log(`Installing ${result.skills.length} skill(s) for ${result.destAgent}...`);
      installTo(result.destAgent, result.skills, result.destOverride, result.withScripts, result.withMCP);
    } else {
      console.log(`Installing ${result.skills.length} skill(s)...`);
      installSkills(result.skills, result.destOverride, true, null, result.withScripts, result.withMCP);
    }
  }).catch((err) => {
    console.error('Interactive picker failed:', err.message);
    printHelp();
    process.exit(1);
  });
}

main();
