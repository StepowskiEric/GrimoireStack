---
name: surrealdb-testing
description: Testing strategies for SurrealDB — SDK integration tests, direct SurrealQL testing via HTTP, CLI validation, transaction-based assertions, and the internal language test suite.
version: 1.0.0
author: Hermes Agent
metadata:
  hermes:
    tags: [surrealdb, testing, quality, surrealql]
---

# SurrealDB Testing Skill

Use this skill when writing tests, validating `.surql` migration files, or setting up CI for any SurrealDB-backed application.

---

## SDK Integration Tests

The most common approach for application-level testing. The SDK lets you spin up a local or embedded instance in a few lines.

### Embedded (in-process) — fastest for unit tests

```javascript
import { Surreal } from 'surrealdb';

const db = new Surreal();
await db.connect('mem://'); // in-memory, no server needed
await db.use({ namespace: 'test', database: 'test' });

// run your tests
const result = await db.select('person');
await db.close();
```

### HTTP — testing against a real server

```javascript
const db = new Surreal();
await db.connect('http://127.0.0.1:8137', {
  namespace: 'test',
  database: 'test',
});
// requires a running surreal instance
```

### Python SDK (embedded)

```python
from surrealdb import Surreal

async def test_basic():
    db = Surreal()
    await db.connect("mem://")
    await db.use({"namespace": "test", "database": "test"})
    await db.query("CREATE person SET name = 'tobie'")
    result = await db.query("SELECT * FROM person")
    assert len(result) == 1
```

