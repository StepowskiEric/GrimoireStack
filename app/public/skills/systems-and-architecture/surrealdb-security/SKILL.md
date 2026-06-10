---
name: surrealdb-security
description: SurrealDB security best practices — capabilities system, authentication (JWT/record/bearer), password hashing, session/token expiration, network hardening, and vulnerability management.
version: 1.0.0
author: Hermes Agent
metadata:
  hermes:
    tags: [surrealdb, security, authentication, jwt, hardening]
---

# SurrealDB Security Skill

Use this skill when deploying SurrealDB, configuring access control, reviewing auth code, or hardening a SurrealDB-backed service.

---

## Capabilities System

SurrealDB uses a **deny-by-default capabilities system**. Most features are disabled at the process level. This is the primary attack surface to understand.

### Default Posture

- Start with `--allow-capabilities=none` (or minimal) and add only what you need
- Avoid broad `--allow-funcs` or `--allow-net` flags without arguments

### Function Allowlisting

```bash
# Discouraged — allows all functions
--allow-funcs "*"

# Recommended — specific function families only
--allow-funcs "parse::email::*, crypto::argon2::*, crypto::bcrypt::*"
```

### Network Allowlisting

```bash
# Specific destinations only
--allow-net 10.0.0.0/8, 192.168.1.0/24

# Block everything — then explicitly allow
--deny-net 0.0.0.0/0
--allow-net 10.0.0.0/8
```

### SSRF Warning

The `http::*` functions can perform Server-Side Request Forgery. `DEFINE FUNCTION` with `http::` should be treated as privileged. SurrealDB does **not** perform reverse DNS lookups, so an attacker can bypass `--deny-net` by using a direct IP address. Use infrastructure-level firewalls in addition to `--allow-net`.

---

## Password Security

### Never Store Plaintext Passwords

Always hash passwords. Use irreversible cryptographic functions:

```surql
-- Argon2 (recommended — best GPU/rainbow table resistance)
DEFINE FUNCTION fn::hash_password($password: string) {
  RETURN crypto::argon2::generate($password);
};

DEFINE FUNCTION fn::verify_password($password: string, $hash: string) {
  RETURN crypto::argon2::compare($password, $hash);
};

-- Bcrypt (also good, widely used)
DEFINE FUNCTION fn::hash_bcrypt($password: string) {
  RETURN crypto::bcrypt::generate($password);
};

-- PBKDF2 and Scrypt also available
-- crypto::pbkdf2::*
-- crypto::scrypt::*
```

**Never use** `md5`, `sha1`, or `sha512` for passwords — too fast, susceptible to brute force.

### Storage Isolation

Store password hashes in a **separate table** with restricted table-level permissions:

```surql
-- Hashes in a separate table from user data
DEFINE TABLE auth_creds SCHEMAFULL
  PERMISSIONS
    FOR select WHERE id = $auth.id
    FOR create WHERE false
    FOR update WHERE false
    FOR delete WHERE false;

-- Main user table has no password field
DEFINE TABLE user SCHEMAFULL
  PERMISSIONS
    FOR select WHERE id = $auth.id
    FOR create, update, delete WHERE id = $auth.id;
```

---

## Authentication

SurrealDB supports three authentication levels:

### System Users (Root / Namespace / Database)

```javascript
// Root — full access to the instance
await db.signin({ username: 'root', password: 'secret' });

// Namespace — access to all DBs in the namespace
await db.signin({ namespace: 'myapp', username: 'admin', password: 'secret' });

// Database — scoped to specific DB
await db.signin({ namespace: 'myapp', database: 'prod', username: 'editor', password: 'secret' });
```

### Record Users (Web/Multi-Tenant Applications)

Record users authenticate via a defined **access method**. Variables (credentials) are passed under `variables`:

```javascript
await db.signin({
  namespace: 'myapp',
  database: 'prod',
  access: 'user_access',   // the access method name
  variables: {
    email: 'user@example.com',
    pass: 'password123',
  },
});
```

The corresponding access method defines how `SIGNIN` works:

```surql
DEFINE ACCESS user_access ON DATABASE TYPE RECORD
  -- The table that holds user credentials
  TABLE auth_creds
  -- Fields to match during signin
  SCHEMAFULL
  -- Custom signin logic: find the user record
  SIGNIN (
    SELECT * FROM auth_creds
    WHERE email = $variables.email
    AND crypto::argon2::compare(pass_hash, $variables.pass)
    LIMIT 1
  )
  DURATION FOR SESSION 1h;
```

### Bearer Tokens

