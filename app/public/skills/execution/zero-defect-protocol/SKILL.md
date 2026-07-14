---
name: zero-defect-protocol
description: "Mission-critical feature protocol: data contracting, red-team critique, pre-mortem, 3x critique loop, and speculative prototyping before any code is written."
triggers:
  - Mission-critical features where a single bug could cause catastrophic failure
  - Security-critical or financially-critical code
  - Production deployment where correctness is paramount
---

# Zero-Defect Protocol

You are deploying code to a production environment where a single bug, security flaw, or misalignment with user intent could cause catastrophic failure. You cannot assume, cannot guess, cannot skip verification. Your goal is a perfect plan and implementation.

**Governing rule:** If confused, uncertain, or don't know something — STOP. Get more context. Ask. Do NOT fabricate. An incomplete plan with an honest question is infinitely better than a wrong plan built on guessed assumptions.

---

## The 8 Phases

```
PHASE  1: Bound + Clarify       — Read everything. Ask only unanswerable-from-codebase questions.
PHASE  2: Research + Ideate     — Gist the plan. Fill knowledge gaps via web search.
PHASE  3: Data Contract         — Define I/O schemas, state mutations, invariants BEFORE architecture.
PHASE  4: Master Plan + Alts    — Architecture, control flow, tests, failure modes + 2 lightweight alternatives.
PHASE  5: Red Team + Pre-Mortem + 3x Critique — Three attack lenses on the plan.
PHASE  6: Speculative Prototype — Spike the riskiest 10%. Verify before building the rest.
PHASE  7: Implement + Refactor  — Write production code. Refactor for clarity, not behavior.
PHASE  8: Final Validation      — Run all tests. Fix failures. Present final output.
```

---

## Phase 1 — Bound + Clarify

Read every relevant file, dependency, and related code. If the context is large, spawn a sub-agent to summarize the architecture. Map key files, functions, schemas, relationships.

Then ask the user only the questions you cannot answer from the codebase. Group by category (data shape / business logic / edge cases / security). **Wait for answers before proceeding.**

**Done when:** the full landscape is understood and every unanswerable question has a user answer.

---

## Phase 2 — Research + Ideate

Formulate the gist of the plan. Identify knowledge gaps in libraries, APIs, syntax. Web-search to fill them. Record findings concisely.

**Done when:** a one-paragraph gist exists and every knowledge gap has a documented search result.

---

## Phase 3 — Data Contract

**Before designing architecture, define the data.**

| Item | What to define |
|---|---|
| Input schema | exact shape entering the system (types, required vs optional) |
| Output schema | exact shape leaving the system |
| State mutations | how data transforms at each step (before → transform → after) |
| Invariants | absolute truths that must hold before and after execution |

**Linearizing the data flow forces logic to be mathematically sound before a single line of architecture text.**

**Done when:** every input/output/mutation/invariant is stated explicitly, no implicit assumptions remain.

---

## Phase 4 — Master Plan + Alternatives

Draft the primary implementation plan:
- **Architecture** — how the feature fits the existing system
- **Control flow** — Mermaid diagram mapping the logic. *Writing the syntax exposes hidden loops and dead ends.*
- **Test strategy** — unit, integration, edge cases
- **Security + failure modes** — how this could be exploited or break

Then create **2 lightweight alternatives** using fundamentally different architectures. Build a pros/cons matrix on performance / maintainability / safety. **Select the winner with justification** — do not default to the first idea.

**Done when:** one chosen plan exists, alternatives are documented, the choice is justified.

---

## Phase 5 — Red Team + Pre-Mortem + 3x Critique

Three attack lenses applied in sequence, each updating the plan:

### 5a — Red Team

Spawn a sub-agent acting as Senior Principal Engineer whose sole job is to destroy the plan. Feed it the plan and tell it to find: logic flaws, race conditions, security vulnerabilities, missing edge cases. Do not blindly accept feedback, but integrate valid critiques.

### 5b — Pre-Mortem

Imagine 6 months in the future: the feature was implemented exactly as planned but was a complete disaster. Users are furious, the system crashed, the project failed. Write a brief failure retrospective explaining *why* it failed. **Append safeguards to the plan to prevent each specific failure.**

### 5c — 3x Targeted Critique

Three passes, distinct lens each, update the plan after each:

- **Logic & Data Consistency** — does the control flow match the Data Contracts and Invariants from Phase 3? Broken state transitions? Unhandled data types?
- **Malicious Edge Cases** — if someone actively tried to break this, what weird inputs, race conditions, or simultaneous actions would fail it?
- **Occam's Razor / Simplification** — can any part be simplified without losing functionality? Remove a dependency? Combine two steps into one?

**Done when:** all three lenses have been applied, every finding is integrated or explicitly deferred with reasoning.

---

## Phase 6 — Speculative Prototype

Isolate the riskiest or most complex 10% of the winning plan. Write a quick spike of just that part and verify it works as expected.

**This prevents building a perfect house on a broken foundation.**

**Done when:** the riskiest 10% is proven in isolation, with documented findings.

---

## Phase 7 — Implement + Refactor

**Implement:** Write production-ready code from the verified plan. Follow existing codebase conventions strictly.

**Refactor Gate:** Review the generated code. Improve readability, remove redundant logic, ensure variable names match the Data Contracts, verify DRY. **Do not change functionality — only improve engineering quality.**

**Done when:** all plan steps are implemented, refactor gate passed without behavioral change.

---

## Phase 8 — Final Validation

Write the tests defined in Phase 4. Run them. If any fail, debug and fix. Do not present the final output until **all tests pass** and the code matches the Master Plan.

Present the final output in clean, well-structured Markdown.

**Done when:** all tests pass, code matches the plan, final output is presented.

---

## When to Use

- Deploying to production with zero tolerance for failure
- Security-critical or financially-critical features
- Any feature where a bug could cause irreversible harm
- The request is ambiguous or high-stakes

**Do NOT use when:**
- Trivial one-liner change
- You already have an approved spec and just need to execute
- Speed is more important than correctness (acknowledge the trade-off explicitly if so)