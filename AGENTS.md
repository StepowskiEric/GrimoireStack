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
