---
name: surrealdb-optimization
description: SurrealDB query optimization, EXPLAIN analysis, indexing strategies, server configuration, and performance best practices for production SurrealDB 3.x deployments.
version: 1.0.0
author: Hermes Agent
metadata:
  hermes:
    tags: [surrealdb, performance, optimization, indexing, explain]
---

# SurrealDB Optimization Skill

Use this skill when diagnosing slow queries, designing indexes, tuning server configuration, or reviewing SurrealDB performance in production.

---

## EXPLAIN — Inspect Query Plans

Prefix any read-only statement with `EXPLAIN` to see the execution plan. Add `ANALYZE` for timing and row metrics.

```surql
-- Basic plan inspection
SELECT * FROM user WHERE email = 'test@surrealdb.com' EXPLAIN FULL;

-- With timing and row counts
SELECT * FROM user WHERE status = 'active' ORDER BY created_at DESC EXPLAIN ANALYZE;
```

What to look for:
- `"operation": "Iterate Index"` — the query is using an index (good)
- `"operation": "Iterate Table"` — full table scan (bad for large tables)
- `"operation": "Union"` — combining multiple index scans
- `"operation": "Order"` — external sorting (may indicate missing index for ORDER BY)

Do not build tooling that depends on exact output shape — it changes between versions.

---

## Server Configuration

### Logging Level

Log verbosity directly affects performance. For production or benchmarking:

```bash
surreal start --user root --pass secret --log info surreal://path/to/db
# or
SURREAL_LOG=info surreal start ...
```

**Never use** `debug`, `trace`, or `full` in production — they are extremely expensive.

### Storage Engine

Always use `rocksdb://` for production persistence:

```bash
surreal start --user root --pass secret "rocksdb:///var/lib/surrealdb"
```

- `file://` is broken in 3.x (produces `Unable to load the specified datastore`)
- `surrealkv://` works but `rocksdb://` is recommended for production
- Path format for absolute paths: **triple slash** (`rocksdb:///absolute/path`)

### Embedded Rust Optimization

When embedding SurrealDB in Rust:

```toml
[dependencies]
surrealdb = { version = "3", features = ["allocator"] }  # custom allocator
```

Add `--release` flags beyond standard release. Configure async runtime for multiple threads and increased stack size.

### Tauri Applications

Disable the Tauri plugin log in `tauri.conf.json` or at compile time — database logs in a GUI app will bottleneck performance.

---

## Query Optimization

### Select by Record ID — Avoid WHERE on IDs

Directly selecting from a record ID is faster than a `WHERE` clause on the ID field, especially in pre-3.0 versions. The query planner identifies record ID scans automatically in 3.0+.

```surql
-- Optimized: direct selection
SELECT * FROM person:tobie;

-- Avoid (causes table scan in older versions):
SELECT * FROM person WHERE id = person:tobie;
```

### Multiple Records — Use Array Targets

```surql
-- Optimized: direct array lookup
SELECT * FROM [person:tobie, person:jaime, person:amy];

-- Avoid (causes table scan):
SELECT * FROM person WHERE id INSIDE ['person:tobie', 'person:jaime'];
```

### Boolean Fields First

In `WHERE` clauses, put the simplest/most selective boolean checks first. Boolean checks are the cheapest operations for the engine.

```surql
-- Good: boolean field first
WHERE admin = true AND status = 'active' AND created_at >= '2024-01-01'

-- Less good: expensive string comparison first
WHERE email CONTAINS '@' AND admin = true
```

### Use Ranges on Record IDs for Time-Series Data

When records have time-ordered or numeric IDs, record range scans avoid table scans entirely:

```surql
-- Very fast: uses natural ID ordering
SELECT * FROM sensor:2024-01-01..sensor:2024-12-31;
```

### Index-Only Operations for UPDATE/DELETE

**Pre-v2.3.0 limitation:** `UPDATE` and `DELETE` on large tables do not use indexes directly. Workaround — wrap in a subquery:

```surql
-- Optimized UPDATE (pre-2.3.0):
UPDATE (SELECT id FROM user WHERE admin = true) SET permissions = 'full';

-- Optimized DELETE (pre-2.3.0):
DELETE (SELECT id FROM user WHERE active = false);
```