Bearer grants allow other services to authenticate with a revocable key:

```surql
DEFINE ACCESS service_key ON ROOT TYPE BEARER
  -- The key must exist in this table
  TABLE api_keys
  -- Key lookup function
  FOR READ;
```

---

## JWT Configuration

### Use Asymmetric Algorithms in Production

Avoid symmetric `HSXXX` algorithms — SurrealDB only stores the public key with asymmetric (`PSXXX`, `RSXXX`, `ECXXX`):

```surql
DEFINE ACCESS jwt_access ON DATABASE TYPE JWT
  ALGORITHM RS256
  KEY <...public key content... or URL to JWKS endpoint...>
  DURATION FOR TOKEN 15m
  DURATION FOR SESSION 4h;
```

### JWKS for Key Rotation

```surql
DEFINE ACCESS jwt_access ON DATABASE TYPE JWT
  ALGORITHM RS256
  URL https://auth.example.com/.well-known/jwks.json
  DURATION FOR TOKEN 15m;
```

Using a JWKS URL allows seamless key rotation without redeploying SurrealDB.

---

## Session and Token Expiration

### The `DURATION` Clause

```surql
-- Short tokens for high-risk clients
DEFINE ACCESS sensitive ON DATABASE TYPE RECORD
  DURATION FOR TOKEN 5m
  DURATION FOR SESSION 30m;

-- Longer sessions for trusted internal tools
DEFINE ACCESS internal ON DATABASE TYPE RECORD
  DURATION FOR TOKEN 1h
  DURATION FOR SESSION 30d;
```

### Root User JWT Expiry (Critical)

Root user tokens issued via `--user/--pass` expire after **1 hour by default**. The JS SDK does **not** auto-refresh system-user tokens. After 1 hour, every query fails with:

```
NotAllowedError: Anonymous access not allowed: Not enough permissions to perform this action
```

This looks like a permissions error but is actually a **token expiry** issue.

**Fix — two-layer defense:**

1. **Proactive:** Track connection age and force-reconnect before token expiry:

```javascript
const CONNECTION_MAX_AGE_MS = 50 * 60 * 1000; // 50 min (10 min buffer)
let dbCreatedAt = 0;

async function getDb() {
  const now = Date.now();
  if (!dbPromise || (now - dbCreatedAt) > CONNECTION_MAX_AGE_MS) {
    if (dbPromise) (await dbPromise).close();
    dbPromise = createSurrealDb(config);
    dbCreatedAt = Date.now();
  }
  return dbPromise;
}
```

2. **Reactive:** Retry-on-auth-failure:

```javascript
async function withAuthRetry(fn) {
  try {
    return await fn(await getDb());
  } catch (e) {
    if (e?.data?.code === 'ER_NOTLOWED' && /Anonymous access/.test(e?.message)) {
      invalidateConnection();
      return await fn(await getDb());
    }
    throw e;
  }
}
```

3. **Definitive:** Set explicit long session duration:

```sql
DEFINE USER coppermind ON ROOT PASSWORD '...' ROLE OWNER DURATION FOR SESSION 30d;
```

---

## Query and Content Safety

### SQL Injection — Always Use Parameter Binding

Never interpolate untrusted input directly into queries:

```javascript
// Wrong — SQL injection vector
await db.query(`SELECT * FROM user WHERE email = '${userInput}'`);

// Correct — parameterized
await db.query(
  'SELECT * FROM user WHERE email = $email',
  { email: userInput }
);

// Best — query builder with params
await db.query(
  'SELECT * FROM user WHERE email = $email',
  { email: userInput }
);
```

### XSS Prevention

Use SurrealDB's built-in encoding:

```surql
-- Encode special HTML characters (safest)
SELECT string::html::encode(user_input) FROM $input;

-- Sanitize HTML (less safe — use only if you must allow some HTML)
SELECT string::html::sanitize(user_input) FROM $input;
```

---

## Network and Infrastructure

### Keep SurrealDB Off Public Networks

```bash
# Only bind to internal interface
surreal start --bind 10.0.1.5 --user root --pass secret "rocksdb:///var/lib/surrealdb"
```

Use a firewall or VPN to control access. If public exposure is required, put a WAF in front.

### Hide Server Fingerprinting

```bash
# Prevents version disclosure in HTTP headers
surreal start --no-identification-headers ...
```

### Encryption

- **In transit:** Use TLS/HTTPS. Terminate TLS at a load balancer or reverse proxy in production. SurrealDB's WebSocket protocol also supports `wss://`.
- **At rest:** Use disk-level encryption (LUKS on Linux, BitLocker on Windows) or cloud provider volume encryption (AWS EBS, GCP Persistent Disk, Azure Disk).

