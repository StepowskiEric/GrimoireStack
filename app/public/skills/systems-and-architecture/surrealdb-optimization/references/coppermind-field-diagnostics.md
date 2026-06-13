# Coppermind Field Diagnostics

Knowledge gained from inspecting a live Coppermind daemon with 98+ memories.
Use when a user or agent sees "missing" fields in `coppermind inspect` output
and wants to know if data is correctly populated.

---

## Embedding Architecture (Two Layers)

Coppermind uses a single ONNX embedder (all-MiniLM-L6-v2, 384-dim) for two
separate embedding layers:

### 1. `memories.embedding` — Content Embedding (Hybrid Retrieval)

- Created on memory ingest for the content text
- Used in hybrid retrieval: BM25 + cosine similarity fusion
- Indexed via `HNSW DIMENSION 384 DIST COSINE`
- Background task in `schema-provision.ts:355` backfills any `embedding == NONE`
- Query: `SELECT * FROM memories WHERE embedding == NONE LIMIT 200`
- Stored as `option<array<float>>` on the `memories` table

### 2. `episode.summary_embedding` — Summary Embedding (Hierarchical Retrieval)

- Created from the compressed summary text during admission
- Stored on the `episode` table, NOT the `memories` table
- Created at `ingest-admission.ts:200-202`:
  ```typescript
  const summaryEmbedding = await embedder.embed(episodeSummary);
  db.query(`UPDATE episode SET summary = $summary, summary_embedding = $emb WHERE entry_id = $epEid;`, ...)
  ```
- Also created on naive ingest at `ingest-naive.ts:249-251`
- Used in hierarchical search at `search.ts:740-754` — ranks episodes by cosine
  similarity of `summary_embedding` to query embedding
- Indexed via `HNSW DIMENSION 384 DIST COSINE` on the `episode` table

---

## Why `inspect` Shows Missing Episode Fields

When you run `coppermind inspect`, it queries the **`memories` table** via
`queryFragmentsForUser` → `rowToFragment`. The memories table contains
admission-processed, promoted content. Episode-level fields live in the
**`episode` table** — a separate table with separate schema.

Fields that live ONLY in `episode` (NOT in `memories`):

| Field | Where Stored | Visible in `inspect`? |
|-------|------------|---------------------|
| `session_id` | episode | No |
| `turn_id` | episode | No |
| `event_type` | episode | No |
| `actor` | episode | No |
| `outcome` | episode | No |
| `tool_name` | episode | No |
| `tool_status` | episode | No |
| `retrieved_memory_ids` | episode | No |
| `used_memory_ids` | episode | No |
| `error_signature` | episode | No |
| `confidence` | episode | No |
| `salience` | episode | No |
| `summary_embedding` | episode | No |
| `triage_action` | episode | No |
| `promotion` | episode | No |

The memories `metadata` object in `rowToFragment` includes its own
`metadata` fields but does NOT include episode-level columns.

### How to access episode fields

Episode data is accessible via `episodeRowToFragment()` in row-mappers.ts.
Query the `episode` table directly:

```surql
SELECT * FROM episode WHERE user_id = $user ORDER BY created_at DESC;
```

Or use the backend's episode-specific query methods.

---

## Why `tool_calls` Shows 0 or Missing

The `tool_calls` value in fragment metadata comes from `item.metadata.tool_calls`
at ingest time. The admission pipeline at `admission.ts:428` explicitly defaults it to 0:

```typescript
typeof item.metadata?.tool_calls === 'number' ? Math.max(0, item.metadata.tool_calls) : 0
```

This means:
- Items ingested with `tool_calls: 3` in metadata → show `tool_calls: 3`
- Items ingested without `tool_calls` → show `tool_calls: 0`
- Some fragments may not have it at all (different code path)

If you see `tool_calls: 0`, it means the source (Hermes agent, Codex hook) 
didn't include tool_calls in the metadata when the memory was ingested.

---

## Why `tests` Shows Empty/Null

The `tests` field lives inside `metadata.codeSignals.tests`, populated by
`memory-admission/code-signals.ts:165`:

```typescript
const tests = readStringList(value.tests, 8)
```

Code signals are only extracted for code-related interactions (builds, test
runs, code edits). If the ingested content is conversation text without
code execution context:

- `metadata.codeSignals` → absent entirely
- `metadata.codeSignals.tests` → absent entirely  
- `metadata.tests` → absent entirely

The `tests: []` you see in formatted output is the terminal formatter
rendering an empty `codeSignals.tests` array. This is correct — the
interaction had no test results to capture.

---

## Diagnostic Quick-Check

To verify fields are populated correctly:

```bash
coppermind inspect --json --limit 3 > /tmp/inspect.json
python3 -c "
import json
with open('/tmp/inspect.json') as f:
    data = json.load(f)
for f in data['fragments']:
    meta = f['metadata']
    print(f'id={f[\"id\"][:12]}... tools={meta.get(\"tool_calls\", \"ABSENT\")} tests={meta.get(\"tests\", \"ABSENT\")} codeSignals={\"YES\" if meta.get(\"codeSignals\") else \"NO\"} embed={\"YES\" if meta.get(\"embedding\") else \"NO\"}')
"
```

Expected output for conversation-only memories:
- `tools=0` or `ABSENT` — correct
- `tests=ABSENT` — correct
- `codeSignals=NO` — correct
- `embed=YES` — correct (should always be populated due to backfill task)

For code-execution memories, expect populated codeSignals with tests array.
