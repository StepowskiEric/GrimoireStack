---
name: surrealdb-js-sdk
description: SurrealDB JavaScript/TypeScript SDK v2 — connection patterns, authentication, query execution, live queries, React/SolidJS/Svelte integration, and critical SDK gotchas.
version: 1.0.0
author: Hermes Agent
metadata:
  hermes:
    tags: [surrealdb, javascript, typescript, sdk, react, node]
---

# SurrealDB JavaScript SDK Skill

Use this skill when integrating SurrealDB into Node.js, Bun, browser, or framework applications (React, SolidJS, Svelte, Vue, Next.js).

Package: `surrealdb` on npm/JSR. SDK v2 is the current version (`import { Surreal } from 'surrealdb'`). Do not use the old `@surrealdb/surrealdb` package.

---

## Installation

```bash
npm install surrealdb
# or
bun add surrealdb
```

Requires Node.js 18+ or Bun. Browser use requires WebAssembly support.

---

## Connection

### Protocols

| Protocol | Best For | Session Behavior |
|---|---|---|
| `ws://` / `wss://` | Long-lived stateful connections (backend, SSR) | Sessions default to `NONE` (never expire) |
| `http://` / `https://` | Short-lived stateless connections (serverless) | Sessions default to **1-hour token** |
| `mem://` | In-process in-memory (tests) | Ephemeral |

```javascript
import { Surreal } from 'surrealdb';

const db = new Surreal();

// WebSocket — long lived
await db.connect('ws://127.0.0.1:8000/rpc', {
  namespace: 'myapp',
  database: 'production',
});

// HTTP — stateless
await db.connect('http://127.0.0.1:8000', {
  namespace: 'myapp',
  database: 'production',
});

// Embedded in-memory (tests)
await db.connect('mem://');
```

### Passing Credentials in `connect()` — Preferred Pattern

```javascript
// Pass credentials in connect() for seamless re-auth on reconnect
await db.connect('ws://127.0.0.1:8000/rpc', {
  namespace: 'myapp',
  database: 'prod',
  authentication: {
    username: 'myuser',
    password: 'mypassword',
  },
});
```

This is the **preferred pattern** for system users. The SDK handles automatic re-authentication when the connection drops and reconnects.

### Manual Signin

```javascript
await db.connect('ws://127.0.0.1:8000/rpc');
await db.signin({
  namespace: 'myapp',
  database: 'prod',
  username: 'myuser',
  password: 'mypassword',
});
```

If you call `.signin()` manually, the `authentication` property in `.connect()` is ignored for re-auth purposes. You must then handle token expiry yourself (see the token expiry section).

---

## Authentication

### System Users (Root / Namespace / Database)

```javascript
// Root — full instance access
const tokens = await db.signin({ username: 'root', password: 'secret' });

// Namespace — all databases in namespace
const tokens = await db.signin({
  namespace: 'myapp',
  username: 'admin',
  password: 'secret',
});

// Database — scoped access
const tokens = await db.signin({
  namespace: 'myapp',
  database: 'prod',
  username: 'editor',
  password: 'secret',
});
```

### Record Users (Web / Multi-Tenant)

```javascript
// Signup — create a new record user
const tokens = await db.signup({
  namespace: 'myapp',
  database: 'prod',
  access: 'user_access',   // must match a DEFINE ACCESS ... TYPE RECORD
  variables: {
    email: 'user@example.com',
    pass: 'password123',
  },
});

// Signin — authenticate as record user
const tokens = await db.signin({
  namespace: 'myapp',
  database: 'prod',
  access: 'user_access',
  variables: {
    email: 'user@example.com',
    pass: 'password123',
  },
});
```

The access method defines the signin logic (see `surrealdb-security` skill).

### Auth State Management

