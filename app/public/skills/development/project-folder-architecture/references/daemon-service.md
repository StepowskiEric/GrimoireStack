# Daemon / Service Project Architecture

Folder organization for **long-running service projects** — daemons, background workers, API servers,
and infrastructure components. Distinct from mobile apps (Expo) and web frontends.

---

## What Is a "Daemon" Project

A daemon project is a **long-running process** that:
- Starts once and runs until stopped (not request→response per user interaction)
- Owns a port or socket, accepts connections, and processes events
- Has lifecycle concerns: startup, health checks, graceful shutdown, config reload
- May serve multiple protocols: HTTP API, gRPC, CLI, WebSocket, MCP
- Is often deployed as a container or systemd service, not shipped to an app store

Coppermind (`coppermindd`) is the canonical example in this repo: a SurrealDB-backed memory
daemon that exposes an HTTP API, an MCP server, a CLI, and a gateway.

---

## Canonical Daemon Structure

```
coppermind/                          # Monorepo root (Bun workspaces)
├── package.json                    # Root: workspaces, scripts, bin
├── bun.lock
├── tsconfig.json                   # Root TS config (references, paths)
├── CONTEXT.md                      # Project context / architecture notes
├── AGENTS.md                       # Repo-wide agent guidelines
│
├── daemon/                         # Core daemon — the long-running process
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.ts                 # Entry point: bootstrap, signal handlers
│   │   ├── index.ts                # Public API exports
│   │   ├── coppermind.ts           # Daemon class / process manager
│   │   ├── coppermindd.ts          # CLI entry (bin)
│   │   ├── cli.ts                  # CLI argument parsing
│   │   ├── config.ts               # Config loading (env, file, flags)
│   │   ├── types.ts                # Shared internal types
│   │   ├── logger.ts               # Structured logging
│   │   │
│   │   ├── server/                 # HTTP / TCP server
│   │   │   ├── server.ts           # Server bootstrap
│   │   │   ├── routes/             # HTTP route handlers
│   │   │   └── middleware/         # Auth, CORS, logging, rate-limit
│   │   │
│   │   ├── mcp/                    # MCP server (Model Context Protocol)
│   │   │   ├── server.ts
│   │   │   ├── handlers/           # Tool/resource/prompt handlers
│   │   │   └── tools/              # Individual MCP tools
│   │   │
│   │   ├── cli/                    # CLI subcommands
│   │   │   ├── command-router.ts   # Routes subcommand → handler
│   │   │   ├── commands/           # One file per subcommand
│   │   │   └── help.ts
│   │   │
│   │   ├── config/                 # Config subsystem
│   │   │   ├── loader.ts           # Env + file loading, precedence
│   │   │   ├── types.ts            # Config schema (zod / valibot)
│   │   │   └── local-config-status.ts
│   │   │
│   │   ├── memory/                 # Core domain: memory operations
│   │   │   ├── index.ts
│   │   │   ├── admission/          # Ingest / validate incoming memories
│   │   │   ├── cleanup/            # TTL, deduplication, compaction
│   │   │   ├── store/              # Abstract store interface
│   │   │   └── surreal/            # SurrealDB store implementation
│   │   │
│   │   ├── retrieval/              # Search, recall, semantic retrieval
│   │   │
│   │   ├── sync/                   # Sync with external systems
│   │   │
│   │   ├── runtime/                # Runtime adapters (Hermes, Claude, etc.)
│   │   │
│   │   ├── lifecycle/              # Startup, health, shutdown
│   │   │   ├── health.ts
│   │   │   ├── format.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── monitoring/             # Metrics, tracing, observability
│   │   │
│   │   ├── text-metrics/           # Token counting, cost estimation
│   │   │
│   │   ├── local-ai/               # Local embedding / classification models
│   │   │   ├── cloud-adapters/     # Cloud provider adapter (OpenAI, etc.)
│   │   │   └── tasks/              # Background AI tasks
│   │   │
│   │   ├── codebase-indexer/       # Source-code understanding subsystem
│   │   │
│   │   ├── codex-hooks/            # Codex CLI integration hooks
│   │   │
│   │   ├── surreal-local/          # Embedded SurrealDB for local mode
│   │   │
│   │   ├── compat/                 # Polyfills / compatibility shims
│   │   │
│   │   ├── terminal/               # Terminal / TTY utilities
│   │   │
│   │   └── utils/                  # Pure helpers (no side-effects)
│   │
│   ├── tests/                      # Test suite (not colocated — daemon is a service)
│   │   ├── smoke/                  # Smoke / smoke tests
│   │   ├── benchmarks/             # Performance benchmarks
│   │   └── helpers/                # Shared test utilities
│   │
│   ├── assets/                     # Bundled assets (local AI models, etc.)
│   │   ├── local-ai/
│   │   │   ├── onnx-embedder/
│   │   │   ├── onnx-triage/
│   │   │   └── granite-embedder/
│   │   └── spacetimedb/
│   │
│   ├── mocks/                      # Test doubles / mock implementations
│   │
│   ├── scripts/                    # Dev / ops scripts
│   │
│   ├── skills/                     # Daemon-internal skills (AI behaviour tuning)
│   │   └── coppermind-memory-saver/
│   │
│   └── specs/                      # OpenAPI / protocol specs
│
├── gateway/                        # Edge / API gateway (Cloudflare Workers)
│   ├── src/
│   │   ├── contracts/              # Shared type contracts
│   │   ├── routes/                 # Worker route handlers
│   │   ├── runtime/                # Runtime helpers
│   │   └── services/               # Business logic (thin, delegates to daemon)
│   ├── tests/
│   │   ├── e2e/
│   │   ├── billing/
│   │   ├── security/
│   │   └── helpers/
│   ├── middleware/
│   ├── migrations/                 # Cloudflare D1 SQL migrations
│   └── scripts/
│
├── mcp-server/                     # Standalone MCP server package
│   ├── src/
│   │   ├── index.ts
│   │   ├── types/                  # MCP tool/resource/prompt types
│   │   └── ...
│   ├── tests/
│   ├── tsup.config.ts
│   └── vitest.config.ts
│
├── dashboard/                      # Web dashboard (Next.js / Remix / Astro)
│   ├── src/
│   │   ├── app/                    # File-based routes
│   │   ├── components/
│   │   └── ...
│   └── ...
│
├── docs-site/                      # Documentation site
│   └── ...
│
├── sdk-js/                         # JavaScript/TypeScript client SDK
│   └── src/
│
├── agents/                         # Agent-specific configs / extensions
│   └── pi-extension/
│
├── data/                           # Seed data, snapshots
├── archive/                        # Deprecated / supersceded code
└── scripts/                        # Repo-level scripts (CI, release)
```

