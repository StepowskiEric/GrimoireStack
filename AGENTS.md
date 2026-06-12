# Repo Overview

This repo is a themed catalog of agent skills. The app is a React + Vite frontend that displays skills as grimoire entries and supports search and guided selection.

Primary app source:
- `app/`
- App shell: `app/src/App.jsx`
- Shared data: `app/src/data/schools.js`
- Styles: `app/src/App.css`
- Tests: `app/src/test/**`

## Worktree Safety

- Do not create git worktrees from `app/` or `site/` while the build tooling is running.
- The repo uses `app-dist` and `site/dist` for built output.
- Treat local caches such as `app/.npm-cache/` and `app/tmp-npm-cache/` as untracked artifacts.
- Before destructive cleanup, run:
  - `git status --porcelain`
  - `git diff`

## Install

```bash
cd app
npm install
```

## Dev Server

```bash
cd app
npm run dev
```

## Build

```bash
cd app
npm run build
```

Output lands in `app/dist/`.

## Tests

```bash
cd app
npm test
```

Test stack:
- Vitest
- @testing-library/react
- jsdom environment

## Deploy

Deploy from the React app, not `site/`.

```bash
cd app
npm run build
npx wrangler pages deploy dist --project-name grimoirestack
```

## Code Style

- Use the existing component structure in `app/src/components/`.
- Keep theme text and UX copy in place; avoid redesigning unrelated surfaces.
- Prefer minimal, reversible edits in `App.jsx` and `App.css`.
- Match existing CSS patterns for modals, cards, and navigation.

## Useful Paths

- `app/src/App.jsx`
- `app/src/App.css`
- `app/src/data/schools.js`
- `app/src/search.js`
- `app/src/components/`
- `app/src/test/`
- `site/`

## Pre-Push Checklist

Before committing, pushing, and deploying, always run this sequence
and confirm it is clean. Skipping it has shipped ReferenceErrors
(notably missing imports in `App.jsx` when new modals/banners were
added) to production before.

1. `cd app && npm run lint` — zero errors, zero warnings (or manually
   review each if the rule set was recently tuned)
2. `cd app && npm test` — all suites green, no skipped-then-failed
3. `cd app && npm run build` — vite + prerender + sitemap + RSS all
   finish without errors
4. Smoke the dev server: `cd app && npm run dev` and open
   `http://localhost:5173`. Check the browser console for
   `ReferenceError`, `TypeError`, or `is not defined` errors. The
   build can succeed with a missing JSX reference (it just bundles
   the file) and only runtime catches it.
5. Verify every JSX component rendered in `App.jsx` and
   `GrimoireStackLayout.jsx` has a matching `import` at the top of
   the file. A new `<X ... />` in JSX without a matching
   `import X from './components/X.jsx'` will crash in production.
6. `git status` — review every modified and untracked file before
   staging
7. `git diff --cached` — scan the staged diff for secrets
   (api keys, tokens, passwords) and accidental console.log bloat
8. `git log --oneline -3` — confirm the commit landed with the
   intended message style
9. `git push origin main` — push
10. `npx wrangler pages deploy dist --project-name grimoirestack` —
    deploy. A transient `fetch failed` is fine to retry; the second
    run reports `Deployment complete`.