```javascript
// Subscribe to auth events
db.subscribe('auth', (tokens) => {
  if (tokens) {
    console.log('Signed in:', tokens.access);
  } else {
    console.log('Signed out');
  }
});

// Check current state
if (db.accessToken) {
  console.log('Session is authenticated');
}

// Invalidate (sign out)
await db.invalidate();
await db.close();
```

### Multiple Sessions on One Connection

```javascript
// User A session
const sessionA = await db.newSession();
await sessionA.signin({ ... });

// User B session — different credentials, same connection
const sessionB = await db.newSession();
await sessionB.signin({ ... });

// Close a specific session
await sessionA.closeSession();
```

### Using Existing Tokens (Session Restore)

```javascript
// Restore from stored token
await db.authenticate(accessToken);

// With refresh token for auto-renewal
const newTokens = await db.authenticate({
  access: oldAccessToken,
  refresh: oldRefreshToken,
});
```

---

## Query Execution

### Two Approaches

**1. Query builders** — chainable, structured:

```javascript
// Select
const people = await db.select('person');

// Select by record ID
const person = await db.select(new RecordId('person', 'tobie'));

// Create
const created = await db.create('person', { name: 'tobie', email: 'tobie@surrealdb.com' });

// Insert one or many
await db.insert('person', { name: 'jaime' });
await db.insert('person', [{ name: 'amy' }, { name: 'bob' }]);

// Update
const updated = await db.update('person:tobie', { name: 'tobie updated' });

// Merge (partial update)
const merged = await db.update('person:tobie').merge({ status: 'active' });

// Patch (JSON Patch operations)
const patched = await db.update('person:tobie').patch([{ op: 'replace', path: '/name', value: 'new' }]);

// Upsert — insert or replace
const upserted = await db.upsert('person:tobie').content({ name: 'tobie', email: 't@s.com' });

// Delete
await db.delete('person:tobie');
```

**2. Raw SurrealQL via `.query()`** — flexible, supports multi-statement:

```javascript
// Single query
const result = await db.query('SELECT * FROM person WHERE status = $status', {
  status: 'active',
});

// Multi-statement
const [info, records] = await db.query(`
  USE NS myapp DB prod;
  SELECT * FROM person LIMIT 10;
`);

// Raw (vulnerable to injection — use params)
const bad = await db.query(`SELECT * FROM person WHERE email = '${userInput}'`); // DON'T

// Parameterized (safe)
const safe = await db.query('SELECT * FROM person WHERE email = $email', {
  email: userInput,
});
```

### `.query()` Return Shape — CRITICAL

```javascript
// .query() returns any[][] — always index into the result
const raw = await db.query('SELECT * FROM person LIMIT 5');

// Always unwrap: result[0] = first statement's output
const records = (raw[0] ?? []) as Person[];

// For multiple statements:
const [letResult, selectResult] = await db.query(`
  LET $name = 'test';
  SELECT * FROM person WHERE name = $name;
`);
// letResult = undefined (LET returns nothing)
// selectResult = array of person records
```

The generic type parameter lies — always cast with `as any[]` or `as MyType[]`.

### `.insert()` Table Name — Needs `as any`

```typescript
import { Surreal } from 'surrealdb';
import type { RecordId } from 'surrealdb';

const db = new Surreal();
await db.connect('mem://');
await db.use({ namespace: 'test', database: 'test' });

// TypeScript: insert() first param requires cast
await db.insert('memory' as any, { key: 'value' });

// For typed inserts:
await db.insert<MemoryRecord>('memory' as any, { key: 'value' });
```

### `.delete()` Requires `RecordId`, Not String

```javascript
import { RecordId } from 'surrealdb';

// Wrong — throws
await db.delete('memory:abc123');

// Correct — use RecordId
await db.delete(new RecordId('memory', 'abc123'));
```

---

## Session Parameters

Set session-scoped variables accessible as `$key` in queries:

```javascript
await db.set('activeUser', 'user:tobie');
await db.set('role', 'admin');

// Use in queries
const records = await db.query('SELECT * FROM task WHERE assignee = $activeUser');

// Remove
await db.unset('role');
```

---

## Live Queries

Live queries require a **WebSocket connection** — not supported over HTTP.

### Managed Live Queries (SDK-controlled lifecycle)

```javascript
// Create a managed live query — SDK auto-restarts on reconnect
const live = await db.live('person');

// Subscribe with callback
live.subscribe((action, record) => {
  switch (action) {
    case 'CREATE': console.log('Created:', record); break;
    case 'UPDATE': console.log('Updated:', record); break;
    case 'DELETE': console.log('Deleted:', record.id); break;
  }
});

// Async iteration
for await (const { action, result } of live) {
  console.log(action, result);
}

// Stop
await live.kill();
```

### Live Query with Filters

```javascript
const live = await db.live('person');
live.where({ status: 'active' });
live.subscribe((action, record) => {
  console.log(action, record);
});
```

### Unmanaged Live Queries (Custom SurrealQL)

```javascript
// Execute raw LIVE SELECT, then subscribe by ID
const [result] = await db.query("LIVE SELECT * FROM person WHERE status = 'active'");
const liveQueryId = result; // UUID returned by LIVE SELECT

// Subscribe to it
const sub = await db.liveOf(liveQueryId);
sub.subscribe((action, record) => { ... });

// Not auto-restarted on reconnect — must re-subscribe manually
```

### Auto-Restart on Reconnect

Managed live queries (`.live()`) are **automatically restarted** when the SDK reconnects. Unmanaged queries (raw `LIVE SELECT` + `.liveOf()`) are not — you must re-subscribe manually.

### Feature Detection

```javascript
const supported = await db.feature('live_queries');
if (!supported) {
  // live queries not available — skip or fall back to polling
  return;
}
```

---

## Transactions

```javascript
// Implicit — each statement auto-commits
await db.create('person', { name: 'tobie' }); // committed immediately

// Explicit transaction
const [person, log] = await db.query(`
  BEGIN TRANSACTION;
  CREATE person SET name = 'tobie';
  CREATE log SET action = 'person_created';
  COMMIT TRANSACTION;
`);

// Rollback on error
try {
  await db.query(`
    BEGIN TRANSACTION;
    CREATE person SET name = $name;
    IF $name = '' { THROW 'Name required'; };
    COMMIT TRANSACTION;
  `, { name: '' });
} catch (e) {
  // Transaction rolled back automatically
}
```

---

## Connection Status and Events

```javascript
db.subscribe('connected', () => console.log('Connected'));
db.subscribe('disconnected', () => console.log('Disconnected'));
db.subscribe('error', (err) => console.error('Error:', err));
db.subscribe('using', ({ namespace, database }) => {
  console.log(`Switched to ${namespace}/${database}`);
});

console.log(db.status); // 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
```

---

## React Integration

See the full guide at `references/react-integration.md`.

```jsx
// SurrealProvider.jsx
import { createContext } from 'react';
import { Surreal } from 'surrealdb';

export const db = new Surreal();

export function SurrealProvider({ children, params }) {
  // Initialize and connect
  useEffect(() => {
    db.connect(params.url, {
      namespace: params.namespace,
      database: params.database,
      authentication: params.auth,
    });
    return () => db.close();
  }, []);

  return (
    <SurrealContext.Provider value={db}>
      {children}
    </SurrealContext.Provider>
  );
}

// useSurrealClient.js
export function useSurrealClient() {
  return useContext(SurrealContext);
}

// In a component:
function PersonList() {
  const db = useSurrealClient();
  const [people, setPeople] = useState([]);

  useEffect(() => {
    db.select('person').then(setPeople);
  }, []);

  return <ul>{people.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

Use `@tanstack/react-query` to manage connection state and handle loading/error states.

---

## SolidJS Integration

```jsx
// SurrealProvider.jsx
import { createContext } from 'solid-js';
import { Surreal } from 'surrealdb';

