# Real vs Mock Testing Pitfall — Session Reference

## Issue: UNION parse error in activation-spread.ts
**File:** `daemon/src/memory/activation-spread.ts` (lines 133-156)
**Problem:** Query uses `SELECT ... UNION SELECT ...` which SurrealDB v3 rejects with `Parse error: Unexpected token an identifier, expected Eof`.
**Trigger:** `surreal-memory-plane.test.ts` reports 81 passed but throws 5 unhandled rejections.
**Fix:** Replace UNION with a single query using OR conditions, or split into two queries and merge in TypeScript.

```typescript
// BEFORE (broken):
db.query(
  `SELECT out.entry_id ... FROM related_to WHERE in IN $ids AND out.user_id = $user
   UNION
   SELECT in.entry_id ... FROM related_to WHERE out IN $ids AND in.user_id = $user;`
)

// AFTER (fixed):
db.query(
  `SELECT out.entry_id AS entry_id, out.user_id AS user_id, "related_to" AS edge_type
   FROM related_to
   WHERE (in IN $ids AND out.user_id = $user)
      OR (out IN $ids AND in.user_id = $user);`,
  { ids: recordIds, user: userId }
)
```

## Issue: Missing ONNX external weight file (.onnx.data)
**File:** `daemon/assets/local-ai/onnx-triage/coppermind_triage_v25.onnx`
**Problem:** `.onnx` file exists but `.onnx.data` (external weights produced by ONNX export with external_data_format) is missing.
**Symptom:** `onnx-triage-label-mapping.test.ts` fails with `filesystem error: in file_size: No such file or directory` for the `.data` file.
**Fix options:**
1. Include `.onnx.data` in repo with Git LFS
2. Re-export model with inline weights (no external data)
3. Add test skip-guard when file is absent (prevents CI crash)

## Issue: Admission pipeline tests use mock backend only
**File:** Various admission gate tests
**Problem:** Tests call `createMemoryBackendFixture()` (in-memory array) which mimics `LocalMemoryBackend`. The real `resolveAdmissionDecision → resolveSemanticDecision → Surreal INSERT` path is never hit.
**Gap:** HTTP handler → mock is tested, but HTTP handler → real DB is not.
**Fix:** Add a "real pipeline" integration test that:
1. Spins up SurrealDB `mem://`
2. Provisions the full schema
3. Calls `resolveAdmissionDecision` with real task runners (or mocks for ONNX)
4. Asserts episode + memory records exist in SurrealDB after the call

## Issue: v3 `option<T>` coercion silently rejects JS `null` bindings
**File:** `daemon/src/memory/surreal/ingest-admission-enforce-helpers.ts`
**Problem:** An `option<array>` field (e.g., `embedding`) receives a JavaScript `null` bound parameter. SurrealDB v3 coerces this to SQL `NULL`, which is NOT accepted for `option<T>` — the field expects `NONE` instead. The entire INSERT silently fails (returns success but inserts 0 rows).
**Trigger:** Integration test `promote_to_memory` passes all mock gates, reaches the memories INSERT block, but `SELECT COUNT(*)` afterwards shows 0 rows.
**Fix:** Replace direct parameter binding with guarded SurrealQL:
```typescript
// WRONG:
embedding: $emb  // JS null → SQL NULL → rejected for option<array>

// RIGHT:
embedding: IF type::is_array($emb) { $emb } ELSE { NONE }
```
**Pattern:** Audit every INSERT/UPDATE that binds parameters for `option<T>` fields. Use `IF type::is_X($param) { $param } ELSE { NONE }` instead of raw `$param`.
**Detection:** Add a temporary `SELECT COUNT(*)` assertion immediately after every INSERT in integration tests. If the count is 0 but the query didn't throw, suspect a NULL coercion issue.
- Parse errors can leak as unhandled rejections (tests "pass" but stderr shows errors)
- Missing asset files crash tests but the test runner reports failures, not the root cause
- Mock backends hide query syntax and schema compatibility issues
- Always verify the query actually executes against real SurrealDB when the feature touches persistence
