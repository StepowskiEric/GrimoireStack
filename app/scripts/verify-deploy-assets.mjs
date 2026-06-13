#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.resolve('dist');
const htmlPath = path.join(buildDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error(`MISSING_BUILD\t${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const scriptRegex = /<script[^>]+src="([^"]+)"[^>]*>/g;

const referencedAssets = [];
for (const match of html.matchAll(scriptRegex)) {
  const src = match[1];
  if (src.startsWith('/assets/')) {
    referencedAssets.push(src);
  }
}

const missing = [];
for (const asset of referencedAssets) {
  const fullPath = path.join(buildDir, asset.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    missing.push(asset);
  }
}

if (missing.length > 0) {
  console.error(`STALE_ASSETS\t${missing.join(', ')}`);
  process.exit(1);
}

const hasAssetRef = referencedAssets.length > 0;
if (!hasAssetRef) {
  console.error('NO_ASSET_REFS');
  process.exit(1);
}

console.log(`OK\t${htmlPath}\t${referencedAssets.length} asset(s) verified`);
process.exit(0);