This uses the index on `admin` / `active` to find IDs first, then updates/deletes by ID.

---

## Indexing Strategies

### Index Types

| Type | Use When |
|---|---|
| Standard (non-unique) | High-cardinality fields in `WHERE` clauses — tags, status, foreign keys |
| `UNIQUE` | Emails, IDs, any field that must not duplicate |
| `COUNT` | Tables where you frequently run `SELECT count() FROM t GROUP ALL` |
| `FULLTEXT ANALYZER ... BM25` | Search-oriented text retrieval |
| `HNSW DIMENSION N` | Vector similarity search (embeddings) |
| Composite | Unique constraint or filter on multiple fields together |

### Syntax

```surql
-- Standard index
DEFINE INDEX idx_user_status ON TABLE user FIELDS status;

-- Unique index
DEFINE INDEX user_email_unique ON TABLE user FIELDS email UNIQUE;

-- Composite unique
DEFINE INDEX user_account_email ON TABLE user FIELDS account, email UNIQUE;

-- Full-text search
DEFINE INDEX memory_text_idx ON TABLE memories
  FIELDS search_text
  FULLTEXT ANALYZER simple BM25;

-- Vector (HNSW)
DEFINE INDEX memory_embedding_idx ON TABLE memories
  FIELDS embedding
  HNSW DIMENSION 1536 DIST COSINE;

-- COUNT index (v3.0+) — no FIELDS clause, applies to whole table
DEFINE INDEX table_count ON TABLE memories COUNT;
```

### String Index Operators (v2.4.0)

To use an index on a string field, you must use these operators:

- **Index-friendly:** `CONTAINSANY`, `ALLINSIDE`, `ANYINSIDE`
- **Not index-friendly:** `CONTAINS` — does substring matching and ignores indexes

```surql
-- Uses index (v2.4.0+)
SELECT * FROM person WHERE interests CONTAINSANY ['music', 'art'];

-- Does NOT use index — full scan
SELECT * FROM person WHERE interests CONTAINS 'music';
```

### Remote Field Lookups (Index-Based Joins)

When filtering on a field of a linked record (e.g., `access.user.role = 'admin'`), create indexes on **both** the local reference field and the remote field:

```surql
DEFINE INDEX access_user_idx ON TABLE access FIELDS user;
DEFINE INDEX user_role_idx ON TABLE user FIELDS role;

-- Now this query can use index-based join:
SELECT * FROM access WHERE user.role = 'admin';
```

### CONCURRENTLY and DEFER for Large Index Builds

- **`CONCURRENTLY`** (v2.0+): Builds the index in the background without blocking reads/writes. Monitor with `INFO FOR INDEX <name> ON <table>;` — stages are `initial` → `update` → `ready`.

- **`DEFER`** (v2.5.0+): Decouples ingestion from indexing for eventual consistency. Useful for high-volume parallel bulk loads. Cannot be used with `UNIQUE`.

```surql
-- Non-blocking build
DEFINE INDEX big_table_idx ON TABLE big FIELDS created_at CONCURRENTLY;

-- Deferred for bulk loads
DEFINE INDEX wide_idx ON TABLE large FIELDS category, region DEFER;
```

### Index Tradeoffs

Indexes dramatically speed up `SELECT` queries but **increase write latency** for `INSERT`, `UPDATE`, and `DELETE` because the index must be updated on every write. Do not add indexes speculatively — add them for specific query patterns and verify with `EXPLAIN`.

---

## Remote Field Lookups and JOIN Strategy

Without `FETCH`, `SELECT *` returns record ID strings for link fields, not the linked record's fields:

```surql
-- Returns: { user: "user:abc123" } — record ID string, not the record
SELECT * FROM task;

-- Returns: full user record inlined — one extra lookup
SELECT * FROM task FETCH user;

-- Project explicitly without FETCH overhead
SELECT user.name, user.email FROM task;
```

For large result sets, avoid `FETCH` on linked records — run a second query for the linked data instead.

---

## FETCH Clause — Avoiding N+1

`FETCH` replaces record ID links with the actual linked record data in a single query — use it to avoid N+1 queries:

