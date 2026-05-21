---
name: supabase-testing
description: "Test Supabase databases using pgTAP (SQL unit tests) and client-side test patterns. Use when writing database tests, testing RLS policies, verifying migrations, testing Postgres functions, or setting up Supabase test automation. Covers Supabase CLI test runner, pgTAP assertions, RLS policy testing, Edge Function testing, and CI integration."
---

# Supabase Database Testing

Test Supabase databases at two levels:
1. **SQL-level** with pgTAP — unit tests for tables, columns, RLS policies, functions, indexes
2. **Client-level** via Supabase client — integration tests using your app's Supabase client in any language

This skill covers the pgTAP/Supabase CLI workflow for SQL tests and the patterns for client-level tests.

---

## When to Use Which Approach

| What you're testing | Use |
|---|---|
| Table/column existence, types, constraints | pgTAP SQL tests |
| RLS policies (who can read/write) | pgTAP SQL tests |
| Postgres functions / triggers / views | pgTAP SQL tests |
| Migration correctness (schema changes) | pgTAP SQL tests |
| Business logic in Postgres functions | pgTAP SQL tests (for pure logic) or client tests (with real data) |
| End-to-end auth + data flows | Client-level tests (test client + real or test database) |
| Edge Functions | Client-level tests (Deno test runner) |

---

## Part 1: Setup

### Prerequisites

- Supabase CLI ≥ v1.11.4
- A local or remote Supabase project
- pgTAP extension enabled in the target database

### Enable pgTAP

**Via Dashboard:**
1. Go to Database → Extensions
2. Search for `pgtap` → Enable

**Via SQL:**
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

To make pgTAP available in all new databases, install it into `template1`:
```bash
psql -d template1 -c "CREATE EXTENSION pgtap"
```

### Project Structure

```
supabase/
├── config.toml
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_add_profiles.sql
├── functions/
│   └── my-function/
└── tests/
    └── database/
        ├── schema.test.sql         # Table/column existence
        ├── rls.test.sql            # RLS policy checks
        ├── functions.test.sql      # Function return types and results
        └── migrations.test.sql     # Migration correctness
```

Create the test directory:
```bash
mkdir -p supabase/tests/database
```

---

## Part 2: Writing pgTAP Tests

### Test File Anatomy

Every `.test.sql` file follows this pattern:

```sql
BEGIN;

-- Declare how many tests this file runs (required — protects against premature failure)
SELECT plan(3);

-- Run tests ---------------------------------------------------------

SELECT has_table('profiles', 'profiles table should exist');
SELECT has_column('profiles', 'id', 'id column should exist');
SELECT col_is_pk('profiles', 'id', 'id should be the primary key');

-- Finish and clean up -------------------------------------------------

SELECT * FROM finish();
ROLLBACK;
```

Key rules:
- `BEGIN` / `ROLLBACK` — all changes are rolled back. Tests never mutate real data.
- `SELECT plan(N)` — declare the test count. Use `no_plan()` only when you can't count ahead.
- `SELECT * FROM finish()` — always call this; it reports skipped/failed counts.
- Never omit `ROLLBACK` — a forgotten `ROLLBACK` can leave test data in your database.

### Running Tests

Run all database tests:
```bash
supabase test db
```

Run a specific test file:
```bash
supabase test db --file supabase/tests/database/rls.test.sql
```

Expected output:
```
supabase/tests/database/rls.test.sql .. ok
supabase/tests/database/schema.test.sql ... ok
All tests successful.
Files = 2, Tests = 8, 1 wallclock secs ( 0.01 usr 0.00 sys + 0.04 cusr 0.02 csys = 0.07 CPU )
Result: PASS
```

---

## Part 3: Core pgTAP Assertions

### Schema Tests

Test that tables, columns, indexes, and constraints exist and are correctly defined.

