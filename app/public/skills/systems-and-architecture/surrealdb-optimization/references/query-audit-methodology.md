# Systematic SurrealDB Query Audit Methodology

A proven approach for auditing and optimizing all SurrealDB queries in a codebase. Derived from a production audit of the Coppermind memory daemon (~95 queries across 15+ files).

## Phase 1: Discovery

### 1.1 Find all queries

```bash
rg --no-heading --line-number "SELECT.*FROM|INSERT INTO|UPDATE.*SET|DELETE FROM|UPSERT" --type ts
```

For each query, record:
- File and line number
- Query type (SELECT/INSERT/UPDATE/DELETE/UPSERT)
- Table name
- WHERE clause
- Whether it uses `SELECT *`

### 1.2 Find all schema definitions

```bash
rg --no-heading --line-number "DEFINE INDEX|DEFINE TABLE|DEFINE FIELD|DEFINE ANALYZER" --type ts
```

Build a complete index inventory:
- Index name, table, fields, type (standard/UNIQUE/FULLTEXT/HNSW/COUNT)
- Identify which indexes are unused (no query references their fields)

### 1.3 Map hot paths

Identify which queries are on the critical path:
- **Ingest path**: called on every memory write (episode INSERT, dedup check, admission decision)
- **Search path**: called on every memory retrieval
- **Cleanup path**: periodic background sweeps

Tag queries by path: `[HOT]` for ingest/search, `[BG]` for background workers.

## Phase 2: Analysis

### 2.1 SELECT * audit

For every `SELECT *`, trace the result to its consumer. Count how many fields are actually accessed vs. how many are fetched. Flag any that:
- Fetch embedding vectors when no embedder is available
- Fetch `search_text` (duplicate of content) for existence checks
- Fetch `content_hash` for anything other than hash comparison
- Return full records when only `entry_id` or `id` is needed

**High-impact targets** (ordered by call frequency × waste):
1. Dedup/existence checks that need 1-2 fields but fetch all 40+
2. Admission context queries that need 10 fields but fetch all 40+
3. Search queries that always fetch embedding even when not ranking by similarity

### 2.2 Write pattern audit

Look for:
- **DELETE + INSERT** on the same record → should be UPSERT
- **N individual UPDATEs** in a loop → should be single `UPDATE WHERE id IN $ids`
- **Sequential per-item processing** in a for loop → consider parallelization or batching
- **UPDATE by record ID** when UPSERT by unique field would work

### 2.3 Missing index audit

For every WHERE clause, check if a matching index exists. Flag:
- Queries filtering on fields with no index (full table scan)
- Edge/relation table lookups filtering on `in, out` with no composite index
- Queries with `ORDER BY` on non-indexed fields
- Record-link traversals (`WHERE memory_id.user_id = $uid`) — these can't use standard indexes

### 2.4 Bug detection

While auditing, watch for:
- **Wrong table names** — SurrealDB may silently create the wrong table
- **Unused query results** — result consumed only for length check, not content
- **Shadowed variables** — `$eid` reused with different meaning in same scope

## Phase 3: Prioritized Fixes

Apply in this order (proven ROI from highest to lowest):

### Tier 1: Zero-risk, high-impact (do immediately)

1. **Fix SELECT * on hot-path dedup** — typically reduces 40+ fields to 1-2
2. **Fix bugs** (wrong table names, etc.)
3. **Replace DELETE+INSERT with UPSERT** — halves roundtrips, makes atomic

### Tier 2: Low-risk, moderate-impact

4. **Project explicit fields** on admission/search queries
5. **Add missing indexes** for cleanup queries filtering on unindexed fields
6. **Add composite indexes** on edge tables (`in, out`)
7. **Batch UPDATE loops** into single `UPDATE WHERE id IN $ids`

### Tier 3: Architectural (measure first)

8. **In-process write batching** for ingest (accumulate 100ms or N items)
9. **Cache admission context** (in-process LRU for "top-5 existing memories" query)
10. **Parallelize sequential per-item processing**

## Real-World Results

From the Coppermind audit (11 files changed, +42/-38 lines):

| Fix | Queries Changed | Est. Data Reduction |
|-----|-----------------|---------------------|
| Dedup SELECT * → 2 fields | 1 (every ingest) | ~95% |
| Admission SELECT * → explicit | 5 | ~70% |
| Search/temporal SELECT * → explicit | 12 | ~50% |
| DELETE+INSERT → UPSERT | 1 | 50% fewer roundtrips |
| N UPDATEs → batch | 1 (touch-access) | N→1 roundtrips |
| New indexes | 4 added | Table scans → index lookups |
| Bug: wrong table name | 1 | Silent failure → correct behavior |

## Verification Checklist

After applying fixes:
- [ ] No new type errors in touched files
- [ ] `EXPLAIN FULL` confirms index usage on modified queries (if testable)
- [ ] Downstream consumers of projected fields still receive all needed fields
- [ ] No new table names that don't exist in schema
- [ ] Format pass clean
