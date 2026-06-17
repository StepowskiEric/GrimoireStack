/**
 * Shared constants for GrimoireStack scripts.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '..', '..');
export const APP_DIR = path.join(REPO_ROOT, 'app');
export const PUBLIC_SKILLS = path.join(APP_DIR, 'public', 'skills');
export const SPELL_METADATA = path.join(APP_DIR, 'src', 'data', 'spellMetadata.js');
export const SCHOOLS_JS = path.join(APP_DIR, 'src', 'data', 'schools.js');
export const README = path.join(REPO_ROOT, 'README.md');
export const SKILL_CATALOG = path.join(REPO_ROOT, 'docs', 'skill-catalog.md');

export const SCAN_DIRS = [
  'debugging', 'execution', 'judgment-and-routing', 'mcp-servers',
  'mlops', 'orchestration', 'output-quality', 'reasoning',
  'software-development', 'systems-and-architecture', 'testing', 'development',
  'research',
];
