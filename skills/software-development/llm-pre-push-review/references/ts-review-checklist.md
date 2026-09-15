# TypeScript Code Review Checklist

A concrete, actionable checklist for reviewing TypeScript code. Covers the four high‑risk areas most commonly missed by both automated linters and AI‑generated code.

---

## 1. Type Safety Pitfalls

### 1.1 `any` Usage
- [ ] Search for `: any` in variable declarations, parameter types, and return types.
- [ ] Search for `any[]` – prefer `unknown[]` or a specific union type.
- [ ] If `any` is used, require an inline justification comment explaining why no narrower type is possible.
- [ ] Check for implicit `any` – variables without an explicit type annotation in `noImplicitAny` mode will fail compilation, but confirm the compiler option is active in `tsconfig.json`.

**Bad:**
```ts
function process(data: any) { return data.id; }
const items: any[] = [];
```

**Good:**
```ts
interface ProcessInput { id: string; /* … */ }
function process(data: ProcessInput) { return data.id; }
const items: ProcessInput[] = [];
```

---

### 1.2 Type Assertions (`as T`)
- [ ] Flag every `as T` – require a comment explaining the invariant that makes the assertion safe.
- [ ] Flag `as unknown as T` doubly – this is almost always hiding a real type mismatch.
- [ ] Verify that `as` assertions are not used to bypass a compiler error rather than fix a type.
- [ ] Check whether a type guard or discriminated union would eliminate the need for the assertion entirely.

**Bad:**
```ts
const user = data as User;           // no justification
const val = obj as unknown as number; // double assertion
```

**Good:**
```ts
// SAFETY: backend guarantees `role` is present for admin users
const user = data as User;
// OR – prefer a type guard
function isUser(d: unknown): d is User { return typeof (d as User)?.id === "string"; }
```

---

### 1.3 Non-Null Assertions (`!`)
- [ ] Flag every use of `value!` outside of a guard (`if (value != null)` or `value?`).
- [ ] Common AI pattern: `const el = ref.current!` without a preceding existence check.
- [ ] React `ref.current!` inside `useEffect` is the primary accepted exception – still flag with reduced severity.
- [ ] Prefer optional chaining (`value?.prop`) or explicit null checks over `!`.

**Bad:**
```ts
const user = users.find(u => u.id === id)!; // may throw if not found
const el = ref.current!; // no guard
```

**Good:**
```ts
const user = users.find(u => u.id === id) ?? throwError("User not found");
// OR
if (!ref.current) return;
const el = ref.current;
```

---

### 1.4 Generic and Conditional Type Misuse
- [ ] Generic type parameters that are never used in the function body → unused generic, may indicate a copy-paste error.
- [ ] `T extends unknown` – almost certainly redundant; verify intent.
- [ ] `Record<string, any>` – replace with a proper interface or `Record<string, unknown>`.

---

## 2. Runtime vs Compile-Time Gaps

### 2.1 External Data at Trust Boundaries
- [ ] Every entry point that accepts JSON, form data, or API responses must validate the shape of incoming data before using it.
- [ ] Look for `JSON.parse(result)` followed by direct property access – insert a validation step (e.g., `zod`, `io-ts`, or manual check).
- [ ] Flag use of `typeof x === "object"` as a type guard – it does not distinguish between `null` and plain objects, and does not narrow to any specific shape.

**Bad:**
```ts
const data = JSON.parse(req.body);
return data.user.id; // crashes if user is missing or null
```

**Good:**
```ts
const data = userSchema.safeParse(JSON.parse(req.body));
if (!data.success) return res.status(400).json(data.error);
return data.data.user.id;
```

---

### 2.2 Enum and Const Mismatches
- [ ] Enums compiled to objects at runtime – confirm the consuming code does not assume they are string literals only.
- [ ] `as const` objects vs. runtime enums – mixing both in comparisons can fail at runtime even when TypeScript compiles cleanly.
- [ ] `switch` on union types that lacks a `default` or `never` exhaustive check – add `assertNever(x)` helper.

