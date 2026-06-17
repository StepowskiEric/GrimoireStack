'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKIP_DIRS = new Set([
  'docs',
  'node_modules',
  'scripts',
  'references',
  '.git',
  '.agents',
  '.worktrees',
  '.code-review-graph',
  'benchmarks',
]);

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
  'research',
];

const TOPIC_LABELS = {
  execution: 'Execution — how-to-do-the-work protocols',
  'judgment-and-routing': 'Judgment & Routing — deciding what to do and how rigorously',
  'output-quality': 'Output Quality — improving what the agent produces',
  'systems-and-architecture': 'Systems & Architecture — thinking about structure and scale',
  orchestration: 'Orchestration — agent coordination and workflow control',
  debugging: 'Debugging — log trace correlation and problem solving',
  mlops: 'MLOps — local LLM tooling and model management',
  reasoning: 'Reasoning — faithfulness and reasoning verification',
  'software-development': 'Software Development — practical development workflows',
  development: 'Development — skill building and repository management',
  testing: 'Testing — test patterns, mocking, and evaluation',
  research: 'Research — lookup, verification, and source discipline',
};

const AGENT_CONFIGS = {
  codex: { defaultDest: path.join(os.homedir(), '.agents', 'skills'), flat: false },
  hermes: { defaultDest: path.join(os.homedir(), '.hermes', 'skills'), flat: false },
  claude: { defaultDest: path.join(os.homedir(), '.claude', 'skills'), flat: false },
  antigravity: { defaultDest: path.join(os.homedir(), '.antigravity', 'skills'), flat: false },
  copilot: { defaultDest: path.join(os.homedir(), '.agents', 'skills'), flat: true },
  pi: { defaultDest: path.join(os.homedir(), '.pi', 'agent', 'skills'), flat: true },
};

function getSkillFiles(dir, base) {
  base = base || dir;
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
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

function extractSkillName(file) {
  const base = path.basename(file, '.md');
  if (base === 'SKILL') {
    return path.basename(path.dirname(file));
  }
  return base;
}

function getSkillBundlePath(file, flat) {
  const name = extractSkillName(file);

  if (flat) {
    return path.join(name, 'SKILL.md');
  }

  if (path.basename(file) === 'SKILL.md') {
    return file;
  }

  return path.join(path.dirname(file), name, 'SKILL.md');
}

function skillHasCompanion(skillsDir, file) {
  const scriptsDir = path.join(skillsDir, path.dirname(file), 'scripts');
  try {
    return fs.readdirSync(scriptsDir, { withFileTypes: true })
      .some((e) => e.isFile() && !e.name.startsWith('.'));
  } catch {
    return false;
  }
}

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

function listSkills(skillsDir, allSkills) {
  console.log(`\nGrimoireStack (${allSkills.length} total)\n`);

  for (const topic of TOPIC_DIRS) {
    const files = allSkills.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
    if (files.length === 0) continue;

    console.log(`${TOPIC_LABELS[topic] || topic}:`);
    for (const f of files) {
      const name = extractSkillName(f);
      const tag = f.includes('state-machine') ? ' [protocol]' : ' [framework]';
      const scriptTag = skillHasCompanion(skillsDir, f) ? ' [scripted]' : '';
      console.log(`  ${name}${tag}${scriptTag}`);
    }
    console.log('');
  }

  const categorized = TOPIC_DIRS.flatMap((t) =>
    allSkills.filter((f) => f.startsWith(t + '/') || f.startsWith(t + path.sep))
  );
  const uncategorized = allSkills.filter((f) => !categorized.includes(f));
  if (uncategorized.length > 0) {
    console.log('Other:');
    uncategorized.forEach((f) => console.log(`  ${extractSkillName(f)}`));
    console.log('');
  }
}

function topicDirMap(allSkills) {
  const map = {};
  for (const topic of TOPIC_DIRS) {
    map[topic] = allSkills.filter((f) => f.startsWith(topic + '/') || f.startsWith(topic + path.sep));
  }
  return map;
}

function supportedAgents() {
  return Object.keys(AGENT_CONFIGS);
}

function agentConfig(agent) {
  return AGENT_CONFIGS[agent];
}

function topicOrder() {
  return TOPIC_DIRS.slice();
}

function topicLabel(topic) {
  return TOPIC_LABELS[topic] || topic;
}

module.exports = {
  getSkillFiles,
  discoverSkills: (skillsDir) => getSkillFiles(skillsDir),
  extractSkillName,
  getSkillBundlePath,
  skillHasCompanion,
  matchSkill,
  listSkills,
  topicDirMap,
  supportedAgents,
  agentConfig,
  topicOrder,
  topicLabel,
};
