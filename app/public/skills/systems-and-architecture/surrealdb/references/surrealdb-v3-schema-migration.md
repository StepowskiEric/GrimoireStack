# SurrealDB v3 Schema Migration Notes

Changes discovered during Coppermind migration from SurrealDB v2 to v3.0.5.

## DEFINE INDEX Syntax Changes

### WHERE clause removed

SurrealDB v3 removed `WHERE` clauses from `DEFINE INDEX` entirely. There is no replacement for filtered/partial indexes.

**v2 syntax (broken in v3):**
```surql
DEFINE INDEX idx_name ON TABLE memories FIELDS canonical_key WHERE canonical_key != NONE;
DEFINE INDEX idx_active ON TABLE memories FIELDS status WHERE status = 'active';
```

**v3 syntax:**
```surql
-- Just remove the WHERE clause
DEFINE INDEX idx_name ON TABLE memories FIELDS canonical_key;
DEFINE INDEX idx_active ON TABLE memories FIELDS status;
```

Filter in your queries instead of in the index definition.

### MTREE replaced by HNSW for vector indexes

**v2 syntax (broken in v3):**
```surql
DEFINE INDEX idx_embedding ON TABLE memories FIELDS embedding MTREE DIMENSION 384 DISTANCE COSINE;
```

**v3 syntax:**
```surql
DEFINE INDEX idx_embedding ON TABLE memories FIELDS embedding HNSW DIMENSION 384 DIST COSINE;
```

Changes: `MTREE` → `HNSW`, `DISTANCE` → `DIST`.

## NULL Casting Errors

SurrealDB v3 is stricter about NULL vs NONE for `option<T>` fields. JS `null` becomes SQL `NULL`, which `option<T>` rejects:

```
ValidationError: Could not cast into `none | string` using input `NULL`
```

Fix pattern in INSERT/UPDATE queries:
```surql
INSERT INTO memories {
  canonical_key: IF type::is_string($ck) { $ck } ELSE { NONE },
  episode_id: IF type::is_string($epid) { $epid } ELSE { NONE },
  embedding: IF type::is_array($emb) { $emb } ELSE { NONE },
  success_count: IF type::is_number($sc) { <option<int>>$sc } ELSE { NONE }
};
```

For `option<string>`: `IF type::is_string($p) { $p } ELSE { NONE }`
For `option<int>` / `option<float>`: `IF type::is_number($p) { <option<T>>$p } ELSE { NONE }`
For `option<array>`: `IF type::is_array($p) { $p } ELSE { NONE }`
For `option<object>`: `IF type::is_object($p) { $p } ELSE { NONE }`

Note: The function is `type::is_string` (underscore), NOT `type::is::string` (double-colon).

## Workspace Monorepo Package Resolution

If your project uses npm/yarn/bun workspaces with internal packages (e.g., `@coppermind/mcp-core`), the workspace package's `package.json` MUST have `main`, `types`, and `exports` fields. Without them:

- Vitest fails: `Failed to resolve entry for package "@scope/name". The package may have incorrect main/module/exports specified in its package.json.`
- The error is misleading — the package exists and has built dist files, but no entry point is declared.

Fix:
```json
{
  "name": "@scope/package",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## Diagnosis Pattern

When a full test suite shows widespread failures after a SurrealDB version upgrade:
1. Run a single failing test file with verbose output to see the actual error
2. Check `surreal version` to confirm the binary version
3. Look for `Parse error` or `ValidationError` in stderr (not always captured to file)
4. Schema provisioning failures are often silent — the schema just doesn't get created, and all subsequent operations fail
