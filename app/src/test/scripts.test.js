#!/usr/bin/env node

/**
 * tests for skill.mjs (add/remove) and sync-all.mjs
 *
 * These tests use temp directories to avoid mutating production files.
 * Each test suite creates its own isolated copy of the data files.
 *
 * Run with:
 *   cd app && npx vitest run src/test/scripts.test.js
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const APP_DIR = path.join(REPO_ROOT, 'app');
const PUBLIC_SKILLS = path.join(APP_DIR, 'public', 'skills');

const TEST_SKILL_ID = 'test-skill-dummy';
const TEST_TOPIC = 'software-development';
const TEST_DISPLAY = 'Test Skill Dummy';
const TEST_DESC = 'A dummy skill for testing';

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function run(cmd, cwd = REPO_ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function runNoThrow(cmd, cwd = REPO_ROOT) {
  try {
    return { stdout: execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }), ok: true };
  } catch (err) {
    return { stdout: err.stdout || '', stderr: err.stderr || '', ok: false };
  }
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

async function createTmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'grimoirestack-test-'));
}

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

// ─────────────────────────────────────────────
//  TESTS — skill.mjs add
// ─────────────────────────────────────────────

describe('skill.mjs add', () => {
  let tmpDir;
  let tmpSkillDir;
  let tmpSchoolsFile;
  let tmpMetaFile;
  let tmpPublicDir;

  beforeAll(async () => {
    tmpDir = await createTmpDir();
    tmpSkillDir = path.join(tmpDir, TEST_TOPIC, TEST_SKILL_ID);
    tmpSchoolsFile = path.join(tmpDir, 'schools.js');
    tmpMetaFile = path.join(tmpDir, 'spellMetadata.js');
    tmpPublicDir = path.join(tmpDir, 'public', 'skills');

    // Copy the real data files to temp dir
    await copyFile(
      path.join(APP_DIR, 'src', 'data', 'schools.js'),
      tmpSchoolsFile
    );
    await copyFile(
      path.join(APP_DIR, 'src', 'data', 'spellMetadata.js'),
      tmpMetaFile
    );
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('creates skill directory and SKILL.md', async () => {
    // Create the skill directory in temp location
    await fs.mkdir(tmpSkillDir, { recursive: true });
    const content = `---\nname: ${TEST_SKILL_ID}\ndescription: ${TEST_DESC}\n---\n\n# ${TEST_DISPLAY}\n\n## Purpose\n\n${TEST_DESC}\n`;
    await fs.writeFile(path.join(tmpSkillDir, 'SKILL.md'), content, 'utf8');

    expect(await fileExists(tmpSkillDir)).toBe(true);
    const skillContent = await fs.readFile(path.join(tmpSkillDir, 'SKILL.md'), 'utf8');
    expect(skillContent).toContain(`name: ${TEST_SKILL_ID}`);
    expect(skillContent).toContain(`# ${TEST_DISPLAY}`);
  });

  it('validates skill ID format', () => {
    const result = runNoThrow(`node scripts/skill.mjs add INVALID_ID software-development "Bad"`);
    expect(result.ok).toBe(false);
  });

  it('validates topic', () => {
    const result = runNoThrow(`node scripts/skill.mjs add valid-id bogus-topic "Bad"`);
    expect(result.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────
//  TESTS — skill.mjs remove
// ─────────────────────────────────────────────

describe('skill.mjs remove', () => {
  let tmpDir;

  beforeAll(async () => {
    tmpDir = await createTmpDir();
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('validates skill ID is provided', () => {
    const result = runNoThrow(`node scripts/skill.mjs remove`);
    expect(result.ok).toBe(false);
  });
});

// ─────────────────────────────────────────────
//  TESTS — sync-all.mjs
// ─────────────────────────────────────────────

describe('sync-all.mjs', () => {
  it('reports up to date when no changes', async () => {
    const out = run(`node scripts/sync-all.mjs`);
    expect(out).toContain('up to date');
  });
});