---

### 2.3 Structural vs Nominal Typing Confusion
- [ ] TypeScript uses structural typing – confirm that two types with the same shape are not being treated as unrelated.
- [ ] If nominal typing is intended, use `unique symbol` or branded types (`type UserId = string & { __brand: "UserId" }`).
- [ ] Cross-module interfaces that structurally match but semantically differ – ensure naming and documentation make the distinction clear.

---

### 2.4 `unknown` and `never` Underuse
- [ ] API responses that might be unexpected should use `unknown`, not `any`.
- [ ] Exhaustive `switch` branches should narrow to `never` – add an `assertNever` helper to catch unhandled cases at compile time.
- [ ] `void` vs `undefined` in callbacks – confirm the distinction is intentional.

---

## 3. Common Dependency Issues

### 3.1 Package Versions
- [ ] Check `package.json` for version ranges that resolve to `*` or `latest` – pin to `^x.y.z` for production dependencies.
- [ ] Verify that devDependencies (e.g., `typescript`, `@types/node`) are not accidentally listed as dependencies.
- [ ] Check for duplicate packages in both `dependencies` and `devDependencies` – deduplicate.

---

### 3.2 Type Declaration Packages
- [ ] Every imported npm package that is not pure JavaScript must have a corresponding `@types/*` package installed (or ship its own types).
- [ ] Run `tsc --noEmit` – if there are `Cannot find module '…'` errors, the type package is missing.
- [ ] Flag `declare module 'some-package'` shims – they bypass type checking and should be replaced with proper types.

---

### 3.3 Import Hygiene
- [ ] Avoid `import * as X from 'pkg'` when the package does not export a module namespace object – this is a common AI pattern that compiles but fails at runtime.
- [ ] Check for default-import mismatches: `import foo from 'cjs-pkg'` where the package uses `module.exports = …` – TypeScript may compile but the value will be `{ default: … }` at runtime.
- [ ] Verify relative imports do not escape the project root (`../../../../` chains may indicate a structural issue).
- [ ] Ensure deep imports (`pkg/lib/utils`) match the package's actual file structure – AI often hallucinates internal paths.

---

### 3.4 Peer Dependency Conflicts
- [ ] Run `npm ls` or `pnpm why` – look for `UNMET PEER DEPENDENCY` warnings.
- [ ] Duplicate React or TypeScript versions in the dependency tree can cause subtle type mismatches and runtime errors.

---

### 3.5 Outdated / Vulnerable Dependencies
- [ ] Run `npm audit` or `pnpm audit` – flag any `high` or `critical` vulnerabilities.
- [ ] Flag dependencies that have not been updated in >2 years and have known CVEs.
- [ ] AI commonly pulls in unmaintained utility packages – prefer `lodash.get` over a custom `get()` helper.

---

## 4. Async Error Handling Patterns

### 4.1 Unhandled Promise Rejections
- [ ] Search for `.then()` chains without a `.catch()` at the end.
- [ ] Search for `async` functions called without `await` – fire-and-forget with no error handler.
- [ ] Check for `void fn()` patterns – confirm the caller intentionally discards the promise.

**Bad:**
```ts
async function load() { const r = await fetch(url); return r.json(); }
load(); // rejection is unhandled
fetch(url).then(r => r.json()); // no .catch()
```

**Good:**
```ts
load().catch(err => logger.error("Load failed", err));
// OR
try { await load(); } catch (err) { logger.error("Load failed", err); }
```

---

### 4.2 Empty or Swallowed `catch` Blocks
- [ ] `catch {}` with no body – silent failures are indistinguishable from success.
- [ ] `catch (_) {}` – the error is discarded; at minimum log it.
- [ ] `catch (err) { console.log(err) }` – `console.log` is insufficient for production; use a structured logger.
- [ ] `catch (err) { return null }` without null-checking the caller – propagates `null` silently.

