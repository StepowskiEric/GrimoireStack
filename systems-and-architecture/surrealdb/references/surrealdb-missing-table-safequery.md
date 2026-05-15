# SurrealDB Missing Table Pattern — safeQuery

## Problem

SurrealDB throws on `DELETE FROM` / `SELECT FROM` for tables that were never created.
`DEFINE TABLE IF NOT EXISTS` in schema provisioning only works when the provision code runs.
Databases initialized with older schema versions silently lack newer tables.

This commonly affects:
- Edge/relation tables added in later releases (`relates`, `derived_from`)
- Secondary tables (`memory_followups`, `triples`, `session_summaries`)
- CLI commands that connect directly to SurrealDB, bypassing daemon startup provisioning

## Pattern: safeQuery wrapper

```typescript
async function safeQuery(
  db: Surreal,
  surql: string,
  vars?: Record<string, unknown>,
): Promise<unknown> {
  try {
    return await db.query(surql, vars)
  } catch {
    return undefined
  }
}
```

Use for:
1. **Bulk purge operations** — iterate over a list of table names, safeQuery each DELETE
2. **Count/preview operations** — safeQuery each SELECT count(), unwrap with fallback to 0
3. **Any CLI command** that runs outside the daemon lifecycle and touches tables that may not exist

## Pattern: full-table purge with safeQuery

```typescript
const relationTables = ['supersedes', 'contradicts', 'related_to', 'derived_from', 'relates']
const userTables = ['memories', 'episode', 'session_summaries', 'project_states',
                    'task_states', 'review_jobs', 'memory_followups', 'triples']

// Edge tables — no user_id, wipe entirely
for (const table of relationTables) {
  await safeQuery(db, `DELETE FROM ${table};`)
}

// User-scoped tables — filter by user_id
for (const table of userTables) {
  await safeQuery(db, `DELETE FROM ${table} WHERE user_id = $uid;`, { uid: userId })
}
```

## Why not just run provisionSchema before the command?

You should, but belt-and-suspenders is warranted because:
1. CLI commands may run while the daemon is stopped (no SurrealDB running to provision against)
2. Schema provision opens a separate root connection — extra complexity for a one-shot command
3. The safeQuery pattern handles the case gracefully regardless of DB state

## Related

- Schema drift detection: `INFO FOR TABLE` + fields-count check (see main SKILL.md)
- Schema provisioning: `provisionSchema()` in `schema-provision.ts`
- Daemon startup: `ensureLocalSurrealMemoryPlane()` calls `provisionSchema()`
