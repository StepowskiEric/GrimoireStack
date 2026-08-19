# Sub-Agent Composer — Reference Details

## Anti-Patterns

These brief patterns reliably produce bad sub-agent output.

### The "Figure It Out" Brief
> "Look at the codebase and fix the auth bug."

Problem: The sub-agent has no idea which file, which function, or which kind of bug.
Fix: Point to the file, the function, and the specific symptom.

### The "Everything but the Kitchen Sink" Brief
> Paste the entire codebase README plus 10 other files into the brief.

Problem: Context overload. The sub-agent can't distinguish signal from noise and will fixate
on the wrong details.
Fix: Include only what the sub-agent actually needs. Use `reads` for larger files. If the task
is "fix the login form", include the login form file and its tests — not the entire auth module
documentation.

### The "Vague Success Criteria" Brief
> "Make it better."

Problem: The sub-agent doesn't know when to stop or what "better" means.
Fix: Define specific, testable criteria. "Reduce bundle size by 20% without breaking tests"
is testable. "Make it better" is not.

### The "No Boundaries" Brief
> "Refactor the auth module."

Problem: The sub-agent will refactor auth, the login form, the session store, the API client,
and probably the tests — because nothing told it where to stop.
Fix: Include an explicit Boundaries section. "This is scoped to SessionManager.ts only.
Do not modify the login form, navigation, or API client."

### The "Skill Mismatch" Brief
> Loading only `tdd` for a task that requires `security-threat-modeling`.

Problem: The sub-agent writes tests-first code that is also insecure.
Fix: Use the task-to-skill mapping. When the task involves auth, data, or storage, load
`security-threat-modeling`. When it involves complex domain logic, load `domain-driven-design`.

### The "Assume They Know" Brief
> "Follow the existing patterns."

Problem: The sub-agent doesn't know which patterns you consider "existing" or which ones
you want it to follow vs. ignore.
Fix: Name the specific file or pattern. "Follow the error handling pattern in
TokenService.ts — specifically the catch block at line 42."

### The "Goldilocks" Brief
> Dictate every line of code, every variable name, every import order.

Problem: The sub-agent has no room to exercise judgment and will produce mechanical, rigid code
that doesn't adapt to edge cases it discovers mid-implementation.
Fix: Specify the *what* and *why*, let the sub-agent choose the *how*. Give it the destination,
not the turn-by-turn directions.

### The "Moving Target" Brief
> Send follow-up messages that quietly change requirements after the sub-agent has started.

Problem: The sub-agent built against one set of requirements and is now executing against
another. It either ignores the change (wrong output) or restarts from scratch (wasted work).
Fix: Freeze requirements once dispatched. If requirements change, dispatch a *new* task to
the same or a different sub-agent — don't mutate the existing one.

### The "Rewrite" Brief
> "Refactor this to use the new pattern."

Problem: The sub-agent doesn't know what "new" means, what the target pattern looks like, or
what the existing pattern is.
Fix: Include a before/after snippet or point to the reference implementation. "Refactor the
error handling in SessionManager.ts to match the pattern in TokenService.ts (see handleRefresh
at line 30 — try/catch with logged retry)."

### The "Context Anchor" Brief
> Dump the parent's entire reasoning chain into the brief, including wrong guesses and abandoned
approaches.

Problem: The sub-agent inherits the parent's anchoring assumptions — including the ones that
were wrong. It wastes time re-exploring dead ends the parent already ruled out.
Fix: Strip parent reasoning. Include only confirmed facts, accepted decisions, and the current
state. "We tried approach X and ruled it out because [concrete reason]" is fine.
"Then I thought maybe it could be Y or Z..." is noise.

### The "Fix Everything" Brief
> "Fix the auth bug." — and the sub-agent proceeds to fix lint errors in 6 other files, rewrite
> failing tests it didn't break, and refactor a neighboring module "while it's in there."

Problem: The sub-agent treats every visible imperfection as part of its mandate. Pre-existing
lint noise, unrelated failing tests, and code that was already fine all become "problems to fix."
The scope explodes and the actual task gets lost in a pile of side quests.
Fix: Name the exact file(s) and line range(s). State explicitly: "Do NOT fix lint errors,
failing tests, or code quality issues in other files — note them and stop." Add a pre-existing
issues handler instruction: "If you find failing tests that predate your change, confirm they
were already failing before you started. If so, report them and move on."