For a larger real-world test suite with hundreds of assertions, see [this repo](https://github.com/kotolex/surrealist/tree/644a97f5d899f3ad7e011cb82d11ce7d1d482ebc/tests/unit_tests).

---

## Testing via Direct SurrealQL (HTTP)

For environment-specific testing (record user vs. system user vs. root), send queries via the HTTP REST API. This is also the right path for CI scripts that need to hit a running container.

### Auth and query

```bash
# Sign in → get JWT
TOKEN=$(curl -s -X POST http://localhost:8137/signin \
  -H "Content-Type: application/json" \
  -d '{"user": "root", "pass": "yourpassword"}' | jq -r '.token')

# Run a query (USE must be in the query body, NS/DB headers are silently ignored)
curl -s -X POST http://localhost:8137/sql \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer $TOKEN" \
  -d "USE NS test DB test; SELECT * FROM person;"
```

### Important HTTP gotchas

- **NS/DB headers are silently ignored** — always include `USE NS x DB y;` as the first statement.
- `/signin` returns a JWT, not a session cookie. Use it as `Authorization: Bearer $TOKEN`.
- `/health` returns **empty body** on 200 in 3.x — check `response.status` only, not `response.json()`.
- `POST /sql` with `Content-Type: text/plain` — not `application/json`.

---

## Transaction-Based Assertions

Failed transactions automatically roll back. A `THROW` at the end confirms no errors occurred inside the block — this is a testing pattern for verifying a group of statements succeeds together.

```surql
BEGIN TRANSACTION;

-- Test: unique index prevents duplicates
DEFINE INDEX test_email ON TABLE user FIELDS email UNIQUE;
INSERT INTO user { email: 'test@test.com' };
INSERT INTO user { email: 'test@test.com' }; -- throws and cancels transaction

COMMIT TRANSACTION;
-- If we reach here, the THROW was never reached (index worked as expected)
THROW "Reached the end";
```

Expected output when the index is properly enforced: the second insert throws, `THROW` is never reached.

If the index is redefined as non-strict (or omitted), both inserts succeed and `THROW` fires — confirming no errors occurred.

This pattern verifies:
- Unique constraints fire correctly
- Data logic behaves as expected
- Transaction rollback works

---

## Validating `.surql` Migration Files

Use the CLI to validate migration or schema files before applying them:

```bash
surreal validate --pass yourpassword --db yourdb --ns yourns --path ./migrations/001_initial.surql
```

This catches syntax errors and type errors without modifying any data. Do this in CI before applying migrations.

> **Note on schema provisioning noise:** Schema files often contain `REMOVE INDEX idx_name ON TABLE x;` cleanup statements that fail when the index doesn't exist yet. These are benign idempotent cleanup steps — the overall provisioning still succeeds. Do not treat individual `best-effort operation failed` messages as provisioning failures unless subsequent `DEFINE` statements also fail.

---

## Internal Language Test Suite

Each SurrealDB PR runs a language test suite — thousands of assertions across `.surql` files. This suite is **for SurrealDB developers only** and is not a community tool.

That said, it is open source and some users run it to test queries against multiple `.surql` files without recompiling. If you do this:

- These are unit tests — output may differ slightly from a running instance
- Tests assume a clean instance state
- Do not treat this as a replacement for your application test suite

---

## Mock Backend Traps and Real Integration Testing

Using an in-memory mock backend instead of real SurrealDB in tests hides a class of errors that only surface with real query execution:

| What a mock hides | Why it matters |
|---|---|
| `UNION` parse errors | Mock accepts any string; real SurrealDB throws |
| `WHERE` clause syntax differences | Mock may accept v2 syntax after v3 migration |
| `option<T>` → `NULL` coercion | Mock doesn't enforce SurrealDB type system |
| String literal quoting (`'semantic'` vs `"semantic"`) | Mock may not distinguish identifiers vs literals |
| Index effectiveness | Mock returns instantly; real queries may table-scan |
| Transaction isolation | Mock arrays don't model concurrent access |

### When to use mocks vs real database

**Use mocks** for:
- Unit testing pure application logic (ranking, scoring, gating rules)
- Fast feedback during development
- Testing error paths when real DB is unavailable

**Use real `mem://` SurrealDB** for:
- Query syntax validation (the only way to catch parse errors)
- Schema evolution tests after migration
- Performance-sensitive path verification
- Any code path that crosses the persistence boundary

### Integration test: provision → execute → assert on DB state

For features that write to SurrealDB (e.g., admission pipelines, memory ingestion), test the full path:

```typescript
import { Surreal } from 'surrealdb';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

describe('admission pipeline — real SurrealDB', () => {
  let db: Surreal;

  beforeEach(async () => {
    db = new Surreal();
    await db.connect('mem://');
    await db.use({ namespace: 'admission_test', database: 'test' });
    // Provision the same schema your production code uses
    await db.query(`
      DEFINE TABLE memories SCHEMAFULL;
      DEFINE FIELD entry_id ON memories TYPE string ASSERT NOT NONE;
      DEFINE FIELD user_id ON memories TYPE string ASSERT NOT NONE;
      DEFINE FIELD content ON memories TYPE string;
      DEFINE FIELD status ON memories TYPE string DEFAULT 'active';
      DEFINE FIELD created_at ON memories TYPE datetime DEFAULT time::now();
      // ... add all fields the pipeline touches
    `);
  });

  afterEach(async () => {
    await db.close();
  });

  test('ingest creates records in memories table', async () => {
    // Call the real pipeline function with the real db connection
    const result = await resolveAdmissionDecision({
      content: 'test memory',
      user_id: 'user_1',
      // ... other fields
    }, db);

    expect(result.action).toBe('admit');

    // Verify persistence — the real value of integration testing
    const [rows] = await db.query(
      'SELECT * FROM memories WHERE user_id = $user',
      { user: 'user_1' }
    );
    expect(rows.length).toBe(1);
    expect(rows[0].content).toBe('test memory');
  });
});
```

### Warning signs that your tests have mock gaps

- **Parse errors in test output** — tests "pass" but stderr shows unhandled rejections
- **No `.catch()` on `db.query()` calls** — real errors are swallowed, not asserted
- **Tests exercise HTTP handler → mock, never handler → real DB** — the integration layer is unverified
- **External weight files (.onnx.data) referenced but not present** — model loading paths are untested
- **Coverage is high but bugs still reach production** — coverage measures lines hit, not correctness
- **SDK-level `inserted`/`deleted` counts return 0** — the SDK or wrapper may swallow the true result (for example, only counting rows as "inserted" when a specific status flag is returned, while the DB write succeeded under a different status). Always assert on actual DB state with a follow-up query in integration tests. Details: `references/integration-count-pitfalls.md` and `references/hybrid-pipeline-integration-pitfalls.md`.

### Bridging mock and real testing: tiered test strategy

Structure your test suite in tiers:

1. **Unit tests** — pure functions, mock backends (fast, focused)
2. **Query syntax tests** — run every raw SurrealQL string against `mem://` (catches parse errors)
3. **Integration tests** — real `mem://` DB, real schema, assert on DB state after operation
4. **End-to-end tests** — containerized SurrealDB + application running together

For Coppermind specifically, the gap between tiers 2 and 3 is where risk lives — queries that parse but return wrong results, or parse errors that leak as unhandled rejections.

---

## Jest / Vitest Setup Pattern (condensed)

For the full patterns including transaction tests, graph relation tests, auth tests, and CI configuration, see `references/jest-vitest-patterns.md`.

```javascript
import { Surreal } from 'surrealdb';

let db;

beforeEach(async () => {
  db = new Surreal();
  await db.connect('mem://');
  await db.use({ namespace: 'test', database: Math.random().toString(36) });
  // provision schema per test for isolation
  await db.query(`
    DEFINE TABLE person SCHEMAFULL;
    DEFINE FIELD name ON person TYPE string;
    DEFINE FIELD email ON person TYPE string;
    DEFINE INDEX email_idx ON TABLE person FIELDS email UNIQUE;
  `);
});

afterEach(async () => {
  await db.close();
});

test('insert and retrieve', async () => {
  const created = await db.create('person', { name: 'tobie', email: 'tobie@surrealdb.com' });
  const [id] = created;
  const person = await db.select(id);
  expect(person.name).toBe('tobie');
});

test('unique index prevents duplicates', async () => {
  await db.create('person', { name: 'a', email: 'dup@test.com' });
  await expect(
    db.create('person', { name: 'b', email: 'dup@test.com' })
  ).rejects.toThrow();
});
```

Key points:
- Use `mem://` for speed — no disk I/O
- Randomize the database name per test run to avoid state pollution
- Provision schema explicitly (not all schemas auto-create on connect)
- Use `rejects.toThrow()` for negative assertions

---

## Live Query Testing

Live queries require a **WebSocket connection** — they do not work over HTTP. Feature-gate your tests:

```javascript
const db = new Surreal();
await db.connect('ws://127.0.0.1:8137/rpc', {
  namespace: 'test',
  database: 'test',
});

// Check live query support
const supported = await db.feature('live_queries');
if (!supported) {
  // skip live query tests in environments without WS support
  return;
}

// Create a managed live query
const live = await db.live('person');
live.subscribe((action, record) => {
  console.log(action, record); // 'CREATE' | 'UPDATE' | 'DELETE'
});

// Create a record and observe the notification
await db.create('person', { name: 'test' });

await live.kill();
await db.close();
```

---

## v3 option<T> NULL coercion — silent INSERT failures

SurrealDB v3 enforces `option<T>` coercion strictly at the SQL layer. When a JavaScript `null` is bound as a query parameter, SurrealDB receives SQL `NULL`, which is **not** accepted for `option<array>` or `option<record>` fields. The entire INSERT may silently fail (return success but insert 0 rows) or throw a cryptic type error.

**Symptom:** Test reports `inserted: 0` despite the query appearing to execute. A follow-up `SELECT COUNT(*)` confirms no rows were written. No error is thrown by the SDK.

**Root cause:** Code binds `embedding: null` for an `option<array>` field:

```typescript
// WRONG — JS null becomes SQL NULL, rejected by option<array>
await db.query(
  `INSERT INTO memories SET embedding = $emb, ...`,
  { emb: null }
);
```

**Fix:** Use a guarded SurrealQL expression so `NONE` (the valid SurrealDB null) is passed instead:

```typescript
// RIGHT — NONE is accepted for option<array>
await db.query(
  `INSERT INTO memories SET
     embedding = IF type::is_array($emb) { $emb } ELSE { NONE },
     triage_context = IF type::is_string($ctx) { $ctx } ELSE { NONE },
     ...`,
  { emb: null, ctx: null }
);
```

**Pattern:** For every `option<T>` field in a schema, audit all INSERT/UPDATE queries that bind parameters for that field. Replace direct parameter binding with `IF type::is_X($param) { $param } ELSE { NONE }`.

**Detection:** Add a temporary assertion after every INSERT in integration tests:

```typescript
const [rows] = await db.query('SELECT count() AS cnt FROM memories GROUP ALL');
expect(rows[0].cnt).toBeGreaterThan(0);
```

If this fails while the query itself didn't throw, suspect a NULL coercion issue.

---

## ORDER BY Requires Column in SELECT

SurrealDB's query parser requires any column referenced in `ORDER BY` to also appear in the `SELECT` clause. This differs from PostgreSQL/MySQL which allow ORDER BY on non-selected columns.

```surql
-- WRONG: ValidationError — Missing order idiom `created_at`
SELECT promotion, triage_action FROM episode
WHERE user_id = $uid ORDER BY created_at DESC;

-- CORRECT: include the order column in SELECT
SELECT promotion, triage_action, created_at FROM episode
WHERE user_id = $uid ORDER BY created_at DESC;
```

**Error message:** `ValidationError: Parse error: Missing order idiom 'column_name' in statement selection`

**Workaround:** If you don't actually need ordering, drop the `ORDER BY` and sort client-side with `.sort()`. For integration tests that just need count + field match, this is simpler than modifying the SELECT.

---

## v3.x Behavior Changes Affecting Tests

| Scenario | `STRICT` Mode | Default (Non-Strict) |
|---|---|---|
| `SELECT` on non-existent table | throws error | throws error |
| `DELETE` on non-existent table | throws error | throws error |
| `CREATE` on non-existent table | auto-creates table | auto-creates table |

Set `STRICT` in tests to catch schema drift early:

```surql
-- At the top of your schema .surql file
STRICT;
```

---

## What to Test Per Feature

At minimum, test these per table:

1. **Insert success** — all required fields, correct types
2. **Insert failure** — type violations, missing required fields, unique constraint violations
3. **Point lookup** — `SELECT * FROM ONLY table:id`
4. **Scoped read** — filtering by indexed fields with `WHERE`
5. **Update** — partial update (`.merge()`), full replace (`.replace()`)
6. **Delete** — exists and does not exist
7. **Transaction rollback** — throw inside `BEGIN...COMMIT`
8. **Graph relation creation** — `RELATE` or `.relate()` with edge metadata
9. **Permissions** — record user can/cannot access what they should/shouldn't

---

## CI Pattern for SurrealDB Services

```yaml
# Start a container
- name: Start SurrealDB
  run: |
    docker run -d --name surreal -p 8137:8000 surrealdb/surrealdb:latest start

- name: Wait for health
  run: |
    until curl -s http://localhost:8137/status | grep -q .; do sleep 1; done

- name: Run migrations
  run: |
    surreal validate --user root --pass root --path ./migrations/
    # then apply via SQL endpoint

- name: Run tests
  run: npm test
```

---

## What the agent should do before writing tests

1. Provision the schema explicitly in `beforeEach` — do not assume it exists
2. Use `mem://` for speed; spin up a container only for integration tests
3. Verify `STRICT` mode behavior matches production expectations
4. Test both success paths and the specific error thrown on failure paths
5. Use transactions with `THROW` to verify groups of statements succeed atomically
6. Validate `.surql` files in CI before applying them to any environment
