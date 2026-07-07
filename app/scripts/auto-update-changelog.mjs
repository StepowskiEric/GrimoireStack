/**
 * Auto-update changelog when new skills are added.
 *
 * This script is a thin wrapper around the canonical sync/registry
 * pipeline. It delegates to `scripts/sync-all.mjs` so skill discovery,
 * public copy, registry generation, and metadata emission all stay in
 * one place.
 *
 * Run as part of the build process or as a pre-commit hook.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SYNC_SCRIPT = path.join(REPO_ROOT, 'scripts', 'sync-all.mjs');

function runSync() {
  execSync(`node ${SYNC_SCRIPT}`, { cwd: REPO_ROOT, stdio: 'inherit' });
}

function main() {
  console.log('Checking for new skills...');
  runSync();
  console.log('Changelog updated automatically!');
}

main().catch((err) => {
  console.error('Error updating changelog:', err);
  process.exit(1);
});