```sql
BEGIN;
SELECT plan(6);

-- Table existence
SELECT has_table('profiles', 'profiles table should exist');
SELECT has_table('public.profiles', 'profiles table in public schema');
SELECT hasnt_table('temp_profiles', 'temp table should not exist');

-- Column existence and type
SELECT has_column('profiles', 'id', 'id column should exist');
SELECT has_column('profiles', 'email', 'email column should exist');
SELECT hasnt_column('profiles', 'password', 'password column should not exist');

-- Column type
SELECT col_type_is('profiles', 'id', 'uuid', 'id should be a UUID');
SELECT col_type_is('profiles', 'email', 'text', 'email should be text');

-- Nullability
SELECT col_not_null('profiles', 'id', 'id should not be null');
SELECT col_is_null('profiles', 'deleted_at', 'deleted_at should allow null');

-- Default values
SELECT col_has_default('profiles', 'created_at', 'created_at should have a default');
SELECT col_hasnt_default('profiles', 'id', 'id should not have a default');

-- Primary key
SELECT col_is_pk('profiles', 'id', 'id should be the primary key');
SELECT has_pk('profiles', 'profiles should have a primary key');

-- Foreign keys
SELECT col_is_fk('profiles', 'user_id', 'user_id should be a foreign key');
SELECT fk_ok('profiles', 'user_id', 'auth.users', 'id', 'profiles.user_id → auth.users.id');

-- Unique constraints
SELECT col_is_unique('profiles', 'email', 'email should be unique');
SELECT has_unique('profiles', ARRAY['email'], 'unique constraint on email');

-- Indexes
SELECT has_index('profiles', 'email', 'email should have an index');
SELECT index_is_unique('profiles', 'profiles_email_idx', 'email index should be unique');

SELECT * FROM finish();
ROLLBACK;
```

### Function Tests

Test that functions exist, return the right types, and produce correct results.

```sql
BEGIN;
SELECT plan(5);

-- Function existence
SELECT has_function('get_profile', ARRAY['uuid'], 'get_profile should exist');

-- Return type
SELECT function_returns('get_profile', ARRAY['uuid'], 'profiles', 'get_profile should return profiles');

-- Results equality (exact match)
SELECT results_eq(
    'SELECT * FROM get_profile($1)',
    $$VALUES (1, 'Anna', 'anna@example.com')$$,
    'get_profile returns expected data'
);

-- Results inequality (different from expected)
SELECT results_ne(
    'SELECT * FROM get_profile($1)',
    $$VALUES (99, 'Nobody', 'nobody@example.com')$$,
    'get_profile should not return ghost data'
);

-- Function throws expected error
SELECT throws_ok(
    'SELECT get_profile(NULL)',
    '22023', -- invalid_parameter_value
    'get_profile should throw on null input'
);

SELECT * FROM finish();
ROLLBACK;
```

### Performance Tests (optional)

```sql
BEGIN;
SELECT plan(1);

-- Query should complete within 50ms
SELECT performs_ok(
    'SELECT * FROM profiles WHERE email = $1',
    50,
    'profile lookup by email should be fast'
);

SELECT * FROM finish();
ROLLBACK;
```

### Using Prepared Statements (recommended for complex queries)

```sql
BEGIN;
SELECT plan(3);

-- Define reusable prepared statements
PREPARE active_users_q AS
    SELECT id, email FROM profiles WHERE active = true ORDER BY id;

PREPARE expected_users AS
    VALUES (1, 'anna@example.com'), (2, 'bruce@example.com');

-- Test against the prepared statement
SELECT results_eq(
    'active_users_q',
    'expected_users',
    'active_users_q should return the right rows'
);

-- Test with a single-column array result
SELECT results_eq(
    'SELECT id FROM active_users_q',
    ARRAY[1, 2],
    'active user IDs should be [1, 2]'
);

SELECT * FROM finish();
ROLLBACK;
```

---

## Part 4: Testing RLS Policies

RLS policy testing is the most important use case for pgTAP in Supabase. Test that:
1. The right policies exist with the right names
2. The right roles are targeted by each policy
3. The right commands are allowed/denied
4. The actual data returned matches expectations

### Step 1: Test Policy Existence