### The "Fixer" Anti-Pattern — Pre-existing Issues
Sub-agents will often encounter pre-existing failures in the codebase: lint errors in nearby
files, tests that were already red before the change, or code smells in related modules. The
natural instinct is to "fix" them. **Do not let them.**

A sub-agent assigned to modify one file should:
- **NOT** fix lint errors in other files
- **NOT** rewrite tests that were already passing before the change
- **NOT** refactor neighboring code "while it's in there"
- **NOT** add error handling for failures that existed before the change

Instead, the sub-agent should:
1. Note any pre-existing issues found in the output report
2. Confirm whether each issue existed before their change (git diff / git status check)
3. Focus exclusively on the assigned task

Include this guard in every brief:
```
Pre-existing issues: If you encounter lint errors, failing tests, or code quality issues in
files outside your assigned scope, note them in your output and stop. Do not fix them unless
explicitly instructed. Your scope is [file-or-module-name] only.
```

### The "No Persona" Anti-Pattern
> Dispatch a sub-agent to "review this PR" without telling it *who* it should be.

Problem: The sub-agent defaults to a generic, neutral tone — missing the adversarial sharpness
of a security reviewer, the practicality of a senior engineer, or the fresh perspective of a
newcomer.
Fix: Always assign a persona. "You are a security engineer reviewing auth code. You assume
every input is malicious until proven otherwise."

### The "No Post-Delegation Check" Anti-Pattern
> Dispatch, receive "Done", and merge.

Problem: Sub-agents routinely claim "all tests pass" or "lint is clean" when they haven't
actually run the commands, or when they ran them on a stale state.
Fix: Always run your own verification after the sub-agent returns (see Part 10).

### The "Cheapest Agent" Anti-Pattern
> Use the cheapest / fastest model for every sub-agent dispatch.

Problem: Complex reasoning tasks (bug diagnosis, security review, architecture design) need
stronger models. Using a weak model for a hard task produces wrong output that costs more
to fix than using the right model in the first place.
Fix: Match model capability to task complexity. Spend tokens on the sub-agent, save tokens
on the brief compression (see Part 9).

---

---

## Updated Examples

### Example 1: Fix a Bug (high-context brief)

```
Goal: Fix the session timeout bug so expired tokens trigger a retry instead of crashing.

Skills loaded:
- tdd — write tests first, then implement
- subagent-laws — non-negotiable rules: don't fix pre-existing issues outside scope, don't break passing tests
- root-cause-analysis — trace the actual cause, not the symptom
- diagnose — structured reproduction → minimise → hypothesise loop

Persona: You are a senior platform engineer who has owned this auth module for 3 years.
         You value correctness over speed and always write the regression test first.

Why: Users lose their work when the token silently expires. This is the #1 support complaint
     this week and blocks the Q2 retention goal.

Context you need:
- src/auth/SessionManager.ts — the buggy file [pre-loaded via reads]
- src/auth/TokenService.ts — the retry pattern to follow (see handleRefresh at line 30) [pre-loaded via reads]
- src/auth/types.ts — Session and Token types
- Current behavior: token refresh fires at 54 minutes, on failure the app navigates to /login
  instead of retrying once

Your task:
1. Write a failing test that reproduces: expired token + failed refresh = navigation instead of retry
2. Find the error path in SessionManager.ts (around line 89)
3. Add one retry attempt before navigating to /login
4. Make the test pass
5. Run the full auth test suite

Success criteria:
- [ ] Failing test reproduces the bug (run 3 times, fails each time)
- [ ] Only SessionManager.ts is modified (git diff confirms)
- [ ] All auth tests pass: npm test -- --filter auth
- [ ] No new console.log / console.error
- [ ] Lint passes: npm run lint

Rules:
- Follow the error boundary pattern in TokenService.ts — do not add new try/catch blocks
- Use the existing logger at src/utils/logger.ts — do not import console
- All public functions must have JSDoc comments
- Do not modify test setup files or test utilities

Boundaries:
- Scoped to SessionManager.ts only
- Do NOT: modify the login form, change the token refresh interval, touch the backend API,
  update CHANGELOG.md, or modify package.json
- Pre-existing issues: if you find lint errors or failing tests in other files, note them
  and stop — do not fix them

Output format:
- Write a 3-paragraph summary to /tmp/auth-fix-report.md: root cause, files changed, verification results
- Do NOT commit or open a PR

Stop rules:
- Stop after all success criteria are met
- Do not add extra refactoring or "improvements" beyond what is specified
- If you hit a blocker requiring a decision not covered here, use intercom to escalate — do not decide unilaterally
```

