---
description: "Use before deploying any code to production or before pushing AI-authored code."
triggers:
  - Before deploying any code to production
  - Before pushing AI-authored code
  - Running a pre-deployment security and quality gate
---

## Pre-Deployment Gate

A complete pre-deployment checklist that merges the LLM Pre-Push Review (5 structural passes) with Vibe Coding Security Hardening (9 security phases) into a single unified gate.

Based on arXiv research identifying systematic LLM failure modes: hallucinated execution traces (2604.19825), Format-Reliability Gap (2604.16697), False Security Confidence (2604.17014), systematic overcorrection (2603.00539), hallucinated reviews (2601.19072).

### Passes 1-5: LLM Pre-Push Review

Run the 5-pass LLM Pre-Push Review first: execution grounding, security surface, contextual correctness, structural quality, integration points. See `llm-pre-push-review` for the full checklist.

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

## References

- `references/gate-checklist.md` — Printable deployment gate checklist with per-pass verification items, threshold tables, and execution order.