### WebSocket Session Isolation

While the RPC interface allows re-authentication on a single connection, it is safer to **establish a new WebSocket connection** per user session. This prevents:
1. Residual session data leaking between users
2. Resources associated with a specific user persisting after sign-out

```javascript
// On sign-out, close and reconnect
await db.invalidate();
await db.close();

// New connection for next user
db = new Surreal();
await db.connect('ws://...');
```

---

## Token Storage (Browser/Client)

SurrealDB intentionally **does not support cookies** to avoid CSRF attacks.

Best practice for browser clients:

```javascript
// Keep token in memory only (most secure for short-lived sessions)
// Risk: token lost on page refresh

// If persistence needed:
localStorage.setItem('token', accessToken);
// Risk: XSS can read localStorage

// Mitigations for localStorage:
- Short token expiration (15m or less)
- Content Security Policy (CSP) headers
- Subresource Integrity (SRI) on scripts
- Consider httpOnly cookies set by your auth proxy instead
```

---

## Permissions on Tables and Fields

SurrealDB supports row-level and field-level permissions:

```surql
DEFINE TABLE document SCHEMAFULL
  PERMISSIONS
    -- Anyone authenticated can read
    FOR select WHERE $auth IS NOT NONE
    -- Only the owner can modify
    FOR create WHERE $auth.id IS NOT NONE
    FOR update WHERE owner = $auth.id
    FOR delete WHERE owner = $auth.id OR $auth.role = 'admin';

DEFINE FIELD salary ON document SCHEMAFULL
  -- Hide salary field from non-admin users on read
  PERMISSIONS FOR select WHERE $auth.role = 'admin';
```

Combine database permissions with application-level authorization — do not rely on one layer alone.

---

## Event Trigger Security

`DEFINE EVENT` queries execute **without permission checks** — a regular user triggering an event can perform administrative actions (like logging or cross-table updates) that they don't have direct permission to perform.

Design event handlers carefully:

```surql
-- Event runs without permission checks — validate the auth context inside
DEFINE EVENT email_change_log ON TABLE user
WHEN $before.email != $after.email
THEN (
  -- This CREATE runs as the system, not the triggering user
  CREATE log SET
    user = $value.id,
    old_email = $before.email,
    new_email = $after.email,
    changed_by = $auth.id,  -- still captures who triggered it
    time = time::now()
);
```

---

## Vulnerability Management

- Monitor [SurrealDB Security Advisories](https://github.com/surrealdb/surrealdb/security/advisories) regularly
- Subscribe to the GitHub Security Advisories page for your repos using SurrealDB
- Report vulnerabilities via [GitHub Security Advisory Report](https://github.com/surrealdb/surrealdb/security/advisories/new)
- Keep SurrealDB updated — especially security patches

---

## Security Checklist

- [ ] Capabilities are allowlisted, not blanket-allowed (`--allow-funcs` has arguments)
- [ ] `--allow-net` is restricted to specific CIDRs; `--deny-net 0.0.0.0/0` is set
- [ ] Passwords hashed with `crypto::argon2::*` or `crypto::bcrypt::*` (never md5/sha1)
- [ ] Password hash table has restricted `PERMISSIONS`
- [ ] Root user sessions use `DURATION FOR SESSION` for explicit expiry
- [ ] JWT tokens use asymmetric algorithms (`RS256`/`ES256`, not `HS256`)
- [ ] JWT tokens have short `DURATION FOR TOKEN` (15m or less)
- [ ] System-user tokens have proactive reconnect or retry logic (50min refresh for 1h tokens)
- [ ] All user input uses parameter binding (`$var`), not string interpolation
- [ ] `string::html::encode()` used on untrusted output
- [ ] SurrealDB binds to internal interface only (`--bind 10.x.x.x`)
- [ ] `--no-identification-headers` set in production
- [ ] TLS configured (or TLS terminated at load balancer)
- [ ] Disk encryption enabled (cloud volume encryption or LUKS)
- [ ] CSRF-safe token storage (no cookies; httpOnly if unavoidable)
- [ ] Table/field `PERMISSIONS` align with least-privilege principle
- [ ] Event handlers don't blindly trust the triggering user's context
- [ ] SurrealDB Security Advisories subscribed and monitored

## Support files

- `references/startup-checklist.md` — Production startup command reference: all security flags, TLS configuration, environment variable equivalents, post-start access method definitions, quick security audit queries