### Example 2: Implement a Feature (high-context brief)

```
Goal: Add a team invitation endpoint that accepts an email and team ID, creates a pending
      membership, and sends a notification email.

Skills loaded:
- tdd — write tests first, then implement
- subagent-laws — non-negotiable rules: don't fix pre-existing issues outside scope
- api-design-backward-compatibility — endpoint contract design
- security-threat-modeling — authorization and input validation
- domain-driven-design — the invitation domain has its own lifecycle worth modelling

Persona: You are a backend engineer building API endpoints for a B2B SaaS product.
         You design for extensibility and always validate inputs at the boundary.

Why: The enterprise plan requires team-level collaboration. This endpoint unblocks the sales
     team's largest prospect (closing in 10 days).

Context you need:
- src/api/routes/teams.ts — existing team routes, follow the same pattern [reads]
- src/api/middleware/auth.ts — auth middleware, all routes require authentication [reads]
- src/db/schema.ts — teams, members, and invitations tables [reads]
- src/services/email.ts — email sending utility [reads]
- src/types/team.ts — Team, Member, Invitation types [reads]
- Related: src/api/routes/invitations.ts exists but only handles viewing, not creating

Current state:
- POST /api/teams/:id/invitations does not exist
- Email service is configured with Resend, usage in src/services/email.ts
- The invitations table already exists with fields: id, email, teamId, invitedBy, status, expiresAt

Your task:
1. Add POST /api/teams/:id/invitations route
2. Validate: authenticated user is team admin, email is valid, team exists
3. Create pending invitation record in the database
4. Send invitation email via src/services/email.ts
5. Return 201 with invitation details
6. Write tests: happy path, unauthorized, non-admin, invalid email, team not found

Success criteria:
- [ ] POST /api/teams/:id/invitations returns 201 with correct shape on happy path
- [ ] Returns 401 when unauthenticated, 403 when non-admin, 400 on invalid email
- [ ] Invitation email is sent (verify via test mock of email service)
- [ ] All tests pass: npm test -- --filter invitations
- [ ] No new console statements
- [ ] Lint passes

Rules:
- All routes use the auth middleware pattern from auth.ts
- Email content must match the style in src/templates/emails/ (subject line, body template)
- Return errors in the standard shape: { error: string, code: string }
- All public functions must have JSDoc comments
- Do not add new npm packages without discussing first (this task has no external deps)

Boundaries:
- Scoped to the invitations endpoint and its tests
- Do NOT: modify existing team routes, change the invitations table schema, implement
  invitation acceptance flow (that's a separate task), modify email templates beyond the
  invitation content, touch frontend code
- Pre-existing issues: if you encounter lint errors or failing tests in other files, note
  them and stop — do not fix them

Output format:
- Modified files: src/api/routes/teams.ts, src/api/__tests__/teams.test.ts
- New files: none required (extend existing route file)
- Write a summary to /tmp/invitations-feature-report.md: endpoint shape, test coverage,
  any design decisions made

Stop rules:
- Stop after all success criteria are met
- Do not implement the invitation acceptance flow or token-based acceptance link
- If the invitations table schema is insufficient, stop and report — do not add columns
```

---

---

## Cost & Budget Awareness

Every sub-agent dispatch has a cost in tokens, latency, and verification effort. Be deliberate:

### Token Budget

| Context Level | Brief size | Working memory left for sub-agent | Best for |
|--------------|------------|-----------------------------------|----------|
| Minimal | ~100 words | ~95% of context window | Mechanical tasks, simple edits |
| Standard | ~300-500 words | ~80-90% | Typical implementations |
| Comprehensive | ~500-1000 words + reads | ~60-75% | Complex work needing full context |

**Keep briefs under ~800 words for complex tasks.** A compressed brief leaves the sub-agent
more working memory for reasoning. Use `reads` for any file >100 lines.

### Model Selection

