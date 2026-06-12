import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MAP_PATH = join(process.cwd(), 'public', 'skills', '_map.json');

describe('build-skill-map output', () => {
  let map;

  beforeAll(() => {
    map = JSON.parse(readFileSync(MAP_PATH, 'utf8'));
  });

  it('is a non-empty object', () => {
    expect(typeof map).toBe('object');
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });

  it('every value starts with /skills/', () => {
    for (const [key, val] of Object.entries(map)) {
      expect(val).toMatch(/^\/skills\//);
    }
  });

  it('every catalog spell in schools.js has a _map.json entry', async () => {
    const { default: schools } = await import('../data/schools.js');
    const catalogSkills = schools.flatMap(s => s.spells.map(sp => sp.skill));
    const missing = catalogSkills.filter(s => !map[s]);
    expect(missing).toEqual([]);
  });

  it('map keys are the skill ID (directory or filename stem)', () => {
    // bisect-debugging/SKILL.md -> key "bisect-debugging"
    expect(map['bisect-debugging']).toBe('/skills/debugging/bisect-debugging/SKILL.md');
    // debug-to-fix-pipeline.md -> key "debug-to-fix-pipeline"
    expect(map['debug-to-fix-pipeline']).toBe('/skills/debugging/debug-to-fix-pipeline.md');
  });

  it('includes skills with YAML frontmatter name field', () => {
    // super-review-typescript has frontmatter with name: super-review-typescript
    expect(map['super-review-typescript']).toBe('/skills/software-development/super-review-typescript/SKILL.md');
  });
});
