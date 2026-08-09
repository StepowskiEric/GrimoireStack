# Silent Failures in AI-Generated Code

AI-generated code often passes tests but fails silently in production. This pass targets the failure modes that standard linters miss.

## TOCTOU (Time-of-Check to Time-of-Use)

AI frequently checks a condition then uses the resource without re-checking.

```typescript
// BAD: check then use without re-validation
if (fs.existsSync(path)) {
  const data = fs.readFileSync(path); // race condition if file deleted between check and read
}

// GOOD: handle error directly
try {
  const data = fs.readFileSync(path);
} catch (e) {
  if (e.code === 'ENOENT') return null;
  throw e;
}
```

## Auth race conditions

AI frequently checks auth state then performs privileged action without re-verification.

```typescript
// BAD: check then act without re-validation
if (user.role === 'admin') {
  await deleteResource(id); // user might have been downgraded between check and action
}

// GOOD: verify at action time
await deleteResource(id, { requireRole: 'admin' });
```

## Error handling that leaks info

AI frequently logs or returns raw error objects.

```typescript
// BAD: leaks stack traces and internal details
catch (e) {
  console.error(e);
  res.status(500).json({ error: e.message });
}

// GOOD: sanitize errors
catch (e) {
  logger.error('operation failed', { id, error: e.message });
  res.status(500).json({ error: 'Internal server error' });
}
```

## Unhandled promise rejections

AI frequently creates promises without error handling.

```typescript
// BAD: fire-and-forget without error handling
(async () => {
  await doSomething();
})();

// GOOD: handle errors or document why they're safe
(async () => {
  try {
    await doSomething();
  } catch (e) {
    logger.error('background task failed', e);
  }
})();
```

## Stale closures in async callbacks

AI frequently captures stale state in async callbacks.

```typescript
// BAD: stale closure captures initial state
const [items, setItems] = useState([]);
useEffect(() => {
  fetchItems().then(data => setItems(data)); // if fetchItems changes, stale reference
}, [fetchItems]);

// GOOD: use functional update or include deps
useEffect(() => {
  fetchItems().then(data => setItems(prev => [...prev, ...data]));
}, [fetchItems]);
```

## Memory leaks

AI frequently forgets cleanup.

```typescript
// BAD: event listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// GOOD: cleanup in effect
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```

## Silent type coercion

AI frequently relies on implicit coercion.

```typescript
// BAD: implicit coercion
if (count) { ... } // 0 is falsy, but so are '', null, undefined
if (str == 'true') { ... } // == coerces types

// GOOD: explicit checks
if (count > 0) { ... }
if (str === 'true') { ... }
```

## Checklist for silent failures

- [ ] TOCTOU patterns (check-then-use without re-validation)
- [ ] Auth race conditions (check role, then act without re-verify)
- [ ] Error handling that leaks stack traces or internal details
- [ ] Unhandled promise rejections (fire-and-forget without error handling)
- [ ] Stale closures in async callbacks
- [ ] Missing cleanup in `useEffect` / event listeners / timers
- [ ] Implicit type coercion in conditionals
- [ ] Empty `.catch(() => {})` or `.catch(() => null)`
- [ ] `setTimeout` / `setInterval` that never clears
- [ ] `requestAnimationFrame` that never cancels
- [ ] Observable/subscription that never unsubscribes
