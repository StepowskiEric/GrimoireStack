# Common AI Hallucinations in TypeScript/JavaScript

Known failure modes where AI generates plausible but non-existent APIs, patterns, or behavior.

## Methods that don't exist

| Hallucination | Reality |
|--------------|---------|
| `string.isNullOrEmpty()` | `!str` or `str.length === 0` |
| `array.first()` | `array[0]` |
| `array.last()` | `array[array.length - 1]` |
| `promise.tap(fn)` | `promise.then(fn)` |
| `observable.pipeAsync()` | Use `pipe` with async operators |
| `number.toFixed()` vs `toPrecision()` | AI frequently swaps these |
| `Array.prototype.flatMap` when `map` + `filter` is intended | Check intent |
| `Buffer.from(string)` in browser | Browser has no `Buffer` |

## Runtime confusion

| Hallucination | Reality |
|--------------|---------|
| `setTimeout(fn, 0)` as microtask | It's a macrotask; use `queueMicrotask` for microtask |
| `Promise.resolve().then()` guarantees next tick | Microtask queue, not guaranteed timing |
| `Array.isArray` on typed arrays | Returns `false` for `Uint8Array`, etc. |
| `typeof null === 'object'` | AI often forgets this edge case |
| `Object.keys(map)` on `Map` | Use `map.keys()` |
| `structuredClone` in Node < 17 | Not available; use `lodash.cloneDeep` |
| `crypto.randomUUID()` in Node < 19 | Not available |
| `fetch` in Node < 18 | Needs `node-fetch` polyfill |

## Module system hallucinations

| Hallucination | Reality |
|--------------|---------|
| `import * as React from 'react'` in React 17+ with new JSX transform | Unnecessary; runtime import not needed |
| `require()` in ESM files | Use `import` instead |
| `node:fs` vs `fs` | In ESM, `node:fs` is preferred for built-ins |
| Re-exporting from `node:*` built-ins | Some built-ins don't have re-exports |

## TypeScript-specific hallucinations

| Hallucination | Reality |
|--------------|---------|
| `satisfies` where `as` is needed | `satisfies` doesn't cast; it validates |
| Template literal types that are too broad | e.g., `` `${string}` `` matches everything |
| `const` type parameters that widen | Use `const` assertion or `as const` |
| `keyof` on union vs intersection | Behavior differs |
| `infer` in conditional types without constraints | Can match unintended types |

## Verification protocol

For every flagged item:
1. Check `package.json` — is the package installed?
2. Check `node_modules/<pkg>/` — does the file/module exist?
3. Check `.d.ts` files — does the method signature match?
4. Check actual usage — are parameters correct?
5. If still unsure, web search authoritative docs

If any step fails, report. If all pass, do not report.
