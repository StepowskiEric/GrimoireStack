---
name: vibe-coding-security-hardening
description: "Hardening checklist for vulnerabilities LLMs reliably introduce: exposed secrets, missing RLS, broken auth, injection flaws, insecure defaults."
triggers:
  - pre-deploy-hardening
  - vibe-code-review
  - owasp-checklist
  - secret-scan
---

# Vibe Coding Security Hardening

**AI coding tools optimize for functionality, not security** — studies consistently show 45%+ of AI-generated code contains OWASP Top 10 vulnerabilities, at 1.5–2.74× the rate of human-written code. Run this before deploying any AI-generated app: triage first, harden through the ten phases, scan automatically, verify adversarially, then sign off.

## When to Apply
- Before deploying any AI-generated app to production
- After importing AI-generated code into an existing codebase
- Before exposing an app to public users, payment processing, or sensitive data
- When onboarding an AI-built MVP to a real engineering team
- During review of any app built with Bolt, Lovable, v0.dev, Cursor, Replit, Copilot, or similar

## The Move

### 1. Triage — 5 minutes, non-negotiable
Check: no API keys/passwords/tokens in source; no `.env` committed to git; database access controls enabled (RLS/auth rules); no publicly accessible admin interfaces; no exposed debug/test endpoints. **Any fail → do not deploy.**

### 2. Harden — run the ten phases
Work through the phases in order, each with a full checklist (in Reference):
1. **Secrets** — env vars only, nothing client-visible, rotate leaked keys
2. **Database** — RLS on every table, per-user policies, least-privilege roles
3. **Auth** — server-side validation, token expiry, rate limits, IDOR checks
4. **Input** — parameterized queries, no eval, sanitize uploads and rendered HTML
5. **API** — explicit CORS, security headers, rate limits, webhook signature verification
6. **Infra** — HTTPS enforced, no public admin panels, environment-separated keys
7. **Deps** — `npm audit`/`pip audit` clean, lockfiles committed, no typosquats
8. **Logs** — auth events logged, sensitive data never logged, errors sanitized
9. **AI-specific** — prompt-injection sanitization, least-privilege MCP, cost rate limits

### 3. Scan — automate before deploy
Add to CI/CD: secret scan (gitleaks), SAST (semgrep, owasp-top-ten config), dependency scan (`npm audit`). Minimum viable local scan: `gitleaks detect --source . --verbose && npm audit && npx semgrep --config=auto --error`. Pipeline template in Reference.

### 4. Verify adversarially
Prove the controls, don't assume them:
- Access a protected resource logged out → expect 401, not data
- Access another user's resource with your token (IDOR test) → expect 403
- If RLS is on, query a table with only the anon key → expect no data
- Trigger a webhook with a bad signature → expect rejection

### 5. Sign off
Every check passes, or the risk is explicitly accepted with an owner and a date. "It's just an MVP" and "I'll fix it later" are acceptance decisions, not exemptions.

## Reference
For the full per-phase checklists with commands and code examples, the CI/CD pipeline template, research context, and real-world incident patterns, see [`references/hardening-details.md`](references/hardening-details.md).

## Rules
- **Do** run Triage before anything else — a failing triage check blocks deployment.
- **Do** verify every control with an adversarial test, not by reading the code.
- **Do** rotate any secret that ever reached source, logs, or an AI prompt.
- **Do** treat "the framework is secure by default" as a claim to verify — AI-generated config overrides defaults.
- **Do** log auth events and alert on failed attempts.
