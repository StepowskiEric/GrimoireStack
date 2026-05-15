---
name: surrealdb
description: SurrealDB modeling, querying, SDK patterns, and 3.x operational gotchas.
version: 1.1.0
author: Hermes Agent
metadata:
  hermes:
    tags: [surrealdb, database, surrealql, memory]
---

# SurrealDB Agent Skill

Use this skill when designing, querying, migrating, or reviewing code that uses **SurrealDB** and **SurrealQL**.

## What SurrealDB is good at

SurrealDB is a **multi-model** database with a SQL-like language called SurrealQL. It supports document-style records, relational-style querying, graph relations, full-text search, vector search, time-series patterns, geospatial data, and live queries in one engine.

Treat it as a database that can model:
- regular records and nested documents
- explicit graph edges when traversal matters
- search-oriented fields and indexes
- vector embeddings and hybrid retrieval
- realtime subscriptions where needed

Do **not** assume it behaves exactly like Postgres, MongoDB, or Neo4j. It overlaps with all three, but its best results come from using SurrealDB-native patterns deliberately.

---

## SurrealDB TypeScript SDK v2 gotchas (surrealdb npm package)

These apply to the `surrealdb` npm package (SDK v2), not the old `@surrealdb/surrealdb` package.

### `db.insert()` requires `as any` cast for table name

The `insert` method's first parameter type does not accept string table names directly. Cast the table name:

```typescript
await db.insert('memory' as any, record);
```

Or use `RecordId` for insert-targeted operations. The `insertMany` API expects an array of records.

### `db.delete()` requires `RecordId`, not a string

```typescript
import { RecordId } from 'surrealdb';

// Wrong — will throw
await db.delete('memory:abc123');

// Correct
await db.delete(new RecordId('memory', 'abc123'));
```

### `db.query()` return shape is nested arrays

`query<T>` returns `T` directly, but the actual runtime return is always `any[][]`. The first element is the query result. Always unwrap:

```typescript
const result = await db.query('SELECT * FROM memory WHERE ...', bindings);
const records = (result[0] ?? []) as any[];
// result[0] is the array of records from the first statement
// result[1] would be the second statement, etc.
```

Do not use the generic type parameter expecting it to match the shape — it lies. Always cast with `as any[]` or `as MemoryRecord[]`.

### `db.query()` with multiple statements

Each statement produces a separate array in the result:

```typescript
const result = await db.query(`
  LET $user = user:eric;
  SELECT * FROM memory WHERE user = $user;
`);
// result[0] = undefined (LET returns nothing)
// result[1] = array of memory records
```

### Connecting in Workers vs Node

In Cloudflare Workers, use HTTP URL (no embedded mode):
```typescript
await db.connect('https://your-surreal-host');
await db.use({ namespace: 'coppermind', database: 'memory' });
```

In Node.js, HTTP works too. Embedded `file://` is broken in 3.x (use `surrealkv://`).

### No `surrealdb` types in `tsconfig.json`

SDK v2 bundles its own types but some interfaces like `RecordId` must be imported explicitly from `'surrealdb'`. If you see `Cannot find namespace 'surrealdb'`, ensure the import is present.

---

## Default operating posture

When building with SurrealDB, follow these defaults unless the task clearly requires something else:

1. Prefer **schemafull tables** for production application state.
2. Use **schemaless** only for rapid exploration or intentionally flexible payload blobs.
3. Define fields explicitly with `DEFINE FIELD` instead of relying on ad hoc writes.
Define indexes early for fields used in equality filters, uniqueness, full-text search, or vector similarity. **Important:** SurrealDB v3 removed `WHERE` clauses from `DEFINE INDEX`. Filtered indexes (`DEFINE INDEX ... WHERE field != NONE`) are not supported — use plain indexes or application-level filtering instead.
5. Use **record links** by default for simple references.
6. Use **graph relations** only when the edge itself has meaning or traversal is a first-class requirement.
7. Wrap multi-step mutations in explicit transactions when correctness depends on all steps succeeding together.
8. Keep ranking/retrieval business logic in application code unless the logic is genuinely better expressed in SurrealQL.
9. Use `EXPLAIN` when performance matters.
10. Make migrations idempotent with `IF NOT EXISTS` or `OVERWRITE` where appropriate.

---

## How to think about modeling

### Pick the simplest relation that works

SurrealDB supports both **record links** and **graph relations**.

Use a **record link** when:
- one record simply points to another
- the relationship has no independent lifecycle or metadata
- you want the most direct and efficient reference style

Example:
- `task.project = project:abc`
- `message.session = session:123`

Use a **graph relation** when:
- the edge has its own metadata
- the relationship itself is important
- traversal is central to the feature
- you need many-to-many graph semantics

Example:
- `user -> follows -> user`
- `claim -> supported_by -> evidence`
- `memory -> contradicts -> memory`

If you use graph relations, define the relation table explicitly and give the edge fields a real schema.

### Prefer explicit identity and stable keys

Decide early whether records will use:
- generated record IDs
- semantic IDs like `user:eric`
- application-generated UUID fields alongside record IDs

For application portability and imports, it is often useful to store a stable external key such as:
- `fixture_id`
- `external_id`
- `episode_id`

This makes backfills, migrations, and replay much easier.

### Keep flexible payloads boxed in

If you need an unstructured payload, keep it inside a clearly named field like:
- `metadata`
- `payload`
- `raw`

Do not let the whole table become a dumping ground unless that is the intended design.

---

## Schema workflow

### Start with table definitions

Create tables explicitly.

Typical pattern:

```surql
DEFINE TABLE user SCHEMAFULL;
DEFINE TABLE project SCHEMAFULL;
DEFINE TABLE task SCHEMAFULL;
```

### Define fields explicitly

Use `DEFINE FIELD` for:
- type constraints
- defaults
- normalization via `VALUE`
- assertions via `ASSERT`
- computed fields via `COMPUTED`
- field-level permissions when needed

Typical pattern:

```surql
DEFINE FIELD email ON TABLE user TYPE string
  VALUE string::lowercase($value)
  ASSERT string::is_email($value);

DEFINE FIELD created_at ON TABLE task TYPE datetime
  DEFAULT time::now();

DEFINE FIELD updated_at ON TABLE task TYPE datetime
  VALUE time::now();
```

### Use computed fields carefully

`COMPUTED` fields are recalculated on access, not stored. They are useful for derived values, but not for fields that must remain historically stable.

### Enforce invariants in schema where possible

