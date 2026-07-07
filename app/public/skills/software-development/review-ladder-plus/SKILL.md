---
description: "Use after completing any non-trivial coding task, before merging code that touches security/auth/data/concurrency, or when upgrading from casual self-review to production-grade QA."
version: 1.0.0
priority: high
tags: [code-review, multi-agent, testing, security, quality-gate, production-ready]
author: GrimoireStack
created: 2026-05-09
triggers:
  - After completing any non-trivial coding task (feature, fix, refactor, migration)
  - Before merging any code that touches security, auth, data, or concurrency
  - Any time you want to upgrade from casual self-review to production-grade QA
  - Security-sensitive code, data mutations, concurrent logic, external API integrations
---

## Core Principles

1. Reviewers **never** write or modify code — only diagnose and recommend.
2. Every issue must be severity-rated and justified with real-world impact.
3. The main agent must provide a concrete counter-example or test to dismiss any Critical/High finding.
4. A dedicated test-generation step ensures findings are backed by verifiable tests.
5. Final submission only happens after all Critical/High issues are resolved or properly justified.
6. A final fresh-context reviewer validates the post-fix diff with no knowledge of prior conversation.

## Workflow

### Phase 1: Main Agent Packages Output

Before invoking reviewers, the main agent packages:

- **Full diff** (or list of modified files with key changes)
- **Original requirements/spec** (what was asked to build)
- **Existing tests** (what already passes)
- **Brief summary** of what was implemented and why

This becomes the input for all reviewers.

### Phase 2: Dual Reviewers (Parallel)

Two reviewers run simultaneously, each with a different focus:

#### Reviewer Alpha — Correctness, Security, Maintainability

Focus areas:
- Logic correctness, off-by-one errors, incorrect edge handling
- Security vulnerabilities (injection, auth bypass, secrets exposure)
- Code that is hard to understand, test, or maintain
- Violations of explicit requirements

#### Reviewer Beta — Performance, Concurrency, Edge Cases

Focus areas:
- Algorithmic complexity, N+1 queries, missing indexes
- Race conditions, deadlocks, improper locking
- Boundary condition failures, overflow, underflow
- Rare input combinations that break the code

Both reviewers use the **identical JSON output format**:

```json
{
  "issues": [
    {
      "id": "ISSUE-001",
      "type": "Correctness | Security | Performance | Concurrency | Maintainability | Edge_Case",
      "severity": "Critical | High | Medium | Low",
      "location": "file:line or function name",
      "description": "What is the problem?",
      "suggested_fix": "Brief recommendation",
      "why_it_matters": "Real-world impact",
      "confidence": 0-100
    }
  ],
  "nits": [
    {
      "id": "NIT-001",
      "description": "Minor style/clarity concern",
      "location": "file:line"
    }
  ],
  "summary": "One-sentence overall risk assessment",
  "no_issues_found": false
}
```

**Rules:**
- Only report issues with clear negative impact.
- Nits are cosmetic — max 3 per review, never blocking.
- If uncertain, state it explicitly; do not manufacture false confidence.
- Assume this code will run in production under adversarial conditions.
- Confidence scores below 70 should be flagged as "speculative — verify before acting."

### Phase 3: Test Generation Reviewer

After dual review, a **Test Engineer** reviewer consumes the issues and generates 3–5 concrete test cases that would have caught each reported problem.

For each test:
- **Test name** — descriptive, follows `test_<what>_<scenario>` convention
- **What it validates** — the specific condition or behavior
- **Expected behavior** — what the code should do
- **Why this test would have caught a reported issue** — explicit linkage to ISSUE-XXX

```json
{
  "tests": [
    {
      "id": "TEST-001",
      "name": "test_auth_token_expiry_before_use",
      "file": "tests/test_auth.py",
      "what_it_validates": "Expired tokens are rejected before use",
      "expected_behavior": "AuthenticationError raised with specific message",
      "would_have_caught": "ISSUE-003 — buffer overread in token parsing"
    }
  ]
}
```

