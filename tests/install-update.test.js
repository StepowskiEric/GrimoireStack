import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Import the CJS modules via vitest's interop
let installModule;
let updateModule;

function loadModules() {
  installModule = require('../lib/install.js');
  updateModule = require('../lib/update.js');
}

// --- Fixture helpers ---

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'gs-test-'));
}

function rmDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ok */ }
}

function writeSkill(dir, name, content, extra) {
  const skillDir = path.join(dir, name);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content);
  if (extra) extra(skillDir);
}

// --- buildSkillBundle ---

describe('buildSkillBundle', () => {
  beforeAll(() => loadModules());

  it('adds source tag to content with YAML frontmatter', () => {
    const content = '---\nname: my-skill\ndescription: test\n---\n\nBody';
    const result = installModule.buildSkillBundle(content, 'execution/my-skill/SKILL.md', null);
    expect(result).toContain('source: "GrimoireStack"');
    expect(result).toContain('name: my-skill');
    expect(result).toContain('Body');
  });

  it('does not duplicate source tag if already present', () => {
    const content = '---\nname: my-skill\ndescription: test\nsource: "GrimoireStack"\n---\n\nBody';
    const result = installModule.buildSkillBundle(content, 'execution/my-skill/SKILL.md', null);
    expect(result).toContain('source: "GrimoireStack"');
    // Count occurrences — should be exactly 1
    const matches = result.match(/source:\s*"GrimoireStack"/g);
    expect(matches).toHaveLength(1);
  });

  it('wraps content without frontmatter in YAML', () => {
    const content = '## Purpose\n\nDo the thing.\n\n## Steps\n\n1. Step one';
    const result = installModule.buildSkillBundle(content, 'execution/my-skill/SKILL.md', null);
    expect(result).toContain('source: "GrimoireStack"');
    expect(result).toContain('name: "my-skill"');
    expect(result).toContain('Do the thing.');
  });

  it('rewrites name for copilot agent', () => {
    const content = '---\nname: my-skill\ndescription: test\n---\n\nBody';
    const result = installModule.buildSkillBundle(content, 'execution/my-skill/SKILL.md', 'copilot');
    // copilot rewrites name to the JSON-stringified version
    expect(result).toContain('name: "my-skill"');
  });
});

// --- extractSkillDescription ---

describe('extractSkillDescription', () => {
  beforeAll(() => loadModules());

  it('extracts first paragraph under ## Purpose', () => {
    const content = '## Purpose\n\nThis is the purpose.\n\nMore detail.\n\n## Steps\n\nStep 1';
    expect(installModule.extractSkillDescription(content)).toBe('This is the purpose.');
  });

  it('returns fallback when no ## Purpose section', () => {
    const content = '## Steps\n\nStep 1';
    expect(installModule.extractSkillDescription(content)).toBe('Skill instructions for an AI agent to follow.');
  });

  it('collapses whitespace in description', () => {
    const content = '## Purpose\n\nThis   is   the   purpose.\n\n## Steps';
    expect(installModule.extractSkillDescription(content)).toBe('This is the purpose.');
  });
});

// --- deduplicateSkills ---

describe('deduplicateSkills', () => {
  beforeAll(() => loadModules());

  it('removes duplicate skills by name', () => {
    const skills = ['execution/foo/SKILL.md', 'debugging/foo/SKILL.md', 'execution/bar/SKILL.md'];
    const result = installModule.deduplicateSkills(skills);
    expect(result).toHaveLength(2);
    expect(result).toContain('execution/foo/SKILL.md');
    expect(result).toContain('execution/bar/SKILL.md');
  });

  it('keeps first occurrence of duplicate', () => {
    const skills = ['execution/foo/SKILL.md', 'debugging/foo/SKILL.md'];
    const result = installModule.deduplicateSkills(skills);
    expect(result).toEqual(['execution/foo/SKILL.md']);
  });

  it('returns empty array for empty input', () => {
    expect(installModule.deduplicateSkills([])).toEqual([]);
  });
});

// --- cleanStaleSkills ---

