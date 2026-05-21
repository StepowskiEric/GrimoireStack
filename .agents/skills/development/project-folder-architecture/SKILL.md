---
name: project-folder-architecture
description: >
  Universal folder architecture skill for TypeScript + Expo (React Native) + Convex/Supabase
  full-stack projects, updated to 2026 conventions. Covers Expo SDK 55+/Router file-based routing,
  Convex best-practices (model/ split, internal.*), Supabase Edge Functions layout, Supabase migrations,
  Supabase Cron (pg_cron), and Supabase Queues (pgmq). SurrealDB and daemon/service backend references
  are included for non-Expo backends.
  Use when scaffolding a new project, restructuring an existing one, auditing folder health, or
  answering "where should this file live?".
---

# Project Folder Architecture

Universal folder organization for **TypeScript + Expo Router + React Native + Convex/Supabase**
projects, updated to 2026 standards.

---

## Guiding Principles

1. **Route groups reflect user flow, not technical structure.** Expo Router's `(auth)`, `(tabs)`,
   `(welcome)` groups are first-class organizational tools — use them.
2. **Feature-first over layer-first.** Group by what the user does (ladder, profile, social),
   not by file type (components, screens). Layer folders (`components/`, `hooks/`) hold
   *cross-cutting shared* code only.
3. **Thin API, thick model.** In Convex, public `query`/`mutation`/`action` wrappers are short;
   business logic lives in `convex/model/` helpers.
4. **Promote on reuse, demote on specificity.** A util lives inside its feature until a second
   feature needs it, then it moves up to the shared layer.
5. **Clear ownership boundaries.** If deleting a feature folder would break other features,
   your boundaries leaked. Features must not import from each other directly.

---

## The Canonical Structure

