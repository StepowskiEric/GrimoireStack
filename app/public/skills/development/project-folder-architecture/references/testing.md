# Testing Reference

Full testing layout for **TypeScript + Expo Router + React Native + Convex/Supabase** projects.

---

## Philosophy

- **Colocated tests** for unit/integration — test file sits next to the file it tests.
- **Dedicated top-level folders** for cross-cutting test types (E2E, mobile UI automation, mocks).
- **One test runner per layer** — don't mix Jest and Vitest in the same project.
- **Test behaviour, not implementation** — mock at boundaries, never internals.

---

## Test Runner Selection

| Runner | Use for | Expo / RN support |
|--------|---------|-------------------|
| **Vitest** | Unit + integration (preferred for new projects) | ✅ `vitest.config.ts` + `vitest.setup.ts` |
| **Jest** | Legacy RN setups, `@testing-library/react-native` | ✅ `jest.config.js` + `jest-expo` preset |
| **Playwright** | Web E2E (Expo web build or standalone web app) | ✅ |
| **Maestro** | Native mobile UI automation (iOS / Android simulators and devices) | ✅ — separate concern from unit tests |
| **convex-test** | Convex queries, mutations, schema (in-process mock backend) | ✅ — Vitest-based |
| **Deno test** | Supabase Edge Functions | ✅ — built into Supabase CLI |

Pick **one** unit-test runner. Vitest is preferred for new projects; Jest is fine for existing
React Native setups already using `jest-expo`. Never run both simultaneously.

---

## Colocated Unit & Integration Tests

Every production folder owns its `__tests__/` sub-folder.

```
features/ladder/
├── components/
│   ├── VoteBar.tsx
│   └── __tests__/               # component-level tests
│       └── VoteBar.test.tsx
├── hooks/
│   ├── useLadderGame.ts
│   └── __tests__/
│       └── useLadderGame.test.ts
├── utils/
│   ├── ladder-logic.ts
│   └── __tests__/
│       └── ladder-logic.test.ts
└── __tests__/                    # integration / feature-level tests
    └── ladder-integration.test.ts
```

```
convex/
├── model/
│   ├── ladder.ts
│   └── __tests__/
│       └── ladder.test.ts        # test pure helpers directly
├── mutations/
│   └── __tests__/
│       └── votes.test.tsx        # convex-test for mutation tests
└── __tests__/
    └── schema-roundtrip.test.ts  # schema, auth flow
```

```
app/(tabs)/
├── ladder/
│   ├── index.tsx
│   └── __tests__/
│       └── index.test.tsx        # screen-level integration test
```

**Rules:**
- Test the file directly above `__tests__/`. `VoteBar.tsx` → `components/__tests__/VoteBar.test.tsx`.
- Feature-level (multi-component) tests live in `features/<name>/__tests__/`.
- Test file names mirror source: `ladder-logic.ts` → `ladder-logic.test.ts`.

---

## Convex Testing (`convex-test`)

`convex-test` runs queries, mutations, and schema checks in-process — no real database.

```
convex/
├── __tests__/
│   ├── schema-roundtrip.test.ts   # defineSchema serialises / deserialises
│   ├── votes.test.ts              # mutation tests with mock backend
│   └── testModules.ts             # shared test imports (schema, validators)
```

```ts
// convex/__tests__/votes.test.ts
import { convexTest } from "convex-test";
import { afterEach, describe, it, expect } from "vitest";
import schema from "../schema";

describe("votes", () => {
  let backend: ReturnType<typeof convexTest>;

  afterEach(() => {
    backend.cleanup();
  });

  it("records a vote", async () => {
    backend = convexTest(schema);
    const matchId = await backend.insert("matches", { ... });
    await backend.runMutation(internal.votes.castVote, { matchId, choice: "left" });
    const votes = await backend.runQuery(internal.votes.getVotes, { matchId });
    expect(votes).toHaveLength(1);
  });
});
```

**Rules:**
- Test `convex/model/` helpers directly — they are pure TS functions, trivially unit-testable.
- Test public `query`/`mutation` wrappers through `convex-test` to verify argument validators and access-control checks.
- Use the `convex` fixture, never a real backend, for CI speed and determinism.
- `convex/__tests__/testModules.ts` is the shared import for all Convex tests — import from there,
  not directly from `convex/`, to keep test boundaries clean.

---

## Supabase Edge Function Testing

Edge Functions use the **Deno test runner** (built into Supabase CLI):

```
supabase/
└── functions/
    ├── my-function/
    │   └── index.ts
    └── tests/
        ├── my-function-test.ts     # Deno test
        └── helpers.ts              # shared test helpers (build Supabase client, etc.)
```

```ts
// supabase/functions/tests/my-function-test.ts
import { describe, it, beforeEach } from "https://deno.land/std@0.230.0/testing/bdd.ts";
import { assertEquals } from "https://deno.land/std@0.230.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

describe("my-function", () => {
  it("returns 200 for valid request", async () => {
    const supabase = createClient(/* test project URL + anon key */);
    const { data, error } = await supabase.functions.invoke("my-function", {
      body: { key: "value" },
    });
    assertEquals(error, null);
    assertEquals(data.status, 200);
  });
});
```