```sql
BEGIN;
SELECT plan(3);

-- Check that expected policies exist on the table
SELECT policies_are(
    'public',
    'profiles',
    ARRAY[
        'Profiles are public read',           -- SELECT policy
        'Users can update own profile',       -- UPDATE policy
        'Users can insert own profile'        -- INSERT policy
    ],
    'profiles should have exactly 3 policies'
);

-- Check policy roles
SELECT policy_roles_are(
    'public',
    'profiles',
    'Users can update own profile',
    ARRAY['authenticated'],
    'update policy should apply to authenticated role'
);

-- Check policy command
SELECT policy_cmd_is(
    'public',
    'profiles',
    'Users can update own profile',
    'UPDATE',
    'update policy should fire on UPDATE'
);

SELECT * FROM finish();
ROLLBACK;
```

### Step 2: Test RLS Returns Correct Data

The most critical test: does the policy actually filter data correctly?

```sql
BEGIN;
SELECT plan(4);

-- Test SELECT: anonymous users see no profiles
SELECT results_eq(
    $$SELECT set_config('role', 'anon', true); SELECT * FROM profiles$$,
    $$VALUES ()$$,
    'anonymous role should see no profiles'
);

-- Test SELECT: authenticated users see their own profile only
SELECT results_eq(
    $$SELECT set_config('role', 'authenticated', true);
      SELECT * FROM profiles WHERE id = current_user_id()$$,
    $$VALUES (1, 'anna@example.com')$$,
    'authenticated user should see their own profile'
);

-- Test INSERT: anonymous users cannot insert
SELECT throws_like(
    $$SELECT set_config('role', 'anon', true);
      INSERT INTO profiles (id, email) VALUES (999, 'hacker@evil.com')$$,
    '%row-level security%',
    'anonymous role should be blocked from INSERT'
);

-- Test UPDATE: user cannot update another user's profile
SELECT throws_like(
    $$SELECT set_config('role', 'authenticated', true);
      UPDATE profiles SET email = 'hacked@evil.com' WHERE id = 2$$,
    '%row-level security%',
    'user should be blocked from updating another profile'
);

SELECT * FROM finish();
ROLLBACK;
```

**Important:** `set_config('role', ...)` only works for testing. It switches the active
role for the current transaction — it does not change real auth. Never use this in
application code.

### Step 3: Test Policy Coverage Checklist

For every table with RLS enabled, confirm:

| Check | pgTAP assertion |
|---|---|
| Policy count matches expectations | `policies_are()` |
| Correct roles targeted | `policy_roles_are()` |
| Correct command types (SELECT/INSERT/UPDATE/DELETE) | `policy_cmd_is()` |
| Anonymous users can't read restricted data | `results_eq()` with `set_config('role', 'anon')` |
| Authenticated users can read own data | `results_eq()` with `set_config('role', 'authenticated')` |
| Authenticated users can't read others' data | `results_eq()` expecting empty result |
| Service role bypasses RLS | Test with `service_role` role |

---

## Part 5: Testing Migrations

Test that migrations are idempotent, reversible, and don't break existing data.

```sql
BEGIN;
SELECT plan(5);

-- Test 1: idempotency — running the same migration twice should not error
SELECT lives_ok(
    $$CREATE TABLE IF NOT EXISTS test_idempotent (id uuid PRIMARY KEY DEFAULT gen_random_uuid())$$,
    'migration should be idempotent'
);

-- Test 2: column exists after migration
SELECT has_column('profiles', 'display_name', 'display_name column added by migration');

-- Test 3: column has correct type
SELECT col_type_is('profiles', 'display_name', 'text', 'display_name should be text');

-- Test 4: existing data is preserved
SELECT results_eq(
    'SELECT COUNT(*) FROM profiles',
    $$VALUES (3)$$,
    'existing profile count should be unchanged'
);

-- Test 5: new column defaults correctly
SELECT col_has_default('profiles', 'display_name', 'display_name should have a default');

SELECT * FROM finish();
ROLLBACK;
```

---

## Part 6: Supabase CLI Test Commands

### Command Reference

```bash
# Run all database tests
supabase test db

# Run tests against a specific environment
supabase test db --env staging

# Run a specific test file
supabase test db --file supabase/tests/database/rls.test.sql

# Run with verbose output (individual test names)
supabase test db --verbose

# Link to remote project for remote testing
supabase test db --project-ref your-project-id
```

### CI/CD Integration

Add to your CI pipeline (GitHub Actions example):