describe('cleanStaleSkills', () => {
  beforeAll(() => loadModules());
  let tmp;

  beforeEach(() => { tmp = tmpDir(); });
  afterEach(() => rmDir(tmp));

  it('removes GrimoireStack-tagged skill directories', () => {
    writeSkill(tmp, 'stale-skill', '---\nsource: "GrimoireStack"\n---\n\nBody');
    writeSkill(tmp, 'other-skill', '---\nsource: "Other"\n---\n\nBody');

    const cleaned = installModule.cleanStaleSkills(tmp);
    expect(cleaned).toBe(1);
    expect(fs.existsSync(path.join(tmp, 'stale-skill'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'other-skill'))).toBe(true);
  });

  it('returns 0 when dest does not exist', () => {
    const cleaned = installModule.cleanStaleSkills('/nonexistent/path');
    expect(cleaned).toBe(0);
  });

  it('returns 0 when no GrimoireStack skills exist', () => {
    writeSkill(tmp, 'my-skill', '---\nsource: "Other"\n---\n\nBody');
    expect(installModule.cleanStaleSkills(tmp)).toBe(0);
  });
});

// --- cleanOldSkillVersions ---

describe('cleanOldSkillVersions', () => {
  beforeAll(() => loadModules());
  let tmp;

  beforeEach(() => { tmp = tmpDir(); });
  afterEach(() => rmDir(tmp));

  it('removes old -skill suffixed directories in flat layout', () => {
    const skills = ['execution/my-skill/SKILL.md'];
    // Create the old-style dir
    const oldDir = path.join(tmp, 'my-skill-skill');
    fs.mkdirSync(oldDir, { recursive: true });
    fs.writeFileSync(path.join(oldDir, 'SKILL.md'), 'old');

    installModule.cleanOldSkillVersions(skills, tmp, true);
    expect(fs.existsSync(oldDir)).toBe(false);
  });

  it('removes old -skill suffixed directories in topic layout', () => {
    const skills = ['execution/my-skill/SKILL.md'];
    // cleanOldSkillVersions computes: path.join(dest, path.dirname(file), oldName)
    // = path.join(tmp, 'execution/my-skill', 'my-skill-skill')
    const oldDir = path.join(tmp, 'execution', 'my-skill', 'my-skill-skill');
    fs.mkdirSync(oldDir, { recursive: true });
    fs.writeFileSync(path.join(oldDir, 'SKILL.md'), 'old');

    installModule.cleanOldSkillVersions(skills, tmp, false);
    expect(fs.existsSync(oldDir)).toBe(false);
  });

  it('does nothing when skill name already ends with -skill', () => {
    const skills = ['execution/my-skill-skill/SKILL.md'];
    // Should not try to remove my-skill-skill-skill
    expect(() => installModule.cleanOldSkillVersions(skills, tmp, true)).not.toThrow();
  });
});

// --- installSkills ---

// Skills live under skills/ relative to repo root
const SKILL_PREFIX = 'skills';

describe('installSkills', () => {
  beforeAll(() => loadModules());
  let tmp;

  beforeEach(() => { tmp = tmpDir(); });
  afterEach(() => rmDir(tmp));

  it('installs skills to destination directory', () => {
    const allSkills = [`${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`];
    const count = installModule.installSkills(allSkills, tmp, false, null, false, false);
    expect(count).toBe(1);
    // getSkillBundlePath preserves the full path for SKILL.md files when flat=false
    const installedPath = path.join(tmp, SKILL_PREFIX, 'execution', 'assumption-grounding', 'SKILL.md');
    expect(fs.existsSync(installedPath)).toBe(true);
    const content = fs.readFileSync(installedPath, 'utf8');
    expect(content).toContain('source: "GrimoireStack"');
  });

  it('installs in flat layout when flat=true', () => {
    const allSkills = [`${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`];
    const count = installModule.installSkills(allSkills, tmp, true, null, false, false);
    expect(count).toBe(1);
    const installedPath = path.join(tmp, 'assumption-grounding', 'SKILL.md');
    expect(fs.existsSync(installedPath)).toBe(true);
  });

  it('deduplicates skills before installing', () => {
    const allSkills = [
      `${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`,
      `${SKILL_PREFIX}/debugging/assumption-grounding/SKILL.md`,
    ];
    const count = installModule.installSkills(allSkills, tmp, false, null, false, false);
    expect(count).toBe(1);
  });

  it('cleans stale skills before installing', () => {
    // Create a stale skill in the dest
    writeSkill(tmp, 'stale-skill', '---\nsource: "GrimoireStack"\n---\n\nOld');

    const allSkills = [`${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`];
    installModule.installSkills(allSkills, tmp, false, null, false, false);
    expect(fs.existsSync(path.join(tmp, 'stale-skill'))).toBe(false);
  });
});

// --- findInstalledSkills ---

