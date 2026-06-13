# Native SurrealDB Graph Traversal

Replace JS-managed BFS with native `->edge->target` syntax for memory graph traversal.

## The Pattern

Instead of querying edge tables directly and stitching results in application code, use **native graph syntax** to let SurrealDB resolve paths via record pointers.

### Basic Bidirectional Traversal

```surql
-- Outbound: seed nodes are the 'in' side of edges
SELECT entry_id, user_id FROM memories
WHERE entry_id IN (
  SELECT VALUE ->related_to->memories.entry_id
  FROM memories WHERE entry_id IN $seedIds
);

-- Inbound: seed nodes are the 'out' side of edges  
SELECT entry_id, user_id FROM memories
WHERE entry_id IN (
  SELECT VALUE <-related_to<-memories.entry_id
  FROM memories WHERE entry_id IN $seedIds
);
```

### Why This Works

- `->related_to->memories` resolves through the `related_to` edge table using record pointers
- `SELECT VALUE ->...memories.entry_id` extracts just the target entry IDs
- The outer query filters on the resolved IDs with `user_id + status` guards
- SurrealDB optimises path resolution internally (index-friendly)

### Compared to Old Approach

**Old (JS-managed BFS):**
```typescript
// Query edge table directly, build record IDs, stitch in JS
const recordIds = seedIds.map(id => `memories:${id}`);
const result = await db.query(
  `SELECT out.entry_id AS entry_id FROM related_to WHERE in IN $ids`,
  { ids: recordIds }
);
// Then filter, deduplicate, and traverse in JS loop
```

Problems:
- Fragile `memories:id` string construction
- Per-hop queries don't leverage SurrealDB graph optimiser
- Derived_from bug: `memories:epX` strings never matched episode records

**New (Native traversal):**
```typescript
const result = await db.query(
  `SELECT entry_id FROM memories WHERE entry_id IN (
     SELECT VALUE ->related_to->memories.entry_id 
     FROM memories WHERE entry_id IN $entryIds
   ) AND ...`,
  { entryIds: seedEntryIds }
);
```

Benefits:
- Correct record pointer resolution across tables (memory vs episode)
- SurrealDB can optimise the entire path
- Eliminates fragile ID-string construction

### 2-Hop Sibling Walk (derived_from)

Finds sibling memories that share a provenance episode:

```surql
SELECT entry_id, user_id FROM memories
WHERE entry_id IN (
  SELECT VALUE <-derived_from<-episode.entry_id
  FROM (
    SELECT VALUE ->derived_from->episode.entry_id
    FROM memories WHERE entry_id IN $seedEntryIds
  ) AS episodes
);
```

Walk: `seed memory ->derived_from->episode<-derived_from<-sibling memory`

The inner subquery finds episodes our seeds were derived from. The outer subquery walks back to OTHER memories derived from those episodes.

### Degree Centrality (Connectedness Signal)

Single aggregate query counting all edges per node:

```surql
SELECT entry_id,
       (count(->related_to) + count(<-related_to)
        + count(->derived_from) + count(<-derived_from)
        + count(->relates) + count(<-relates)) AS degree
FROM memories
WHERE entry_id IN $ids
GROUP BY entry_id;
```

Used as a gentle RRF ranking signal (weight 0.3 vs triple-match at 1.5).

### Query Organization Pattern (TypeScript)

```typescript
// Run all directional queries in parallel
const [relatedOut, relatedIn, derivedIn, relatesOut, relatesIn] = 
  await Promise.allSettled([
    db.query(outboundQuery, params),
    db.query(inboundQuery, params),
    db.query(derivedSiblingQuery, params),
    db.query(relatesOutQuery, params),
    db.query(relatesInQuery, params),
  ])

// Deduplicate: same entry via same edge type = skip
// Different edge types to same entry = keep both
function addRows(result: PromiseSettledResult<unknown>, edgeType: string) {
  if (result.status !== 'fulfilled') return  // log and skip
  for (const r of unwrapQuery(result.value)) {
    const dedupKey = `${r.entry_id}::${edgeType}`
    if (seen.has(dedupKey)) continue
    seen.add(dedupKey)
    neighbors.push({ entry_id: r.entry_id, user_id: r.user_id, edge_type: edgeType })
  }
}
```

### Edge Weights in Activation Spread

| Edge | Weight | Direction | Purpose |
|------|--------|-----------|---------|
| canonical_key | 2.0 | implicit | Same logical fact, different versions |
| derived_from | 1.5 | inbound only | Sibling memories sharing provenance |
| related_to | 1.0 | bidirectional | Followup-worker detected similarity |
| relates | 0.9 | bidirectional | Typed semantic relations |
| triple_overlap | 0.8 | entity match | Shared subject/object across triples |

### When to Use Native Traversal vs JS BFS

**Native traversal wins when:**
- Graph has 2-4 hops needed
- Edge tables have record pointers (`in`/`out` fields)
- Query can terminate at the database (filter on `user_id`, `status`)
- You need correct cross-table resolution (memory ↔ episode)

**JS BFS still makes sense when:**
- Graph is deeply nested (5+ hops with dynamic stopping conditions)
- You need real-time control over exploration order or budgeting
- The traversal logic depends on application state at each node
- Edge tables don't use record pointers

### Performance Characteristics

- Native traversal replaces N queries per hop (one per edge table × direction) with a single query
- Latency: ~4-8x reduction for typical activation spread graphs (50-200 seed nodes, 2-3 hops)
- SurrealDB optimises path resolution internally; JS BFS cannot benefit from index-only graph walks
- Degree centrality adds a single aggregate query — negligible overhead

### Related

- `surrealdb-union-4-query-split.md` — the UNION workaround that preceded native traversal
- `surrealdb-activation-spread.md` — full activation spread algorithm that uses these patterns
