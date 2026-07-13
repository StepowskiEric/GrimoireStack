import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import skillUtils from '../lib/skill-utils.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

describe('skill-utils', () => {
  describe('extractSkillName', () => {
    it('returns the parent directory name for SKILL.md files', () => {
      expect(skillUtils.extractSkillName('execution/foo/SKILL.md')).toBe('foo');
    });

    it('strips .md from regular skill files', () => {
      expect(skillUtils.extractSkillName('execution/foo.md')).toBe('foo');
    });

    it('handles nested paths', () => {
      expect(skillUtils.extractSkillName('a/b/c/bar.md')).toBe('bar');
    });
  });

  describe('getSkillBundlePath', () => {
    it('returns flat path when flat is true', () => {
      expect(skillUtils.getSkillBundlePath('execution/foo/SKILL.md', true)).toBe(path.join('foo', 'SKILL.md'));
    });

    it('preserves existing SKILL.md structure when flat is false', () => {
      expect(skillUtils.getSkillBundlePath('execution/foo/SKILL.md', false)).toBe('execution/foo/SKILL.md');
    });

    it('maps regular files to topic/name/SKILL.md when flat is false', () => {
      expect(skillUtils.getSkillBundlePath('execution/foo.md', false)).toBe(path.join('execution', 'foo', 'SKILL.md'));
    });
  });

  describe('matchSkill', () => {
    const skills = ['execution/foo.md', 'execution/bar/SKILL.md', 'debugging/foo.md'];

    it('matches exact path without .md', () => {
      expect(skillUtils.matchSkill('execution/foo', skills)).toBe('execution/foo.md');
    });

    it('matches exact skill name', () => {
      expect(skillUtils.matchSkill('bar', skills)).toBe('execution/bar/SKILL.md');
    });

    it('matches partial query when unique', () => {
      expect(skillUtils.matchSkill('bar', skills)).toBe('execution/bar/SKILL.md');
    });

    it('throws for ambiguous partial match', () => {
      expect(() => skillUtils.matchSkill('foo', skills)).toThrow(/Ambiguous skill/);
    });

    it('throws when no skill matches', () => {
      expect(() => skillUtils.matchSkill('missing', skills)).toThrow(/No skill found matching/);
    });
  });

  describe('skillHasCompanion', () => {
    it('returns false when scripts directory does not exist', () => {
      expect(skillUtils.skillHasCompanion(repoRoot, 'execution/foo.md')).toBe(false);
    });
  });

  describe('supportedAgents', () => {
    it('returns all expected agents', () => {
      expect(skillUtils.supportedAgents()).toEqual(['codex', 'hermes', 'claude', 'antigravity', 'copilot', 'pi', 'omp', 'factory']);
    });
  });

  describe('agentConfig', () => {
    it('returns config for known agent', () => {
      expect(skillUtils.agentConfig('copilot').flat).toBe(true);
    });

    it('returns config for non-flat agent', () => {
      expect(skillUtils.agentConfig('codex').flat).toBe(false);
    });
  });

  describe('topicOrder', () => {
    it('returns topic order array', () => {
      const order = skillUtils.topicOrder();
      expect(Array.isArray(order)).toBe(true);
      expect(order.length).toBeGreaterThan(0);
    });
  });

  describe('topicLabel', () => {
    it('returns label for known topic', () => {
      expect(skillUtils.topicLabel('execution')).toBe('Execution — how-to-do-the-work protocols');
    });

    it('falls back to topic name for unknown topic', () => {
      expect(skillUtils.topicLabel('unknown-topic')).toBe('unknown-topic');
    });
  });

  describe('discoverSkills', () => {
    it('returns sorted skill files from repo root', async () => {
      const skills = skillUtils.discoverSkills(repoRoot);
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0] < skills[skills.length - 1]).toBe(true);
    });
  });

  describe('topicDirMap', () => {
    it('groups skills by topic prefix', () => {
      const skills = ['execution/foo.md', 'debugging/bar.md'];
      const map = skillUtils.topicDirMap(skills);
      expect(map.execution).toEqual(['execution/foo.md']);
      expect(map.debugging).toEqual(['debugging/bar.md']);
    });
  });

  describe('discoverSkills edge cases', () => {
    const fixtureRoot = path.resolve(repoRoot, 'tests/fixtures/skill-discovery');

    it('prefers sibling markdown files over SKILL.md directories', () => {
      const skills = skillUtils.discoverSkills(fixtureRoot);
      expect(skills).toContain('execution/bar.md');
      expect(skills).not.toContain('execution/bar/SKILL.md');
    });

    it('ignores hidden files', () => {
      const skills = skillUtils.discoverSkills(fixtureRoot);
      expect(skills).not.toContain('execution/.hidden.md');
    });

    it('ignores README files', () => {
      const skills = skillUtils.discoverSkills(fixtureRoot);
      expect(skills).not.toContain('execution/README.md');
      expect(skills).not.toContain('docs/README.md');
    });
  });
});

describe('CLI contract', () => {
  it('prints help for help command', async () => {
    const { stdout } = await execFileAsync('node', ['bin/install.js', 'help'], { cwd: repoRoot });
    expect(stdout).toContain('grimoirestack — install agent skill files');
    expect(stdout).toContain('--agent');
  });

  it('lists skills for list command', async () => {
    const { stdout } = await execFileAsync('node', ['bin/install.js', 'list'], { cwd: repoRoot });
    expect(stdout).toContain('GrimoireStack (');
    expect(stdout).toContain('abductive-first-debugging');
  });

  it('rejects invalid command with help text', async () => {
    try {
      await execFileAsync('node', ['bin/install.js', 'bad'], { cwd: repoRoot });
    } catch (error) {
      expect(error.stderr).toContain('Unknown command');
      return;
    }
    throw new Error('Expected CLI to exit with an error for an unknown command');
  });

  it('reports missing skill match', async () => {
    try {
      await execFileAsync('node', ['bin/install.js', 'install', '--agent', 'copilot', '--skill', 'missing'], { cwd: repoRoot });
    } catch (error) {
      expect(error.stderr).toContain('No skill found matching');
      return;
    }
    throw new Error('Expected CLI to exit with an error for a missing skill');
  });

  it('enforces --agent or --dest with --skill', async () => {
    try {
      await execFileAsync('node', ['bin/install.js', 'install', '--skill', 'foo'], { cwd: repoRoot });
    } catch (error) {
      expect(error.stderr).toContain('--skill requires --agent or --dest');
      return;
    }
    throw new Error('Expected CLI to exit with an error when --skill is used without --agent or --dest');
  });
});
