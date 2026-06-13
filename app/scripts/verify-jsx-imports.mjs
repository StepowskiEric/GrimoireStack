#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const files = new Set([
  path.resolve('src/App.jsx'),
  path.resolve('src/components/GrimoireStackLayout.jsx'),
]);

const jsxTagRegex = /<([A-Z][A-Za-z0-9_]*)[\s/>]/g;

const allowedByFile = new Map([
  [
    'src/App.jsx',
    new Set([
      'BrowserRouter',
      'LanguageProvider',
      'ErrorBoundary',
      'ApprenticeWelcome',
      'GrimoireStackLayout',
      'AppInner',
      'StaleLinkBanner',
      'ShortcutsModal',
      'CompareSpellsModal',
      'ProblemIntakeModal',
      'SpellModal',
      'LidlessEyeCast',
      'InstallPrompt',
      'Suspense',
      'Fragment',
    ]),
  ],
  [
    'src/components/GrimoireStackLayout.jsx',
    new Set([
      'GrimoireStackLayout',
      'SchoolCardGrid',
      'SpellDetailView',
      'SpellCard',
      'FavoritesView',
      'RecipeLabView',
      'BestiaryCodex',
      'SpellWeb',
      'ChangelogView',
      'SettingsView',
      'AllSchoolsView',
      'GrimoireEye',
      'SchoolSigil',
      'Icon',
      'AboutView',
      'LanguageToggle',
      'CommuneView',
      'Suspense',
      'Fragment',
    ]),
  ],
]);

let exitCode = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`MISSING_FILE\t${path.relative(process.cwd(), file)}`);
    exitCode = 1;
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  const allowed = allowedByFile.get(path.relative(process.cwd(), file)) || new Set();
  const missing = [];
  for (const tagMatch of content.matchAll(jsxTagRegex)) {
    const component = tagMatch[1];
    if (allowed.has(component)) continue;
    missing.push(component);
  }

  if (missing.length > 0) {
    console.error(`MISSING_IMPORTS\t${path.relative(process.cwd(), file)}\t${missing.join(', ')}`);
    exitCode = 1;
  } else {
    console.log(`OK\t${path.relative(process.cwd(), file)}`);
  }
}

process.exit(exitCode);
