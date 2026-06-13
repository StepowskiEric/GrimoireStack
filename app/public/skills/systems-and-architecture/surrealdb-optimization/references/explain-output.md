# SurrealDB EXPLAIN Output Reference

Quick reference for interpreting `EXPLAIN` and `EXPLAIN ANALYZE` output from SurrealDB queries.

---

## Generic Response Shape

```json
[
  {
    "detail": {
      "reason": "Iterate table",
      "value": "*"
    },
    "operation": "Iterate Table",
    "cost": 12.345
  },
  {
    "detail": {
      "index": "user_email_unique",
      "operator": "=",
      "value": "test@surrealdb.com"
    },
    "operation": "Iterate Index",
    "cost": 0.001
  }
]
```

Each object in the array represents a step in the query plan.

---

## Common `operation` Values

| Operation | Meaning | Good/Bad |
|---|---|---|
| `Iterate Table` | Full table scan — checks every record | Bad for large tables |
| `Iterate Index` | Index-based lookup | Good |
| `Union` | Combines multiple index scans (e.g., `OR` conditions) | Depends |
| `Order` | Sorting — external sort if no index | May indicate missing index |
| `Fetch` | Record link dereferencing | Normal with `FETCH` |
| `Project` | Field selection / projection | Expected |
| `Group` | Aggregation grouping | Expected for `GROUP BY` |

---

## `EXPLAIN` vs `EXPLAIN ANALYZE`

- `EXPLAIN` — shows the plan only (no execution)
- `EXPLAIN ANALYZE` — shows plan + actual execution time and row counts

```surql
-- Plan only
SELECT * FROM user WHERE email = $email EXPLAIN FULL;

-- Plan with timing
SELECT * FROM user WHERE email = $email EXPLAIN ANALYZE FULL;
```

`EXPLAIN ANALYZE` output adds `duration` and `count` fields to each step.

---

## Reading a Good Plan (Index Hit)

```surql
SELECT * FROM user WHERE email = 'test@surrealdb.com' EXPLAIN FULL;
```

Good output:
```json
[{
  "detail": { "index": "user_email_unique", "operator": "=", "value": "test@surrealdb.com" },
  "operation": "Iterate Index",
  "cost": 0.001
}]
```

One step, `Iterate Index`, low cost.

---

## Reading a Bad Plan (Table Scan)

```surql
SELECT * FROM user WHERE email = 'test@surrealdb.com' EXPLAIN FULL;
```

Bad output:
```json
[
  {
    "detail": { "reason": "Iterate table", "value": "*" },
    "operation": "Iterate Table",
    "cost": 4500.0
  },
  {
    "detail": { "operator": "=", "value": "test@surrealdb.com" },
    "operation": "Filter",
    "cost": 0.1
  }
]
```

Two steps — full table iteration, then filter. High cost. Fix: add an index on `email`.

---

## `OR` Queries and the Union Operation

```surql
SELECT * FROM user WHERE status = 'active' OR status = 'pending' EXPLAIN FULL;
```

Output:
```json
[
  {
    "detail": { "index": "user_status_idx", "operator": "=", "value": "active" },
    "operation": "Iterate Index",
    "cost": 0.01
  },
  {
    "detail": { "index": "user_status_idx", "operator": "=", "value": "pending" },
    "operation": "Iterate Index",
    "cost": 0.01
  },
  {
    "operation": "Union",
    "cost": 0.0
  }
]
```

Two separate index lookups merged via Union. SurrealDB combines multiple indexes for `OR` automatically.

---

## `WITH INDEX` — Forcing a Specific Index

Use the `WITH` clause to restrict the planner to a specific index:

```surql
SELECT * FROM user WHERE email = $email AND status = 'active'
WITH INDEX user_email_unique
EXPLAIN FULL;
```

Mainly useful for comparing plans during tuning.

---

## `WITH NOINDEX` — Forcing Table Scan

```surql
SELECT * FROM user WHERE status = 'active' AND some_function(field) > 0
WITH NOINDEX
EXPLAIN FULL;
```

Use when an index would be slower (e.g., the filter function can't use an index and cardinality is very high).

---

## Order By Without an Index

```surql
SELECT * FROM post WHERE status = 'published' ORDER BY title ASC EXPLAIN FULL;
```

Bad output (no index on `title`):
```json
[
  {
    "detail": { "index": "post_status_idx", "operator": "=", "value": "published" },
    "operation": "Iterate Index",
    "cost": 0.1
  },
  {
    "detail": { "order": "ASC", "value": "title" },
    "operation": "Order",
    "cost": 50.0
  }
]
```

The `Order` step with high cost means external sorting. Fix: add a composite index `(status, title)`.

---

## Pre-2.3.0 UPDATE/DELETE — EXPLAIN Can Lie

In versions before 2.3.0, `UPDATE` and `DELETE` do not use indexes even when `EXPLAIN` shows `Iterate Index`. Always use the subquery workaround:

```surql
-- EXPLAIN says Iterate Index, but actual execution does not (pre-2.3.0)
UPDATE user WHERE admin = true SET active = false EXPLAIN FULL;

-- Guaranteed to use index
UPDATE (SELECT id FROM user WHERE admin = true) SET active = false;
```

---

## Verify Index Usage in Tests

```typescript
async function verifyIndexUsed(
  db: Surreal,
  query: string,
  vars?: Record<string, unknown>
): Promise<{ usesIndex: boolean; usesTableScan: boolean; steps: any[] }> {
  const [result] = await db.query(`${query} EXPLAIN FULL`, vars);
  const steps = result as any[];
  const usesIndex = steps.some(
    (s: any) => s.operation === 'Iterate Index' && s.detail?.index
  );
  const usesTableScan = steps.some((s: any) => s.operation === 'Iterate Table');
  return { usesIndex, usesTableScan, steps };
}

// In a test:
test('email filter uses index', async () => {
  const { usesIndex } = await verifyIndexUsed(
    db,
    'SELECT * FROM user WHERE email = $email',
    { email: 'test@test.com' }
  );
  expect(usesIndex).toBe(true);
});
```