```yaml
name: Database Tests
on: [push, pull_request]

jobs:
  db-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase init
      - run: supabase db start
      - run: supabase db push --linked  # Apply migrations
      - run: supabase test db
```

---

## Part 7: Client-Level Testing

Use your application's Supabase client to run integration tests in your test framework of choice.

### TypeScript / JavaScript (Vitest / Jest)

```typescript
import { createClient } from '@supabase/supabase-js';

// Use the test client pointing at your test/local database
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

describe('profiles table', () => {
  it('allows authenticated users to read their own profile', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.email).toBe('test@example.com');
  });

  it('blocks anonymous access to profiles', async () => {
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await anonClient
      .from('profiles')
      .select('*');

    // RLS should return empty or throw
    expect(data?.length ?? 0).toBe(0);
  });
});
```

### Python (pytest)

```python
import os
from supabase import create_client

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_ANON_KEY"]
)

def test_profiles_rls():
    # Anonymous user sees nothing
    result = supabase.table("profiles").select("*").execute()
    assert len(result.data) == 0
```

---

## Part 8: Edge Function Testing

Edge Functions use the Deno test runner. Tests live alongside the function or in a `tests/` folder.

```
supabase/functions/
├── my-function/
│   ├── index.ts
│   └── _shared/
│       └── helpers.ts
└── tests/
    └── my-function.test.ts
```

```typescript
// supabase/functions/tests/my-function.test.ts
import { assertEquals, assertStringIncludes } from "jsr:@std/assert";

// Test the handler function directly
Deno.test("my-function returns 200", async () => {
  const response = await myFunctionHandler(new Request("https://example.com"));
  assertEquals(response.status, 200);
});

Deno.test("my-function returns expected body", async () => {
  const response = await myFunctionHandler(new Request("https://example.com"));
  const body = await response.json();
  assertEquals(body.success, true);
});
```

Run Edge Function tests:
```bash
supabase functions test my-function
```

---

## Part 9: pgTAP Assertion Quick Reference

### Schema Assertions

| Function | Tests |
|---|---|
| `has_table(schema, table)` | Table exists |
| `has_column(table, column)` | Column exists |
| `col_type_is(table, column, type)` | Column has type |
| `col_not_null(table, column)` | Column is NOT NULL |
| `col_is_null(table, column)` | Column allows NULL |
| `col_has_default(table, column)` | Column has a default |
| `col_is_pk(table, column)` | Column is primary key |
| `col_is_fk(table, column)` | Column is a foreign key |
| `col_is_unique(table, column)` | Column has unique constraint |
| `has_index(table, column)` | Index exists on column |
| `has_pk(table)` | Table has a primary key |
| `has_fk(table, column)` | Foreign key exists |
| `has_unique(table, cols)` | Unique constraint exists |

### RLS Assertions

| Function | Tests |
|---|---|
| `policies_are(schema, table, names[])` | Exact set of policies on a table |
| `policy_roles_are(schema, table, policy, roles[])` | Roles targeted by a policy |
| `policy_cmd_is(schema, table, policy, cmd)` | Command type (SELECT/INSERT/UPDATE/DELETE) |

### Function / Query Assertions

| Function | Tests |
|---|---|
| `has_function(name, argtypes[])` | Function exists |
| `function_returns(name, args, returns)` | Function return type |
| `results_eq(sql, expected)` | Query returns exact expected rows |
| `results_ne(sql, not_expected)` | Query doesn't return specific rows |
| `set_eq(sql, expected)` | Same rows in any order |
| `throws_ok(sql, errcode, errmsg)` | Query throws a specific error |
| `throws_like(sql, pattern)` | Error message matches SQL LIKE |
| `lives_ok(sql)` | Query does not throw |
| `performs_ok(sql, ms)` | Query completes within time limit |

### Boolean Assertions

| Function | Tests |
|---|---|
| `ok(boolean, desc)` | Generic boolean pass/fail |
| `is(have, want, desc)` | Values are identical (IS NOT DISTINCT FROM) |
| `isnt(have, want, desc)` | Values are different (IS DISTINCT FROM) |
| `matches(value, regex, desc)` | Value matches regex |
| `alike(have, like, desc)` | Value matches SQL LIKE pattern |
| `pass(desc)` / `fail(desc)` | Unconditional pass/fail |

