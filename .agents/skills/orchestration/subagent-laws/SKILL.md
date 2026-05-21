---
name: subagent-laws
description: "Persistent, opinionated rules every sub-agent must follow regardless of task type. Loaded automatically by subagent-composer alongside task-specific skills. Use when composing sub-agent briefs to enforce scope discipline, test hygiene, code structure, and communication standards."
---

# Sub-Agent Laws — Non-Negotiable Rules Every Sub-Agent Must Follow

## Purpose

This skill defines the non-negotiable laws every sub-agent must follow, regardless
of the task type. It is loaded automatically by `subagent-composer` alongside any task-specific
skills. Treat these as standing orders — they apply to every sub-agent dispatch unless the brief
explicitly overrides a specific rule with justification.

The goal: eliminate the most common sub-agent failure modes that aren't task-specific — scope
creep, fixing unrelated issues, breaking tests that were already passing, and committing
unasked.

---

## 1. Pre-Existing Issues — Do Not Fix Unrelated Failures

The single most common sub-agent failure: seeing a lint error, failing test, or code smell in
a neighboring file and deciding "this is my job now."

**Rule:** If the sub-agent encounters lint errors, failing tests, or code quality issues in
files *outside* their assigned scope, they must:
1. Note them in the output report (file + line + brief description)
2. Stop — do NOT fix them unless explicitly instructed

A sub-agent assigned to fix one file should not:
- Fix lint errors in other files
- Rewrite tests that were already passing before the change
- Refactor neighboring code "while it's in there"
- Add error handling for failures that existed before the change

**Guard to include in every brief:**
```
Pre-existing issues: If you encounter lint errors, failing tests, or code quality issues in
files outside your assigned scope, note them in your output and stop. Do not fix them unless
explicitly instructed. Your scope is [file-or-module-name] only.
```

---

## 2. Test Discipline — Don't Break or Rewrite Passing Tests

**Rule:** Never modify a test that was passing before the sub-agent started. This includes:
- Changing test assertions to make them pass
- Deleting tests that fail after the change
- Rewriting test setup or fixtures to accommodate the change
- "Cleaning up" test files while working in the same area

**Pre-existing failures:** If a test was already failing before the sub-agent started, confirm
this by running it before and after the change. Report it as a pre-existing issue, don't fix it
unless instructed.

**Scope of test changes:** Only modify tests that directly test the changed code. If the task
is "fix the session timeout bug," the sub-agent may write a new test for the bug and modify
tests directly related to session handling — but not tests for the login form, navigation, or
unrelated auth flows.

---

## 3. Scope Boundaries — Stay in Your Assigned Files

**Rule:** Only modify files directly related to the task. The sub-agent must not:
- Expand to neighboring files "while it's in there"
- Add new npm packages without explicit instruction
- Update `CHANGELOG.md`, `package.json` versions, or generated files
- Touch the backend API when assigned frontend work, or vice versa
- Modify shared utilities that other tasks depend on unless the task requires it

**File size guard:** Do not let a file grow past ~1000 lines in a single change. If the diff
would push a file over that threshold, stop and report — suggest extracting a helper,
subcomponent, or module instead.

---

## 4. Code Structure — Prefer Direct Over Clever

**Rule:** Favor direct, boring, maintainable code over clever abstractions.

- **No magic behavior:** Avoid generic mechanisms that hide simple data-shape assumptions.
  Code should be readable without knowing the "trick."
- **No thin wrappers:** Identity wrappers and pass-through helpers that add indirection without
  buying clarity should be deleted, not preserved.
- **No unnecessary complexity:** If a simpler path exists that removes moving pieces, take it.
  Prefer deleting a layer of indirection over polishing it.
- **No special-case bolting:** If the change requires "weird if statements in random places,"
  that's a design problem — push the logic into a dedicated abstraction, helper, state machine,
  policy object, or separate module. Don't tangle an existing path.
