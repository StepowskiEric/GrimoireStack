# SurrealDB Record Link Query Pitfalls

Session-discovered gotchas for querying tables with record-link fields (e.g., `memory_id` pointing to `memories:abc123`). Extracted from Coppermind triple-aware retrieval debugging, May 2026.

---

## 1. `(type)field` cast syntax is invalid

**Attempted:**
```surql
SELECT (string)memory_id AS memId, confidence AS conf FROM triples
WHERE memory_id.user_id = $user;
```

**Error:**
```
Parse error: Unexpected token `an identifier`, expected FROM
 --> [1:16]
  |
1 | SELECT (string)memory_id AS memId, confidence AS conf FROM triples
  |                ^^^^^^^^^
```

**Correct:** Use `meta::id()` to extract the string record ID:
```surql
SELECT meta::id(memory_id) AS memId, confidence AS conf FROM triples
WHERE memory_id.user_id = $user;
```

Or handle in application code after fetching the raw record ID.

---

## 2. `link.field` in WHERE clauses silently fails for record links

**Attempted:**
```surql
SELECT * FROM triples WHERE memory_id.entry_id IN $ids;
```

**Problem:** `memory_id` is a record link (`memories:abc123`). Without `FETCH memory_id`, `memory_id` resolves to a `RecordId` object, not an object with `.entry_id`. The query may parse but return empty results silently.

**Correct approaches:**

a) Use `meta::id()` to match the string record ID:
```surql
SELECT * FROM triples WHERE meta::id(memory_id) IN $ids;
```

b) Store the raw string `entry_id` redundantly on the referencing row:
```surql
DEFINE FIELD entry_id ON TABLE triples TYPE string;
DEFINE INDEX idx_triples_entry ON TABLE triples FIELDS entry_id;
-- Then query:
SELECT * FROM triples WHERE entry_id IN $ids;
```

---

## 3. Record link fields return RecordId objects, not dereferenced records

**Assumption (wrong):**
```typescript
const rows = await db.query("SELECT * FROM triples WHERE ...");
for (const r of rows) {
  const entryId = r.memory_id.entry_id;  // undefined — memory_id is a RecordId
}
```

**What you actually get:**
- Without `FETCH`: `r.memory_id` is a `RecordId` or string like `"memories:abc123"`
- With `FETCH memory_id`: `r.memory_id` becomes the full dereferenced record object

**Correct patterns:**

```typescript
// Pattern A: meta::id() in SQL, string comparison in code
const rows = unwrapQuery<{ memId: string; conf: number }>(
  await db.query(
    `SELECT meta::id(memory_id) AS memId, confidence AS conf FROM triples WHERE ...`,
    { user: userId }
  )
);
const key = String(r.memId ?? "");

// Pattern B: FETCH the linked record
const rows = unwrapQuery<{ memory_id: { entry_id: string } }>(
  await db.query(
    `SELECT * FROM triples FETCH memory_id WHERE ...`,
    { user: userId }
  )
);
const key = r.memory_id?.entry_id;
```

---

## 4. Silent failure via try/catch makes broken queries invisible

**Pattern in Coppermind search.ts:**
```typescript
try {
  const rows = unwrapQuery(...);
  // ... accumulate weights ...
} catch (err) {
  getGlobalLogger().debug(
    { domain: "search", action: "triple_match", error: String(err) },
    "Triple match query failed — gracefully ignored"
  );
}
```

**Problem:** The query is broken (parse error), but the catch swallows it at `debug` level. Unit tests with mocked `db.query` pass. Integration tests with real SurrealDB fail silently — the feature appears to work (returns results) but the triple signal is always zero.

**Fix:**
1. Fix the query syntax first.
2. Consider logging at `warn` level for unexpected query failures in retrieval paths, or assert non-empty results in integration tests.

---

## Summary: Record link query cheat sheet

| Goal | Wrong | Right |
|------|-------|-------|
| Extract string ID from link | `(string)memory_id` | `meta::id(memory_id)` |
| Filter by linked record's ID | `WHERE memory_id.entry_id IN $ids` | `WHERE meta::id(memory_id) IN $ids` |
| Access linked record fields | `r.memory_id.entry_id` (no FETCH) | `SELECT ... FETCH memory_id` then `r.memory_id.entry_id` |
| Fast bulk lookup by ID | `WHERE memory_id.entry_id IN $ids` | Redundant `entry_id` string field + index |
