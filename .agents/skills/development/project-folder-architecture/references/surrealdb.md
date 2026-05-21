# SurrealDB Project & Folder Structure

Folder organization and schema management for **SurrealDB**-backed projects — from single-service
apps to multi-workspace daemons like Coppermind. Based on official SurrealDB documentation and
SurrealKit conventions.

---

## When This Applies

Use this reference when the project uses SurrealDB as its primary database, document store, or
memory layer. SurrealDB replaces the `convex/` or `supabase/` layer in the canonical app structure
from [`SKILL.md`](../SKILL.md).

---

## SurrealDB Project Structure

### Minimal Project

```
my-project/
├── src/                    # Application code
│   ├── db/
│   │   ├── client.ts       # SurrealDB client connection
│   │   └── schema.ts       # Schema definitions (SCHEMAFULL tables, indexes, events)
│   └── ...
├── surreal/                # SurrealDB-specific artifacts
│   ├── schema/             # .surql schema definition files (source of truth)
│   │   ├── tables/
│   │   │   ├── users.surql
│   │   │   ├── memories.surql
│   │   │   └── events.surql
│   │   ├── indexes/
│   │   │   └── user-email-idx.surql
│   │   ├── functions/
│   │   │   └── fn-search.surql
│   │   └── 000_init.surql  # Entry point: imports all other files
│   ├── seed/               # Idempotent seed data
│   │   ├── 001_users.surql
│   │   └── 002_roles.surql
│   └── migrations/         # Versioned schema/data migrations
│       ├── 001_add_goat_field.surql
│       └── 002_backfill_ratings.surql
├── tests/
│   └── db/
│       ├── schema.test.ts
│       └── integration.test.ts
├── surrealkit.toml          # SurrealKit config (schema dir, vars, env)
├── docker-compose.yml       # Local SurrealDB for dev
└── README.md
```

### Multi-Service / Daemon Project (Coppermind pattern)

When SurrealDB backs a daemon with multiple subsystems, organise by capability domain:

```
coppermind/
├── daemon/
│   ├── src/
│   │   ├── memory/
│   │   │   ├── store.ts          # Abstract store interface
│   │   │   ├── surreal/
│   │   │   │   ├── surreal-store.ts   # SurrealDB implementation
│   │   │   │   ├── queries/           # SurrealQL query builders
│   │   │   │   │   ├── recall.surql
│   │   │   │   │   ├── ingest.surql
│   │   │   │   │   └── delete.surql
│   │   │   │   ├── schema/            # Table definitions
│   │   │   │   │   ├── memories.surql
│   │   │   │   │   └── events.surql
│   │   │   │   └── migrations/        # Versioned changes
│   │   │   └── admission/             # Ingest validation
│   │   └── ...
│   └── tests/
│       └── integration/
│           └── surreal-store.integration.test.ts
├── surreal/                     # Repo-wide SurrealDB artifacts
│   ├── schema/                  # Canonical schema (imported by daemon at startup)
│   ├── seed/
│   └── migrations/
└── surrealkit.toml
```

---

## Schema File Organization

### The `000_init.surql` Entry-Point Pattern

SurrealDB does not natively split schema across files. Use an **entry-point file** that `IMPORT`s
all other schema files in dependency order:

```surql
-- surreal/schema/000_init.surql
IMPORT ./tables/users.surql;
IMPORT ./tables/memories.surql;
IMPORT ./tables/events.surql;
IMPORT ./indexes/user-email-idx.surql;
IMPORT ./functions/fn-search.surql;
```

Apply with:
```bash
surreal sql --conn http://localhost:8000 --ns my_ns --db my_db --user root --pass root < surreal/schema/000_init.surql
```

### Split by Concern

| Sub-directory | Contents |
|---------------|----------|
| `schema/tables/` | `DEFINE TABLE` statements, one file per table or domain |
| `schema/indexes/` | `DEFINE INDEX` statements |
| `schema/functions/` | `DEFINE FUNCTION` statements |
| `schema/events/` | `DEFINE EVENT` and `DEFINE TRIGGER` statements |
| `seed/` | `CREATE` / `UPSERT` seed data, idempotent |
| `migrations/` | Versioned `DEFINE` / `ALTER` / data migrations |

### File Naming