- **Canonical helpers only:** Reuse existing canonical utilities/helpers over bespoke one-offs.
  If a helper already exists for this purpose, use it. Don't write a new one.

---

## 5. Type Safety — No Any Casts, No Silent Fallbacks

**Rule:** Maintain explicit type boundaries.

- **No `any` escapes:** Don't add `any` casts to bypass type errors. Fix the underlying issue
  or escalate.
- **No unnecessary optionality:** Question `unknown`, `any`, or cast-heavy code when a clearer
  type boundary could exist.
- **No silent fallbacks:** If a branch relies on silent fallback to paper over an unclear
  invariant, make the boundary explicit instead.
- **Prefer typed models:** Use explicit typed models or shared contracts over loosely-shaped
  ad-hoc objects.

---

## 6. Layer Discipline — Keep Logic in the Right Place

**Rule:** Code belongs in the layer that owns the concept.

- **No layer leaking:** Feature logic should not leak into shared paths. Implementation details
  should not leak through public APIs.
- **No architectural drift:** Push code toward the right package, service, or module instead
  of normalizing drift.
- **Orchestration vs. business logic:** Separate orchestration from business logic. Don't mix
  both in the same function.
- **Non-atomic updates are a smell:** If related updates can leave state half-applied, flag it
  as a design concern. Push for a more atomic structure.

---

## 7. Git Hygiene — Don't Commit or Push Unasked

**Rule:** Never commit, push, or open a PR unless explicitly instructed.

- Don't update `CHANGELOG.md` or version files
- Don't reformat or clean up unrelated files
- Don't modify `node_modules`, lock files, or generated files
- Don't force-push or amend commits you didn't create

---

## 8. Communication — Escalate Blockers, Don't Decide Unilaterally

**Rule:** When the sub-agent hits a decision not covered by the brief, escalate — don't decide
unilaterally.

```
Use intercom when you hit a blocker:
intercom({ action: "ask", to: "<parent-session-name>",
           message: "The invitations table lacks an expiresAt column. Should I add it, or should the expiry be computed?" })
```

The parent session name is available from the task context. If unknown, ask the user directly.

---

## 9. Error Handling — Don't Add What Wasn't There

**Rule:** Don't add `try/catch` blocks to code paths that didn't have them before, unless the
task specifically requires improving error handling.

Adding defensive error handling to a previously unhandled path changes behavior and can mask
bugs. If the task is "add error handling to the payment flow," do that. If the task is "fix
the invoice calculation," don't also add try/catch to the calculation function.

---

## 10. Output Format — Structured Reports Only

**Rule:** Output must be a structured report or the specified deliverable. The sub-agent must
not engage in freeform discussion, ask clarifying questions mid-task, or provide commentary
beyond what the brief specifies.

Unless instructed otherwise, write a brief summary to `/tmp/<task-slug>-report.md` containing:
1. What was done (or what was found, for research tasks)
2. Files changed (git diff --name-only)
3. Any blockers encountered or pre-existing issues noted
4. Verification steps run and their results

Do NOT commit, push, or open a PR unless instructed.

---

## Agent-Guidance Checklist

Before a sub-agent completes, confirm:

- [ ] Did not fix lint errors, failing tests, or code quality issues outside assigned scope
- [ ] Did not modify tests that were passing before the change
- [ ] Did not expand scope to neighboring files or "cleanup" unrelated code
- [ ] Did not add npm packages without explicit instruction
- [ ] Did not update CHANGELOG.md or version files
- [ ] Did not add `any` casts to bypass type errors
- [ ] Did not add try/catch to code paths that didn't have them (unless task required it)
- [ ] Did not commit, push, or open a PR unless explicitly instructed
- [ ] Reported any pre-existing issues found, rather than fixing them
- [ ] Escalated blockers via intercom rather than deciding unilaterally
- [ ] For code changes: output is test-first, addresses loaded skill concerns, does not break passing tests
- [ ] For non-code tasks: output reflects the reasoning frameworks loaded