```surql
SELECT * FROM task
WHERE project = 'project:xyz'
FETCH project, assignee;
```

Caution: `FETCH` does an additional lookup per linked record. For large result sets with many links, a separate query for the linked data may be faster.

---

## Pagination

Use `LIMIT` and `START` together. `START` is 0-indexed:

```surql
-- Page 2 of 20
SELECT * FROM post
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20 START 20;
```

For very large datasets that exceed available RAM, use `TEMPFILES`:

```surql
SELECT * FROM massive_table TEMPFILES;
```

---

## ORDER BY Optimization

- Sort on indexed fields when possible — SurrealDB can use a pre-ordered index scan
- `COLLATE` provides consistent Unicode sorting for different languages/cases
- `NUMERIC` correctly sorts strings containing numbers (e.g., "file10" after "file2")

```surql
-- Using index for ORDER BY (if status has an index):
SELECT * FROM post WHERE status = 'published' ORDER BY created_at DESC;

-- External sort — no index available:
SELECT * FROM post ORDER BY computed_score DESC;
```

### NULLS FIRST/LAST — Not Supported

SurrealDB does **not** support `NULLS FIRST` or `NULLS LAST` in `ORDER BY`, and does not support `COALESCE()` in `ORDER BY`. Both throw parse errors.

SurrealDB sorts NULLs first in `ASC` by default (equivalent to `NULLS FIRST`). For NULLs-last behavior:

```surql
SELECT *,
  IF created_at = NONE THEN 1 ELSE 0 END AS null_rank
FROM memories
ORDER BY null_rank ASC, created_at ASC;
```

---

## UPSERT vs UPDATE

`UPSERT` with a unique index is significantly faster than `UPDATE` because it uses the index to locate the record directly, rather than a table scan:

```surql
-- Fast: index lookup
UPSERT user:eric SET preferences = $prefs;

-- Slower: table scan
UPDATE user:eric SET preferences = $prefs;
```

Always use `UPSERT` when updating by a unique field.

### Replace DELETE + INSERT with UPSERT

A common pattern for "upsert" semantics is to DELETE then INSERT. This requires two roundtrips and is not atomic. Replace with a single `UPSERT`:

```surql
-- Anti-pattern: two queries, non-atomic, risks data loss on crash between them
DELETE FROM memories WHERE entry_id = $eid;
INSERT INTO memories { entry_id: $eid, content: $content, ... };

-- Correct: single atomic query using the UNIQUE index on entry_id
UPSERT memories SET
  entry_id = $eid,
  content = $content,
  updated_at = time::now()
WHERE entry_id = $eid;
```

## Batch UPDATE — Eliminate N+1 Write Loops

When updating the same field on N records (e.g., `last_accessed_at`), avoid a loop of N individual queries:

```typescript
// Anti-pattern: N roundtrips
for (const eid of entryIds) {
  await db.query(
    `UPDATE memories SET last_accessed_at = $now WHERE entry_id = $eid;`,
    { eid, now: timestamp },
  );
}

// Correct: single roundtrip
await db.query(
  `UPDATE memories SET last_accessed_at = $now WHERE entry_id IN $ids;`,
  { ids: entryIds, now: timestamp },
);
```

---

## In-Process Concurrency (Independent Items)

When processing N independent items through a SurrealDB pipeline, replacing a sequential `for-await` with bounded-concurrency `Promise.allSettled` can yield near-linear speedup without infrastructure changes. The critical precondition: items must have **zero cross-item dependencies**.

### Precondition: Verify independence

Before parallelizing, confirm:
- No item's result is read by another item in the same batch
- Shared accumulator is append-only (IDs, counts) — NOT read-then-mutate
- Each item uses its own UUIDs (not auto-increment or shared counters)
- Queries are scoped to `(user_id, scope, content_hash)` — items within the same batch won't collide on dedup checks

### Pattern: Bounded-concurrency dispatch