---

### 4.3 `try/catch` Scope Too Broad
- [ ] A single `try/catch` wrapping an entire async function body will catch type errors, logic errors, and real failures – too broad to be useful.
- [ ] Narrow the `try` block to only the operation that can fail, or use separate handlers per operation.

**Bad:**
```ts
async function handler(req: Request) {
  try {
    const user = await getUser(req.id);   // can throw
    const data = processData(user.data);  // logic error also caught
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
```

**Good:**
```ts
async function handler(req: Request) {
  const user = await getUser(req.id).catch(() => null);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  const data = processData(user.data); // logic errors are real bugs, surface them
  return Response.json(data);
}
```

---

### 4.4 Missing `await` Inside Loops
- [ ] `for` or `for...of` loops that call async functions without `await` – executes concurrently with no ordering guarantee, and errors are unhandled.
- [ ] `array.map(fn => asyncOp(item))` without `await Promise.all(...)` – the promise array is returned but not awaited.

**Bad:**
```ts
for (const u of users) { await saveUser(u); }  // slow – sequential, but OK
for (const u of users) { saveUser(u); }         // fast but errors unhandled
const results = users.map(u => saveUser(u));    // returns Promise[], errors unhandled
```

**Good:**
```ts
await Promise.all(users.map(u => saveUser(u))); // parallel + errors are caught by outer try
```

---

### 4.5 Throwing Non-Error Objects
- [ ] `throw "error string"` or `throw 500` – non-Error throws break `instanceof Error` checks and stack traces.
- [ ] Always `throw new Error(message)` or a custom `Error` subclass.
- [ ] Check `err instanceof Error` guard before accessing `.message` or `.stack`.

**Bad:**
```ts
throw "Not found";
catch (err) { console.log(err.message); } // TypeError: Cannot read property 'message' of string
```

**Good:**
```ts
throw new NotFoundError("User not found");
catch (err) { if (err instanceof Error) console.error(err.message); }
```

---

### 4.6 Cancellation and Timeout Leaks
- [ ] Long-running `fetch` or `setTimeout` without an `AbortController` – request continues after the component unmounts or the user navigates away.
- [ ] WebSocket or SSE connections that are never closed on teardown.
- [ ] Retry loops without a max-retry or backoff cap – can turn a brief outage into a runaway loop.

---

### 4.7 Promise Constructor Anti-Pattern
- [ ] `new Promise((resolve, reject) => { resolve(await fn()); })` – wrapping an already-async function in a Promise constructor is unnecessary and can swallow rejections if `fn()` throws before `resolve` is called.
- [ ] Simply `return fn()` or `return await fn()` instead.

**Bad:**
```ts
function getData() {
  return new Promise(async (resolve) => {
    const data = await fetchJson(); // if fetchJson throws, rejection is swallowed
    resolve(data);
  });
}
```

**Good:**
```ts
async function getData() { return await fetchJson(); }
```

---

## Quick Reference Summary

| Category | Key Rule | Severity |
|---|---|---|
| `any` | Never without justification comment | ⚠ Warning |
| Type assertion | `as unknown as T` requires comment | ⚠ Warning |
| Non-null assertion | `!` without prior null guard | ⚠ Warning |
| External data | Validate before use | ❌ Error |
| Hardcoded secrets | Move to env vars | ❌ Error |
| SQL injection | Use parameterized queries | ❌ Error |
| Empty catch | Always log or re-throw | ❌ Error |
| Missing `.catch()` | Every `.then()` chain needs one | ❌ Error |
| Throwing non-Error | Use `new Error(...)` | ⚠ Warning |
| Missing `await` | Silent fire-and-forget is a bug | ❌ Error |
| Outdated deps | `npm audit` high/critical | ⚠ Warning |
| N+1 queries | Batch DB calls | ❌ Error |
| Race conditions | Shared mutable state without locks | ❌ Error |
| `AbortController` | Clean up async work on teardown | ⚠ Warning |