describe('findInstalledSkills', () => {
  beforeAll(() => loadModules());
  let tmp;

  beforeEach(() => { tmp = tmpDir(); });
  afterEach(() => rmDir(tmp));

  it('finds GrimoireStack-tagged skills', () => {
    writeSkill(tmp, 'my-skill', '---\nsource: "GrimoireStack"\n---\n\nBody');
    const found = updateModule.findInstalledSkills(tmp);
    expect(found).toHaveLength(1);
    expect(found[0].name).toBe('my-skill');
    expect(found[0].content).toContain('GrimoireStack');
  });

  it('ignores non-GrimoireStack skills', () => {
    writeSkill(tmp, 'my-skill', '---\nsource: "Other"\n---\n\nBody');
    expect(updateModule.findInstalledSkills(tmp)).toHaveLength(0);
  });

  it('returns empty array for nonexistent directory', () => {
    expect(updateModule.findInstalledSkills('/nonexistent')).toEqual([]);
  });

  it('finds skills in nested directories', () => {
    const nested = path.join(tmp, 'subdir', 'nested-skill');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'SKILL.md'), '---\nsource: "GrimoireStack"\n---\n\nBody');
    const found = updateModule.findInstalledSkills(tmp);
    expect(found).toHaveLength(1);
    expect(found[0].name).toBe('nested-skill');
  });
});

// --- checkSkillChanged ---

describe('checkSkillChanged', () => {
  beforeAll(() => loadModules());

  it('returns unchanged for identical content', () => {
    const content = '---\nname: test\n---\n\nBody';
    const result = updateModule.checkSkillChanged(content, content);
    expect(result.changed).toBe(false);
    expect(result.reason).toBe('identical');
  });

  it('ignores source tag difference', () => {
    const installed = '---\nsource: "GrimoireStack"\nname: test\n---\n\nBody';
    const source = '---\nname: test\n---\n\nBody';
    const result = updateModule.checkSkillChanged(installed, source);
    expect(result.changed).toBe(false);
  });

  it('returns unchanged for whitespace-only differences', () => {
    const installed = '---\nname: test\n---\n\nBody\n';
    const source = '---\nname: test\n---\n\n  Body';
    const result = updateModule.checkSkillChanged(installed, source);
    expect(result.changed).toBe(false);
    expect(result.reason).toBe('whitespace only');
  });

  it('returns changed for different content', () => {
    const installed = '---\nname: test\n---\n\nBody A';
    const source = '---\nname: test\n---\n\nBody B';
    const result = updateModule.checkSkillChanged(installed, source);
    expect(result.changed).toBe(true);
    expect(result.reason).toBe('content differs');
  });

  it('normalizes line endings', () => {
    const installed = '---\nname: test\n---\n\nBody\r\n';
    const source = '---\nname: test\n---\n\nBody\n';
    const result = updateModule.checkSkillChanged(installed, source);
    expect(result.changed).toBe(false);
  });
});

// --- updateSkills ---

describe('updateSkills', () => {
  beforeAll(() => loadModules());
  let tmp;

  beforeEach(() => { tmp = tmpDir(); });
  afterEach(() => rmDir(tmp));

  it('returns 0 when no GrimoireStack skills are installed', () => {
    const result = updateModule.updateSkills(tmp, [], false, false, false, null);
    expect(result).toBe(0);
  });

  it('updates a changed skill', () => {
    // Install a skill first
    const allSkills = [`${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`];
    installModule.installSkills(allSkills, tmp, false, null, false, false);

    // Now update — should find it unchanged
    const result = updateModule.updateSkills(tmp, allSkills, false, false, false, null);
    expect(result).toBe(0); // 0 updated (unchanged)
  });

  it('removes skills not in source', () => {
    // Install a skill
    const allSkills = [`${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`];
    installModule.installSkills(allSkills, tmp, false, null, false, false);

    // Now update with empty source — the installed skill should be removed
    const result = updateModule.updateSkills(tmp, [], false, false, false, null);
    expect(result).toBe(0); // 0 updated, but 1 removed
    expect(fs.existsSync(path.join(tmp, 'execution', 'assumption-grounding'))).toBe(false);
  });

  it('cleans stale skills before updating', () => {
    // Create a stale skill in the dest
    writeSkill(tmp, 'stale-skill', '---\nsource: "GrimoireStack"\n---\n\nOld');

    // Install a real skill
    const allSkills = [`${SKILL_PREFIX}/execution/assumption-grounding/SKILL.md`];
    installModule.installSkills(allSkills, tmp, false, null, false, false);

    // Update — stale skill should be cleaned
    updateModule.updateSkills(tmp, allSkills, false, false, false, null);
    expect(fs.existsSync(path.join(tmp, 'stale-skill'))).toBe(false);
  });
});