```
your-project/
├── app/                          # Expo Router file-based routes (source of truth for navigation)
│   ├── _layout.tsx              # Root layout — auth guards, providers, Stack root
│   ├── (auth)/                   # Route group — unauthenticated screens (excluded from URL)
│   │   ├── _layout.tsx          # Auth layout (no tabs, no header)
│   │   ├── login/
│   │   │   └── index.tsx
│   │   └── signup/
│   │       └── index.tsx
│   ├── (tabs)/                   # Route group — authenticated tabbed UI
│   │   ├── _layout.tsx          # Tabs layout; wrap sensitive tabs in Tabs.Protected
│   │   ├── index.tsx            # Default/home tab
│   │   ├── ladder/
│   │   │   ├── _layout.tsx      # Stack layout inside the tab (for drill-down)
│   │   │   ├── index.tsx        # Main ladder screen
│   │   │   └── [matchId].tsx    # Param route for a specific duel
│   │   ├── profile/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── social/
│   │   │   ├── index.tsx
│   │   │   ├── friends.tsx
│   │   │   └── versus.tsx
│   │   └── settings.tsx         # Single-screen tab
│   ├── (welcome)/               # Route group — first-run / onboarding (no auth yet)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── +not-found.tsx
│
├── features/                     # Feature-first domain modules (primary organizing axis)
│   ├── ladder/
│   │   ├── components/           # Feature-scoped UI (VoteBar, PortraitDuel, GhostRaceBar)
│   │   ├── hooks/                # Feature-scoped hooks (useLadderGame, useRoundTimer)
│   │   ├── utils/                # Feature-scoped pure logic (ladder-logic.ts, variableRewards.ts)
│   │   └── __tests__/
│   ├── profile/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── social/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── rivalry/
│   ├── pack/
│   ├── geo/
│   └── ranking/
│
├── components/                   # Shared/reusable UI primitives (used across 2+ features)
│   ├── ui/                       # Atomic: Button, Avatar, Badge, Skeleton, Toast
│   ├── brand/                    # Branded: GoatyCharacter, haptic-tab, NavigationTracker
│   ├── external-link.tsx
│   └── SwipeBackWrapper.tsx
│
├── hooks/                        # Shared cross-cutting hooks (used across 2+ features)
│   ├── useAppLifecycle.ts
│   ├── useRootNavigation.ts
│   ├── useServerFunctions.ts     # Convex use-* wrapper aggregator
│   ├── voteRefresh.ts
│   └── __tests__/
│
├── services/                     # API client layer — thin wrappers around Convex/Supabase
│   ├── convexApi/               # TanStack Query hooks for Convex functions
│   │   ├── client.ts            # Convex React client setup
│   │   ├── index.ts             # Barrel: re-export all hooks
│   │   ├── queryKeys.ts         # TanStack Query key factory
│   │   ├── ladder.ts
│   │   ├── profiles.ts
│   │   ├── friends.ts
│   │   ├── geoGuess.ts
│   │   ├── packs.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── alerts.ts                # Push notification helpers
│   ├── devAuth.ts               # Dev-only auth bypass
│   └── oauthTokenBridge.ts
│
├── stores/                       # Zustand or other global persisted stores
│   ├── appStore.ts
│   ├── streakStore.ts
│   └── __tests__/
│
├── .env                          # Local secrets (never commit)
├── .env.local                    # Overrides, gitignored
├── .env.example                  # Template for new devs
│
├── providers/                    # App-level provider wiring
│   ├── ConvexProvider.tsx       # Convex client + React Query provider
│   ├── ConvexAuthProvider.tsx
│   ├── ThemeProvider.tsx
│   └── SafeAreaProvider.tsx
│
├── context/                      # React Context providers (if Zustand isn't used)
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── constants/                    # App-wide constants (theme tokens, identity strings, limits)
│   ├── theme.ts
│   ├── Colors.ts
│   └── config.ts
│
├── types/                        # Shared TypeScript types not owned by a single feature
│   ├── index.ts
│   ├── pack.types.ts
│   └── tooling.d.ts
│
├── utils/                        # Pure utilities used across features (zero React dependency)
│   ├── format/
│   │   ├── date.ts
│   │   └── score.ts
│   └── validation/
│       └── slug.ts
│
├── lib/                          # App-wide infrastructure: client bootstrap, logger, sound, storage
│   ├── convex-client.ts         # Convex client bootstrap
│   ├── logger.ts
│   ├── sounds.ts
│   └── storage.ts
│
├── convex/                       # Convex backend (schema + functions)
│   ├── schema.ts                 # Single source of truth: defineSchema + defineTable
│   ├── crons.ts                  # Scheduled functions (ctx.scheduler)
│   ├── auth.config.ts            # Auth provider config (email/password, OAuth, etc.)
│   ├── auth/
│   │   └── index.ts              # Auth helpers (createUser, signIn, signOut wrappers)
│   ├── _generated/               # Auto-generated — DO NOT EDIT
│   │   ├── api.ts
│   │   ├── server.ts
│   │   └── ...
│   ├── model/                    # Business logic helpers — most code lives here
│   │   ├── ladder.ts
│   │   ├── profiles.ts
│   │   ├── players.ts
│   │   ├── packs.ts
│   │   ├── notifications.ts
│   │   └── ...
│   ├── queries/                  # Thin public query wrappers → delegate to model/
│   │   ├── ladder.ts
│   │   ├── profiles.ts
│   │   └── ...
│   ├── mutations/                # Thin public mutation wrappers → delegate to model/
│   │   ├── ladder.ts
│   │   ├── profiles.ts
│   │   ├── votes.ts
│   │   └── ...
│   ├── actions/                  # Side-effectful functions (external APIs, Node.js code)
│   │   ├── scrape.ts
│   │   └── ai.ts
│   ├── http/                     # HTTP Actions (webhooks, custom routes)
│   │   └── stripe-webhook.ts
│   ├── migrations/               # Convex schema/data migrations
│   │   ├── 001_initial_schema.ts
│   │   └── 002_add_goat_rating.ts
│   └── __tests__/
│
├── supabase/                     # Only if using Supabase alongside/instead of Convex
│   ├── migrations/               # SQL migrations (supabase migration new)
│   ├── functions/                # Edge Functions
│   │   ├── _shared/              # Shared code — underscore prefix prevents deployment as a function
│   │   │   ├── supabaseClient.ts # Supabase client with publishable key
│   │   │   ├── supabaseAdmin.ts  # Supabase client with service_role key
│   │   │   └── cors.ts
│   │   ├── send-notification/
│   │   │   └── index.ts
│   │   ├── stripe-webhook/
│   │   │   └── index.ts
│   │   └── tests/
│   ├── seed.sql                  # Seed data (idempotent, safe to re-run)
│   ├── config.toml               # Supabase local config (links to local dev)
│   └── types.ts                  # Generated types (supabase gen types typescript)
│
├── docs/                         # Architecture, ADRs, launch docs, agent guides
│   ├── architecture.md
│   ├── adr/
│   │   ├── 001-auth-provider.md
│   │   └── 002-db-choice.md
│   ├── launch/
│   └── agent/
│       └── AGENTS.md             # Project-specific agent rules
│
├── e2e/                          # Playwright / Detox end-to-end tests
│   └── auth.spec.ts
│
├── assets/                       # Static files (images, fonts, audio)
│   ├── images/
│   ├── fonts/
│   └── audio/
│
├── translations/                 # i18n / l10n files
│   ├── en.json
│   └── es.json
│
├── scripts/                      # One-off scripts, data imports, seed runners
│   ├── seed-convex.ts
│   └── import-players.ts
│
├── data/                         # Raw / generated data files (JSON, CSV snapshots)
│   └── players_backup.json
│
├── vitest.config.ts            # Unit/integration test runner config
├── vitest.setup.ts              # Global test setup (Convex mocks, Expo stubs)
├── jest.config.js               # Legacy / RN-specific test config
├── __mocks__/                   # Hand-written module mocks (Convex, Expo)
├── tsconfig.json                 # Path aliases: @/* → root, @features/* → features/, etc.
├── tsconfig.node.json
├── package.json
├── app.config.ts                 # Expo config (expo-router, plugins, runtime config)
├── eas.json                      # EAS Build / Submit / Update configuration
└── README.md
```

