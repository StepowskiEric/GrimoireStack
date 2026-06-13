# Table Name Mismatch Diagnosis

When the dashboard shows zero/empty data but you know the database has records, the root cause is often a **table name mismatch** between application queries and actual SurrealDB schema.

## Diagnosis Pattern

### 1. Trace the data flow

```
Dashboard UI → Gateway API → SurrealDB Store → SurrealDB
```

Identify each query path. In Coppermind:

| Layer | File | Table |
|-------|------|-------|
| Daemon schema provisioning | `daemon/src/memory/surreal/schema-provision.ts` | `memories` (plural) |
| Daemon writes | daemon ingest pipeline | `memories` |
| Gateway store (reads/writes) | `gateway/src/runtime/stores/surreal.ts` | was `memory` (singular) |
| Gateway BYODB routes | `gateway/routes/byodb-memory.ts` | was `memory` (singular) |
| Gateway query endpoint | `gateway/gateway.ts` | was `memory` (singular) |

### 2. Verify with direct SurrealDB inspection

Use the `surreal sql` CLI to check what tables actually exist:

```bash
# List all tables in the database
surreal sql --endpoint <url> --username <user> --password <pass> \
  --namespace <ns> --database <db> --pretty << 'EOF'
INFO FOR DB;
EOF
```

This returns all defined tables. If the application queries a table that doesn't appear here, that's the mismatch.

### 3. Check for common naming pitfalls

- **Singular vs plural**: `memory` vs `memories` — standard SQL convention uses plural table names, but individual developers may use singular
- **Database name mismatch**: The daemon uses database `daemon` (via `provisionSchema()` in `schema-provision.ts`), but the gateway's SurrealDB store default is `memory` — override with `SURREALDB_DB=daemon` in `.env.local`
- **Schema drift**: Tables added to the daemon's `schema-provision.ts` in a later release may not exist yet if the daemon hasn't been restarted since the change

### 4. Find all query locations

```bash
# Find all table references in production code (exclude tests)
rg "FROM memory" gateway/src/ gateway/routes/ gateway/gateway.ts
```

Each hit that uses the wrong table name must be changed in:
- `SELECT * FROM <table>` — query locations
- `DELETE FROM <table>` — delete locations  
- `INSERT INTO <table>` / `db.insert(new Table('<table>'), ...)` — write locations
- `new RecordId('<table>', ...)` — record ID construction

### 5. Fix all occurrences systematically

Use `skill_manage` with `patch` and `replace_all=true` for bulk fixes of the same pattern across different SQL queries. For unique patterns (`RecordId`, `Table()` constructor, `DELETE`), use individual patches.

### Common sources of this bug

| Pattern | Example (broken) | Example (fixed) |
|---------|-------------------|-----------------|
| SQL FROM clause | `FROM memory` | `FROM memories` |
| RecordId constructor | `new RecordId('memory', id)` | `new RecordId('memories', id)` |
| Table constructor | `new Table('memory')` | `new Table('memories')` |

## Verification

After fixing, verify against the actual database:

```bash
surreal sql --endpoint <url> --username <user> --password <pass> \
  --namespace <ns> --database <db> --pretty << 'EOF'
SELECT count() FROM memories;
EOF
```

Then restart the gateway and check that the dashboard now shows the expected data.
