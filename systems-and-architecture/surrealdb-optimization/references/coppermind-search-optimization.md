# Coppermind Search Optimization Patterns

Concrete search pipeline optimizations applied to Coppermind's hybrid retrieval (BM25 + cosine + triples RRF fusion).

## Architecture

```
Query → preprocessSearchQuery (stemming, abbreviations) 
      → FTS BM25 (search_text @@ query) 
      → embed query (ONNX all-MiniLM-L6-v2, 384-dim)
      → buildTripleMatchMap (CONTAINSANY on S/P/O)
      → RRF(BM25, cosine, triples) + temporal boost
      → batch-fetch triples for top fragments
      → spreading activation (SYNAPSE, max 3 injects)
```

Two code paths in `daemon/src/memory/surreal/search.ts`:
- `searchFragmentsForUser` — flat search (primary path)
- `searchFragmentsHierarchical` — episode-anchored (semantic episode → scoped memories)

## Optimization 1: CONTAINSANY for triple matching

**Problem:** `buildTripleMatchMap` did a full table scan of triples (`SELECT ... FROM triples WHERE memory_id.user_id = $user LIMIT N`), then substring-matched tokens in JS via `haystack.includes(token)`.

**Fix:** Push token matching into SurrealDB:
```surql
SELECT memory_id.entry_id AS memId, confidence AS conf FROM triples
WHERE memory_id.user_id = $user
  AND (subject CONTAINSANY $tokens OR predicate CONTAINSANY $tokens OR object CONTAINSANY $tokens)
LIMIT $limit;
```

**Why:** `CONTAINSANY` is index-friendly (v2.4.0+). Uses existing indexes on `subject`, `predicate`, `object`. Falls back to legacy JS path if SurrealDB doesn't support it.

**Risk:** Very low. Fallback retained for pre-2.4.0 SurrealDB. Token set is bounded by query length.

## Optimization 2: HNSW for hierarchical episode search

**Problem:** `searchFragmentsHierarchical` fetched ALL episodes for the user and computed cosine similarity in JS for ranking. No index used despite HNSW index existing on `episode.summary_embedding`.

**Fix:** Use `vector::similarity::cosine()`:
```surql
SELECT entry_id, summary_embedding FROM episode
WHERE user_id = $user
  AND summary_embedding IS NOT NONE
  AND vector::similarity::cosine(summary_embedding, $qemb) > 0.3
ORDER BY vector::similarity::cosine(summary_embedding, $qemb) DESC
LIMIT 10;
```

**Why:** Leverages `idx_episode_summary_embedding` (HNSW DIMENSION 384 DIST COSINE). Falls back to JS path if vector::similarity unavailable.

**Risk:** Low. Falls back to full scan if SurrealDB version doesn't support vector operators.

## Optimization 3: Shared RRF fusion function

**Problem:** Flat and hierarchical search paths had ~400 lines of near-identical RRF fusion + triple enrichment + spreading activation. A bug fixed in one path wouldn't propagate.

**Fix:** Extracted `applyRrfFusion()` — single function serving both paths:
```typescript
async function applyRrfFusion(
  db, userId, query, queryEmbedding, rows, limit, tripleMatchMap, neuroGating
): Promise<LocalMemoryFragment[]>
```

**Why:** One bug fix applies everywhere. Hierarchical path passes `null` for `tripleMatchMap` (episode scoping is the structural filter there).

**Risk:** Very low. Pure refactor — behavior preserved exactly.

## Optimization 4: LRU embedding cache

**Problem:** Every search re-embeds the query. Repeated identical queries (e.g., retry loops, multi-agent contexts) recompute the 384-dim vector.

**Fix:** LRU cache (size=100) in `OnnxEmbedder.embed()`:
```typescript
private cache = new Map<string, number[]>()
private cacheOrder: string[] = []
private cacheMaxSize = 100
```

Cache key is the raw text string. LRU eviction when size exceeds 100.

**Cost:** ~40KB memory (100 × 384 floats). **Benefit:** ~50ms saved per cache hit.

**Risk:** Very low. Deterministic — same input always produces same output.

## Not Implemented (deferred)

### Push cosine into SurrealDB for flat path
Reason: Requires `vector::similarity` in same query as BM25 `search::score`. SurrealDB may not support merged expression. Defer until tested against specific version.

### Batch spreading activation edges into UNION
Reason: 50-node budget + 2-hop depth already bounds worst case to ~8 queries. Not worth refactoring without profiling data.
