# Hybrid Mock-Real Pipeline Integration Pitfalls

Real DB + mocked business logic is a common hybrid integration test pattern, but it introduces failure modes that pure real-DB or pure-mock tests do not surface.

## 1. Pre-filter gates silently drop test data

When business logic is mocked but **pre-filter gates** (deterministic extraction, question detection, keyword-based drops) run on real code, the test input may be dropped before the mock ever executes.

**Example:**
- Mock returns `action: "store_episode_only"`.
- Deterministic active extraction sees a question prefix (`How can I...`) and returns `action: "ignore"`.
- The item is deleted/dropped in Phase 0; the test assertion expecting `inserted: 1` fails.
- The DB state is correct (0 rows), but the test expected the mocked path.

**Fix:** Make test inputs bypass real pre-filter gates, or add the pre-filter gate to the mock layer so the test controls it explicitly.

## 2. Application inserted-count tracking diverges from DB state

In multi-phase pipelines, `result.inserted` is often computed from an in-memory array (e.g., `episodeIds.length`) rather than a `SELECT COUNT(*)`.

**The `inserted` count represents "promoted to memory", NOT "episodes written".**

The contract (Coppermind crud.ts):
- `status: "processed"` → push to episodeIds (new memory was created) → `inserted += 1`
- `status: "duplicate"` → push existing memory ID to episodeIds (caller gets a reference to the existing memory) → `inserted += 1`
- `status: "episode_only"` → do NOT push (triage said not worth promoting) → `inserted: 0`
- `status: "dropped"` → do NOT push (content was noise) → `inserted: 0`

Phase 1 always writes an `episode` record regardless. But the episode's existence doesn't mean it was "inserted" from the caller's perspective. An episode row with `promotion: "episode_only"` is stored but not counted.

**Common mistake:** When adding explicit branches for `episode_only`/`dropped` in the ingest loop, accidentally pushing to episodeIds changes the `inserted` count and breaks existing tests that expect `inserted: 0`.

**Fix:** When modifying the ingest loop's status branching, always check: does this status represent a new memory promotion? If not, don't push. And assert on DB state (follow-up SELECT) in integration tests — never trust `result.inserted` alone.

## 3. v3 option<T> coercion and bound nulls

SurrealDB v3 enforces `option<T>` coercion strictly. Passing a JavaScript `null` as a bound parameter for an `option<array>` field can silently fail or cause the entire INSERT to behave unexpectedly (e.g. type rejection without a clear error).

**Fix:** Use guarded SurrealQL expressions: `IF type::is_array($emb) { $emb } ELSE { NONE }` instead of binding raw `null`.

## 4. Schema-provision red herrings

`REMOVE INDEX ...` cleanup statements in idempotent schema provisioning log "best-effort operation failed" when the index does not exist yet. These are benign. Do not treat them as the root cause of integration test failures unless subsequent `DEFINE` statements also fail.

## 5. Cascading deduplication failures

If a first ingest fails to persist for any reason (e.g. the INSERT in Phase 2 fails silently), a second near-identical ingest will not find any existing record to deduplicate against, so it will be inserted as new and return `inserted: 1`. The dedup test fails as a consequence of the first-persist failure, not because dedup logic is wrong.

**Fix:** Always verify that the first ingest actually wrote to the DB before diagnosing dedup behavior.

## 6. New admission gates break existing test assertions

When a new admission gate (e.g., prediction-error gate) is added to the pipeline and enabled by default, existing tests that relied on the old behavior will fail with misleading assertions.

**Example:** A test written before the PE gate expected `inserted: 1` for near-duplicate content. With the PE gate active, near-duplicates get demoted to `episode_only` (not counted as inserted), so the assertion fails with `expected 0 to be 1`.

**The test was "correct" before the gate existed — the gate changed the system's behavior, not the test.**

**Fix:** When adding a new gate, search existing integration tests for assertions on `inserted` count that might be affected. Two options:
1. Update the assertion to match new behavior (if the gate's effect is correct)
2. Disable the new gate in that specific test's config to preserve the original test intent

**Diagnostic pattern:** If a test fails with `inserted: X` vs `inserted: Y`, check whether a recently-added gate changed the pipeline. Stash your changes and run the test on the previous commit — if it also fails, the failure is pre-existing and unrelated to your changes.

## Test-design recommendation

For hybrid pipelines, structure integration tests in two tiers:

1. **Phase-isolation tests** — mock the pre-filter gate and test only the DB write path.
2. **End-to-end tests** — use test data known to pass every real gate, or make all gates mockable.
