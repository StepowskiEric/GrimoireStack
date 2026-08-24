import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const skillsRoot = path.join(repoRoot, 'skills');

/**
 * Parse the YAML frontmatter subset used by the repo (same rules as
 * app/scripts/registry/frontmatter.mjs): flat key: value lines.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9_-]+):\s*(.*)$/i);
    if (m) meta[m[1]] = m[2].trim();
  }
  return meta;
}

function walkSkills() {
  const skills = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'SKILL.md') skills.push(full);
    }
  };
  walk(skillsRoot);
  return skills;
}

describe('skill frontmatter contract', () => {
  const files = walkSkills();

  it('discovers every skill in skills/', () => {
    expect(files.length).toBeGreaterThanOrEqual(124);
  });

  for (const file of files) {
    const skillName = path.basename(path.dirname(file));
    const content = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(content);

    it(`${skillName}: has parseable frontmatter`, () => {
      expect(meta).not.toBeNull();
    });

    it(`${skillName}: name matches parent directory`, () => {
      expect(meta?.name).toBe(skillName);
    });

    it(`${skillName}: name is lowercase-hyphen`, () => {
      expect(skillName).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it(`${skillName}: has a description`, () => {
      expect(meta?.description?.length ?? 0).toBeGreaterThan(0);
    });

    it(`${skillName}: disables model invocation`, () => {
      expect(meta?.['disable-model-invocation']).toBe('true');
    });
  }
});
