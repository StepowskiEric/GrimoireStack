# Handoff Report Template

Use this template when an agent needs to stop and pass complete context to the next session. Fill out every section with concrete, specific details.

---

## ⚠️ CRITICAL: Agent-to-Agent Handoff

**STOP. Do not continue work. Produce this report completely, then halt.**

The next agent has **zero memory** of this session. They need full context to continue effectively without re-discovering what you already know.

---

## What We Were Working On

[1-3 sentences describing the goal, the problem being solved, and what success looks like]

**Example:**
"We were implementing a JWT refresh token rotation system for the auth middleware. The goal is to invalidate old refresh tokens on use and issue new ones, preventing token theft replay attacks. Success = all existing auth flows work, refresh tokens rotate correctly, and tests pass."

---

## What's Done

[Bulleted list with specific details. Include file paths, commit hashes, test results, decisions made.]

**Example:**
- Added `refreshTokenRotation()` function to `src/auth/middleware.ts` (commit: abc123)
- Modified login endpoint to return both access and refresh tokens
- Added `logout()` endpoint that adds tokens to a denylist in Redis
- Wrote 5 unit tests covering: happy path, expired token, tampered token, rotation edge case, concurrent requests
- All 47 tests in `tests/auth/` passing (0 failures)
- Decided to use Redis for token denylist over DB — faster lookup, auto-expiry matches token TTL

---

## What's In Progress

[What were you doing when you stopped? What have you tried? What's left?]

**Example:**
"I was debugging a race condition in the refresh flow. When two requests come in with the same refresh token simultaneously, both get new access tokens before either is marked as used. Tried adding a Redis lock — partially works but introduces a deadlock risk. Still need to test the locking solution under load."

---

## What's Pending / Next Steps

[Numbered list in priority order. The next agent should know exactly what to tackle first.]

**Example:**
1. Fix the refresh token race condition (blocking on: load test to validate Redis lock solution)
2. Add integration tests for the full auth flow (login → refresh → logout)
3. Update API documentation in `docs/auth.md`
4. Run security audit on token generation and validation
5. Deploy to staging and verify with Postman collection

---

## Important Constraints & Preferences

[User preferences, hard requirements, things that must not change]

**Example:**
- User wants nuke-and-pave migration strategy — do not incremental migrations
- User hates useEffect — use useReducer or custom hooks instead
- All changes must be committed with conventional commit format
- Never use moment.js — use date-fns
- API routes must follow REST conventions (no RPC-style endpoints)

---

## File Locations & Environment

- **Working directory:** `~/projects/myapp`
- **Key files:**
  - `src/auth/middleware.ts` — main auth logic
  - `src/auth/tokens.ts` — token generation/validation helpers
  - `tests/auth/auth.test.ts` — unit tests
  - `docs/auth.md` — API documentation
- **Relevant skills loaded:** `auth-patterns`, `redis-integration`
- **MCP servers / tools active:** `filesystem`, `git`, `postgres`

---

## Unresolved Issues

[Bugs known but not fixed, edge cases not handled, known failure modes. Do not hide problems.]

**Example:**
- Refresh token race condition still unresolved (see What's In Progress)
- Token denylist cleanup job not written — orphaned Redis keys will accumulate
- No handling for revoked tokens that were already used before logout (edge case: user logs out then immediately refreshes)
- Redis connection pooling not configured — may exhaust connections under load

---

## Risks

[What could go wrong if the next agent continues from here? What should they watch out for?]

**Example:**
- If the race condition fix isn't implemented before deploy, concurrent refresh requests could create session inconsistency
- Redis denylist approach means tokens are stateful — a Redis outage would break logout functionality (fallback needed)
- Token TTL mismatch between Redis expiry and JWT exp claim could cause confusing auth errors if clocks drift

---

## What the Next Agent Needs to Know

[Anything else that would help: user's communication style, what's been tried and failed, where to look for more context]

**Example:**
- User prefers detailed commit messages with the "why", not just the "what"
- The password hashing discussion (commit def456) was contentious — user wants bcrypt over argon2, respect that choice
- Full conversation context is in `~/projects/myapp/.agent-session/2026-05-14.md` if available
- Redis connection string is in `.env` as `REDIS_URL` — do not commit it
- The auth spec document (`docs/auth-spec.md`) has the original requirements and acceptance criteria

---

## END HANDOFF REPORT — SESSION COMPLETE

[Do not add anything below this line. The report is complete.]