```
tables/
├── users.surql          # DEFINE TABLE user ...
├── memories.surql       # DEFINE TABLE memory ...
└── events.surql         # DEFINE TABLE event ...

indexes/
├── user-email-idx.surql
└── memory-owner-idx.surql

seed/
├── 001_root_user.surql   # Number prefix = apply order
├── 002_default_roles.surql
└── 003_sample_memories.surql

migrations/
├── 20240301__add_goat_field.surql    # YYYYMMDD__description.surql
└── 20240615__backfill_ratings.surql
```

---

## SurrealKit: Official Schema Management

[SurrealKit](https://github.com/surrealdb/surrealkit) is the official schema management tool for
SurrealDB. It tracks schema files as the source of truth and reconciles the live database.

### Directory Layout (SurrealKit conventions)

```
project/
├── database/
│   ├── schema/                 # Your .surql schema files
│   │   ├── tables/
│   │   ├── indexes/
│   │   └── functions/
│   ├── seed/                   # Seed data
│   ├── rollouts/               # Generated rollout manifests (do not edit)
│   ├── snapshots/              # Auto-generated state snapshots
│   │   ├── schema_snapshot.json
│   │   └── catalog_snapshot.json
│   ├── tests/
│   │   ├── suites/             # Declarative TOML test suites
│   │   │   ├── auth.toml
│   │   │   └── permissions.toml
│   │   └── config.toml
│   └── surrealkit.toml         # Project config (variables, env)
└── surrealkit.toml             # Or at project root
```

### Sync vs Rollout

| Command | Use case |
|---------|----------|
| `surrealkit sync` | Local/dev — fast desired-state reconcile; auto-prunes deleted objects |
| `surrealkit sync --watch` | Local dev with file watching |
| `surrealkit rollout baseline` | Baseline an existing shared/prod DB before first rollout |
| `surrealkit rollout plan --name <desc>` | Generate a reviewed manifest from current diff |
| `surrealkit rollout start <id>` | Apply non-destructive expansion phase |
| `surrealkit rollout complete <id>` | Finalise — perform destructive contract phase |
| `surrealkit rollout rollback <id>` | Roll back an in-flight rollout |

**Rule:** Use `sync` for disposable/local databases. Use `rollout` for shared/production databases
where changes need review and staged cutover.

### Template Variables

Use `${VAR_NAME}` in any `.surql` file and bind at runtime:

```surql
-- database/schema/tables.surql
DEFINE TABLE ${table_prefix}_users SCHEMAFULL;
```

```bash
surrealkit sync --var table_prefix=acme
# or via env var:
SURREALKIT_VAR_TABLE_PREFIX=acme surrealkit sync
# or in surrealkit.toml:
# [variables]
# table_prefix = "acme"
```

---

## Schema Design Patterns (from official SurrealDB docs)

### SCHEMAFULL vs SCHEMALESS

| Mode | Production use | Behaviour |
|------|---------------|-----------|
| `SCHEMAFULL` | ✅ Recommended | Rejects non-conforming data at write time |
| `SCHEMALESS` | Prototyping only | Accepts any fields; flexible payloads |

```surql
DEFINE TABLE user SCHEMAFULL;
DEFINE TABLE event_log SCHEMALESS;   -- flexible, evolving payload
```

### STRICT Mode

Prevents accidental table creation from typos:

```surql
STRICT;
SELECT * FROM nonexistent;  -- throws error (not auto-created)
```

Enable in production deployments.

### Field Definition Depth

```surql
-- Minimal (type only)
DEFINE FIELD name ON user TYPE string;

-- With assertion (validation)
DEFINE FIELD email ON user TYPE string ASSERT string::is_email($value);

-- With default
DEFINE FIELD created_at ON user TYPE datetime DEFAULT time::now();

-- With computed value (read-only derived)
DEFINE FIELD since ON user VALUE time::format(created_at, "%Y-%m-%d") READONLY;

-- With FLEXIBLE (accepts extra fields in SCHEMAFULL table)
DEFINE FIELD metadata ON user TYPE object FLEXIBLE;
```

### Index Patterns

```surql
-- Unique index (prevents duplicates, enables UPSERT)
DEFINE INDEX email_idx ON user FIELDS email UNIQUE;

-- Standard index (filters, sorting)
DEFINE INDEX age_idx ON user FIELDS age;

-- Composite index
DEFINE INDEX team_role_idx ON member FIELDS team, role;
```

**Key rules from official docs:**
- Use `UPSERT` with a unique index instead of `UPDATE ... WHERE` — avoids full table scan.
- Index lookups on remote fields (`access.user.role`) require indexes on both the local and
  remote field.
- Currently (3.x) indexes are not used for `UPDATE`/`DELETE` on large tables — wrap in a
  `SELECT` subquery to use the index.

### Graph Assertions in Schema

Enforce relationship invariants at write time:

```surql
DEFINE FIELD parents ON person ASSERT <-parent_of<-person OR first_generation;

-- person:one must have a parent OR set first_generation = true
CREATE person:one SET first_generation = true;        -- OK
CREATE person:two;                                      -- Error: no parent
RELATE person:one -> parent_of -> person:two;
CREATE person:two;                                      -- Now OK
```

### `DEFINE PARAM` for Reuse

```surql
DEFINE PARAM $MONTHS VALUE ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

DEFINE FIELD month_published ON book TYPE string ASSERT $value IN $MONTHS;
DEFINE FUNCTION fn::check_month($m: string) {
  IF !($m IN $MONTHS) { THROW "Invalid month: " + $m };
};
```

---

## Multi-Tenancy Patterns

### Namespace-per-Tenant (recommended for SurrealDB)

```surql
-- Each tenant gets a dedicated namespace
-- Tenant A
USE NS tenant_a DB main;
-- Tenant B
USE NS tenant_b DB main;
```

Access via SDK:
```typescript
// Tenant A
await db.use({ namespace: "tenant_a", database: "main" });
// Tenant B
await db.use({ namespace: "tenant_b", database: "main" });
```

### Database-per-Tenant (maximum isolation)

```surql
-- Tenant A: full isolation
DEFINE DATABASE tenant_a;
-- Tenant B
DEFINE DATABASE tenant_b;
```

Use when tenants require completely separate schemas or compliance-mandated isolation.

### Record-Level Tenancy (shared DB, row-level segregation)

```surql
DEFINE TABLE memory SCHEMAFULL;
DEFINE FIELD tenant_id ON memory TYPE string;
DEFINE FIELD owner_id ON memory TYPE string;

-- RLS equivalent: scope queries by tenant
SELECT * FROM memory WHERE tenant_id = $current_tenant;
```

SurrealDB does not have built-in RLS like Postgres. Enforce tenant scoping in the application
layer or via `DEFINE FUNCTION` guards.

---

## Testing Structure

### Unit / Integration Tests (SDK)

```typescript
// tests/db/schema.test.ts
import { Surreal } from "surrealdb";

let db: Surreal;

beforeAll(async () => {
  db = new Surreal();
  await db.connect("mem://");              // in-memory, no server
  await db.use({ namespace: "test", database: "test" });
  await db.query(`
    IMPORT ./surreal/schema/000_init.surql;
  `);
});

afterAll(async () => {
  await db.close();
});

test("user table accepts valid records", async () => {
  const [result] = await db.query(
    `CREATE user SET email = "test@example.com", name = "Test";`
  );
  expect(result.status).toBe("OK");
});
```

### SurrealKit Test Suites (declarative TOML)

```toml
# database/tests/suites/auth.toml
name = "auth_smoke"
tags = ["smoke", "security"]

[[cases]]
name = "guest_cannot_create_user"
kind = "sql_expect"
actor = "guest"
sql = "CREATE user SET email = 'hacker@evil.com';"
allow = false
error_contains = "permission"

[[cases]]
name = "authenticated_user_can_create"
kind = "sql_expect"
actor = "user_alice"
sql = "CREATE user SET email = 'bob@example.com';"
allow = true
```

Run:
```bash
surrealkit test --suite "database/tests/suites/auth.toml"
surrealkit test --json-out report.json    # CI-friendly JSON output
```

### Test Isolation Principles

| Principle | Detail |
|-----------|--------|
| **Use `mem://` for unit tests** | In-memory SurrealDB — no server needed, fastest |
| **Spin up ephemeral HTTP for integration** | Docker container per test suite, torn down after |
| **Never test against production** | Use a dedicated test namespace/database |
| **Idempotent seeds** | Seed files must be safe to re-run without duplicating data |
| **Clean state between tests** | `DROP ALL` or namespace-level reset between suites |

---

## Client Connection Patterns

### TypeScript / JavaScript SDK

```typescript
// src/db/client.ts
import { Surreal } from "surrealdb";

export class SurrealClient {
  private db: Surreal;

  constructor(url: string, namespace: string, database: string) {
    this.db = new Surreal();
  }

  async connect() {
    await this.db.connect(this.url, { namespace: this.ns, database: this.db });
  }

  async query<T>(surql: string): Promise<T> {
    const [result] = await this.db.query<T>(surql);
    return result;
  }

  async select<T>(table: string): Promise<T[]> {
    return this.db.select<T>(table);
  }

  async close() {
    await this.db.close();
  }
}
```

### Python SDK

```python
# src/db/client.py
from surrealdb import Surreal

async def get_db() -> Surreal:
    db = Surreal()
    await db.connect("ws://localhost:8000/rpc")
    await db.use({"namespace": "my_ns", "database": "my_db"})
    return db
```

### Embedded (in-process)

```typescript
// For tests or embedded use
const db = new Surreal();
await db.connect("mem://");              // in-memory, no server
await db.use({ namespace: "test", database: "test" });
```

---

## Schema Versioning & Migration

### SurrealKit (recommended)

SurrealKit is the official migration tool. It tracks a schema snapshot and generates rollout
manifests for production changes.

```
surreal/schema/          # Desired-state .surql files (source of truth)
surrealkit.toml          # Project config
database/rollouts/       # Generated rollout manifests (git-tracked)
database/snapshots/      # Auto-generated state snapshots (gitignored)
```

Workflow:
```bash
# 1. Edit schema files
vim surreal/schema/tables/memories.surql

# 2. Reconcile local DB
surrealkit sync

# 3. Generate rollout for review (production)
surrealkit rollout plan --name "add_memory_rating_field"

# 4. Review and apply
surrealkit rollout start 202403011200__add_memory_rating_field
surrealkit rollout complete 202603021530__add_memory_rating_field
```

### Manual Migration (no SurrealKit)

For projects not using SurrealKit, keep numbered `.surql` files and apply sequentially:

```bash
# Apply all pending
for f in surreal/migrations/*.surql; do
  echo "Applying $f"
  surreal sql --conn ... < "$f"
done
```

Track applied migrations in a `_migrations` table to avoid double-application:

```surql
DEFINE TABLE _migrations SCHEMAFULL;
DEFINE FIELD filename ON _migrations TYPE string UNIQUE;
DEFINE FIELD applied_at ON _migrations TYPE datetime DEFAULT time::now();
```

---

## Performance Quick Reference

From [official SurrealDB performance docs](https://surrealdb.com/docs/surrealdb/reference-guide/performance-best-practices):

| Pattern | Why |
|---------|-----|
| `SELECT * FROM table:id` | Direct record access — no scan. Prefer over `WHERE id = ...` |
| Index `FIELD`s used in `WHERE` / `ORDER BY` | Query planner uses index instead of full table scan |
| `UPSERT` with unique index | Index-based lookup, no table scan. Faster than `UPDATE ... WHERE` |
| Boolean pre-computed fields | `WHERE is_active` is faster than `WHERE status != 'inactive'` |
| Avoid `Date.now()` in queries | SurrealDB does not re-run queries on wall-clock changes |
| `--log info` in production | `debug`/`trace` verbosity has measurable performance cost |

---

## How This Differs from Convex / Supabase

| Area | Convex | Supabase | SurrealDB |
|------|--------|----------|-----------|
| **Schema location** | `convex/schema.ts` (TS) | `supabase/migrations/*.sql` | `surreal/schema/*.surql` |
| **Schema tooling** | `convex codegen`, migrations built-in | `supabase migration new` | SurrealKit (`sync`/`rollout`) |
| **Query language** | TypeScript functions | Postgres SQL | SurrealQL (SQL-like) |
| **Indexes** | `defineIndex` in TS schema | Postgres `CREATE INDEX` | `DEFINE INDEX ... ON ... FIELDS ...` |
| **Auth** | Convex Auth (built-in) | Supabase Auth / Postgres | Record-access tokens, JWT, scope |
| **Realtime** | Live queries (automatic) | Postgres Realtime | Live queries, changefeeds |
| **Multi-tenancy** | Filter by `userId` in every query | RLS policies | Namespace-per-tenant or record-level scoping |
| **Migrations** | Zero-downtime, backwards-compatible | SQL migrations | SurrealKit rollouts (expansion → contract) |
