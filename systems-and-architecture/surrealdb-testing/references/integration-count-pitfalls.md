# Integration Test Count Pitfalls

## Pattern: SDK wrapper returns `inserted: 0` but DB row exists

When an application wraps SurrealDB writes with its own status- tracking (e.g. `episodeIds.push(id)` only on `"processed"` status), the SDK- level `inserted`/`deleted`/`updated` counts may return 0 even though the row was written.

### Symptom

```typescript
const result = await backend.ingest(item);
expect(result.inserted).toBe(1); // FAILS — got 0
```

But a follow-up `SELECT` shows the record exists.

### Root Cause

The wrapper tallied IDs into a result array using a status gate:

```typescript
if (status === 'processed') episodeIds.push(id);
```

When the admission pipeline returns `"store_episode_only"` or `"dropped"`, the episode row is written but not counted.

### Fix Options

1. **Count every written row regardless of downstream status** — if the DB transaction committed, increment the count.
2. **Assert on DB state, not wrapper counts** — query the table after the operation and assert the expected rows exist. This is more robust because it tests the persistence boundary directly.

### Example: assert on DB state

```typescript
const result = await backend.ingest(item);
// Don't assert result.inserted here
const [rows] = await db.query('SELECT * FROM memories WHERE user_id = $u', { u: 'test' });
expect(rows.length).toBe(1);
expect(rows[0].promotion).toBe('store_episode_only');
```

### When this matters

- Admission pipelines with multiple exit statuses (admit / episode_only / drop)
- Soft-delete wrappers that write a tombstone but report `deleted: 0`
- Batch ingests where partial success is a valid state

---

## Pattern: Wrapper reports `inserted: 1` but no new row was created (semantic duplicate)

The inverse of the above: the wrapper counts episodes processed, not new memories. On a semantic duplicate, the wrapper pushes the **existing** memory's ID into the result array. The DB has the same row count before and after, but `inserted` reports 1.

### Symptom

```typescript
const first = await backend.ingest(item1);
const second = await backend.ingest(item2); // near-identical to item1
expect(second.inserted).toBe(0); // FAILS — got 1
```

### Root Cause

The wrapper's duplicate path does:

```typescript
if (admissionResult.status === "duplicate") {
  episodeIds.push(admissionResult.memoryEntryId); // pushes existing ID
  continue;
}
return { inserted: episodeIds.length, episodeIds };
```

`episodeIds.length` is 1 because the existing memory ID was pushed, even though no new row was written.

### Fix

Assert on DB state, not on wrapper counts:

```typescript
const [rows] = await db.query('SELECT count() AS cnt FROM memories WHERE user_id = $u GROUP ALL', { u: 'test' });
expect(rows[0].cnt).toBe(1); // only one row despite two ingests
```

Or assert `second.episodeIds` matches `first.episodeIds` (both point to the same memory).

---

## Related

See `references/mock-backend-traps.md` for why mock backends hide parse errors and type mismatches that real `mem://` catches.
