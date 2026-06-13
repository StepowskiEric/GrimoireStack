# Common Coordinated Change Patterns

## Pattern: Add a New Field to a Database Object

The most common multi-file change. Every new field requires updates across the stack.

**Change set:**
1. Schema (add field to table definition)
2. Type definition (add to TypeScript interface)
3. Mutation (add to insert/update validation and handler)
4. Query (add to return shape if selective)
5. Component (display the new field)
6. Test (update assertions)

**Order:** 1 → 2 → 3/4 → 5 → 6

**Atomicity:** All changes in one commit. If the field is optional (default value), the query/mutation changes are backward-compatible and can be deployed independently. If required, all changes must deploy together.

## Pattern: Rename a Function or Variable

**Change set:**
1. Type definition (rename in interface)
2. Implementation (rename function)
3. All call sites (rename every import and usage)
4. Test (rename in test references)

**Order:** 1 → 2 → 3 → 4 (can be done in one pass with find-and-replace)

**Danger:** If the rename is across package boundaries, you need to update the API contract first, then consumers.

## Pattern: Change an API Endpoint Signature

**Change set:**
1. Server route handler (change parameters, response shape)
2. Client API call (update request construction)
3. Client types (update response type)
4. Client components (update usage of response data)
5. Integration tests (update to match new contract)

**Order:** If breaking change — all in one commit. If backward-compatible — server first (returns both old and new), then client migrates, then server removes old.

## Pattern: Extract a Component or Module

**Change set:**
1. Create new file with extracted code
2. Update imports in original file (remove extracted code, add import)
3. Update all consumers to import from new location
4. Update test imports
5. Verify no circular dependencies created

**Order:** 1 → 2 (original file still works without extracted code) → 3 → 4 → 5

**Danger:** Circular imports between extracted module and original.

## Checklist Before Committing Any Coordinated Change

- [ ] All files in change set edited?
- [ ] Types compile? (`tsc --noEmit`)
- [ ] No unused imports from refactored code?
- [ ] All call sites updated?
- [ ] Tests updated to match new behavior?
- [ ] No stale references to old names/API shapes?
- [ ] Single commit with descriptive message?