# SurrealDB Security Startup Checklist

Production-ready startup command checklist. Each item gates on a specific flag or configuration. Use this when deploying a new SurrealDB service or auditing an existing one.

---

## Minimal Production Startup

```bash
surreal start \\
  --user root \\
  --pass "$(openssl rand -base64 32)" \\
  --bind 10.0.1.5 \\
  --log info \\
  --allow-capabilities none \\
  --allow-funcs "parse::email::*,crypto::argon2::*,crypto::bcrypt::*,crypto::pbkdf2::*,crypto::scrypt::*,string::*,time::*" \\
  --allow-net 10.0.0.0/8,192.168.0.0/16 \\
  --deny-net 0.0.0.0/0 \\
  --no-identification-headers \\
  "rocksdb:///var/lib/surrealdb"
```

---

## Flag Reference

### Authentication

| Flag | Value | Why |
|---|---|---|
| `--user` | Strong username | Root account name |
| `--pass` | 32+ char random | Root password — generate, don't type |
| `--no-identification-headers` | flag (no value) | Prevents `Server: surrealdb/x.x.x` disclosure |

### Network

| Flag | Value | Why |
|---|---|---|
| `--bind` | Internal IP only | Never `0.0.0.0` in production |
| `--allow-net` | Specific CIDRs | Principle of least privilege |
| `--deny-net` | `0.0.0.0/0` | Block everything, then allow |

### Capabilities

| Flag | Value | Why |
|---|---|---|
| `--allow-capabilities` | `none` then add specific | Deny-by-default posture |
| `--allow-funcs` | Whitelist only | Prevents arbitrary function execution |
| `--allow-funcs "http::*"` | Only if needed | SSRF risk — restrict to specific hosts via `--allow-net` |

### Performance

| Flag | Value | Why |
|---|---|---|
| `--log` | `info`, `warn`, or `error` | Never `debug`/`trace` in production |
| `rocksdb://` | Storage engine | Not `file://` (broken in 3.x) |

---

## Capabilities Allowlist Examples

```bash
# For a read-heavy API service — no network, no scripting
--allow-capabilities none

# For a service that sends webhooks via http::fetch
--allow-capabilities none
--allow-funcs "http::fetch,parse::email::*,crypto::argon2::*,time::*"
--allow-net api.example.com/32

# For a service with full functionality (dev/staging only)
--allow-capabilities full
```

---

## TLS Configuration

SurrealDB does not terminate TLS internally in all configurations. Production pattern:

```
[Internet]
    |
[HTTPS Load Balancer / Nginx with TLS]
    |
[SurrealDB ws:// internal]
```

Or use `wss://` (WebSocket Secure) if SurrealDB is the edge service:

```bash
surreal start --bind 0.0.0.0:443 ...  # if using with TLS certs
```

For embedded deployments, enable disk encryption:

```bash
# Linux — LUKS
cryptsetup luksFormat /dev/sdb1

# Cloud — use encrypted volumes (AWS EBS gp3, GCP pd-standard with encryption)
```

---

## Root User Session Duration

After starting, immediately set an explicit session duration for the root user:

```sql
-- Connect first, then:
DEFINE USER root_admin ON ROOT PASSWORD 'your-actual-password'
  ROLE OWNER
  DURATION FOR SESSION 30d;
```

This prevents the default 1-hour JWT expiry from silently locking out services after 1 hour.

---

## Access Method Definitions (Post-Start)

After startup, define access methods for applications. Example for a web app:

```sql
USE NS myapp DB production;

-- Password hash verification function
DEFINE FUNCTION fn::verify_pass($pass: string, $hash: string) {
  RETURN crypto::argon2::compare($pass, $hash);
};

-- Record access for end users
DEFINE ACCESS user_access ON DATABASE TYPE RECORD
  TABLE auth_creds
  SIGNIN (
    SELECT * FROM auth_creds
    WHERE email = $variables.email
    AND fn::verify_pass($variables.pass, pass_hash)
    LIMIT 1
  )
  DURATION FOR TOKEN 15m
  DURATION FOR SESSION 24h;

-- JWT access for services
DEFINE ACCESS service_jwt ON DATABASE TYPE JWT
  ALGORITHM RS256
  URL https://auth.myapp.com/.well-known/jwks.json
  DURATION FOR TOKEN 15m
  DURATION FOR SESSION 1h;
```

---

## Quick Security Audit Queries

Run these after startup to verify configuration:

```sql
-- Check root users and their session durations
INFO FOR USER ROOT;

-- Check all access methods defined
INFO FOR DB;

-- Verify no anonymous access
SELECT * FROM _auth_features WHERE enabled = true;
```

```bash
# Verify identification headers are suppressed
curl -sI https://your-surreal-host/ | grep -i server

# Verify /health doesn't leak version (3.x returns empty body — expected)
curl -s -o /dev/null -w "%{http_code}" https://your-surreal-host/health
# Should return 200 with empty body — NOT JSON
```

---

## Environment Variables Equivalents

| CLI Flag | Environment Variable |
|---|---|
| `--user` | `SURREAL_USER` |
| `--pass` | `SURREAL_PASS` |
| `--bind` | `SURREAL_BIND` |
| `--log` | `SURREAL_LOG` |
| `--allow-funcs` | `SURREAL_ALLOW_FUNCS` |
| `--allow-net` | `SURREAL_ALLOW_NET` |
| `--deny-net` | `SURREAL_DENY_NET` |
| `--allow-capabilities` | `SURREAL_ALLOW_CAPABILITIES` |
