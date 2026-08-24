---
name: review-ladder-plus
description: "Multi-agent code review ladder for production-grade QA: security, auth, data, concurrency."
triggers:
  - pre-merge-production-qa
  - security-sensitive-review
  - data-mutation-review
  - concurrency-review
disable-model-invocation: true
---

# Review Ladder Plus

**Production-grade QA is a ladder, not a look.** Casual self-review misses what adversarial review finds: dual reviewers with separate mandates, tests generated from findings, a formal gate for dismissing Critical/High issues, and a fresh-context reviewer with no anchoring on the earlier conversation. Reviewers never write code — they diagnose and recommend; the main agent fixes or proves.

## The Move

### 1. Package the output
Before invoking any reviewer, assemble: the full diff (or modified files with key changes), the original requirements/spec, the existing tests, and a brief summary of what was implemented and why. This package is the input for every reviewer — a half package produces a half review.

### 2. Dual review — parallel, separate mandates
- **Reviewer Alpha** — correctness, security, maintainability: logic errors, injection/auth bypass/secrets, hard-to-understand code, requirement violations
- **Reviewer Beta** — performance, concurrency, edge cases: complexity, N+1 queries, races, deadlocks, boundary failures, rare input combinations

Both use the identical JSON issue format: id, type, severity (Critical/High/Medium/Low), location, description, suggested fix, why-it-matters, confidence. Rules: only report issues with clear negative impact; max 3 nits per review, never blocking; confidence < 70 flagged as speculative — verify before acting; assume the code runs in production under adversarial conditions.

### 3. Generate tests from findings
A Test Engineer reviewer consumes the issues and produces 3–5 concrete tests per reported problem: descriptive name, what it validates, expected behavior, and explicit linkage to the issue it would have caught (`would_have_caught: ISSUE-003`). Tests are a mandatory phase — not an afterthought.

### 4. Explain-why-it's-safe gate — for every unfixed Critical/High
For each Critical/High issue not fixed, respond in the exact format: **Decision** (Reject / Partial Accept / Fix), **Explanation** (why it is not a real problem, not impactful, or already handled), **Proof** (a counter-example, a passing test pasted in, or an execution trace showing safe behavior), and **Risk Acceptance** (honest statement of what is surrendered). "It's a nit" is not a valid dismissal; "this would only happen in an edge case" without proof is not sufficient. Medium/Low issues may be filed as accepted debt.

### 5. Fresh-context review & submission gate
A brand-new agent receives only the post-fix diff, the original spec, and the safety justifications — never the prior review conversation, so it cannot anchor. It reports remaining/cleared/new issues and `submission_ready`. **Submission is allowed only when:** all Critical/High issues are fixed or have passing proofs, tests exist for all reported issues, and the fresh-context reviewer cleared the post-fix diff. Otherwise state exactly what remains, fix it, re-run the gate.

## Reference
For the reviewer and test-generation prompt templates, see [`references/prompt-templates.md`](references/prompt-templates.md). Severity definitions, the audit trail, and related skills are in [`references/review-ladder-details.md`](references/review-ladder-details.md).

## Rules
- **Do** keep reviewers diagnostic-only — a reviewer that writes code cannot review its own fix.
- **Do** require formal proof to dismiss Critical/High — severity-rated issues need severity-rated responses.
- **Do** generate tests for every reported issue before submission.
- **Do** run the fresh-context reviewer — anchoring on prior issues is a real failure mode.
- **Do** record an outcome per issue (FIXED / REJECTED / PARTIAL / DEBT) in the audit trail.
