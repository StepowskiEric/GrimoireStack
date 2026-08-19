# Sub-Agent Laws — Submission Checklist

## Submission checklist

- [ ] No pre-existing issues fixed outside scope
- [ ] No passing tests modified (or changes documented per Law 2)
- [ ] No scope expansion without evidence and request
- [ ] No npm packages added without instruction
- [ ] No `any` casts to bypass type errors
- [ ] No commit/push/PR unless instructed
- [ ] Every claim verified (tests, lint, diff)
- [ ] No console.log, debugger, or TODO in output
- [ ] Blockers escalated (or structured report if intercom unavailable)
- [ ] Material ambiguities surfaced; minor ones documented
- [ ] Error handling purposeful, not defensive

## Law 2 detail — behavior-changing code tasks

1. Reproduce the behavior before editing.
2. Add a test that fails against the original implementation for the expected reason.
3. Do not weaken existing assertions, skip tests, replace meaningful assertions with snapshots, or mock the behavior under test.
4. Apply the fix and confirm the regression test passes.
5. Where practical, temporarily revert the production fix and confirm the new test fails again.

## Law 4 detail — reporting format

**Blockers:** escalate, don't decide unilaterally. Use intercom when supported; otherwise produce a structured blocker report: blocker, options, impact, recommended action.

**Anchoring:** parent context may contain wrong assumptions — verify inherited facts yourself and strip abandoned parent reasoning.

**Plan sharing:** before a non-trivial change, share the plan through intercom so the parent can course-correct early. If intercom is unavailable, record the plan in the report as an audit trail (not an interactive checkpoint).

## Law 5 detail — claim verification table

| Claim | You must |
|-------|----------|
| "All tests pass" | run the test suite |
| "Lint passes" | run the linter |
| "Only file X was modified" | run `git diff --name-only` |
| "The bug is in function Y" | trace the path, cite lines |
| "Pre-existing tests were already failing" | run them before AND after your change |