| Task type | Recommended model tier | Rationale |
|-----------|----------------------|-----------|
| Simple mechanical (rename, format, lint) | Fast/cheap model | Low judgment needed |
| Bug diagnosis, security review, architecture | Strongest available | High reasoning load |
| Code generation with clear spec | Mid-tier | TDD guards most errors |
| Adversarial review / fresh perspective | Strongest + `context: "fresh"` | Independence matters |

**Rule of thumb:** Spend tokens on the sub-agent's reasoning (stronger model), save tokens
on brief compression (shorter brief + `reads`). Don't use a cheap model for a hard task —
the cost of fixing wrong output exceeds the model savings.

### Parallel Dispatch Cost

| Agents | Total token cost | Coordination overhead | Best for |
|--------|-----------------|----------------------|----------|
| 1 | Lowest | None | Self-contained tasks |
| 2-3 | Moderate | Low | Cleanly separable modules |
| 4-6 | High | Moderate | Large features with clear boundaries |
| 7+ | Very high | High | Rarely worth it; prefer chaining |

Keep parallel agents to ≤4 unless the modules are truly independent with no shared state.

---

---

## Post-Delegation Verification

After the sub-agent returns, the parent must verify the output before integrating it.
The sub-agent says "done" — you confirm.

### Verification Checklist

Run these checks in order. Stop at the first failure.

```
[ ] 1. Output artifact exists at the specified path
[ ] 2. All modified files exist (git status / ls confirms)
[ ] 3. Tests pass (run the test command yourself — don't trust the sub-agent's report)
[ ] 4. Only specified files were modified (git diff --name-only confirms scope discipline)
[ ] 5. No new console.log / debug statements (grep for these)
[ ] 6. Lint passes (run the linter yourself)
[ ] 7. Type-check passes (run tsc or equivalent)
[ ] 8. The sub-agent did not modify files outside its boundaries
[ ] 9. Pre-existing issues were noted, not fixed (if any were reported)
[ ] 10. Success criteria are actually met (re-check each one)
```

### Common Sub-Agent Deceptions

Sub-agents don't *intend* to deceive, but they reliably produce these patterns:

| They say | Reality | Verification |
|----------|---------|--------------|
| "All tests pass" | Tests weren't run, or ran against stale state | Run tests yourself |
| "Only file X was modified" | Files Y and Z also changed | `git diff --name-only` |
| "Lint is clean" | Linter wasn't installed/configured | Run the linter yourself |
| "I followed the pattern" | New code doesn't match existing style | Read the diff |
| "I noted the pre-existing issues" | Issues weren't actually checked | Check original state yourself |

### Integration Decision

After verification, choose one of:

| Outcome | Action |
|---------|--------|
| **All checks pass** | Integrate the output (commit, PR, or merge as appropriate) |
| **Minor issues found** | Fix them yourself (if quick) or re-delegate with specific correction brief |
| **Major issues found** | Re-delegate with a correction brief that names each failure specifically. Do NOT re-send the original brief — the sub-agent will repeat the same mistakes. |
| **Output is wrong or harmful** | Discard the output. Re-delegate with a stronger model, a tighter brief, or do the work yourself. |

### When to Re-Delegate vs. Fix Yourself

- **1-2 small issues** in an otherwise correct output: fix yourself (cheaper than another dispatch)
- **3+ issues** or **one systematic error**: re-delegate with a targeted correction brief
- **Fundamental approach is wrong**: discard, reconsider the brief, and re-delegate with a fresh approach or different persona

### Correction Brief Template

```
## Goal
Fix the issues in the previous implementation at [path].

## Previous Issues (identified by parent)
1. [Issue 1: specific and concrete]
2. [Issue 2: specific and concrete]

## Your Task
1. [Focused fix for issue 1]
2. [Focused fix for issue 2]
3. Run the full test suite and confirm all pass

## Success Criteria
- [ ] Issue 1 is resolved: [verification]
- [ ] Issue 2 is resolved: [verification]
- [ ] No new files were modified beyond fixing the issues
- [ ] All tests pass

## Boundaries
- Do NOT refactor, improve, or add features
- Do NOT touch files unrelated to the listed issues
- Pre-existing issues rule still applies: don't fix what wasn't broken by your change

## Stop Rules
Stop after the listed issues are fixed and tests pass.
```

---

---