### Phase 4: Explain Why It's Safe Gate

For every **Critical or High** issue the main agent does **not** fix, the main agent must respond in this exact format:

```markdown
### Response to ISSUE-XXX

**Decision:** Reject / Partial Accept / Fix

**Explanation:** [Clear reasoning why this is not a real problem, not impactful, or is already handled]

**Proof:** 
- Counter-example or specific scenario where the code behaves safely
- Test case that demonstrates safety (paste the test)
- Or: "I ran the following test and it passed: ..."
- Execution trace showing safe behavior

**Risk Acceptance:** I accept the remaining risk because... [honest statement of what is surrendered]
```

**Important:**
- "It's a nit" is not a valid dismissal for Critical/High.
- "This would only happen in an edge case" without a proof is not sufficient.
- The gate fails if any Critical/High issue is unaddressed without a passing proof.
- Medium/Low issues may be noted as "accepted technical debt" without formal proof.

### Phase 5: Final Fresh-Context Reviewer (Recommended)

A brand-new agent receives only:
- The **post-fix diff**
- The **original requirements/spec**
- The **Explain Why It's Safe** justifications (if any)

It does **not** receive the prior review conversation. This prevents anchoring on earlier issues and catches problems that survived the fix process.

Output format:
```json
{
  "remaining_issues": [...],
  "cleared_issues": [...],
  "new_issues_found": [...],
  "fresh_summary": "...",
  "submission_ready": true | false
}
```

### Phase 6: Submission Gate

**Submission is only allowed when:**
- All Critical/High issues are either fixed OR have a passing "Explain Why It's Safe" justification.
- The Test Generation Reviewer has produced tests for all reported issues.
- The Final Fresh-Context Reviewer (if used) has cleared the post-fix diff.

If not ready: state exactly what remains, fix it, then re-run the gate.

## Prompt Templates

See `references/prompt-templates.md` for the Reviewer Prompt Template (Alpha & Beta) and Test Generation Prompt Template.

## Severity Definitions

| Severity | Definition | Gate Behavior |
|----------|------------|---------------|
| **Critical** | Data loss, security breach, crash, or irreversible harm | Must be fixed or have a passing proof |
| **High** | Incorrect behavior that is hard to detect, could cause customer-facing bugs | Must be fixed or have a passing proof |
| **Medium** | Noticeable quality issue, correctable with refactor | Fix or document as accepted debt |
| **Low** | Minor quality concern, cosmetic | Optional — document if desired |

## Audit Trail

Each issue must have a recorded outcome:
- `FIXED` — main agent patched the code
- `REJECTED` — main agent provided passing proof
- `PARTIAL` — main agent partially fixed, provided partial proof
- `DEBT` — filed as accepted technical debt (Medium/Low only)

Keep this log as a comment in the diff or in a `review-log.jsonl` file alongside the code.

## Anti-Patterns This Skill Prevents

| Anti-Pattern | What This Skill Does |
|--------------|---------------------|
| Reviewer writes code "to show the fix" | Reviewers diagnose only — no code writing |
| Main agent dismisses issues as "nitpicky" | Critical/High requires formal proof to dismiss |
| Tests are added after the fact as an afterthought | Test Generation is a mandatory phase |
| Reviewer anchors on prior issues | Fresh-Context Reviewer sees only diff + spec |
| "Looks fine to me" self-review | Dual reviewers force perspective diversity |
| Edge cases deemed "theoretically impossible" | Beta reviewer explicitly hunts boundary conditions |

## Related Skills

- `llm-pre-push-review` — pre-push checklist based on LLM coding failure research
- `pre-deployment-gate` — full pre-deploy security and quality checklist
- `verified-synthesize` — formal verification with Dafny for correctness-critical code
- `security-review-protocol` — STRIDE-based security review
- `vibe-coding-security-hardening` — OWASP vulnerability hardening for AI-generated code
- `debug-to-fix-pipeline` — systematic debugging when issues are found
