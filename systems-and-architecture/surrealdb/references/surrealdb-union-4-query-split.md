# Union and Graph Traversal Patterns for SurrealDB Edges

## Problem

SurrealDB v3 does not support `UNION` or `UNION ALL` in SELECT statements. Using them produces:

```
Parse error: Unexpected token an identifier, expected Eof
 --> [4:8]
  |
4 | UNION
  | ^^^^^
```

## Context: Bidirectional Graph Edge Queries

The canonical failure case is querying graph edges bidirectionally. For `related_to` edges (which have `in` and `out` pointers), you need results from both directions.

## Preferred Approach: Native Graph Traversal via SELECT VALUE subquery (v2+)

**This is the preferred pattern as of May 2026.** Instead of querying edge tables directly (`FROM related_to WHERE in IN $ids`), use SurrealDB's native `->edgeType->targetTable` traversal syntax via `SELECT VALUE` subquery:

```surql
-- Both outbound and inbound in separate queries (UNION is broken)
-- Outbound: seed memory is `in`, find target memories via ->
SELECT entry_id, user_id FROM memories
WHERE user_id = $user
  AND (status = 'active' OR status IS NONE)
  AND entry_id IN (
    SELECT VALUE ->related_to->memories.entry_id
    FROM memories WHERE entry_id IN $entryIds
  );

-- Inbound: seed memory is `out`, find source memories via <-
SELECT entry_id, user_id FROM memories
WHERE user_id = $user
  AND (status = 'active' OR status IS NONE)
  AND entry_id IN (
    SELECT VALUE <-related_to<-memories.entry_id
    FROM memories WHERE entry_id IN $entryIds
  );
```

### Why this is better than querying edge tables directly

1. **Resolves record pointers correctly.** The old approach built record IDs as `memories:<id>` strings, which broke for derived_from edges where the target is an `episode` record, not a `memory`. Native traversal resolves pointers regardless of target table type — it traverses `->derived_from->episode` naturally.
2. **Lets SurrealDB optimize traversal** via its graph engine instead of doing a join-based scan on the edge table.
3. **Enables multi-hop syntax** — you can traverse `->related_to->memories->related_to->memories` in one subquery for depth-2 BFS.
4. **Cleaner code** — no `memories:id` string construction, no fragile ID format assumptions.
5. **Filters on the outer query** — user_id, status, and LIMIT all apply to resolved records, not edge table rows.

### TypeScript pattern (Promise.allSettled for resilience)

```typescript
const [outbound, inbound] = await Promise.allSettled([
  db.query(
    `SELECT entry_id, user_id FROM memories
     WHERE user_id = $user
       AND (status = 'active' OR status IS NONE)
       AND entry_id IN (
         SELECT VALUE ->related_to->memories.entry_id
         FROM memories WHERE entry_id IN $entryIds
       )
     LIMIT 100;`,
    { entryIds, user: userId },
  ),
  db.query(
    `SELECT entry_id, user_id FROM memories
     WHERE user_id = $user
       AND (status = 'active' OR status IS NONE)
       AND entry_id IN (
         SELECT VALUE <-related_to<-memories.entry_id
         FROM memories WHERE entry_id IN $entryIds
       )
     LIMIT 100;`,
    { entryIds, user: userId },
  ),
]);

const neighbors: NeighborRow[] = [];
for (const result of [outbound, inbound]) {
  if (result.status === 'fulfilled') {
    const rows = unwrapQuery<{ entry_id: string; user_id: string }>(result.value);
    for (const r of rows) {
      neighbors.push({
        entry_id: String(r.entry_id),
        user_id: String(r.user_id),
        edge_type: 'related_to',
      });
    }
  }
}
```

### Multi-hop (depth 2) — find siblings via derived_from

This pattern finds OTHER memories that were derived from the same episodes as our seeds — useful for provenance-based associative recall:

