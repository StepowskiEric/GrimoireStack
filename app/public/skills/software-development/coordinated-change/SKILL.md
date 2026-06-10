---
source: "jerry-skills"
name: coordinated-change
description: "Plan and execute changes across multiple related files as a coordinated atomic unit. For when a fix or feature requires touching 2+ files that must stay consistent — types, implementation, tests, schema, config."
triggers:
  - A fix requires changes in more than one file
  - Changing an API contract that has client and server consumers
  - Updating a type definition that's used in multiple places
  - Schema migration that requires query and mutation updates
  - Any change where "if I update A, I must also update B and C"
  - Adding a parameter to a function that's called from multiple files
  - Agent is making one-file patches but tests keep breaking elsewhere
---

# Coordinated Change

**Biological analog:** An organ transplant — you can't just swap the heart, you need to reconnect the arteries, update the blood pressure, adjust the medications. The change is atomic across the whole system.

## Why This Skill Exists

Most debugging and patching skills (iterative-patch-repair, debug-to-fix-pipeline) work on single files. But real-world bugs and features frequently require **coordinated changes across multiple files**:

- Type definition + implementation + test
- API contract + client code + server code
- Schema change + query update + UI component
- Config change + build script + deployment manifest

When one file changes, the others must change consistently. Missing one creates a worse bug than the original.

## The CC Protocol (Coordinated Change)

### Step 1: Map the Change Set

Before editing anything, identify every file that needs to change:

```
CHANGE SET for: [brief description of the change]

Core change:
- [file]:[what changes] → the primary fix/feature

Ripple changes (files that must update to stay consistent):
- [file]:[what must change] → because it uses/depends on [core change]
- [file]:[what must change] → because it implements [interface changed in core]
- [file]:[what must change] → because it tests [behavior changed in core]

Verification targets:
- [file]: must still pass existing tests after changes
- [file]: behavior must change as expected
```

**How to find ripple changes:**

```bash
# Find all imports of the changed module
rg "from.*['\"].*changedModule" --type ts

# Find all usages of the changed function/type
rg "changedFunction|ChangedType" --type ts

# Find all tests related to the changed area
rg "describe|it\(" test/ --type ts | grep -i "changedArea"
```

### Step 2: Order the Changes

Changes have a dependency order. Changing them in the wrong order creates intermediate broken states.

**Correct ordering rules:**

1. **Types/Interfaces first** — define the new shape before code uses it
2. **Core implementation second** — implement against the new types
3. **Consumers third** — update all callers to match new signatures
4. **Tests last** — update test expectations to match new behavior

**Exception:** If you're changing a type to narrow it, update consumers first (they're being restricted). If widening, update type first (consumers still work).

```
Change Order for: [your change]

1. types.ts — add new field to User interface
2. convex/schema.ts — add new field to users table
3. convex/users.ts — update query to return new field
4. components/UserCard.tsx — display new field
5. __tests__/user.test.ts — update assertions for new field
```

### Step 3: Make Changes Atomically

Edit all files in the change set before running tests. Running tests with partial changes creates false failures.

**Atomic edit pattern:**

```bash
# Stage 1: Create/modify types and interfaces
# (edit type files)

# Stage 2: Implement core logic
# (edit implementation files)

# Stage 3: Update all consumers
# (edit consumer files)

# Stage 4: Update tests
# (edit test files)

# ONLY NOW run tests
npm run check
```

**Anti-pattern:** Editing one file, running tests, seeing failures, then editing the next file. The failures are expected because changes are incomplete. This wastes time and creates confusion.

### Step 4: Verify Consistency

After all changes are made:

```bash
# 1. Type check — catches type mismatches across files
npx tsc --noEmit

# 2. Lint — catches unused imports, missing dependencies
npm run lint

# 3. Full test suite — catches behavioral regressions
npm run test

# 4. Full check — all of the above
npm run check
```

**Consistency check — for each file in the change set:**

| Check | How |
|-------|-----|
| Type references match | `tsc --noEmit` passes |
| Imports used | No unused imports, no missing imports |
| API contract consistent | Client sends what server expects |
| Tests cover the change | New behavior has a test, old behavior unchanged |
| No orphan references | `rg` confirms no code references the old signature |

### Step 5: Commit as One Unit

All changes in the set should be a single commit (or a single PR with stacked commits that make sense together).

```bash
git add -A
git commit -m "Add user.avatarUrl field to schema, query, and UI"
```

**Not:**
```bash
git commit -m "Add avatarUrl to type"    # incomplete
git commit -m "Update query for avatarUrl"  # broken without type
git commit -m "Update test for avatarUrl"  # broken without implementation
```

---

## Common Change Set Patterns

### Pattern: New API Field

```
1. types.ts — add field to interface
2. schema.ts — add field to database table
3. mutation.ts — add field to insert/update mutation
4. query.ts — add field to query return
5. component.tsx — display field in UI
6. test.ts — update assertions
```

### Pattern: Rename/Re-signature

```
1. types.ts — update type definition
2. implementation.ts — update function signature
3. consumer-a.ts — update call site
4. consumer-b.ts — update call site
5. test.ts — update test calls
```

### Pattern: Feature Flag / Config Change

```
1. config.ts — add new config value
2. feature.ts — consume config value
3. component.tsx — use feature flag
4. test.ts — test both flag states
```

### Pattern: Data Migration

```
1. schema.ts — add new field (backward compatible with old field)
2. migration.ts — populate new field from old field
3. query.ts — read from new field, fall back to old field
4. migration-2.ts — remove old field (separate PR after migration complete)
5. test.ts — test migration and fallback
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Editing files one at a time and running tests between each | Incomplete changes cause expected failures; wastes time |
| Forgetting to update imports after renaming | `tsc` catches this, but only if you run it after all changes |
| Updating tests before implementation | Tests that assert new behavior will fail until implementation exists; edit both, then run tests |
| Committing partial change sets | Leaves the codebase in a broken state between commits |
| Only updating the primary file | Type errors, broken imports, and inconsistent behavior cascade |
| Using `any` to "make it compile" during transition | Masks real type mismatches; remove before committing |

---

## Integration with Other Skills

- **Before `iterative-patch-repair`:** If the bug requires multi-file changes, use this skill to plan the change set first, then use iterative-patch-repair for the actual patch generation.
- **After `specter`:** Specter finds the root cause. This skill helps when the fix for that root cause spans multiple files.
- **With `minimal-reproduction`:** Write the reproduction test first (minimal-reproduction), then plan the change set (this skill), then implement.
- **With `git-surgery`:** If you've already made partial changes and need to reorganize them into coherent change sets, use git-surgery to split or combine commits.