---

## Daemon vs. App: Key Structural Differences

| Dimension | Mobile / Web App (`app/` first) | Daemon / Service (`src/` first) |
|-----------|--------------------------------|--------------------------------|
| **Entry point** | `app/_layout.tsx` → screen routes | `src/main.ts` → process bootstrap |
| **Routing** | Expo Router file-based routes | HTTP handlers, CLI subcommands, MCP tools |
| **UI** | React Native / React screens | HTTP API responses, CLI output, MCP notifications |
| **State** | React state, Zustand, Convex live queries | In-process singletons, connection pools, config |
| **Tests** | Colocated `__tests__/` alongside components | Top-level `tests/` (unit + integration at `src/` level); E2E separate |
| **Config** | `app.config.ts`, env vars | `src/config/` subsystem with typed schema, file + env precedence |
| **Lifecycle** | Mount/unmount per navigation | Startup → health-check → steady-state → graceful-shutdown |
| **Process model** | One screen at a time | One long-lived process; handles concurrent connections |
| **Deployment** | App store / EAS build | Container image, systemd, Cloudflare Worker, Fly.io |

---

## Daemon Internal Layout (`daemon/src/`)

Organise by **capability domain**, not by file type. Each top-level subdirectory under `src/` is
a subsystem with a single responsibility:

```
src/
├── server/       # HTTP / TCP listener — thin routing only
├── mcp/          # MCP protocol implementation
├── cli/          # CLI argument routing and subcommands
├── config/       # Config loading, validation, hot-reload
├── memory/       # Core business domain (CRUD + business rules)
│   ├── admission/
│   ├── cleanup/
│   ├── store/     # Storage interface
│   └── surreal/   # Storage implementation
├── retrieval/    # Search and recall algorithms
├── sync/         # External system synchronisation
├── runtime/      # Runtime adapters (Hermes, Claude, OpenAI…)
├── lifecycle/    # Process lifecycle (startup, health, shutdown)
├── monitoring/   # Metrics, tracing, alerting
├── local-ai/     # Embedded ML models (ONNX, llama.cpp)
├── surreal-local/# Embedded SurrealDB for local / dev mode
├── codex-hooks/  # Codex CLI event hooks
├── compat/       # Polyfills for older runtimes
└── utils/        # Pure helpers (no side-effects, no I/O)
```

**Key rules:**
- `server/`, `mcp/`, `cli/` are **thin routing layers**. They parse input, call into the
  appropriate domain module, and format the response.
- `memory/`, `retrieval/`, `sync/` are **domain modules**. They own business logic and data access.
- `config/` owns all config loading — no other module reads env vars directly.
- `lifecycle/` owns startup ordering, health checks, and graceful shutdown signals.
- `utils/` is the only place for cross-cutting pure helpers.

---

## Monorepo Layout (Multiple Workspaces)

When the daemon ships multiple packages (as Coppermind does), use **Bun workspaces** or
**pnpm workspaces**:

```
package.json          # Root: workspaces, scripts, bin
├── daemon/           # Core daemon (TypeScript)
├── gateway/          # Edge / API gateway (Cloudflare Workers)
├── mcp-server/       # Standalone MCP server
├── mcp-core/         # Shared MCP types and utilities
├── dashboard/        # Web dashboard
├── docs-site/        # Documentation site
└── sdk-js/           # JS/TS client SDK
```

**Rules:**
- Shared types live in the lowest-level package that needs them (e.g. `mcp-core` for MCP types).
- `gateway/` calls the daemon over HTTP or the local runtime client — it never imports daemon internals.
- Each workspace has its own `package.json`, `tsconfig.json`, and test config.
- The root `package.json` defines convenience scripts: `"dev": "cd daemon && bun run dev"`.

---

## Test Layout for Daemons

Daemon tests differ from app tests — there is no concept of "screens" or "components":

```
daemon/
├── src/
│   ├── memory/
│   │   ├── store.ts
│   │   └── surreal/
│   │       └── surreal-store.ts
│   └── ...
│
├── tests/                    # Top-level (not colocated — daemon is a service)
│   ├── unit/                 # Pure function tests
│   │   ├── memory/
│   │   │   ├── admission.test.ts
│   │   │   └── cleanup.test.ts
│   │   └── utils/
│   │       └── format.test.ts
│   ├── integration/          # Subsystem tests (uses real SurrealDB test instance)
│   │   ├── memory/
│   │   │   └── surreal-store.integration.test.ts
│   │   └── retrieval/
│   │       └── recall.integration.test.ts
│   ├── smoke/                # Fast daemon-startup + health-check tests
│   │   └── daemon-smoke.test.ts
│   ├── benchmarks/           # Performance benchmarks (not CI-blocking)
│   │   └── recall-latency.bench.ts
│   └── helpers/
│       ├── daemon-fixture.ts  # Spins up daemon on ephemeral port for integration tests
│       └── db-fixture.ts      # Creates / tears down test SurrealDB instance
│
├── mocks/                    # Test doubles
│   ├── surreal-mock.ts
│   └── clock-mock.ts
│
└── vitest.config.ts          # or bun test / pytest config
```

**Rules:**
- No `__tests__/` subdirectories inside `src/`. All tests are top-level `tests/`.
- **Unit tests** mirror `src/` directory structure: `src/memory/surreal/surreal-store.ts`
  → `tests/unit/memory/surreal-store.test.ts`.
- **Integration tests** live in `tests/integration/`, mirror `src/` structure, use a real
  (ephemeral) database instance created by a test fixture.
- **Smoke tests** start the daemon, hit the health endpoint, verify startup ordering.
- **Benchmarks** are never CI-blocking — they produce perf reports, not pass/fail.
- Each test file is **independent** — no shared mutable state between files.

---

## Lifecycle Pattern

A well-structured daemon makes its lifecycle explicit:

```
src/
├── main.ts            # Process entry — signal handlers, top-level try/catch
├── coppermind.ts      # Daemon class: init → start → run → stop
├── lifecycle/
│   ├── index.ts       # Lifecycle orchestrator
│   ├── health.ts      # Health check (liveness + readiness probes)
│   └── format.ts      # Startup log formatting
└── server.ts          # HTTP server (liveness = /health, readiness = /ready)
```

```ts
// src/main.ts — the actual process entry (bin target)
import { startDaemon } from "./coppermind";

process.on("SIGTERM", () => stopDaemon.graceful());
process.on("SIGINT", () => stopDaemon.graceful());

startDaemon().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
```

```ts
// src/coppermind.ts — lifecycle orchestrator
export async function startDaemon() {
  await loadConfig();               // config/loader.ts
  await initSurreal();              // surreal-local/surreal-local.ts or remote
  await initMemoryPlane();          // memory/surreal-memory-plane.ts
  await startHttpServer();          // server/server.ts
  await startMcpServer();           // mcp/server.ts
  await initLocalAi();              // local-ai/ (optional)
  await reportReady();              // lifecycle/health.ts → /ready returns 200
  await runUntilShutdown();         // blocks until SIGTERM/SIGINT
  await gracefulShutdown();         // close connections, flush buffers
}
```

---

## Config Subsystem Pattern

Every daemon needs typed, layered config. Never read `process.env` directly in business logic.

```
src/config/
├── index.ts          # Public config API (getConfig(), reload())
├── loader.ts         # Env → file → defaults precedence chain
├── types.ts          # Config schema (zod / valibot)
└── local-config-status.ts  # Detect local vs. cloud deployment
```

```ts
// src/config/types.ts
import { z } from "zod";

export const DaemonConfigSchema = z.object({
  port: z.coerce.number().default(18989),
  surreal: z.object({
    url: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  embedding: z.object({
    provider: z.enum(["openai", "local", "none"]).default("none"),
    model: z.string().optional(),
  }),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type DaemonConfig = z.infer<typeof DaemonConfigSchema>;
```

```ts
// src/config/loader.ts — precedence: CLI flags > env vars > config file > defaults
export function loadConfig(): DaemonConfig {
  const fileConfig = readConfigFile();        // config.yaml / config.toml
  const envConfig = loadEnvConfig();           // process.env with prefix COPPERMIND_
  const cliConfig = parseCliFlags();           // --port, --log-level, etc.

  return DaemonConfigSchema.parse({
    ...fileConfig,
    ...envConfig,
    ...cliConfig,
  });
}
```

---

## AGENTS.md in Daemon Projects

Daemon repos benefit from **nested `AGENTS.md` files** at multiple levels:

```
daemon/
├── AGENTS.md              # Daemon-wide: tech stack, test commands, deploy flow
└── src/
    ├── AGENTS.md           # Source-level: module map, import rules, coding patterns
    ├── memory/
    │   └── AGENTS.md       # Memory subsystem: SurrealDB schema, query patterns
    └── mcp/
        └── AGENTS.md       # MCP subsystem: tool registration, handler conventions
```

Each `AGENTS.md` should cover only what an agent needs to work productively in that directory —
not the entire project. The root `AGENTS.md` covers cross-cutting concerns (CI, release, deploy).

---

## How This Differs from the App Skill

| Area | App (project-folder-architecture) | Daemon (this reference) |
|------|----------------------------------|------------------------|
| **Entry point** | `app/_layout.tsx` → Expo Router | `src/main.ts` → process bootstrap |
| **Routing** | File-based (`app/(tabs)/ladder/index.tsx`) | HTTP handlers, CLI subcommands, MCP tools |
| **State** | React state + Convex live queries | In-process singletons, connection pools |
| **Tests** | Colocated `__tests__/` in every folder | Top-level `tests/` with `unit/`, `integration/`, `smoke/` |
| **Config** | `app.config.ts` + env vars | `src/config/` typed subsystem |
| **Lifecycle** | React mount/unmount | Startup → health → steady-state → graceful-shutdown |
| **Deployment** | EAS build / app store | Container, systemd, Cloudflare Worker, Fly.io |

When the skill encounters a daemon-shaped project, apply the **Daemon column**, not the App column.
