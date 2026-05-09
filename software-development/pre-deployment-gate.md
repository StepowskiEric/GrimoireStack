---
name: Pre-Deployment Gate
description: "Complete pre-push/pre-deploy checklist combining LLM Pre-Push Review with Vibe Coding Security Hardening. 7-pass protocol: execution grounding, security surface, contextual correctness, structural quality, integration points, production hardening, secrets audit."
...



---

## Pre-Deployment Gate

A complete pre-deployment checklist that merges the LLM Pre-Push Review (5 structural passes) with Vibe Coding Security Hardening (9 security phases) into a single unified gate.

Based on arXiv research identifying systematic LLM failure modes: hallucinated execution traces (2604.19825), Format-Reliability Gap (2604.16697), False Security Confidence (2604.17014), systematic overcorrection (2603.00539), hallucinated reviews (2601.19072).

### Pass 1: Execution Grounding

**Goal:** Don't imagine — verify.

- [ ] Every new function/method has a test or is called by one
- [ ] Edge cases tested (empty input, null, zero, max, off-by-one)
- [ ] Types match at boundaries (optional vs required, null vs undefined)
- [ ] Async/await correct (missing await, unhandled rejection, race conditions)
- [ ] Error paths tested, not just happy paths

**Red flag:** "It looks right" without running it = Mental-Reality Gap. Execute it.

### Pass 2: Security Surface

**Goal:** Catch functionally-correct-but-vulnerable code.

- [ ] Input validation on all external-facing surfaces (API endpoints, user inputs, env vars)
- [ ] No hardcoded secrets or keys
- [ ] No SQL/query injection vectors (string interpolation in queries)
- [ ] Auth checks on every protected route/mutation
- [ ] No secrets in logs or error messages
- [ ] New dependencies checked: maintained? transitive junk?

### Pass 3: Contextual Correctness

**Goal:** The change does what was actually requested.

- [ ] Change matches requirement/spec — no overcorrection of working code
- [ ] No scope creep — every changed line traces to the requirement
- [ ] No speculative code ("might be useful later" = dead code now)
- [ ] Existing tests still pass
- [ ] Imports cleaned up (both directions — unused removed, missing added)

### Pass 4: Structural Quality

**Goal:** No LLM structural anti-patterns.

- [ ] No god functions (>50 lines = too much)
- [ ] No duplicated logic (near-duplicate blocks in the diff)
- [ ] Naming matches intent (data/result/item/info → rename)
- [ ] No premature abstractions (single-use helpers, one-key config objects)
- [ ] Comments explain why not what
- [ ] Error messages are actionable

### Pass 5: Integration Points

**Goal:** Code works when connected to everything else.

- [ ] API contracts match (changed signatures → check all callers)
- [ ] Schema migrations are safe (no destructive drops without path)
- [ ] New env vars documented in .env.example and deployment config
- [ ] Backwards compatibility maintained for existing consumers
- [ ] File moves/renames don't break import paths

### Pass 6: Production Hardening

**Goal:** Secure defaults for production deployment.

- [ ] Row-level security (RLS) enabled on all user-facing tables
- [ ] Rate limiting on public API endpoints
- [ ] CORS configured (not wildcard `*` in production)
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced, no mixed content
- [ ] Error responses don't leak stack traces or internal state
- [ ] Health check endpoint exists and validates dependencies

### Pass 7: Secrets and Config Audit

**Goal:** No credential exposure.

- [ ] No secrets in source code (API keys, JWT secrets, DB passwords)
- [ ] No secrets in git history (use `git log -p | grep -iE 'secret|key|token|password'`)
- [ ] Environment-based config for all environment-specific values
- [ ] Default configs are safe for production (not dev-mode shortcuts)
- [ ] Third-party service credentials rotated if previously exposed

### Quick Mode (< 50 line diff)

1. Change matches requirement?
2. Test covers new behavior?
3. Types correct at boundaries?
4. Security surface exposed?
5. Existing tests pass?
6. No secrets in diff?

### Execution

```bash
# 1. Tests
npm test

# 2. Lint + types
npm run lint && npm run typecheck

# 3. Diff size check (>500 lines = split)
git diff --stat main

# 4. Full diff review with checklist
git diff main

# 5. Secret scan
git diff main | grep -iE '(api_key|secret|token|password|credential|private_key)' || echo "clean"
```