export const db = new Surreal();

export function SurrealProvider(props) {
  onMount(() => {
    db.connect(props.url, {
      namespace: props.namespace,
      database: props.database,
      authentication: props.auth,
    });
  });

  onCleanup(() => db.close());

  return (
    <SurrealContext.Provider value={db}>
      {props.children}
    </SurrealContext.Provider>
  );
}
```

---

## Error Handling

```javascript
try {
  await db.insert('person', data);
} catch (e) {
  // SurrealDB errors have .data with code and details
  if (e?.data?.code === 'ER_NOTFOUND') {
    console.error('Record not found');
  } else if (e?.data?.code === 'ER_ACCESS') {
    console.error('Permission denied');
  } else if (/Anonymous access/.test(e?.message)) {
    // Token expired — reconnect
    await reconnect();
  } else {
    throw e;
  }
}
```

---

## Node.js HTTP Health Check

```javascript
// Check health — /health returns empty body on 200 in 3.x
async function isHealthy(db) {
  try {
    const res = await fetch('http://127.0.0.1:8137/health');
    return res.ok;           // check status only — NOT res.json()
  } catch {
    return false;
  }
}

// Better: check via SDK ready state
console.log(db.status === 'connected');
```

---

## SDK Gotchas Summary

| Issue | Workaround |
|---|---|
| `.insert()` first param type doesn't accept string | Cast: `db.insert('table' as any, data)` |
| `.delete()` requires `RecordId`, not string | `db.delete(new RecordId('table', 'id'))` |
| `.query()` returns `any[][]` — generic lies | Always cast: `(result[0] ?? []) as MyType[]` |
| Live queries need WebSocket | HTTP/health endpoints don't support them |
| Token expiry after ~1h for system users | Proactive reconnect or retry-on-auth-failure |
| `db.use()` namespace/DB headers ignored in HTTP | Always `USE NS x DB y;` as first statement |
| `.connect()` with auth for re-auth on reconnect | Preferred over manual `.signin()` for system users |
| `LIVE SELECT` not auto-restarted on reconnect | Use `.live()` (managed) for auto-restart |
| `mem://` works in Node.js and browser (WASM) | Fastest for tests — no server needed |
| SDK feature detection for capabilities | `await db.feature('live_queries')` |
| `DEFINE INDEX ... WHERE` removed in v3 | Remove WHERE clause; filter in queries instead |
| `MTREE` vector indexes removed in v3 | Use `HNSW DIMENSION N DIST COSINE` instead |
| JS `null` → SQL `NULL` rejected by `option<T>` | Guard: `IF type::is_X($p) { $p } ELSE { NONE }` |

---

## Framework Quick-Reference

| Framework | Provider Pattern | State Management |
|---|---|---|
| React | `SurrealProvider` context + TanStack Query | `@tanstack/react-query` |
| SolidJS | `SurrealProvider` context + TanStack Query | `@tanstack/solid-query` |
| SvelteKit | Svelte stores + SDK singleton | Svelte stores |
| Vue | `app.provide()` + Pinia | Pinia store |
| Next.js | Server components / Route Handlers | Server-side singleton |

---

## What the agent should do when using the JS SDK

1. Always use parameter binding (`$var`) in `.query()` — never string interpolation
2. Cast `.query()` results: `(raw[0] ?? []) as MyType[]`
3. Use `RecordId` for `.delete()` — not raw strings
4. Cast table name to `as any` for `.insert()`
5. Prefer passing auth in `.connect()` for system users (auto-reconnect re-auth)
6. Use `.live()` for live queries that should survive reconnections
7. Feature-detect live query support before using it
8. Use `mem://` for tests — no server needed
9. Always `await db.close()` in cleanup to free resources
10. Handle token expiry reactively — catch `Anonymous access` errors and reconnect