Run with `supabase functions test my-function` or `bun test` if Deno is configured in the
project's Bun workspace.

---

## Playwright (Web E2E)

```
e2e/
├── auth.spec.ts
├── ladder.spec.ts
├── helpers/
│   ├── auth.ts         # login helper, shared across specs
│   └── db.ts           # test data factory
├── fixtures/
│   └── users.ts        # deterministic test user factory
└── playwright.config.ts
```

```ts
// e2e/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:8081", // Expo web
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

Run with `pnpm test:e2e` or `npx playwright test`.

---

## Maestro (Mobile UI Automation)

Maestro drives native iOS/Android simulators and real devices via YAML flow files. It is
**not** a unit-test runner — it is a mobile UI automation layer, analogous to Playwright for web.

```
maestro/
├── flows/
│   ├── auth/
│   │   ├── login-flow.yaml
│   │   └── signup-flow.yaml
│   ├── ladder/
│   │   ├── play-duel.yaml
│   │   └── post-vote-payoff.yaml
│   └── onboarding/
│       └── welcome-flow.yaml
├── screenshots/              # Auto-captured on failure
├── maestro.config.yaml       # App binary, platform, tags
└── README.md                 # Flow conventions, device matrix
```

```yaml
# maestro/flows/ladder/play-duel.yaml
appId: com.footygoat.app
---
- launchApp
- tapOn: "Ladder"
- assertVisible: "Who's the GOAT?"
- tapOn: "Messi"
- tapOn: "Ronaldo"
- waitForAnimationToEnd
- assertVisible: "Votes recorded"
```

```bash
# Run a single flow
maestro test maestro/flows/ladder/play-duel.yaml

# Run all flows with a tag
maestro test maestro/flows --include-tags=smoke

# Run on a specific device
maestro --device=00008030-... test maestro/flows/

# Continuous mode (re-runs on file change)
maestro test maestro/flows/play-duel.yaml -c

# Upload to Maestro Cloud
maestro cloud --app-file=./build/app.ipa --flows=maestro/flows/
```

`maestro.config.yaml` (in project root or `maestro/`):

```yaml
appId: com.footygoat.app
tags:
  - smoke
  - regression
  - ios-only
  - android-only
```

**Rules:**
- One flow file per user journey. Name it after the journey: `login-flow.yaml`, not `test1.yaml`.
- Group related flows in subdirectories by feature: `flows/ladder/`, `flows/auth/`.
- Use `assertVisible` / `assertNotVisible` assertions — avoid bare `tapOn` without a check.
- Use `waitForAnimationToEnd` and `extendedWaitUntil` instead of arbitrary `wait` sleeps.
- Flows should be **idempotent** — safe to run against a fresh install or an existing session.
- Maestro flows complement unit/integration tests; they do not replace them.

---

## Test Configuration Files

| File | Runner | Purpose |
|------|--------|---------|
| `vitest.config.ts` | Vitest | Unit/integration; Expo + TS projects |
| `vitest.setup.ts` | Vitest | Global setup — mock Convex, stub Expo modules |
| `jest.config.js` | Jest | Legacy / React Native (`jest-expo` preset) |
| `jest.setup.js` | Jest | Global Jest setup |
| `e2e/playwright.config.ts` | Playwright | Web E2E — browsers, baseURL, CI reporter |
| `maestro/maestro.config.yaml` | Maestro | App binary, platform, tags |
| `__mocks__/` | Jest/Vitest | Hand-written module mocks (Convex, Expo modules) |

---

## Convex Test Isolation Principles

| Principle | Detail |
|-----------|--------|
| **Test `model/` helpers directly** | Pure TS functions — easiest, fastest, most deterministic |
| **Test public wrappers through `convex-test`** | Verifies validators and access-control fire correctly |
| **One `convex` fixture per test file** | Call `backend.cleanup()` in `afterEach` — fresh state per file |
| **Never use `Date.now()` in tests** | Inject a clock or pass explicit timestamps |
| **Avoid testing internal call chains** | Test that the mutation returns the right result, not that it called `model.foo` then `model.bar` |

---

## Supabase Test Isolation Principles

| Principle | Detail |
|-----------|--------|
| **Use a dedicated test project** | Never point tests at production Supabase |
| **Clean state between tests** | Wrap each test in a transaction and roll back, or use `supabase db reset` |
| **RLS is tested implicitly** | If your tests use the anon key, RLS policies are enforced — write at least one test per table that exercises RLS |
| **Seed deterministically** | Use factory functions, not hardcoded IDs |

---

## Universal Test Isolation Principles

| Principle | Detail |
|-----------|--------|
| **One runner per layer** | Vitest for unit/integration, Playwright for web E2E, Maestro for native UI |
| **No shared mutable state** | Each test file is independent; use factory functions for test data |
| **Mock at the boundary** | Mock Convex responses, Supabase clients, native modules — never mock your own internals |
| **CI-friendly** | All tests must pass in a headless / non-interactive environment |
| **Deterministic time** | Inject clocks in Convex and Supabase tests; never rely on `Date.now()` |
