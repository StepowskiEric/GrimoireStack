# Coppermind Memory Schema Field Lifecycle

How to trace a field from the architecture document through to the database,
and find gaps where fields are defined in the spec but never written to the DB.

## The pipeline stages

Every field on a `memories` table record flows through these stages:

```
Architecture doc (wiki/concepts/agentic-memory-architecture.md)
  ↓
Schema definition (daemon/src/memory/surreal/schema.ts → memoriesFields)
  ↓
Interface type (daemon/src/memory/surreal/row-mappers.ts → SurrealMemoryRecord)
  ↓
Write plan (daemon/src/memory/surreal/write-plans.ts → CanonicalWritePlan + WritePlanContext)
  ↓
Write plan construction (admission pipeline + decision helpers + codebase-indexer fast path)
  ↓
INSERT query (3 paths: enforce, naive, consolidation)
  ↓
Row mapper read-back (rowToFragment → metadata blob)
  ↓
API response (gateway → dashboard)
```

## Key insight: SCHEMALESS tables

The `memories` table is defined as `SCHEMALESS` in `schema-provision.ts:68`:

```typescript
'DEFINE TABLE IF NOT EXISTS memories SCHEMALESS;',
```

This means:
- `DEFINE FIELD IF NOT EXISTS` statements from `memoriesFields` are **type hints**, not constraints.
- SurrealDB accepts writes to **any field name** regardless of whether it's in `memoriesFields`.
- Adding a new column requires NO migration — just write it in the INSERT query and define the field.
- The `memoriesFields` array in `schema.ts` is the source of truth for which fields are *intended* to exist, but the code can write fields that aren't listed there.

## Where fields get lost

The most common failure pattern: a field is in one stage but not in the next, causing a silent drop.

### Stage gap: Write plan → INSERT query

The write plan (`CanonicalWritePlan`) may carry a field, but if the INSERT query in
`ingest-admission-enforce-helpers.ts` doesn't include it in the SurrealQL and bindings, the
field is silently dropped.

### Stage gap: Architecture doc → Schema definition

The architecture doc (`agentic-memory-architecture.md:173-188`) lists "Required Metadata"
that the code never implemented as columns. Examples:

| Required field (doc says) | Column in schema.ts? | Written anywhere? |
|---|---|---|
| `confidence` | No | Only in `metadata` blob |
| `salience` | No (episode yes) | Episode table only |
| `source_episode_ids` | No | `episode_id` (singular) instead |
| `last_verified_at` | No | No |
| `retrieval_default` | No | Read from `metadata.retrieval_default` |
| `privacy_class` | No | No |
| `review_trigger` | No | No |

### Stage gap: Admission pipeline (triage path) vs naive path

The admission pipeline (with LLM/ONNX triage) produces `triage.output.confidence` and
`triage.output.importance`. The naive path has no triage and uses hardcoded defaults.

When adding a field that depends on triage output, you must provide sensible defaults for
the naive path and the codebase-indexer fast path.

## The three INSERT paths

Every field that should persist must be added to ALL three paths:

| Path | File | Function | Triage available? |
|---|---|---|---|
| Enforce (admission) | `ingest-admission-enforce-helpers.ts` | Line 276-307 | Yes |
| Naive | `ingest-naive.ts` | Line 187 | No |
| Consolidation semantic | `consolidation-queries.ts` | `insertSemanticCandidate` | No (uses `input.confidence`) |
| Consolidation profile | `consolidation-queries.ts` | `insertProfileCandidate` | Same |
| Consolidation procedural | `consolidation-queries.ts` | `insertProceduralCandidate` | Same |

## How to audit a field

To verify a field flows end-to-end:

1. **Check the architecture doc** — does `agentic-memory-architecture.md` require it?
2. **Check `schema.ts`** — is it in `memoriesFields`?
3. **Check `row-mappers.ts`** — is it in `SurrealMemoryRecord` interface AND in the `metadata` spread of `rowToFragment`?
4. **Check `write-plans.ts`** — is it in `CanonicalWritePlan` and `WritePlanContext`? Is it passed through in `buildCanonicalWritePlan`?
5. **Check admission decision** — is it in the inline write plans in `admission-decision-helpers.ts`? Is it in the WritePlanContext in `admission.ts` (for codebase-indexer fast path)?
6. **Check ALL three INSERT paths** — is it in the SurrealQL AND the bindings?
7. **Check consolidation INSERTs** — all 3 functions in `consolidation-queries.ts`.
8. **Check read path** — does `rowToFragment` map it from the DB row into `metadata`?
9. **Check consumers** — does `buildLocalMemoryContextResponse` (in `local-memory.ts`) read it? Does the gateway's `toFragment` service?

## SurrealDB `option<T>` INSERT pattern

For any `option<T>` field that might receive JS `null`, use the `type::is_*` guard pattern
to convert JS null → SurrealDB `NONE`:

```surql
INSERT INTO memories {
  ...
  salience: IF type::is_number($sal) { $sal } ELSE { NONE },
  confidence: IF type::is_number($conf) { $conf } ELSE { NONE },
  source_episode_ids: IF type::is_array($seids) { $seids } ELSE { NONE },
  retrieval_default: IF type::is_bool($rd) { $rd } ELSE { NONE },
};
```

Literal values (`true`, `false`, `NONE`, `"active"`) can be used in the SurrealQL directly.
Binding variables (`$sal`) require the guard pattern because JS `null` maps to SQL `NULL`,
not SurrealDB `NONE`.

## Salience computation

Salience is computed at two points in the system:

1. **Episode capture** (`episode-capture.ts:68`): `computeEpisodeSalience()` uses 12 signals
   (corrections, errors, contradictions, conventions, preferences, memory usefulness).
   Written to `episode.salience` but **never carried over** to the promoted memory.

2. **Admission pipeline** (`admission-decision-helpers.ts:201`): For the admit path, salience
   is computed from available signals:
   ```
   salience = clamp(0.3 + triageConfidence * 0.25 + enrichedImportance * 0.3 + (hasCanonicalKey ? 0.15 : 0))
   ```

The episode salience and admission salience are **independent** — episode salience drives
consolidation decisions, admission salience scores the promoted memory.

## Reading back: metadata vs columns

The row mapper (`rowToFragment`) maps DB columns into the `metadata` JSON blob for
backward compatibility with consumers that read from `metadata.*`:

```typescript
metadata: {
  ...(row.metadata ?? {}),
  // Phase 6 fields mapped to metadata for consumer compatibility
  ...(row.salience != null ? { salience: row.salience } : {}),
  ...(row.confidence != null ? { confidence: row.confidence } : {}),
  ...(row.source_episode_ids != null ? { source_episode_ids: row.source_episode_ids } : {}),
  ...(row.retrieval_default != null ? { retrievalDefault: row.retrieval_default, retrieval_default: row.retrieval_default } : {}),
}
```

## Design principle: AI-facing vs human-facing

The daemon's data model is optimized for AI retrieval effectiveness, not dashboard display.

- `importance` (float 0-1) is the daemon's confidence/trust metric
- `strength` and `confidence` are dashboard-only concepts derived from `importance * 10` in the gateway fallback
- Lifecycle audit fields (`times_corrected`, `last_verified_at`) that a human auditor would want are intentionally absent — AI doesn't need them
- The schema grows based on what improves retrieval quality (q_value, codebase_*, triage_context), not what serves human inspection

When deciding whether to add a field, ask: "Does this help the AI retrieve better, rank better, or use this memory more safely?" If the answer is no (e.g., it only helps a human dashboard display), the field belongs in the gateway mapping, not in the daemon's schema.