**Env vars:** Prefix secrets with `EXPO_PUBLIC_` to expose them to the bundle.
`app.config.ts` reads `process.env` at build time — never hardcode credentials.
Use `expo-secret` or Vault for production secrets. `.env`, `.env.local`, and `.env.example`
are gitignored / templated per-project.

---

## Testing

Tests live **colocated with the code they test** (unit/integration) or in dedicated
folders for cross-cutting test types (E2E, browser, mobile-automation). Full details — runner
selection, Convex `convex-test`, Supabase Deno tests, Playwright, Maestro, test config files,
and isolation principles — are in [`references/testing.md`](references/testing.md).

**Runner selection:** Vitest for all non-native code (utils, hooks, components, Convex `model/` helpers,
Convex queries/mutations via `convex-test`). Jest only for React Native component tests that touch
native modules (Metro bundler dependency). `convex-test` reuses the same `vitest.config.ts` — no
separate runner needed. Supabase Edge Function tests use the Deno test runner and live in
`supabase/functions/tests/`.

Quick summary:

| Test type | Location | Runner |
|-----------|----------|--------|
| Unit / integration (components, hooks, utils, `convex/model/` helpers) | `__tests__/` colocated in each folder | Vitest (preferred) or Jest |
| Convex queries, mutations, schema | `convex/__tests__/` | `convex-test` (Vitest-based) |
| Supabase Edge Functions | `supabase/functions/tests/` | Deno test runner |
| Web E2E | `e2e/` | Playwright |
| Mobile UI automation | `maestro/` | Maestro CLI |
| Mocks | `__mocks__/` at project root | — |

---

## Layer-by-Layer Rules

### `app/` — Routes, Not Screens

- **File = route.** Every `.tsx` file directly inside `app/` or a route group is a routable
  screen. The file name IS the route name.
- **`_layout.tsx` = layout boundary.** Put navigators (Stack, Tabs, Drawer) and global
  providers here, not inside screens.
- **Route groups `(name)` are invisible in the URL.** Use them to group screens by concern
  (auth state, tab layout) without polluting routes.
- **`[param].tsx` for dynamic routes.** `[matchId].tsx`, `[id].tsx` — never catch-all `[...slug]`
  unless you need it.
- **Keep screens lean.** Screens compose; components own their own state, hooks, and API logic.
- **Tests live adjacent:** `app/(tabs)/ladder/__tests__/index.test.tsx` (colocated).

