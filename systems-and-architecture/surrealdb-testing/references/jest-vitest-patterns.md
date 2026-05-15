# Jest / Vitest Testing Patterns for SurrealDB

Complete test setup patterns using `mem://` for fast isolation and explicit schema provisioning.

---

## Vitest Setup (recommended — faster than Jest for this use case)

```typescript
// tests/setup.ts
import { Surreal } from 'surrealdb';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

let db: Surreal;

export async function createTestDb(): Promise<Surreal> {
  const db = new Surreal();
  await db.connect('mem://');
  const ns = `test_${Math.random().toString(36).slice(2)}`;
  await db.use({ namespace: ns, database: ns });
  return db;
}

export async function provisionSchema(db: Surreal) {
  await db.query(`
    DEFINE TABLE person SCHEMAFULL;
    DEFINE FIELD name ON person TYPE string;
    DEFINE FIELD email ON person TYPE string ASSERT string::is_email($value);
    DEFINE FIELD age ON person TYPE option<int>;
    DEFINE INDEX person_email ON TABLE person FIELDS email UNIQUE;

    DEFINE TABLE task SCHEMAFULL;
    DEFINE FIELD title ON task TYPE string;
    DEFINE FIELD status ON task TYPE string DEFAULT 'open';
    DEFINE FIELD assignee ON task TYPE option<record<person>>;
    DEFINE INDEX task_status ON TABLE task FIELDS status;
  `);
}

export { db };

afterEach(async () => {
  if (db) await db.close();
});
```

---

## Basic CRUD Tests

```typescript
// tests/person.test.ts
import { describe, expect, test, beforeEach } from 'vitest';
import { createTestDb, provisionSchema } from './setup';

describe('person', () => {
  let db: import('surrealdb').Surreal;

  beforeEach(async () => {
    db = await createTestDb();
    await provisionSchema(db);
  });

  afterEach(async () => {
    await db.close();
  });

  test('create and select', async () => {
    const [created] = await db.create('person', {
      name: 'tobie',
      email: 'tobie@surrealdb.com',
    });
    expect(created.id).toMatch(/^person:/);

    const [person] = await db.select('person');
    expect(person.name).toBe('tobie');
  });

  test('insert many', async () => {
    const result = await db.insert('person', [
      { name: 'amy', email: 'amy@test.com' },
      { name: 'bob', email: 'bob@test.com' },
    ]);
    expect(result.length).toBe(2);

    const records = await db.select('person');
    expect(records.length).toBe(2);
  });

  test('unique index prevents duplicates', async () => {
    await db.create('person', { name: 'a', email: 'dup@test.com' });
    await expect(
      db.create('person', { name: 'b', email: 'dup@test.com' })
    ).rejects.toThrow();
  });

  test('point lookup with ONLY', async () => {
    const [created] = await db.create('person', { name: 'solo', email: 'solo@test.com' });
    // select returns array — ONLY returns the object directly
    const person = await db.query('SELECT * FROM ONLY $id', { id: created.id });
    expect(person[0].name).toBe('solo');
  });

  test('update merge', async () => {
    const [created] = await db.create('person', { name: 'tobie', email: 't@t.com' });
    await db.update(created.id as string).merge({ name: 'tobie updated' });
    const [updated] = await db.select(created.id as string);
    expect(updated.name).toBe('tobie updated');
    expect(updated.email).toBe('t@t.com'); // unchanged
  });

  test('upsert creates if not exists', async () => {
    await db.upsert('person:newid').content({ name: 'brand new', email: 'new@test.com' });
    const [person] = await db.select('person:newid');
    expect(person.name).toBe('brand new');
  });

  test('upsert replaces if exists', async () => {
    await db.create('person', { name: 'original', email: 'orig@test.com' });
    await db.upsert('person:newid').content({ name: 'replaced', email: 'rep@test.com' });
    const [person] = await db.select('person:newid');
    expect(person.name).toBe('replaced');
  });
});
```

---

## Transaction Rollback Tests