Use:
- `TYPE`
- `ASSERT`
- `READONLY`
- `PERMISSIONS`
- unique indexes

Do not push every data-integrity rule into application code if the database can enforce it cleanly.

---

## Indexing rules

### Add the right index for the right job

Use regular indexes for:
- equality filters
- high-cardinality lookup fields
- foreign-key-like fields
- timestamps used in ordering/filtering

Use `UNIQUE` when duplicates must be impossible.

Use `FULLTEXT ANALYZER ... BM25` for search-oriented text retrieval.

Use `HNSW` indexes for vector similarity search.

Typical patterns:

```surql
DEFINE INDEX user_email_unique ON TABLE user FIELDS email UNIQUE;
DEFINE INDEX task_project_idx ON TABLE task FIELDS project;
DEFINE INDEX memory_text_idx ON TABLE memory FIELDS search_text FULLTEXT ANALYZER simple BM25;
DEFINE INDEX memory_embedding_idx ON TABLE memory FIELDS embedding HNSW DIMENSION 1536 DIST COSINE;
```

### `CONTAINS` for array membership (tags, lists)

`CONTAINS` is the **only** valid operator for testing array membership in SurrealDB 3.x. Do NOT try `array_contains()` or `array::contains()` — neither exists:

```surql
-- WRONG — doesn't exist (parse error)
WHERE array_contains(tags, $tag);
WHERE array::contains(tags, $tag);

-- RIGHT — CONTAINS for array membership
WHERE tags CONTAINS $tag;

-- Multiple tags (OR match)
WHERE tags CONTAINS $tag0 OR tags CONTAINS $tag1;
```

This applies to any array field: `tags`, `files`, `symbols`, `errors`, `commands`, `tests`, etc.

**Performance note:** `CONTAINS` on arrays uses a sequential scan unless an index exists on the array field. For high-cardinality tag filtering, consider a GIN-style lookup table instead.

### Important gotcha: `CONTAINS` on strings is not the same as indexed lookup

Do not assume `CONTAINS` on a string will use a normal string index. If indexed lookup matters, verify operator/index compatibility and inspect with `EXPLAIN`.

### Always verify query plans when performance matters

Use:

```surql
SELECT * FROM task WHERE project = project:abc EXPLAIN FULL;
```

Do not guess whether an index is being used.

---

## Query patterns the agent should prefer

### Point lookup

```surql
SELECT * FROM ONLY user:eric;
```

Use `ONLY` when expecting a single record.

### Scoped reads

```surql
SELECT * FROM task
WHERE user = user:eric
  AND status = "open"
ORDER BY updated_at DESC
LIMIT 20;
```

Prefer explicit scope filters instead of broad table scans followed by app-side filtering.

### Fetch related data

Use `FETCH` when dereferencing linked records helps.

```surql
SELECT * FROM task
WHERE project = project:abc
FETCH project, assignee;
```

### Graph traversal

Use graph traversal syntax when the edge model is intentional.

```surql
SELECT ->supported_by->evidence FROM claim:one;
SELECT <-contradicts<-claim FROM claim:one;
```

**Native traversal (preferred):** Use `FROM records WHERE id IN (SELECT VALUE ->edge->target.field FROM ...)` pattern instead of querying edge tables directly. This:
- Correctly resolves record pointers across table boundaries (e.g., memory ↔ episode)
- Lets SurrealDB optimise the path resolution
- Eliminates fragile record-ID string construction in application code

See `references/surrealdb-native-graph-traversal.md` for the full patterns: bidirectional traversal, 2-hop sibling walks, degree centrality aggregate, query organization in TypeScript, and edge weight design.

**Multi-hop traversal fallback (legacy):** If native `->edge->target` syntax doesn't work for your SurrealDB version, use stepwise queries:

```surql
-- Stepwise: intermediate result, then query again
LET $intermediate = (SELECT out.id FROM relates WHERE in.entry_id = $a);
SELECT out.entry_id FROM relates WHERE in.id IN $intermediate;
```

### Relation creation

```surql
RELATE claim:one->supported_by->evidence:two
  SET created_at = time::now(), confidence = 0.92;
```

### Full-text search

Model a dedicated searchable text field when appropriate, then query it consistently.

### Vector search

Store embeddings as numeric arrays with a matching HNSW index and use SurrealDB's vector functions or search patterns consistently.

---

## Transactions

Each statement is transactional by default, but multi-step correctness still requires an explicit transaction.

Use `BEGIN ... COMMIT` when:
- creating multiple records that must succeed together
- mutating several linked records atomically
- validating invariants across steps
- performing financial, identity, or state-machine transitions

Pattern:

```surql
BEGIN TRANSACTION;

LET $task = CREATE task SET title = "Ship migration", status = "open";
LET $log = CREATE audit_log SET action = "task_created", task = $task.id;

IF $task.status != "open" {
  THROW "Task not created in expected state";
};

COMMIT TRANSACTION;
```

Use `THROW` when you need conditional rollback.

---

## Realtime and live queries

Use `LIVE SELECT` for realtime subscriptions when you genuinely need push updates.

Do not default to live queries for everything.

Use them when:
- a dashboard or agent must react to record changes immediately
- you control the deployment constraints
- single-node support is acceptable for the feature

Be aware that live-query support is documented as currently limited to single-node deployments.

---

## Permissions and security

SurrealDB supports permissions at table and field level.

Use permissions when:
- records are accessed directly by end-user or semi-trusted clients
- you need row-level or field-level restrictions
- you want policy close to the data model

Typical table pattern:

```surql
DEFINE TABLE post SCHEMAFULL
  PERMISSIONS
    FOR select WHERE published = true OR author = $auth.id
    FOR create WHERE author = $auth.id
    FOR update WHERE author = $auth.id
    FOR delete WHERE author = $auth.id OR $auth.role = "admin";
```

Do not rely on database permissions alone if the application also has complex business authorization. Align both layers.

---

## Graph-specific guidance

### Record links first, relation tables second

If you only need a pointer, use a record field.
If you need edge metadata or graph traversal as a core feature, use `TYPE RELATION` tables.

### Prevent duplicate symmetric edges

For relationships like `friends_with`, define a normalized key and a unique index so the relation cannot be inserted twice from opposite directions.

### Put edge metadata on the relation itself

Examples:
- confidence
- source
- created_at
- weight
- reason

This is one of the main reasons to use graph edges in the first place.

---

## Vector and hybrid retrieval guidance

