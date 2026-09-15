# Hallucination Verification Protocol

This is the mandatory verification protocol for Pass 2 (Hallucination Detection). Follow these steps in order for every flagged item.

## Step 1: Package resolution

**For every import statement:**
1. Open `package.json`
2. Does the package appear in `dependencies` or `devDependencies`?
3. If no → **REPORT**: `WARNING: Import from 'foo' in src/bar.ts:12 — not found in package.json`
4. If yes → proceed to Step 2

**Built-in exceptions:**
- `node:*` modules are always valid in ESM
- `react`, `react-dom` are standard React imports
- `fs`, `path`, `crypto`, etc. are Node built-ins

## Step 2: Module existence

**For every import:**
1. Check `node_modules/<package>/` — does the imported file exist?
2. For relative imports (`./foo`, `../bar`) — does the file exist in the project?
3. If no → **REPORT**: `WARNING: Import './foo' in src/bar.ts:12 — file not found`
4. If yes → proceed to Step 3

## Step 3: Method signature verification

**For every method call on an imported type:**
1. Find the type definition: `node_modules/<package>/<type>.d.ts` or source file
2. Does the method exist on the type?
3. Do the parameter types match?
4. If no → **REPORT**: `WARNING: Method 'foo' does not exist on type 'Bar' at src/baz.ts:45`
5. If yes → proceed to Step 4

## Step 4: Parameter validation

**For every function call:**
1. Are the arguments the right type?
2. Are required arguments present?
3. Are optional arguments used correctly?
4. If mismatch → **REPORT**: `WARNING: Parameter type mismatch in fn() at src/baz.ts:45`

## Step 5: Cross-reference

**For cross-module contracts:**
1. Find the type/interface definition
2. Find all usages
3. Does every usage match the declared shape?
4. If mismatch → **REPORT**: `WARNING: Type mismatch in src/consumer.ts:23 — expects 'foo' but type defines 'bar'`

## Step 6: Web search (last resort)

**If still unsure:**
1. Search official docs: `[library] [method] documentation`
2. Check GitHub issues for known API changes
3. If docs confirm it doesn't exist → **REPORT**
4. If docs confirm it exists but usage is unclear → **INFO: manual verification needed**

## Decision tree

```
Flagged item found
    ├─ Is it an import?
    │   ├─ Not in package.json → REPORT
    │   ├─ Not in node_modules → REPORT
    │   └─ Exists → check method signature
    │       ├─ Method doesn't exist → REPORT
    │       ├─ Wrong params → REPORT
    │       └─ Matches → DO NOT REPORT
    ├─ Is it a type contradiction?
    │   ├─ tsc --noEmit shows error → REPORT
    │   ├─ Clear mismatch (string vs number) → REPORT
    │   └─ Ambiguous → INFO: manual verification needed
    └─ Is it an impossible type guard?
        ├─ Property doesn't exist on type → REPORT
        └─ Type is `any`/`unknown` → INFO: possible but verify
```

## Common AI hallucinations to check first

See `common-hallucinations.md` for the full catalog. Quick checks:
- `string.isNullOrEmpty()` → doesn't exist
- `array.first()` → doesn't exist
- `array.last()` → doesn't exist
- `promise.tap()` → doesn't exist
- `Buffer.from()` in browser → doesn't exist
- `require()` in ESM → doesn't exist