---

## Part 10: Anti-Patterns

### Don't Use `no_plan()`

Avoid `SELECT * FROM no_plan()` — it disables the safety net that catches early exits. Always
count and declare your tests with `SELECT plan(N)`.

### Don't Forget `ROLLBACK`

Tests wrapped in `BEGIN`/`ROLLBACK` never touch real data. Forgetting `ROLLBACK` (or using
`COMMIT`) can pollute your database with test data.

### Don't Test Against Production

Always test against a local or staging database. pgTAP tests can read and inspect schema and
data — never run them against production.

### Don't Skip `has_table()` / `has_column()` in RLS Tests

Testing `results_eq()` on a table that doesn't exist yet produces a confusing error. Always
assert schema existence before testing behavior.

### Don't Test with `service_role` for RLS

The `service_role` bypasses all RLS policies. Use `service_role` to set up test data, but test
RLS behavior using `anon` and `authenticated` roles via `set_config('role', ...)`.

### Don't Hardcode User IDs in CI

Use test fixtures (insert known users in a `setup` function or migration) rather than
hardcoding UUIDs. In CI, insert test users with known IDs and clean up after.

### Don't Let Tests Depend on Insert Order

Use `ORDER BY` in every `results_eq()` query. Without deterministic ordering, test results
are non-deterministic and will flap between pass and fail.

---

## Part 11: Debugging Failing Tests

### Minimal Reproduction

Isolate a single failing assertion into its own file:
```bash
# Create a focused test file
cat > supabase/tests/database/debug_rls.test.sql << 'EOF'
BEGIN;
SELECT plan(1);
SELECT results_eq(
    $$SELECT set_config('role', 'anon', true); SELECT * FROM profiles$$,
    $$VALUES ()$$,
    'anon should see no profiles'
);
SELECT * FROM finish();
ROLLBACK;
EOF

supabase test db --file supabase/tests/database/debug_rls.test.sql --verbose
```

### Check Test Output for Diagnostics

pgTAP prints diagnostics on failure:
```
not ok 4 - anon should see no profiles
# Failed test 4:
# have: (1, 'anna@example.com')
# want: ()
```

### Verify Extension is Enabled

If `plan()` or `has_table()` throws "function does not exist":
```sql
SELECT * FROM pg_extension WHERE extname = 'pgtap';
```
If no row returned, enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

### Verify Role Switching Works

`set_config('role', ...)` requires pgTAP ≥ 1.1.0. If role switching doesn't work:
```sql
SELECT pgtap_version();
```

---

## Part 12: xUnit Style Tests

For larger test suites, use xUnit-style test functions stored in the database:

```sql
-- Define test functions
CREATE OR REPLACE FUNCTION test_profiles_table_exists()
RETURNS SETOF TEXT AS $$
BEGIN
  RETURN NEXT has_table('profiles', 'profiles table exists');
  RETURN NEXT has_column('profiles', 'id', 'id column exists');
  RETURN NEXT col_is_pk('profiles', 'id', 'id is the primary key');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION test_profiles_rls()
RETURNS SETOF TEXT AS $$
BEGIN
  RETURN NEXT policies_are(
      'public', 'profiles',
      ARRAY['Profiles are public', 'Users can update own profile']
  );
END;
$$ LANGUAGE plpgsql;

-- Run all xUnit tests
SELECT * FROM runtests();
```

Each test function runs in its own transaction and is rolled back after completion.

---

## Definition of Done

A Supabase database test suite is complete when:

- [ ] `supabase/tests/database/` directory exists with `.test.sql` files
- [ ] `BEGIN; SELECT plan(N); ... SELECT * FROM finish(); ROLLBACK;` pattern used in every file
- [ ] Table/column tests cover all tables in the schema
- [ ] RLS policy tests cover all tables with RLS enabled (policy existence + data filtering)
- [ ] Function tests cover all public Postgres functions
- [ ] Migration tests verify idempotency and data preservation
- [ ] All tests pass locally: `supabase test db`
- [ ] `results_eq()` queries use `ORDER BY` for deterministic results
- [ ] No tests run against production data
- [ ] `ROLLBACK` is present in every test file