```surql
-- Seed memory -> derived_from -> episode <- derived_from <- sibling memory
SELECT entry_id, user_id FROM memories
WHERE user_id = $user
  AND (status = 'active' OR status IS NONE)
  AND entry_id IN (
    SELECT VALUE <-derived_from<-episode.entry_id
    FROM (
      SELECT VALUE ->derived_from->episode.entry_id
      FROM memories WHERE entry_id IN $entryIds
    ) AS episodes
  );
```

This pattern is made possible by native traversal — the old `memories:id` string construction would have turned episode entry_ids into `memories:epX` which never matched.

### Graph degree centrality (single query)

Count all edges (inbound + outbound) across multiple edge tables in one query:

```surql
SELECT entry_id,
  (count(->related_to) + count(<-related_to)
   + count(->derived_from) + count(<-derived_from)
   + count(->relates) + count(<-relates)) AS degree
FROM memories
WHERE entry_id IN $ids
GROUP BY entry_id;
```

Use the degree as a gentle ranking signal in RRF: well-connected memories are "hub" knowledge and deserve a small boost.

## Legacy Approach A: Single Query with OR (simple cases only)

For simple lookups where the two sides have the same projection and you're querying the edge table directly (not using native traversal):

```surql
SELECT out.entry_id AS entry_id, out.user_id AS user_id, "related_to" AS edge_type
FROM related_to
WHERE (in IN $ids AND out.user_id = $user)
   OR (out IN $ids AND in.user_id = $user);
```

**Limitation:** This doesn't help with derived_from in-direction (out is an episode, not a memory) and may perform worse than native traversal.

## Legacy Approach B: Four Separate Queries with Promise.allSettled

**This was the original pattern. It is now REPLACED by native traversal.** Kept for reference:

```typescript
// OBSOLETE — kept for backward compatibility reference
const [relatedOutRows, relatedInRows, derivedOutRows, derivedInRows] = await Promise.allSettled([
  db.query(
    `SELECT out.entry_id AS entry_id, out.user_id AS user_id, "related_to" AS edge_type
     FROM related_to WHERE in IN $ids AND out.user_id = $user;`,
    { ids: recordIds, user: userId }
  ),
  db.query(
    `SELECT in.entry_id AS entry_id, in.user_id AS user_id, "related_to" AS edge_type
     FROM related_to WHERE out IN $ids AND in.user_id = $user;`,
    { ids: recordIds, user: userId }
  ),
  db.query(
    `SELECT out.entry_id AS entry_id, out.user_id AS user_id, "derived_from" AS edge_type
     FROM derived_from WHERE in IN $ids AND out.user_id = $user;`,
    { ids: recordIds, user: userId }
  ),
  db.query(
    `SELECT in.entry_id AS entry_id, in.user_id AS user_id, "derived_from" AS edge_type
     FROM derived_from WHERE out IN $ids AND in.user_id = $user;`,
    { ids: recordIds, user: userId }
  ),
]);
```

**Why it was replaced:**
1. Built `memories:id` strings from entry IDs, which broke derived_from inbound (target is episode, not memory)
2. Querying edge tables directly is slower than native `->edge->target` traversal
3. More verbose, harder to extend with new edge types

## When to use which approach

| Case | Use |
|---|---|
| Single table, both sides same type, production | Native traversal: `SELECT VALUE ->edge->target` |
| Multi-hop / provenance traversal | Native traversal: nested `SELECT VALUE` subqueries |
| Edge degree counting | Native traversal: `count(->edge)` in SELECT |
| Legacy code, simple cases, edge table metadata needed | Fix A: single OR query |
| Fallback / backward compat | Fix B: separate queries + allSettled |

## Key differences from traditional graph DB patterns

- **No UNION in SurrealQL** — always use separate queries or native traversal.
- **No `memories:id` string format** — let SurrealDB resolve record pointers via `->edge->target`.
- **`Promise.allSettled` over `Promise.all`** — partial results are useful in graph traversal.

## Files affected in Coppermind

- `daemon/src/memory/activation-spread.ts` — `fetchNeighbors()` (native graph traversal, v2)
- `daemon/src/memory/surreal/search.ts` — `fetchGraphDegrees()` (degree centrality)
