---
name: project-folder-architecture
description: "Folder architecture for TypeScript + Expo Router + React Native + Supabase full-stack projects, updated to 2026 conventions. Use when scaffolding a new project, restructuring an existing one, auditing folder health, or answering 'where should this file live?'."
---

# Project Folder Architecture

For **TypeScript + Expo Router + React Native + Supabase** projects. Supabase edge functions, migrations, and queues layout follows the official 2026 conventions. SurrealDB and daemon/service references are linked at the bottom for non-Expo backends.

---

## Guiding Principles

1. **Route groups reflect user flow, not technical structure.** `(auth)`, `(tabs)`, `(welcome)` are first-class organizational tools.
2. **Feature-first over layer-first.** Group by what the user does (`ladder/`, `profile/`), not by file type (`components/`, `screens/`). Layer folders hold *cross-cutting shared* code only.
3. **Promote on reuse, demote on specificity.** A util lives inside its feature until a second feature needs it, then it moves up.
4. **Clear ownership boundaries.** If deleting a feature folder breaks other features, boundaries leaked. Features must not import from each other directly.

---

## Canonical Structure (compressed)

```
app/                      Expo Router file-based routes
  _layout.tsx             Root layout — auth guards, providers
  (auth)/ (tabs)/ (welcome)/   Route groups (invisible in URL)
  [param].tsx             Dynamic routes
features/                 Vertical slices — primary organizing axis
  <feature>/
    components/  hooks/  utils/  __tests__/
components/               Shared UI primitives (used across 2+ features)
  ui/                     Atoms (Button, Avatar, Badge, Skeleton)
  brand/                  Branded (app-styled components)
hooks/                    Cross-cutting hooks (2+ features)
services/                 API client layer — thin Supabase wrappers
  supabaseApi/            TanStack Query hooks + queryKeys.ts
stores/                   Zustand or global persisted stores
providers/                App-level wiring (React Query, Auth, Theme)
context/                  React Context — only if NOT using Zustand
constants/  types/  utils/  lib/
supabase/
  migrations/             SQL migrations
  functions/              Edge Functions (fat functions, _shared/ for common code)
  config.toml  seed.sql  types.ts
docs/                     Architecture, ADRs, agent guides
e2e/                      Playwright tests
__mocks__/                Hand-written module mocks
tsconfig.json             Path aliases (@/, @features/, @components/)
app.config.ts             Expo config (env vars at build time)
```

Full per-layer rules and config templates are in [`references/testing.md`](references/testing.md), [`references/daemon-service.md`](references/daemon-service.md), [`references/surrealdb.md`](references/surrealdb.md).

---

## Testing — Quick Layout

| Test type | Location | Runner |
|---|---|---|
| Unit / integration | `__tests__/` colocated | Vitest (preferred) or Jest |
| Supabase queries / schema | `supabase/__tests__/` | Supabase test helpers |
| Supabase Edge Functions | `supabase/functions/tests/` | Deno test runner |
| Web E2E | `e2e/` | Playwright |
| Mobile UI automation | `maestro/` | Maestro CLI |

See [`references/testing.md`](references/testing.md) for runner selection, isolation, and config details.

---

## Layer-by-Layer Rules (essentials)

### `app/` — Routes, not screens
File name IS route name. `_layout.tsx` = layout boundary. Keep screens lean — components own their own state.

### `features/` — Vertical slices
Each feature owns its components, hooks, utils. **No `features/a → features/b` imports.** Shared code moves up to `components/`, `hooks/`, `utils/`, or `services/`.

### `components/` — Shared UI primitives
Two sub-layers: `ui/` (atoms, no business logic) and `brand/` (branded). One level of nesting max — deeper signals a feature folder should exist.

### `services/` — API client layer
Thin Supabase wrappers. `queryKeys.ts` centralizes TanStack Query keys. One file per domain (`ladder.ts`, `profiles.ts`). No imports from `features/`.

### `supabase/`
Use **fat functions** (fewer large ones, not many tiny ones). Shared code in `_shared/` (underscore prefix prevents deployment). Function folders use hyphens: `send-notification/`.

### `providers/` vs `context/`
`providers/` for app-level wiring (React Query, Auth, Theme). `context/` only if not using Zustand. Pick one mechanism per domain — never both.

---

## Dependency Rules (the most important rule)

```
utils/  ←  hooks/  ←  services/  ←  features/  ←  app/
  ↑                              ↑
  └────── shared ───────────────┘
```

| Can import from… | Can NOT import from… |
|---|---|
| `utils/` | `app/`, `features/`, `services/` |
| `hooks/` | `app/`, `features/` |
| `services/` | `app/`, `features/` |
| `features/` | other `features/`, `app/` |
| `app/` | (nothing — top of graph) |

**Quick test:** Delete `features/ladder/`. If anything outside `app/(tabs)/ladder/` and `services/supabaseApi/ladder.ts` breaks, boundaries leaked.

---

## Naming Conventions

| Pattern | Example |
|---|---|
| Folder / file | kebab-case: `geo-guess/`, `ladder-logic.ts` |
| Component | PascalCase: `PostVotePayoff` |
| Hook | camelCase + `use` prefix: `useLadderGame` |
| Edge Function folder | kebab-case with hyphens: `send-notification/` |
| Test files | `*.test.ts(x)` colocated in `__tests__/` |

---

## Migration Path (Restructuring)

1. **Audit → Create → Move → Fix imports → Delete dead code.**
2. Start with `features/`. Identify clusters from existing screen folders.
3. Move feature-private code first (ladder-specific components → `features/ladder/`).
4. Extract cross-feature code up (`components/`, `hooks/`, `utils/`, `services/`).
5. Update `tsconfig.json` path aliases.
6. Run tests at every step — one folder per commit is safest.

---

## What "Good" Looks Like

- Renaming `features/ladder/` → `features/goat-debate/` only changes files inside that folder and `app/(tabs)/ladder/` routes.
- Deleting `features/profile/` breaks nothing in `features/ladder/` or `features/social/`.
- Every route's purpose is obvious from the folder name alone.

---

## Failure Modes

| ❌ | ✅ |
|---|---|
| Business logic in screens | Move to `features/*/utils/` |
| `features/a → features/b` imports | Promote shared code up |
| Component tests in top-level `__tests__/` | Colocate in feature folders |
| Deeply nested components (>2 levels) | Create a feature folder |
| Forgetting function names in `ctx.db` calls | `ctx.db.get("tableName", id)` |
| `Date.now()` in query functions | Pass time as explicit argument |

---

## References

| File | Covers |
|------|--------|
| [`references/testing.md`](references/testing.md) | Full testing layout, runner selection, isolation |
| [`references/daemon-service.md`](references/daemon-service.md) | Daemon / long-running service structure |
| [`references/surrealdb.md`](references/surrealdb.md) | SurrealDB schema and migration patterns |