```typescript
const CONCURRENCY = 4;
const results: { index: number; ids: string[] }[] = [];

for (let i = 0; i < items.length; i += CONCURRENCY) {
  const batch = items.slice(i, i + CONCURRENCY);
  const settled = await Promise.allSettled(
    batch.map((item, batchIdx) =>
      processItem(item).then(ids => ({ index: i + batchIdx, ids })),
    ),
  );
  for (const s of settled) {
    if (s.status === "fulfilled") results.push(s.value);
    else logger.warn({ error: s.reason }, "item_failed");
  }
}
// Preserve original order
results.sort((a, b) => a.index - b.index);
const allIds = results.flatMap(r => r.ids);
```

**Design decisions:**
- `Promise.allSettled` over `Promise.all` — one item failure must not abort the batch
- Bounded concurrency (4) over unbounded — SurrealDB HTTP server handles concurrent connections fine, but ONNX runtimes, memory pressure, and downstream API quotas are real constraints
- Index-preserving merge — callers that depend on submission order (e.g., first response wins) need sorted results

### Pitfalls

- **ONNX runtime thread safety**: Some ONNX backends (`onnxruntime-node`) are not fully thread-safe for concurrent `run()` calls. The safe default is concurrency=4 where each item owns its inference sequentially, but items in the batch infer concurrently. Profile before increasing.
- **Duplicate detection races**: If two items in same batch have the same `content_hash`, one will write first and the other will dedup-catch it. Acceptable — the dedup check still works, just non-deterministically within the batch.
- **Episode ordering**: If downstream consumers care about `ORDER BY created_at DESC`, make `created_at` identical within the batch (all items share the same `nowTs`) — order is then stable by entry_id.

### Admission context caching (complementary)

When the admission pipeline fetches the same baseline context (`queryFragmentsForUser`) for every item in a batch, a short-TTL in-process cache eliminates N redundant queries:

```typescript
const CACHE_TTL_MS = 2_000;
const _cache = new Map<string, { data: Fragment[]; expires: number }>();

async function getCachedFragments(db: Surreal, userId: string, scope: string) {
  const key = `${userId}:${scope}`;
  const cached = _cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;
  const fragments = await queryFragmentsForUser(db, userId, scope);
  _cache.set(key, { data: fragments, expires: Date.now() + CACHE_TTL_MS });
  return fragments;
}
```

TTL is deliberately short (2s) — triage context is advisory, not authoritative, and slight staleness across concurrent items is acceptable.

---

## Transaction Scope

Each statement is implicitly transactional, but wrap multi-step mutations in explicit transactions when correctness requires atomicity:

```surql
BEGIN TRANSACTION;

LET $task = CREATE task SET title = 'Ship it', status = 'open';
LET $log = CREATE audit_log SET action = 'task_created', task = $task.id;

IF $task.status != 'open' {
  THROW "Task not created in expected state";
};

COMMIT TRANSACTION;
```

Short transactions reduce lock contention on high-concurrency workloads.

---

## Live Query Performance

Live queries push updates over WebSocket. Each live query consumes server resources. Best practices:

- Use `WHERE` filters in `LIVE SELECT` to narrow the scope, not broad subscriptions
- `KILL` live queries when no longer needed — don't leave them dangling
- Live queries are single-node only; multi-node support is in development
- Use `ASYNC` events for fire-and-forget side effects rather than synchronous triggers

---

## Monitoring in Production

- Use `INFO FOR INDEX <name> ON <table>` to check index build status
- Use `SHOW CHANGES FOR TABLE <name> SINCE <timestamp>` to inspect a changefeed
- Set `CHANGEFEED 1d` on tables you need to audit or replay
- The `COUNT` index avoids scanning every row for `SELECT count() ... GROUP ALL`

---

## Systematic Query Audit (Full Codebase)

When optimizing a codebase's SurrealDB usage beyond a single slow query, use this methodology. See `references/query-audit-methodology.md` for a detailed checklist with real-world examples.

### Step 1: Inventory all queries

Use `rg` (or Scout-Lite) to find every query string:

```
rg --no-heading "SELECT.*FROM|INSERT INTO|UPDATE.*SET|DELETE FROM|UPSERT" --type ts
```

For each query, record: file, line, query type, WHERE clause, whether it uses SELECT *.

### Step 2: Rank by impact