Use SurrealDB vector features when:
- you need semantic similarity
- you want one storage engine for records + embeddings
- hybrid search can simplify your architecture

Recommended agent posture:
1. keep embeddings in a dedicated vector field
2. define HNSW indexes with the correct dimension and distance
3. retain metadata filters so vector search stays scoped
4. keep hybrid ranking rules explicit in application code when precision matters

Do not assume vector search alone solves retrieval quality. Metadata filters, graph links, recency, and business rules still matter.

---

## Performance guidance

### Avoid avoidable table scans

Be suspicious of queries that:
- filter on unindexed fields
- use broad substring search on large tables
- fetch large nested records unnecessarily
- sort large result sets without good filters

### Use the database for what it is good at

Good candidates for in-database logic:
- filtering
- ordering
- grouping
- joining/traversal
- constraint enforcement
- transaction boundaries

Less ideal candidates:
- application-specific ranking heuristics that change often
- large custom semantic pipelines better owned by TypeScript/Python code

### Benchmark with realistic data shapes

When reviewing SurrealDB code, ask:
- Is the table schema explicit enough?
- Are the indexes aligned with actual query patterns?
- Are record links or graph relations being used intentionally?
- Is the query plan verified?
- Is the app doing work the database should do, or vice versa?

---

## Migration and review checklist

When the task is a migration or refactor, do all of the following:

1. Define tables and fields first.
2. Add unique and lookup indexes before bulk loading.
3. Preserve stable external IDs.
4. Backfill in deterministic batches.
5. Verify parity with sample queries.
6. Check `EXPLAIN` on critical queries.
7. Add tests for:
   - point lookup
   - scoped search
   - relation traversal
   - transaction rollback
   - duplicate rejection
8. Do not delete old paths until parity is proven.

---

## Common mistakes to avoid

- Using graph relations where a simple record link is enough
- Leaving schema implicit in production
- Forgetting indexes on scope fields
- Assuming `CONTAINS` behaves like indexed search automatically
- Mixing business ranking logic into storage code without tests
- Skipping transactions for multi-record invariants
- Treating computed fields like stored history
- Failing to verify relation uniqueness for symmetric relationships
- Building semantic search without metadata filters
- Trusting a query is fast without `EXPLAIN`
- **Treating architecture docs as prescriptive specs** — the doc describes intent; the code and INSERT queries are reality. Audit all three to find gaps.

---

## SurrealDB 3.x operational gotchas

These are version-specific findings that are not well documented.

### `file://` storage is broken in 3.0 — use `surrealkv://` or `rocksdb://`

The `file://` KVS backend is deprecated in SurrealDB 3.x and produces `Unable to load the specified datastore` errors even when the path is valid. **Use `surrealkv://` or `rocksdb://` instead.**

**Start command syntax in 3.x uses `-b` for bind address and `-u`/`-p` for credentials:**

```
# Correct for SurrealDB 3.x — absolute path
surreal start -b 127.0.0.1:8000 -u root -p root rocksdb:///absolute/path/to/db

# Correct for SurrealDB 3.x — relative path with single dot
surreal start -b 127.0.0.1:8000 -u root -p root rocksdb://./relative/path

# 'memory' (in-memory) is the default if no PATH given
surreal start -b 127.0.0.1:8000 -u root -p root
```

**Key differences from v2:**
- `-b` / `--bind` flag is now **required** for the listen address (positional bind address does not work)
- `-u` / `--username` replaces `--user` (short flags preferred, `--user` does not exist in 3.x)
- `-p` / `--password` replaces `--pass`
- `PATH` argument is always positional, use the storage backend prefix (`rocksdb://` or `surrealkv://`)
- Bare filesystem path (`/path/to/db`) produces error: `Provide a valid database path parameter`

**Path format for absolute paths** uses **triple slash** (`surrealkv:///absolute/path`) since the backend name followed by `://` signals an absolute path to SurrealDB 3.x. Relative paths use a single dot: `rocksdb://./relative/path`.

**Common errors and fixes:**
| Error | Cause | Fix |
|-------|-------|-----|
| `unexpected argument '127.0.0.1:8000' found` | Bind address passed as positional arg | Use `-b 127.0.0.1:8000` |
| `Provide a valid database path parameter` | Filesystem path without scheme prefix | Use `rocksdb:///path` or `surrealkv:///path` |
| `Unable to load the specified datastore` | `file://` scheme no longer supported | Use `rocksdb://` or `surrealkv://` | The daemon's `surreal-local.ts` must use `surrealkv://${config.surrealDataDir}` (absolute path, no tilde expansion).

### `/health` endpoint returns empty 200 in 3.x

The `/health` endpoint in SurrealDB 3.x returns HTTP 200 with an **empty body**. It does not return JSON. Health-check logic that parses the response body as JSON will silently fail. Code that only checks `response.status` is correct; code that calls `response.json()` will get an empty object or EOF error.

### `port-conflict-foreign` vs `healthy` — check health before ownership

In the Coppermind daemon's `buildLocalSurrealSnapshot`, the state machine checked `portOwnerClassification === "foreign"` before checking whether SurrealDB was actually healthy. This meant a healthy SurrealDB started by a different process (e.g. manually or by a previous daemon run) was classified as `port-conflict-foreign` instead of `healthy`. The fix: check `health.reachable` first, regardless of port ownership. A reachable, responding SurrealDB is usable.

### Schema is not auto-provisioned when connecting to a pre-existing instance

When connecting to SurrealDB via `ensureLocalSurrealCompanion({ ensureRunning: false })` (connecting to an already-running instance), the namespace, database, tables, and indexes are **not** created automatically — that only happens in the full `ensureRunning: true` flow. Tests or tooling that connect to an existing SurrealDB must explicitly call the schema provisioning function. The `provisionSurrealSchema(config)` function in `surreal-memory-plane.ts` provides this.

### HTTP API auth: `/signin` → JWT, not basic auth

SurrealDB 3.x HTTP API (`/sql`, `/signin`) does **not** accept basic auth (`-u user:pass`) — it returns 401. The correct pattern:

1. `POST /signin` with `{user: "...", pass: "..."}` → returns `{token: "eyJ..."}` (JWT, 1h expiry)
2. Use as `Authorization: Bearer $TOKEN` on subsequent requests

**Important:** The `/signin` endpoint requires `Accept: application/json` header. Without it, SurrealDB v3.x returns an empty body (HTTP 200, `content-length: 0`) instead of the JSON token. Python's `urllib` and similar libraries that don't send a default `Accept` header will get an empty response and fail to parse the token. Always set the header:

```python
import urllib.request, json
req = urllib.request.Request(
    'http://localhost:8137/signin',
    data=json.dumps({'user': user, 'pass': passwd}).encode(),
    headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
    method='POST'
)
resp = urllib.request.urlopen(req)
token = json.loads(resp.read())['token']
```

```bash
# Without Accept header — may return empty body
curl -s -X POST http://localhost:8137/signin -d '{"user":"x","pass":"y"}'

# With Accept header — always returns token
curl -s -X POST http://localhost:8137/signin \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"user":"x","pass":"y"}'
```

**NS/DB headers are silently ignored** on the `/sql` endpoint. Setting `surreal-ns` or `NS` headers does nothing — you must include `USE NS x DB y;` as the first statement in your SQL query body:

```bash
# WRONG — NS/DB headers ignored, queries fail with "Specify a namespace"
curl -s -X POST "http://localhost:8137/sql" \
  -H "NS: myns" -H "DB: mydb" \
  -H "Authorization: Bearer $TOKEN" \
  -d "SELECT * FROM mytable;"

# CORRECT — USE statement in query body
curl -s -X POST "http://localhost:8137/sql" \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer $TOKEN" \
  -d "USE NS myns DB mydb; SELECT * FROM mytable;"
```

Multi-statement queries: `USE` returns `{"result": {"database":"...", "namespace":"..."}}` as the first element, subsequent statements use that namespace/database context.

### Root-user JWT tokens expire after 1 hour — SDK does not auto-refresh

SurrealDB 3.x issues JWT tokens for root users (created via `--user`/`--pass`) that expire after **1 hour** by default. The JS SDK (`surrealdb` npm v2.x) does **not** auto-refresh system-user tokens. If your application caches a single `Surreal` instance (common pattern), every query will fail after ~1 hour with:

```
NotAllowedError: Anonymous access not allowed: Not enough permissions to perform this action
```

This looks like a permissions error but is actually a **token expiry** issue. The SDK sends the expired JWT, SurrealDB rejects it as unauthenticated, and the error message is misleading.

**Verify by decoding the JWT:**
```bash
# Get a fresh token
TOKEN=$(curl -s -X POST http://localhost:8137/signin \
  -H "Content-Type: application/json" \
  -d '{"user": "YOUR_USER", "pass": "YOUR_PASS"}' | jq -r '.token')

# Decode payload
echo "$TOKEN" | cut -d. -f2 | base64 -d | jq '.exp, .iat'
```

**Fix — two-layer defense:**
1. **Proactive:** Track connection age. Force-reconnect before token expiry (e.g., 50 minutes for a 1-hour token).
2. **Reactive:** Wrap queries with a retry-on-auth-failure handler that detects the error pattern, invalidates the cached connection, reconnects, and retries.

```typescript
// Proactive: max-age check in getDb()
const CONNECTION_MAX_AGE_MS = 50 * 60 * 1000; // 50 min (10 min before 1h expiry)

function getDb(): Promise<Surreal> {
  const now = Date.now();
  if (!dbPromise || (now - dbCreatedAt) > CONNECTION_MAX_AGE_MS) {
    // Close stale connection and create fresh one
    dbPromise = createSurrealDb(config).then(db => {
      dbCreatedAt = Date.now();
      return db;
    });
  }
  return dbPromise;
}

// Reactive: retry wrapper for auth failures
async function withDb<T>(fn: (db: Surreal) => Promise<T>): Promise<T> {
  try {
    return await fn(await getDb());
  } catch (e) {
    if (e instanceof SurrealError && /Anonymous access|Not enough permissions/.test(e.message)) {
      invalidateConnection(); // clear cached connection
      return await fn(await getDb()); // retry with fresh connection
    }
    throw e;
  }
}
```

**Alternative:** Define the root user with an explicit longer session duration:
```sql
DEFINE USER coppermind ON ROOT PASSWORD '...' ROLE OWNER DURATION FOR SESSION 30d;
```

### MTREE vector indexes replaced by HNSW in v3

SurrealDB v3 replaced `MTREE` vector indexes with `HNSW`. The syntax changed:

```surql
-- v2 (BROKEN in v3)
DEFINE INDEX idx_embedding ON TABLE memories FIELDS embedding MTREE DIMENSION 384 DISTANCE COSINE;

-- v3 (CORRECT)
DEFINE INDEX idx_embedding ON TABLE memories FIELDS embedding HNSW DIMENSION 384 DIST COSINE;
```

Key differences: `DISTANCE` became `DIST`, `MTREE` became `HNSW`. If you see `Parse error` on a `DEFINE INDEX ... MTREE` statement, this is the cause.

### `DEFINE INDEX ... WHERE` removed in v3

SurrealDB v3 removed the `WHERE` clause from `DEFINE INDEX`. This means:

```surql
-- v2 (BROKEN in v3)
DEFINE INDEX idx_active ON TABLE memories FIELDS status WHERE status = 'active';
DEFINE INDEX idx_canonical ON TABLE memories FIELDS canonical_key WHERE canonical_key != NONE;

-- v3 (CORRECT — plain index, filter in queries)
DEFINE INDEX idx_active ON TABLE memories FIELDS status;
DEFINE INDEX idx_canonical ON TABLE memories FIELDS canonical_key;
```

Filtered/partial indexes simply do not exist in v3. If you need only-active records, filter with `WHERE status = 'active'` in your queries instead. The index still helps with the equality check on the field value.

This affected Coppermind's `schema-provision.ts` which had 15 index definitions with `WHERE ... != NONE` clauses that all failed silently during schema provisioning, causing downstream test failures.

### Monorepo workspace packages need `main`/`exports` for test runner resolution

In npm/bun workspaces, packages are symlinked into `node_modules`. If a workspace package has no `main`, `module`, or `exports` field in its `package.json`, test runners (Vitest, Jest) fail with:

```
Error: Failed to resolve entry for package "@scope/package-name". The package may have incorrect main/module/exports specified in its package.json.
```

This looks like a missing dependency but is actually a missing entry-point declaration. The package exists at `packages/pkg-name/` with built output in `dist/`, but the resolver can't find it.

**Fix**: Add entry-point fields to the workspace package's `package.json`:

```json
{
  "name": "@scope/package-name",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

This affected Coppermind's `mcp-core` package — its `package.json` only had `size-limit` config and no entry points. Adding `main`/`types`/`exports` fixed ~20 test files that import from `@coppermind/mcp-core`.

### `NULL` vs `NONE` for `option<T>` fields — `type::is_string()`, not `type::is::string()`

SurrealDB distinguishes between SQL `NULL` (JS `null`) and its own sentinel `NONE`. When a table schema defines a field as `option<string>`, passing JS `null` via query parameters produces:

```
InternalError: Couldn't coerce value for field ...: Expected `none | string` but found `NULL`
```

**Fix**: Use `IF type::is_string($param) { $param } ELSE { NONE }` instead of bare `$param` in INSERT/UPDATE queries for any `option<string>` field that might receive `null`:

```sql
-- WRONG — JS null becomes SQL NULL, rejected by option<T>
INSERT INTO memories { codebase_branch: $cbb };

-- WRONG — JS ternary not valid SurrealQL (parse error)
INSERT INTO memories { codebase_branch: (type::is_string($cbb) ? $cbb : NONE) };

-- RIGHT — SurrealQL IF/ELSE block converts JS null → NONE
INSERT INTO memories { codebase_branch: IF type::is_string($cbb) { $cbb } ELSE { NONE } };

-- For UPDATE SET, use = not :
UPDATE memories SET codebase_branch = IF type::is_string($cbb) { $cbb } ELSE { NONE };
```

**Important**: The function is `type::is_string` (underscore), NOT `type::is::string` (double-colon). The double-colon form produces a parse error:

```
Parse error: Invalid function/constant path, did you maybe mean `type::is_string`
```

This applies to all `option<string>` fields. For `option<int>` or `option<float>`, use `type::is_number()`, for `option<bool>` use `type::is_bool()`, for `option<array>` use `type::is_array()`, for `option<object>` use `type::is_object()`, etc.

```
Parse error: Invalid function/constant path, did you maybe mean `type::is_string`
```

This applies to all `option<string>` fields. For other `option<T>` types:
- `option<int>` → `type::is_number()` (note: `type::is_int()` also works)
- `option<float>` → `type::is_number()` (covers both int and float)
- `option<bool>` → `type::is_bool()`
- `option<array>` → `type::is_array()`
- `option<array<float>>` → `type::is_array()` (check if the value is an array)
- `option<object>` → `type::is_object()`

### `option<array<float>>` (embedding fields) — `null` from JS → `NULL`, not `NONE`

**Critical for vector/embedding ingestion.** An `option<array<float>>` field (e.g., `embedding`, `summary_embedding`) refuses JS `null`:

```
InternalError: Couldn't coerce value for field `embedding` of `memories:abc123`: Expected `none | array<float>` but found `NULL`
```

This error fires when the JS side passes `null` as a query parameter for an `option<array<float>>` field, and the query assigns it directly:

```typescript
// WRONG — embedding is `null` in params, SurrealDB receives SQL NULL
await db.query(
  `INSERT INTO memories { ..., embedding: $emb, ... };`,
  { emb: null }
);
```

**Three fixes (pick one):**

1. **Omit the field entirely** — `option<T>` defaults to `NONE` when missing. If the JS value is `null`/`undefined`, simply don't include it in the query:
   ```typescript
   const fields: string[] = [];
   if (embedding) fields.push(`embedding: ${JSON.stringify(embedding)}`);
   // ... other fields
   const query = `INSERT INTO memories { ${fields.join(', ')} };`;
   ```

2. **`IF type::is_array($emb)` guard** in SurrealQL — replaces the JS `null` with `NONE` at the parser level:
   ```surql
   INSERT INTO memories { ..., embedding: IF type::is_array($emb) { $emb } ELSE { NONE }, ... };
   ```

3. **Pass `NONE` as a literal string** (works only when the field is already defined as `option`):
   ```surql
   INSERT INTO memories { ..., embedding: NONE, ... };
   ```

**Note:** This affects ANY `option<T>` field, not just embeddings. The error message always reads `Expected `none | T` but found `NULL`. If you see this pattern, the fix is the same — never pass JS `null` directly into an `option<T>` slot through query parameters. Either omit, guard with `type::is_*()`, or use the literal `NONE`.

### `UNION` is not valid SurrealQL — use separate queries or restructure with OR

SurrealDB does **not** support the SQL `UNION` or `UNION ALL` operators for combining `SELECT` results. Using them produces a parse error:

```
Parse error: Unexpected token an identifier, expected Eof
 --> [4:8]
  |
4 | UNION
  | ^^^^^
```

**Context:** This commonly occurs when trying to query graph edges bidirectionally. For example, `related_to` edges have `in` and `out` pointers; you might try to UNION outbound and inbound queries:

```surql
-- WRONG — UNION is not valid SurrealQL
SELECT out.entry_id AS entry_id, out.user_id AS user_id
FROM related_to WHERE in IN $ids AND out.user_id = $user
UNION
SELECT in.entry_id AS entry_id, in.user_id AS user_id
FROM related_to WHERE out IN $ids AND in.user_id = $user;
```

**Fix — restructure as a single query with OR conditions:**

```surql
-- RIGHT — single query with OR
SELECT out.entry_id AS entry_id, out.user_id AS user_id, "related_to" AS edge_type
FROM related_to
WHERE (in IN $ids AND out.user_id = $user)
   OR (out IN $ids AND in.user_id = $user);
```

**Alternative — two separate queries merged in application code:**

```typescript
const [outbound, inbound] = await Promise.all([
  db.query('SELECT out.entry_id AS entry_id FROM related_to WHERE in IN $ids', { ids }),
  db.query('SELECT in.entry_id AS entry_id FROM related_to WHERE out IN $ids', { ids }),
]);
const combined = [...unwrapQuery(outbound), ...unwrapQuery(inbound)];
```

**Rule:** If you find yourself reaching for `UNION`, stop. Either merge with `OR` in a single `WHERE` clause, or split into two queries and concatenate in TypeScript.

---

### `time::now()` returns `datetime`, not `string` — cast required for string-typed fields

`time::now()` in SurrealQL returns a SurrealDB **datetime** object (`d'2026-05-10T17:08:12.385Z'`). If the target table field is typed `string` or `option<string>`, assigning `time::now()` directly will produce:

```
InternalError: Couldn't coerce value for field `updated_at` of `episode:abc123`: Expected `none | string` but found `d'2026-05-10T17:08:12.385062Z'`
```

**Fix**: Cast to string with `<string>time::now()`:

```surql
-- BROKEN — time::now() returns datetime, rejected by string-typed field
UPDATE episode SET updated_at = time::now() WHERE entry_id IN $eids;

-- CORRECT — explicit cast to string
UPDATE episode SET status = "consolidated", updated_at = <string>time::now()
WHERE entry_id IN $eids;
```

This applies to any `SET ... = time::now()` on a field whose schema type is `string` or `option<string>`. The `NULL` vs `NONE` section above covers a related pitfall (JS null rejection), but this is a distinct case — the `datetime` to `string` coercion fails even when the datetime is valid.

### `SELECT DISTINCT col1, col2` with `GROUP BY` — parse error

SurrealDB does **not** support `SELECT DISTINCT` on multiple columns when `GROUP BY` is also present. Attempting:

```surql
SELECT DISTINCT user_id, scope FROM memories
WHERE ... GROUP BY user_id, scope;
```

produces:
```
Parse error: Unexpected token `an identifier`, expected FROM
 --> [1:17]
  |
1 | SELECT DISTINCT user_id, scope FROM memories
  |                 ^^^^^^^
```

**Fix**: Remove `DISTINCT` — `GROUP BY col1, col2` already deduplicates on the grouped columns, so `SELECT` without `DISTINCT` produces the same result:

```surql
-- BROKEN — DISTINCT + GROUP BY on multiple columns produces parse error
SELECT DISTINCT user_id, scope FROM memories ... GROUP BY user_id, scope;

-- CORRECT — GROUP BY already deduplicates, DISTINCT is redundant
SELECT user_id, scope FROM memories ... GROUP BY user_id, scope;
```

This only affects multi-column `SELECT DISTINCT`. Single-column `SELECT DISTINCT col` (without `GROUP BY`) works fine.

### `NULLS FIRST`/`NULLS LAST` not supported in ORDER BY

SurrealDB does **not** support `NULLS FIRST` or `NULLS LAST` in `ORDER BY` clauses. It also does not support `COALESCE()` in `ORDER BY`. These will throw a parse error at query time.

```surql
-- BROKEN — both throw parse errors
SELECT * FROM memories ORDER BY last_accessed_at ASC NULLS FIRST;
SELECT * FROM memories ORDER BY COALESCE(last_accessed_at, "1970-01-01T00:00:00Z") ASC;

-- CORRECT — SurrealDB sorts NULLs first in ASC by default (same as NULLS FIRST)
SELECT * FROM memories ORDER BY last_accessed_at ASC;
```

If you need NULLs-last behavior, add a computed sort key in the SELECT:
```surql
SELECT *, IF last_accessed_at = NONE THEN 1 ELSE 0 END AS null_rank
FROM memories ORDER BY null_rank ASC, last_accessed_at ASC;
```

### Tables that were never provisioned cause errors on DELETE/SELECT

SurrealDB errors when you query or delete from a table that has never been created — even if `DEFINE TABLE IF NOT EXISTS` exists in your schema provisioning code. The `IF NOT EXISTS` guard only works **when the statement actually runs**. If the database was initialized with an older schema version that didn't include a particular table, that table simply doesn't exist and any `DELETE FROM` or `SELECT FROM` against it will throw.

This is the root cause of "table X does not exist" errors in purge/maintenance commands: they connect directly to SurrealDB, bypassing the daemon's startup schema provision path. Edge/relation tables (e.g., `relates`, `derived_from`) are especially prone to this because they may have been added in a later release.

**Fix — `safeQuery` wrapper pattern:**

```typescript
async function safeQuery(db: Surreal, surql: string, vars?: Record<string, unknown>): Promise<unknown> {
  try {
    return await db.query(surql, vars)
  } catch {
    return undefined
  }
}

// Use for any table that might not exist
await safeQuery(db, `DELETE FROM relates;`)
await safeQuery(db, `SELECT count() AS total FROM relates GROUP ALL;`)
```

**Prevention:** Always call `provisionSchema()` (or the full `ensureLocalSurrealMemoryPlane()`) before running maintenance commands that touch arbitrary tables. But belt-and-suspenders with `safeQuery` is still warranted for CLI commands that run outside the daemon lifecycle.

**Coppermind tables affected:** `relates`, `memory_followups`, `triples`, and any edge table added post-initial-setup. Core tables like `memories` and `episode` always exist.

### `INFO FOR TABLE <name>` returns empty-but-valid for non-existent tables

Querying `INFO FOR TABLE nonexistent_table` does **not** throw an error. It returns:
```json
{"events": {}, "fields": {}, "indexes": {}, "lives": {}, "tables": {}}
```
with `status: "OK"`. This means checking `if (!result)` or `if (result.length === 0)` will not detect a missing table — the result is a non-empty object.

To detect whether a table actually exists, check if `fields` is non-empty (real tables have defined fields):
```typescript
const info = await db.query('INFO FOR TABLE memories');
const tableInfo = info[0] as any;
const exists = Object.keys(tableInfo.fields ?? {}).length > 0;
```

This is the root cause of the "schema drift" bug where `memory_followups` was never created on fresh restart: the health probe only checked the `memories` table and returned "healthy" even when `memory_followups` was missing.

**Do NOT use `information_schema.tables` in SurrealDB 3.x** — `SELECT count() > 0 FROM information_schema.tables WHERE table_name = '...'` returns an empty array even for tables that DO exist. This SQL-idiom approach is broken. Use `INFO FOR TABLE` + fields-count check instead.

### String literals use SINGLE quotes, NOT double quotes (critical)

SurrealDB distinguishes between:
- `"semantic"` (double quotes) — a **field name / identifier reference**, NOT a string
- `'semantic'` (single quotes) — a **string literal**

This is the opposite of SQL (where double quotes often mean strings). Using double quotes for string values silently produces wrong results:

```surql
-- WRONG — "semantic" is a field reference, resolves to NONE
UPDATE memories SET memory_kind = "semantic" WHERE memory_kind == NONE;

-- RIGHT — 'semantic' is a string literal
UPDATE memories SET memory_kind = 'semantic' WHERE memory_kind == NONE;
```

**Diagnosis:** If a migration appears to run successfully but the data doesn't change, suspect this. The `"semantic"` → NONE coercion is silent. You'll see `memory_kind: null` in query results despite the migration having "worked."

**This caused a real Coppermind bug:** the Phase 2b migration at `schema-provision.ts:202-207` used `"semantic"` and `"turn"` as if they were string literals. The update ran without error but set `memory_kind = NONE` instead of `memory_kind = 'semantic'`. 33 records accumulated with null `memory_kind` over months.