### `features/` — Feature Modules

Each feature folder is a **vertical slice**. It owns everything needed for that feature:

```
features/ladder/
├── components/   # Ladder-specific UI
├── hooks/        # Ladder-specific hooks
├── utils/        # Ladder-specific pure logic
└── __tests__/
```

- **Naming is singular:** `ladder/`, not `ladders/`. `ladder-logic.ts`, not `ladders-logic.ts`.
  (Exception: top-level plural folders like `features/`, `components/`, `hooks/` hold many things.)
- **No feature imports from another feature.** If `features/ladder/` needs something from
  `features/profile/`, that shared piece belongs in `components/`, `hooks/`, `utils/`, or
  `services/` at the top level.
- **Promote when reused:** A util only `ladder` uses → `features/ladder/utils/`. A util two
  features use → `utils/format/`.
- **Tests colocated:** `__tests__/` inside each feature folder.

### `components/` — Shared UI Primitives

- **Two sub-layers:**
  - `components/ui/` — framework-agnostic atoms (Button, Badge, Skeleton). No business logic.
  - `components/footygoat/` — branded components with app-specific styling or logic.
- **No feature-specific logic here.** If it imports from `features/ladder/`, it belongs in the
  feature.
- **One level of nesting max.** `components/ui/button/icon.tsx` is fine; deeper nesting signals
  a feature folder should exist instead.

### `services/` — API Client Layer

- **Thin wrappers around Convex/Supabase calls.** No business logic — just invocation and
  response shaping.
- **`services/convexApi/`** — TanStack Query hooks (useQuery/useMutation wrappers around
  Convex `useQuery`/`useMutation`).
- **`queryKeys.ts`** — Centralised TanStack Query key factory; prevents key mismatches.
- **One file per domain area:** `ladder.ts`, `profiles.ts`, `friends.ts`, etc.
- **No imports from `features/`.** Services are below features in the dependency graph.

### `hooks/` — Shared Cross-Cutting Hooks

- Hooks used by 2+ features go here (e.g. `useServerFunctions`, `useAppLifecycle`).
- Hooks used by only one feature live in that feature's `hooks/` folder.

### `stores/` — Global Client State

- Zustand stores (or equivalent) for state that must survive across navigation and re-renders.
- `appStore.ts` — global app state (theme, onboarding complete, etc.)
- `streakStore.ts` — persisted user state (login streak, last visit)

### `convex/` — Backend (Convex)

Official Convex best-practice layout:

```
convex/
├── schema.ts              # defineSchema + all defineTable calls (single source of truth)
├── crons.ts               # ctx.scheduler.runAfter / runAt schedules
├── auth.config.ts         # Auth provider configuration
├── auth/                  # Auth helper functions
├── _generated/            # Auto-generated — never edit manually
├── model/                 # ← Most code lives here
│   ├── ladder.ts          # Pure helper functions (no query/mutation/action wrapper)
│   ├── profiles.ts
│   └── ...
├── queries/               # Public: thin wrappers → model/
├── mutations/             # Public: thin wrappers → model/
├── actions/               # Side-effects, external APIs, Node.js code
├── http/                  # HTTP Actions (webhooks)
└── migrations/            # Zero-downtime schema migrations
```

**Key rules (from official Convex best-practices):**

| Rule | Why |
|------|-----|
| `model/` helpers do the real work | Easier to test, easier to refactor |
| Public API wrappers are ~3 lines | `return await Ladder.resolveMatch(ctx, args)` |
| Use `internal.*` not `api.*` for internal calls | `api.*` is public — anyone can call it; `internal.*` is Convex-only |
| Always pass table name to `ctx.db` calls | `ctx.db.get("ladderMatches", id)` — safety + future-custom-ID compat |
| Use argument validators (`v.*`) on every public function | Prevents spoofed/malformed inputs |
| Check `ctx.auth.getUserIdentity()` in every public function | Access control — identity cannot be spoofed |
| Prefer `withIndex` over `.filter` in queries | Index queries are far more efficient |
| Avoid `.collect()` on unbounded queries | Use `.paginate()`, `.take()`, or denormalised counters |

