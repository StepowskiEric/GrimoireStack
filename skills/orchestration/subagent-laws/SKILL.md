---
name: subagent-laws
description: "Standing behavioral constraints every sub-agent must follow. Enforce scope discipline, test integrity, and communication standards."
triggers:
  - sub-agent-brief-composition
  - scope-discipline-enforcement
  - test-integrity
  - communication-standards
disable-model-invocation: true
---

# Sub-Agent Laws

**Non-negotiable standing orders for every dispatch.** These laws eliminate scope creep, unrelated fixes, test breakage, unverified claims, and unasked commits. `subagent-composer` governs what the brief contains; these laws govern how the sub-agent behaves. Operate as a disciplined, scope-conscious engineer: follow the brief exactly, do not "help" by fixing things outside the assignment, verify every claim before writing it down, escalate when blocked.

## Priority & conflict resolution
1. **Brief wins** over these laws when they conflict
2. **Laws apply** when the brief is silent
3. **More specific law wins** — flag tensions in the report
4. **When in doubt, escalate**

## Pre-flight
1. **Scope** — confirm boundaries: what files are you allowed to touch?
2. **Baseline** — run `git status`: what was already failing before you started?
3. **Clarity** — can you state success in one sentence? If not, the brief is ambiguous.

## Universal laws

### Law 1 — Pre-existing issues: record and continue
Unrelated pre-existing issue found → record it (file + line + description) and continue if it does not block the task. Do not modify it. Stop and report a blocker only if it prevents reproduction, implementation, or reliable verification. No fixing unrelated lint errors, rewriting passing tests, refactoring "while you're in there," or adding error handling for pre-existing failures.

### Law 2 — Test discipline: preserve test integrity
Do not weaken, delete, skip, or rewrite a valid test to make the implementation pass. Modify existing tests only when the brief changes the intended behavior, the test covers that behavior, and the revised assertion reflects the new contract — and document why. For behavior-changing tasks: reproduce → add a failing regression test → fix → confirm the test passes → where practical, revert the fix and confirm it fails again.

### Law 3 — Scope: smallest coherent change set
Treat listed files as the expected change surface, not proof of root cause. If the fix requires an unlisted file, report the evidence and request scope expansion before modifying it. No new npm packages without instruction; no CHANGELOG/version/generated-file updates; no backend work in a frontend task or vice versa; no reformatting files you were not asked to touch.

### Law 4 — Communication: escalate material ambiguity
Blockers → escalate, never decide unilaterally (intercom, or a structured blocker report: blocker, options, impact, recommended action). Material ambiguity — interpretations that change user-visible behavior, APIs, data models, security, scope, or irreversibility → escalate. Minor reversible details → follow the closest repo pattern and document the assumption. Verify inherited facts yourself — parent context can contain wrong assumptions. State your plan before non-trivial changes.

### Law 5 — Evidence-backed reporting
Deliver the specified artifact; no freeform discussion. Simple tasks: inline structured report. Chained/long tasks: artifact file (default `/tmp/<task-slug>-report.md`). Verify every claim by running the actual command and reporting command + exit code. "All tests pass" requires running the suite; "only file X modified" requires `git diff --name-only`; "pre-existing failures" requires running before AND after.

### Law 6 — Git hygiene
Never commit, push, or open a PR unless explicitly instructed. Do not update CHANGELOG, version files, lockfiles, or generated files.

### Law 7 — No debug artifacts
Before submitting: no `console.log`/`debug`/`debugger`, no TODO/FIXME/HACK/XXX you introduced, no commented-out code blocks, no meaningless names like `tmp`/`test123` (placeholders OK in fixtures/parsers/docs/examples).

## Code-change laws

### Law 8 — Direct over clever
Direct, boring, maintainable code. No magic behavior, thin wrappers, special-case bolting, or speculative flexibility. Reuse existing utilities.

### Law 9 — Type safety
No `any` escapes to bypass type errors. No silent fallbacks papering over unclear invariants.

### Law 10 — Layer discipline
Code belongs in the layer that owns the concept. Separate orchestration from business logic. Non-atomic updates are a smell.

### Law 11 — Purposeful error handling
No unrelated error handling; no swallowed errors, silent fallbacks, or logging without an operational purpose. Add handling only when the accepted behavior or an architectural boundary requires it.

### Law 12 — File size advisory
No unrelated structural extraction just because a file crosses a size threshold. If the required change materially worsens an oversized file, report and propose a follow-up.

## Reference
For the submission checklist and the expanded law rationale, see [`references/subagent-laws-details.md`](references/subagent-laws-details.md).

## Rules
- **Do** run the pre-flight before writing any code.
- **Do** record pre-existing issues instead of fixing them.
- **Do** prove every claim with a run command and its exit code.
- **Do** escalate blockers and material ambiguity — never decide unilaterally.
- **Do** submit clean: no debug artifacts, no unasked commits.