Prioritize queries by:
1. **Call frequency** — every request? Every ingest?
2. **Data volume** — does SELECT * fetch embedding vectors (384+ floats), large text fields, or full records?
3. **Roundtrip count** — does the operation require N queries for N items?

### Step 3: Fix in priority order (highest ROI first)

| Priority | Pattern | Fix | Risk |
|----------|---------|-----|------|
| 1 | `SELECT *` on hot-path dedup/existence checks | Project only needed fields (often just `entry_id`) | Very low |
| 2 | `SELECT *` on queries needing <50% of fields | Project explicit field list from downstream usage | Low |
| 3 | `DELETE` + `INSERT` for upsert semantics | Single `UPSERT ... WHERE unique_field = $val` | Low |
| 4 | N individual `UPDATE` in a loop | Single `UPDATE ... WHERE id IN $ids` | Very low |
| 5 | Missing index on WHERE clause | Add `DEFINE INDEX` for filter fields | Low — slight write cost increase |
| 6 | Missing index on relation edges (`in, out`) | Composite index on edge tables | Low |

### Step 4: Verify each change

After each fix: run `EXPLAIN FULL` if feasible, check typecheck passes, verify no downstream code breaks from field projection changes.

### Common anti-patterns to look for

- **Embedding vectors in SELECT \*** — 384+ floats fetched when no embedder is running. Exclude `embedding` from projections when not needed.
- **search_text / content_hash in projections** — large denormalized fields for checks that only need `entry_id` or `canonical_key`.
- **Wrong table names** — SurrealDB silently creates tables on INSERT/UPDATE if the name is wrong (e.g., `episodes` vs `episode`). Verify all table names match schema.
- **Record-link traversals without indexes** — `WHERE memory_id.user_id = $uid` traverses a record link; no standard index helps. Consider denormalizing.
- **OR conditions on scope** — `(scope = $s OR scope = '' OR scope = 'default')` prevents effective index use. Normalize scope values if pattern is common.

## Diagnosing a Single Slow Query

1. Run `EXPLAIN FULL` on the slow query — confirm whether it's a table scan or index iteration
2. Check that the field in the `WHERE` clause has an index
3. Verify the operator is index-friendly (`=`, `!=`, `IN`, `INSIDE`, `CONTAINSANY` — not `CONTAINS`)
4. Check for `SELECT *` when only specific fields are needed — projection-only queries can sometimes use covering indexes
5. Look for `ORDER BY` on non-indexed fields — external sort may be the bottleneck
6. Check whether `UPDATE`/`DELETE` is being used on a large table without a subquery wrapper (pre-v2.3.0 issue)
7. Verify the storage engine is `rocksdb://`, not `file://`
8. Confirm logging is at `info` or higher, not `debug`/`trace`

---

## Operational Checklist

- [ ] Server log level is `info` or higher (not `debug`/`trace`)
- [ ] Storage engine is `rocksdb://`
- [ ] All `WHERE` filter fields have indexes
- [ ] `EXPLAIN` confirms index usage on critical queries
- [ ] `UPSERT` used instead of `UPDATE` on unique key lookups
- [ ] Live queries have `WHERE` filters and are `KILL`ed when done
- [ ] Large index builds use `CONCURRENTLY`
- [ ] Bulk imports use `DEFER` if applicable
- [ ] `COUNT` index exists on tables queried with `GROUP ALL count()`
- [ ] Connection pool / SDK reconnection configured correctly

## Support files

- `references/explain-output.md` — Full `EXPLAIN`/`EXPLAIN ANALYZE` output reference: operation types, good/bad plan shapes, `WITH INDEX`/`WITH NOINDEX`, pre-2.3.0 UPDATE/DELETE caveat, TypeScript verification helper
- `references/query-audit-methodology.md` — Systematic full-codebase query audit checklist with real-world examples from a production SurrealDB application
- `references/coppermind-field-diagnostics.md` — Coppermind-specific: embedding architecture (memories vs episode), why `inspect` shows missing episode fields, why `tool_calls=0` and `tests=[]` are correct not bugs, diagnostic quick-check script
- `references/coppermind-search-optimization.md` — Coppermind search pipeline optimizations: CONTAINSANY triple matching, HNSW episode anchoring, shared RRF fusion, LRU embedding cache