### `supabase/` — Supabase (when used alongside or instead of Convex)

Only present if the project uses Supabase. Follow official Supabase layout:

```
supabase/
├── config.toml             # Local Supabase config
├── seed.sql                # Idempotent seed data
├── migrations/             # SQL migration files (supabase migration new)
├── functions/              # Edge Functions
│   ├── _shared/            # Shared code (underscore = excluded from deployment)
│   │   ├── supabaseClient.ts
│   │   ├── supabaseAdmin.ts
│   │   └── cors.ts
│   ├── my-function/
│   │   └── index.ts
│   └── tests/              # Function tests
└── types.ts                # Generated TS types (supabase gen types typescript)
```

**Edge Functions rules:**
- Use **"fat functions"** — fewer large functions, not many tiny ones.
- Shared code goes in `_shared/` (the underscore prefix prevents Supabase from deploying it as a function).
- Name functions with hyphens: `my-function/`, not `my_function/` or `myFunction/`.
- One `index.ts` per function — it is the entrypoint.

### `providers/` — App-Level Wiring

- Use `providers/` for framework and app-level client wiring (Convex, React Query, Theme, Auth,
  SafeArea). This is the only place where top-level app providers are composed.
- **`providers/` vs `context/`:** Use `providers/` for app-level concerns. Use `context/` only if
  you are **not** using Zustand and need React Context for feature-scoped or domain state. Never use
  both for the same concern — pick one mechanism per domain.

### `context/` — Feature State (only if not using Zustand)

- **`AuthContext.tsx`**, **`ThemeContext.tsx`** — React Context for feature-scoped state.
- If using Zustand (`stores/`), skip this folder entirely for concerns already in `stores/`.

---

## Dependency Rules (the most important rule)

```
utils/  ←  hooks/  ←  services/  ←  features/  ←  app/
  ↑                              ↑
  └────── shared ───────────────┘
```

| Can import from… | Can NOT import from… |
|------------------|----------------------|
| `utils/` | `app/`, `features/`, `services/` |
| `hooks/` | `app/`, `features/` |
| `services/` | `app/`, `features/` |
| `features/` | other `features/`, `app/` |
| `app/` | (nothing — top of the graph) |

Shared `components/`, `hooks/`, `utils/`, `services/` are the **only** way features communicate.
Direct `features/a → features/b` imports = architectural violation.

**Quick test:** Delete `features/ladder/`. If anything outside `app/(tabs)/ladder/` and
`services/convexApi/ladder.ts` breaks, the boundaries leaked.

---

## Naming Conventions

| Pattern | Example |
|---------|---------|
| Folder: kebab-case | `geo-guess/`, `weekly-war/` |
| File: kebab-case | `ladder-logic.ts`, `post-vote-payoff.tsx` |
| Component: PascalCase | `PostVotePayoff`, `GhostRaceBar` |
| Hook: camelCase with `use` prefix | `useLadderGame`, `useRoundTimer` |
| Convex function file | kebab-case: `weekly-war.ts`, `daily-battle.ts` |
| Convex model helper file | kebab-case: `ladder.ts`, `notifications.ts` |
| Edge Function folder | kebab-case with hyphens: `send-notification/` |
| Barrel files | `index.ts` (use sparingly — hurts tree-shaking) |
| Test files | `*.test.ts` or `*.test.tsx`, colocated in `__tests__/` |

---

## `tsconfig.json` Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/services/*": ["services/*"],
      "@/utils/*": ["utils/*"],
      "@/lib/*": ["lib/*"],
      "@/features/*": ["features/*"],
      "@/types/*": ["types/*"],
      "@/convex/*": ["convex/*"],
      "@/assets/*": ["assets/*"]
    }
  }
}
```

With aliases, `import { useQuery } from '@/services/convexApi/ladder'` instead of
`../../../services/convexApi/ladder`.

---

## Auth Guard Pattern (Expo Router)

```tsx
// app/_layout.tsx — root layout
import { Stack } from 'expo-router';
import { useAuthState } from '@/hooks/useAuthState';