### Datetime arithmetic with durations (confirmed valid)

Durations can be added to and subtracted from datetimes (from SurrealDB docs):

```surql
d'1970-01-01' + 1d;          -- d'1970-01-02T00:00:00Z'
time::now() - 1d;            -- datetime 24 hours ago
time::now() + 5m;            -- datetime 5 minutes from now
```

Duration units: `ns`, `us`/`µs`, `ms`, `s`, `m`, `h`, `d`, `w`, `y`. Durations cannot be negative, but subtracting a positive duration from a datetime is valid.

Use this for temporal queries like "find memories superseded in the last 24 hours":
```surql
SELECT * FROM memories WHERE status = 'superseded' AND updated_at >= time::now() - 1d;
```

### Type casting in SELECT: `(type)field` is NOT valid SurrealQL

SurrealDB does **not** support C-style type casts like `(string)memory_id` in queries. Attempting:
```surql
SELECT (string)memory_id AS memId FROM triples;
```
produces:
```
Parse error: Unexpected token `an identifier`, expected FROM
```

**Correct approaches:**
1. Use `meta::id()` to extract the string ID from a record pointer:
   ```surql
   SELECT meta::id(memory_id) AS memId FROM triples;
   ```
2. Handle conversion in application code after fetching:
   ```surql
   SELECT memory_id FROM triples;  -- returns RecordId or string
   ```
   In TypeScript: `String(result.memory_id)` or `result.memory_id.toString()`

### Record link field access in WHERE clauses

When `memory_id` is a record link (e.g., `memories:abc123`), using `memory_id.entry_id` in a `WHERE` clause requires SurrealDB to resolve the linked record for every candidate row. This is slow and may silently return empty results if link resolution fails or the linked record is missing.

**Prefer filtering by record ID:**
```surql
-- Risky — requires link resolution per row; may silently return nothing
SELECT * FROM triples WHERE memory_id.entry_id IN $ids;

-- Safer — filter by record ID using meta::id()
SELECT * FROM triples WHERE meta::id(memory_id) IN $ids;

-- Best — store the raw entry_id directly on the referencing row
DEFINE FIELD entry_id ON TABLE triples TYPE string;
DEFINE INDEX idx_triples_entry ON TABLE triples FIELDS entry_id;
```

### `SELECT *` returns record IDs for link fields, not the linked record's fields

Without `FETCH` or explicit projection, `result.memory_id` is a record ID string like `"memories:abc123"`, not an object with `.entry_id`. To access linked record fields:

1. Use `FETCH`:
   ```surql
   SELECT * FROM triples FETCH memory_id;
   ```
2. Project explicitly:
   ```surql
   SELECT memory_id.entry_id AS mem_entry_id FROM triples;
   ```
3. Run a separate query for linked records (avoids FETCH overhead in large result sets).

### ORDER BY requires projected fields in SurrealDB v3 ("Missing order idiom")

SurrealDB v3+ enforces that any field in an `ORDER BY` clause **must also appear in the SELECT projection**. If you `ORDER BY created_at` but `created_at` is not in the `SELECT` list, you get:

```
Parse error: Missing order idiom `created_at` in statement selection
```

This means queries like this fail:
```surql
-- WRONG — status is in SELECT but ordering by created_at which is not
SELECT entry_id, status FROM memories WHERE user_id='default' ORDER BY created_at LIMIT 10;
```

**Fix**: Always include the sort field in the projection:
```surql
-- RIGHT — created_at is in SELECT, so ORDER BY is valid
SELECT entry_id, status, created_at FROM memories WHERE user_id='default' ORDER BY created_at LIMIT 10;
```

This is a departure from standard SQL where ORDER BY can reference non-projected columns. SurrealDB v3 treats ordering as a projection-dependent operation. The error message says "Missing order idiom" which is confusing — it means "the field you're ordering by is not in the output columns."

### `IN ('literal1', 'literal2')` — comma-separated literals rejected in WHERE

SurrealDB 3.x rejects comma-separated string literals in `IN (...)` lists at the parser level. Do NOT use `IN ('a', 'b')` syntax in WHERE clauses:

```surql
-- BROKEN in v3 — parse error
-- "Parse error: Unexpected token `,` expected delimiter `)`"
WHERE metadata.memoryType IN ('pattern', 'workflow')

-- CORRECT — expand with OR
WHERE metadata.memoryType = 'pattern' OR metadata.memoryType = 'workflow'
```

This affects any query that checks a field against a small fixed set of string values. Array-style `IN $param` with a bound parameter still works — only inline literal lists fail. Affected Coppermind's `consolidation-worker.ts` procedural pruning query.

### `SELECT VALUE` always returns an array, even with LIMIT 1

`SELECT VALUE field FROM table WHERE ... LIMIT 1` returns an **array** with one element, NOT a scalar. This is critical for LET-bound variables used with array indexing:

```surql
-- CORRECT — $key is an array, index [0] to get the value
LET $key = (SELECT VALUE canonical_key FROM memories WHERE entry_id = $eid LIMIT 1);
LET $result = IF $key { $key[0] } ELSE { NONE };

-- WRONG — $key is an array, not a string; using it directly in equality fails
LET $key = (SELECT VALUE canonical_key FROM memories WHERE entry_id = $eid LIMIT 1);
SELECT * FROM memories WHERE canonical_key = $key;  -- $key is ['mykey'], not 'mykey'
```

The fix: always index with `[0]` after `SELECT VALUE` when you need the scalar. Or use `SELECT ... LIMIT 1` (without VALUE) which returns an array of record objects where you'd access `.field`.

This affected Coppermind's `dependentMemoriesQuery()` in `fact-mutation.ts` — the `$canonicalKey` variable holds an array from `SELECT VALUE canonical_key`, and `$canonicalKey[0]` correctly extracts the scalar string.

---

## Related specialized skills

For deeper coverage of specific SurrealDB domains, load these skills directly:

- **`surrealdb-testing`** — SDK integration testing (JS + Python), HTTP endpoint testing, transaction-based assertions, `.surql` validation, Jest/Vitest patterns, CI setup. Key patterns: `mem://` for isolated tests, `BEGIN TRANSACTION` + `THROW` for assertion groups, `db.live()` for live query tests.
- **`surrealdb-optimization`** — `EXPLAIN` plan reading, server config (`--log`, `rocksdb://`), query patterns (direct ID selection, record ranges, array targets), indexing strategies (standard, UNIQUE, composite, COUNT, FULLTEXT, HNSW, CONCURRENTLY, DEFER), string index operators, UPDATE/DELETE subquery workaround for pre-v2.3.0.
- **`surrealdb-security`** — Capabilities system (`--allow-funcs`, `--allow-net`), password hashing (`crypto::argon2::*`, `crypto::bcrypt::*`), JWT configuration (asymmetric algorithms, JWKS, DURATION), token/session expiry, SQL injection prevention, XSS encoding, network hardening, table/field permissions, event trigger security.
- **`surrealdb-js-sdk`** — Full JavaScript/TypeScript SDK coverage: connection protocols, auth (system/record/bearer), CRUD API, `.query()` return shape gotchas, `.live()` managed vs unmanaged live queries, React/SolidJS integration with TanStack Query, error handling, 10-point SDK gotchas table.

## Support files

- `references/surrealdb-v3-schema-migration.md` — v2→v3 migration: DEFINE INDEX WHERE removal, MTREE→HNSW, NULL casting, workspace package resolution
- `references/surrealdb-v3-order-by-pitfall.md` — ORDER BY strictness and affected files
- `references/surrealdb-quoting-pitfalls.md` — String literal quoting (`'semantic'` vs `"semantic"`)
- `references/surrealdb-record-link-query-pitfalls.md` — Record link field access in queries (`meta::id()`, `FETCH`, `WHERE` clause behavior)
- `references/surrealdb-missing-table-safequery.md` — Missing table errors on DELETE/SELECT, safeQuery wrapper pattern, full-table purge with graceful fallback
- `references/surrealdb-union-4-query-split.md` — UNION parse error fix: splitting bidirectional graph edge queries into 4 separate queries with `Promise.allSettled`, used in activation-spread.ts
- `references/surrealdb-native-graph-traversal.md` — Native `->edge->target` traversal replacing JS BFS: bidirectional patterns, 2-hop sibling walks, degree centrality, edge-weight design, TypeScript query organization
- `references/coppermind-memory-schema-field-lifecycle.md` — Full lifecycle of daemon memory schema fields: architecture doc → schema.ts → INSERT queries → row mappers → API response. How to audit a field across all pipeline stages, the three INSERT paths, salience computation, and the AI-facing vs human-facing design principle.
- `scripts/surrealdb-triple-query-verification.sh` — Verification script for triple retrieval queries against real SurrealDB
- `references/surrealdb-table-name-mismatch.md` — Diagnosing and fixing table name mismatches (e.g. `memory` vs `memories`) between application queries and actual SurrealDB schema; verification with `surreal sql` CLI and systematic fix approach

---

## Temporal truth pattern (valid_at / invalid_at / status)

```sql
DEFINE NAMESPACE IF NOT EXISTS coppermind;
USE NS coppermind; DEFINE DATABASE IF NOT EXISTS daemon;
```

This is normally handled by `provisionSchema` in the daemon, but manual intervention is needed when bootstrapping a fresh SurrealDB instance from scratch.

---

## Temporal truth pattern (valid_at / invalid_at / status)

When storing facts that change over time (user preferences, settings, canonical knowledge), use explicit temporal fields instead of flat overwrite.

### Schema

```surql
DEFINE FIELD status ON TYPE option<string>;          -- active|superseded|pending_review|rejected
DEFINE FIELD valid_at ON TYPE option<string>;         -- ISO timestamp, fact valid from
DEFINE FIELD invalid_at ON TYPE option<string>;       -- ISO timestamp, fact no longer valid after
DEFINE FIELD canonical_key ON TYPE option<string>;    -- stable cluster key e.g. "pref:editor_theme"

-- NOTE: SurrealDB v3 removed WHERE clauses from DEFINE INDEX.
-- If you need filtered indexes, create a separate table or use application-level filtering.
DEFINE INDEX idx_canonical_cluster ON TABLE FIELDS user_id, canonical_key, status;
DEFINE INDEX idx_valid_at ON TABLE FIELDS user_id, valid_at;
```

### Insert

Always set `valid_at = created_at, invalid_at = NONE, status = 'active'` on insert.

### Supersede

When a newer version of the same fact arrives, atomically:
1. Set `status = 'superseded', invalid_at = <now>` on the old record.
2. Insert the new record with `status = 'active', valid_at = <now>, invalid_at = NONE`.

### Queries

**What is true now?** — Filter by `status = 'active'` (include `status IS NONE` for pre-migration records).

**What was true at time T?** — Point-in-time predicate:
```surql
WHERE (valid_at <= $ts OR valid_at IS NONE)
  AND (invalid_at > $ts OR invalid_at IS NONE)
  AND (status = 'active' OR status = 'superseded' OR status IS NONE)
```

**What changed since T?** — `WHERE created_at >= $since OR updated_at >= $since`.

**Current truth for a canonical key?** — `WHERE canonical_key = $key AND status = 'active'`.

### Index for status-filtered retrieval

Normal retrieval should exclude superseded/rejected memories. Use a constant filter:
```surql
DEFINE INDEX idx_active ON TABLE FIELDS user_id, status WHERE status = 'active' OR status IS NONE;
```

Admission (dedup/supersede logic) needs a broader filter that includes `pending_review` memories so they can be superseded when higher-confidence versions arrive.

### Gotcha: migration backfill

When adding temporal fields to an existing table, backfill in ensureSchema:
```surql
UPDATE table SET status = 'active', valid_at = created_at WHERE status IS NONE;
```

### Gotcha: canonical_key quality

The cluster query groups by `canonical_key`. If the triage/classification step assigns the same key to unrelated memories, the cluster returns them together. Key quality is only as good as the classifier producing it.

---

## What the agent should do before writing SurrealDB code

Before making changes, the agent should:

1. Identify the dominant access patterns.
2. Decide whether the problem is document-first, graph-first, search-first, or hybrid.
3. Choose record links vs graph relations intentionally.
4. Propose explicit table/field/index definitions.
5. Specify transaction boundaries.
6. Specify permissions if direct client access is in scope.
7. Show at least one representative query per critical access pattern.
8. Call out any operator/index mismatches.

---

## Preferred response style for SurrealDB tasks

When solving SurrealDB tasks, the agent should usually return:

1. the schema changes
2. the indexes
3. the main queries
4. the transaction boundaries
5. the likely performance pitfalls
6. any data-model tradeoffs

If there is ambiguity, prefer the simplest schema that preserves correctness and performance.
