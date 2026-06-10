# Skill: API Design and Backward Compatibility

## Purpose

Use this skill when designing, modifying, or versioning APIs, interfaces, contracts, or data schemas. Prevents the agent from shipping breaking changes that break clients, creating ambiguous contracts that invite misuse, or designing endpoints that cannot evolve without pain.

Good API design is not about making the current feature easy; it is about making the next ten features possible without breaking the first one.

---

## When to Apply

- Adding a new endpoint, method, or public function
- Changing request/response shapes, error formats, or status codes
- Renaming fields, types, or resources
- Adding or removing parameters
- Introducing a new API version
- Changing database schemas that surface through an API
- Publishing SDKs, client libraries, or webhooks
- Consuming a third-party API that may change

---

## The Pattern

### Step 1: Define the Contract Before the Implementation

Write the interface first. Code second.

```
Endpoint: POST /v1/invoices
Request:
  customer_id: string (required)
  items: array<{sku: string, qty: int}> (required, 1-100 items)
  due_date: ISO8601 (optional, default: +30 days)
Response 201:
  id: string
  status: "draft" | "sent" | "paid" | "overdue"
  total: decimal (2 places)
  created_at: ISO8601
Response 400:
  error: string
  field: string (which field failed)
  code: "INVALID_FORMAT" | "OUT_OF_RANGE" | "MISSING_FIELD"
```

Rules:
- Every field has a type, optionality, and constraint
- Every endpoint has explicit success and error responses
- Status codes are fixed; do not repurpose them later
- Enumerations are closed or explicitly extensible

Anti-pattern: Writing the handler first and letting the contract emerge from the implementation.

### Step 2: Design for Evolution

Assume the API will change. Make those changes non-breaking by default.

**Additive changes are safe:**
- New optional fields in responses
- New optional query parameters
- New endpoints
- New values in extensible enums (document that clients must handle unknown values)

**Destructive changes are breaking:**
- Removing or renaming fields
- Changing field types
- Making optional fields required
- Changing status codes for existing errors
- Tightening validation (e.g., reducing max length)
- Changing default behavior

**If a breaking change is unavoidable:**
- Ship it under a new version (`/v2/...` or `Accept-Version: 2`)
- Maintain the old version for a documented deprecation period
- Provide a migration guide with before/after examples

### Step 3: Versioning Strategy

Pick one strategy and stick to it:

| Strategy | How | Best For |
|----------|-----|----------|
| URL path | `/v1/users`, `/v2/users` | Public REST APIs |
| Header | `Accept-Version: 2` | Internal services, GraphQL |
| Content negotiation | `Accept: application/vnd.api+json;version=2` | Hypermedia APIs |

Rules:
- Versions are integers, not dates or SemVer minors
- A version is immutable once documented
- Do not mix strategies within the same API surface
- Deprecate old versions with a sunset date, not silence

Anti-pattern: "We don't need versioning yet; we only have one client." That client will become ten, and the tenth will be your most important one.

### Step 4: Schema Discipline

Response schemas must be predictable:

- **Consistent envelope**: Every response wraps data the same way (`{data: ..., error: ..., meta: ...}`)
- **Consistent datetime format**: ISO8601 UTC, always
- **Consistent decimal handling**: Strings for money, never floats
- **Consistent nullability**: Missing optional field vs explicit `null` — pick one and document it
- **Consistent pagination**: `cursor` or `offset+limit`, never both in the same API
- **Consistent error shape**: Same fields for every error response

Field naming:
- Use `snake_case` or `camelCase`; never mix them
- Avoid abbreviations (`customer_id`, not `cust_id`)
- Booleans are questions (`is_active`, `has_permission`, not `active_flag`)
- Arrays are plural (`items`, not `item_list`)

### Step 5: Backward Compatibility Checklist

Before merging any API change:

- [ ] New response fields are optional
- [ ] Existing request fields still behave identically
- [ ] Default values match previous behavior
- [ ] Error codes for existing failures have not changed
- [ ] Webhook payloads remain compatible (or new event type is introduced)
- [ ] SDK/client types compile without changes
- [ ] Documentation reflects the new behavior without deleting old docs
- [ ] A test exists that asserts the old client still works

The test that matters: can a client written against last week's documentation still run against today's deployment?

### Step 6: Deprecation Protocol

When a field or endpoint must be removed:

1. Mark it deprecated in documentation with a replacement path
2. Add a deprecation header: `Deprecation: true` and `Sunset: <date>`
3. Log usage of deprecated features to identify remaining callers
4. Notify known integrators with a migration deadline
5. After the sunset date, return `410 Gone` or remove the feature

Never silently remove a field. A missing key in a JSON response is a breaking change for typed clients.

### Step 7: Error Design

Errors are part of the contract. Design them deliberately.

```json
{
  "error": {
    "code": "PAYMENT_METHOD_EXPIRED",
    "message": "The provided card has expired.",
    "target": "payment_method_id",
    "details": [
      {
        "code": "CARD_EXPIRED",
        "message": "Expiry date is in the past.",
        "target": "expiry_date"
      }
    ]
  }
}
```

Rules:
- Machine-readable `code` for programmatic handling
- Human-readable `message` for debugging (may be shown to users, so be polite)
- `target` points to the offending field or resource
- `details` for compound errors
- Status codes are coarse (`4xx` = client fault, `5xx` = server fault); `code` is precise

Anti-pattern: Returning `500` for validation errors or returning HTML error pages from JSON APIs.

### Step 8: Consumer-First Documentation

Document what the consumer sends and receives, not how the server works.

- Request/response examples for every endpoint
- Error examples for every documented error code
- Changelog with breaking vs non-breaking classification
- A "migrating from vN to vN+1" guide when versions change

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|-------------|
| Returning different shapes for success vs error | Breaks typed clients and parsing logic |
| Using floats for money | `0.1 + 0.2 !== 0.3`; use integer cents or decimal strings |
| `200 OK` with error in body | HTTP semantics exist for a reason; use `4xx`/`5xx` |
| Undocumented optional fields | Clients cannot rely on them; they become breaking changes when removed |
| Exposing internal IDs directly | Locks you into internal data model; use opaque IDs or slugs |
| Pagination without stable ordering | Duplicate or missing items on page transitions |
| Changing error messages without changing codes | Consumers parsing messages break; code is the contract |
| N+1 query endpoints | `/users` returning full nested orders invites abuse and performance cliffs |

---

## Quick Reference

```
1. Contract first   → write interface, then code
2. Evolution        → additive safe, destructive breaking
3. Versioning       → pick one strategy, immutable versions, sunset dates
4. Schema discipline → consistent envelopes, datetimes, decimals, nulls
5. Compatibility    → test that old clients still work
6. Deprecation      → document, header, log, notify, sunset
7. Errors           → machine code + human message + field target
8. Documentation    → consumer-facing examples and changelogs
```

---

## Related Skills

- `domain-driven-design` — bounded contexts and aggregates inform API boundaries
- `verify-before-integrate` — ensure API changes do not break consumers
- `security-threat-modeling` — every endpoint is an attack surface
- `thinking-in-systems` — understand how API changes propagate through the system