export default function RootLayout() {
  const { isLoggedIn, isLoading } = useAuthState();

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn && !isLoading}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn && !isLoading}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
```

Protected routes re-evaluate when auth state changes — no manual redirects needed.

---

## Feature Folder Anatomy (complete example)

```
features/ladder/
├── __tests__/
│   ├── ladder-logic.test.ts
│   ├── current-duel.test.tsx
│   └── ghost-race-hook.test.tsx
├── components/
│   ├── __tests__/
│   │   ├── PostVotePayoff.test.tsx
│   │   └── RunStreakCallout.test.tsx
│   ├── ClimbTracker.tsx
│   ├── GhostRaceBar.tsx
│   ├── LadderHeader.tsx
│   ├── PortraitDuel.tsx
│   ├── PostVotePayoff.tsx
│   ├── RunStreakCallout.tsx
│   ├── VoteBar.tsx
│   └── WelcomeBackOverlay.tsx
├── hooks/
│   ├── useLadderGame.ts
│   └── useGhostRace.ts
└── utils/
    ├── ladder-logic.ts
    └── variableRewards.ts
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Put business logic in screens | Move to `features/*/utils/` or `convex/model/` |
| Import `features/a` from `features/b` | Promote shared code to `components/`, `hooks/`, or `services/` |
| Use `.filter` on Convex DB queries | Use `.withIndex()` with a proper index |
| `.collect()` on unbounded queries | Use `.paginate()`, `.take()`, or denormalised counts |
| Use `api.*` from within Convex functions | Use `internal.*` — `api.*` is callable by anyone |
| Forget table names in `ctx.db` calls | Always `ctx.db.get("tableName", id)` |
| Put component tests in a top-level `__tests__/` folder | Colocate: `features/ladder/__tests__/` |
| Mix Convex auth and Supabase auth in the same project | Pick one; if migrating, complete the cut before removing the other |
| Deeply nested components (>2 levels) | That's a signal to create a new feature folder |
| `Date.now()` in Convex queries | Pass time as an explicit argument, or use a scheduled function to set a boolean flag |

---

## Migration Path (Restructuring an Existing Project)

If you're reorganizing a project that already has files:

1. **Audit → Create → Move → Fix imports → Delete dead code.**
2. **Start with `features/`.** Identify logical feature clusters from existing screen folders
   and `components/` files. Create `features/<name>/` with `components/`, `hooks/`, `utils/`.
3. **Move feature-private code first.** Ladder-specific components and hooks go to
   `features/ladder/`. Nothing outside `features/ladder/` should import from it.
4. **Extract cross-feature code up.** Code two features share → `components/`, `hooks/`, or
   `services/`.
5. **Restructure `convex/` last.** Add `convex/model/`, split existing mutation files into
   thin wrappers + model helpers, convert `api.*` → `internal.*` for cron/internal calls.
6. **Update path aliases** in `tsconfig.json` to match new layout.
7. **Run tests at every step.** Don't batch — one folder per commit is safest.

---

## What "Good" Looks Like

- You can rename `features/ladder/` → `features/goat-debate/` and only files inside that folder
  and the `app/(tabs)/ladder/` routes need to change.
- New features are added by creating a new `features/<name>/` folder and a route group in `app/`.
- You can delete `features/profile/` and nothing in `features/ladder/` or `features/social/` breaks.
- Convex public functions are 2–5 lines each, delegating to `convex/model/`.
- No `api.foo.bar()` calls from within `convex/` — only `internal.foo.bar()`.
- Every route's purpose is obvious from the folder name alone. No one has to open a file
  to understand what part of the app it serves.

---

## Reference Files

| File | Covers |
|------|--------|
| [`references/testing.md`](references/testing.md) | Full testing layout: Vitest, Jest, Playwright, Maestro, Convex `convex-test`, Supabase Edge Functions, test isolation principles |
| [`references/daemon-service.md`](references/daemon-service.md) | Daemon / long-running service project structure (Coppermind pattern): monorepo layout, `src/` capability domains, lifecycle, config subsystem, test layout for services |
| [`references/surrealdb.md`](references/surrealdb.md) | SurrealDB project structure: schema file organisation, SurrealKit conventions, schema design patterns, multi-tenancy, testing, client connection patterns, migration workflows |