```typescript
// tests/transaction.test.ts
test('transaction rolls back on throw', async () => {
  await db.query(`
    BEGIN TRANSACTION;
    CREATE person SET name = 'before_throw', email = 'bt@test.com';
    THROW 'intentional failure';
    COMMIT TRANSACTION;
  `).catch(() => {}); // SurrealDB throws on rollback

  // Record should not exist
  const result = await db.query("SELECT * FROM person WHERE email = 'bt@test.com'");
  expect((result[0] as any[]).length).toBe(0);
});

test('transaction commits on success', async () => {
  const [result] = await db.query(`
    BEGIN TRANSACTION;
    CREATE person SET name = 'commit_test', email = 'ct@test.com';
    CREATE task SET title = 'task for commit_test';
    COMMIT TRANSACTION;
  `);

  const people = await db.query("SELECT * FROM person WHERE email = 'ct@test.com'");
  expect((people[0] as any[]).length).toBe(1);
});
```

---

## Live Query Tests

```typescript
// tests/live.test.ts
test('live query receives CREATE notification', async () => {
  // Requires WebSocket
  const wsDb = new Surreal();
  await wsDb.connect('ws://127.0.0.1:8000/rpc', {
    namespace: 'test',
    database: 'test',
  });

  const live = await wsDb.live('person');
  const notifications: string[] = [];

  live.subscribe((action) => {
    notifications.push(action);
  });

  await wsDb.create('person', { name: 'live_test', email: 'live@test.com' });

  // Wait for async notification
  await new Promise(r => setTimeout(r, 200));

  expect(notifications).toContain('CREATE');
  await live.kill();
  await wsDb.close();
});
```

---

## Record Link and Graph Relation Tests

```typescript
// tests/graph.test.ts
test('relate creates edge record', async () => {
  const [person] = await db.create('person', { name: 'owner', email: 'o@test.com' });
  const [task] = await db.create('task', { title: 'my task' });

  const [edge] = await db.relate('task:assigned', person.id as string, task.id as string);
  expect(edge.id).toMatch(/^task:assigned:/);

  // Query edge data
  const [edgeRecord] = await db.select(edge.id as string);
  expect(edgeRecord.in).toBe(person.id);
  expect(edgeRecord.out).toBe(task.id);
});

test('graph traversal query', async () => {
  const [person] = await db.create('person', { name: 'traverser', email: 'tr@test.com' });
  const [task] = await db.create('task', { title: 'traversed task' });
  await db.relate('task:assigned', person.id as string, task.id as string);

  // Traverse from person to tasks
  const result = await db.query(
    'SELECT ->task:assigned->task.id AS tasks FROM $person',
    { person: person.id }
  );
  expect(result[0][0].tasks).toContain(task.id);
});
```

---

## Auth and Permission Tests

```typescript
// tests/auth.test.ts
test('record user can only see their own records', async () => {
  // Create a record user access method and sign in as them
  await db.query(`
    DEFINE ACCESS test_user ON DATABASE TYPE RECORD
      TABLE auth_creds
      SIGNIN (SELECT * FROM auth_creds WHERE email = $variables.email AND pass = $variables.pass)
      DURATION FOR SESSION 1h;
  `);

  // Sign in as the record user
  const userDb = new Surreal();
  await userDb.connect('ws://127.0.0.1:8000/rpc', {
    namespace: 'test',
    database: 'test',
    authentication: {
      namespace: 'test',
      database: 'test',
      access: 'test_user',
      variables: { email: 'user@test.com', pass: 'password' },
    },
  });

  // Record user should only see records matching their auth
  // This depends on the table's PERMISSIONS definition
  const records = await userDb.select('person');
  expect(records).toBeDefined();

  await userDb.close();
});
```

---

## Jest Configuration

```javascript
// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 10_000,
  // Ensure mem:// works (no special config needed for Vitest, but Jest may need esm support)
  transform: {},
  // For ESM-only packages like surrealdb:
  transformIgnorePatterns: [
    '/node_modules/(?!surrealdb)',
  ],
};
```

For Jest with ESM `surrealdb`, you may need `jest-esm` or to run with `--experimental-vm-modules`. Consider using **Vitest** instead — it handles ESM natively and works with `mem://` out of the box.

---

## CI Pattern

```yaml
# .github/workflows/test.yml
- name: Run unit tests (mem:// — no server needed)
  run: npm run test:unit

- name: Run integration tests
  services:
    surreal:
      image: surrealdb/surrealdb:latest
      ports:
        - 8137:8000
      env:
        SURREAL_USER: root
        SURREAL_PASS: secret
  steps:
    - name: Wait for SurrealDB
      run: npx wait-on tcp:127.0.0.1:8137
    - name: Run integration tests
      env:
        SURREAL_URL: ws://127.0.0.1:8137/rpc
      run: npm run test:integration
```
