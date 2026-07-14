---
name: subagent-composer
description: "Compose high-context sub-agent briefs with skill loading, explicit boundaries, success criteria, and stop rules."
triggers:
  - Delegating to sub-agents
  - Need to eliminate first-pass failures from incomplete briefs
  - Need to give sub-agents the right skills and context
---

# Skill: Sub-Agent Composer — High-Context Delegation

## Purpose

Use this skill when delegating work to a sub-agent. Instead of sending a raw task, compose a
brief that gives the sub-agent everything it needs to succeed on the first pass: the right skills,
full context, explicit boundaries, style rules, success criteria, and stop conditions.

The rule: **every sub-agent gets the skills it needs and the context it needs — TDD for code
tasks, plus whatever the task demands.**

A well-composed brief eliminates the most common sub-agent failure modes:
- Writes implementation without tests because nobody specified TDD
- Misses a critical constraint because it wasn't stated
- Produces output in the wrong format because nobody described the target
- Goes off-script because success criteria were vague
- Builds the wrong thing because context was incomplete
- Burns the sub-agent's context window on irrelevant background before it starts working

### TL;DR

All improvements are documented below, but the three rules that prevent 80%+ of failures:

1. **Every brief must have: Task → adjacent Success Criteria → Boundaries → Stop Rules** — in that order, no gaps.
2. **Always load `subagent-laws` + `tdd` for code tasks.** Always assign a **Persona** so the sub-agent knows *who to be*. Always move **Skills Loaded** to the top of the brief (after Goal) so the sub-agent knows what lenses to use before reading instructions.
3. **Verify the output yourself after the sub-agent returns** — run the tests, inspect the diff, check for scope drift. The sub-agent says "pass" — you confirm.

---

## Core Principle

**Context is the single biggest predictor of sub-agent success.**

A sub-agent has no access to your conversation history, your working memory, or the unstated
assumptions you've been carrying. Everything it needs must be in the brief — but *only* what it
needs. Over-contexting is as bad as under-contexting: it wastes the sub-agent's token budget and
drowns the signal.

Good briefs answer:
1. **What** am I asking it to do?
2. **Why** does it matter? (gives the sub-agent judgment when it hits choices you didn't anticipate)
3. **What context** does it need to do it correctly? (files, data, constraints, existing patterns)
4. **What rules** must it follow? (style, boundaries, anti-patterns)
5. **What does success look like?** (criteria, format, completion signal)
6. **What should it avoid?** (scope boundaries, known anti-patterns, explicit exclusions)

---

## Delegation Decision Tree

Before composing any brief, decide whether to delegate at all. The cost of dispatching a
sub-agent (context load, coordination, verification) can easily exceed the cost of doing the
work yourself. Use this table:

| Task scope | Do it yourself | Delegate |
|---|---|---|
| **1-2 files, well-understood patterns** | ✅ Faster and cheaper | ❌ Overhead exceeds benefit |
| **3+ files, clear module boundaries** | ❌ Too much context to hold | ✅ Sub-agent isolates cleanly |
| **Needs fresh perspective / adversarial review** | ❌ You're biased by prior work | ✅ Use `context: "fresh"` |
| **High-risk (financial, auth, data loss potential)** | ❌ Expensive to get wrong | ✅ But add a **review gate** after delegation |
| **Repetitive / mechanical (rename, lint, format)** | ❌ Low judgment needed | ✅ Sub-agent handles bulk |
| **Exploratory / research (no fixed answer)** | ❌ Let sub-agent iterate | ✅ Use **iterative delegation** with checkpoints |

**Rule of thumb**: If the task is in one module and fits in your working memory, do it yourself.
If it crosses module boundaries or needs a specific expertise lens you don't currently hold,
delegate.

---

## Part 1: Skill Selection

Before writing the brief, choose the right skills.

### Skill Selection

Use the task-to-skill mapping below. **When in doubt**: add one more skill than you think is
needed. The cost of an extra loaded skill is negligible. The cost of a sub-agent missing a
critical reasoning framework is a full rewrite cycle.

| Task Type | Always | Also Include |
|-----------|--------|-------------|
| **Fix a bug** | `tdd`, `subagent-laws` | `root-cause-analysis`, `diagnose`, `systematic-debugging` |
| **Implement a feature** (new code) | `tdd`, `subagent-laws` | `api-design-backward-compatibility` (if API), `security-threat-modeling` (if auth/data/storage), `domain-driven-design` (if complex domain logic) |
| **Refactor code** | `tdd`, `subagent-laws` | `refactoring-state-machine`, `working-effectively-with-legacy-code`, `philosophy-of-software-design` |
| **Design architecture** | `subagent-laws` | `domain-driven-design`, `thinking-in-systems`, `designing-data-intensive-applications` |
| **Code review** | `tdd`, `subagent-laws` | `code-review-excellence`, `super-review-typescript`, `security-threat-modeling`, `llm-pre-push-review` |
| **Performance optimization** | `tdd`, `subagent-laws` | `the-goal-theory-of-constraints`, `python-performance-optimization` (if Python) |
| **Security audit / hardening** | `tdd`, `subagent-laws` | `security-threat-modeling`, `vibe-coding-security-hardening`, `unsafe-control-actions-hazard-analysis` |
| **Write documentation** | `subagent-laws` | `documentation-craft`, `feynman-technique`, `mece-pyramid-principle` |
| **Plan / estimate** | `subagent-laws` | `pre-mortem`, `second-order-thinking`, `reference-class-forecasting`, `inversion-mental-model` |
| **Research / explore** | `subagent-laws` | `research`, `verify-before-integrate`, `first-principles` |
| **Data modeling / schema** | `tdd`, `subagent-laws` | `domain-driven-design`, `api-design-backward-compatibility`, `designing-data-intensive-applications` |
| **Decision / proposal** | `subagent-laws` | `steelmanning`, `advocatus-diaboli`, `second-order-thinking`, `pre-mortem` |
| **Debug a test failure** | `tdd`, `subagent-laws` | `purify-test-output`, `simulate-instrumentation`, `bisect-debugging` |

---

## Part 2: The Complete Sub-Agent Brief

A high-context brief has these sections, in this order:

```
## Goal
<one-sentence description of what the sub-agent must produce>

## Skills Loaded
<list of skills loaded and why — placed early so the sub-agent knows what lenses to use>

## Persona
<who the sub-agent should be — role, expertise, perspective>

## Why This Matters
<what problem this solves and what would break if it fails — gives the sub-agent judgment>

## Context You Need
<everything the sub-agent needs to understand the current state>

## Your Task
<step-by-step instructions for what to do>

## Success Criteria
<how to know the job is done correctly — specific, measurable, testable>

## Rules to Follow
<non-negotiable constraints, style requirements, quality standards>

## Boundaries
<what this task does NOT include — explicit exclusions prevent scope creep>

## Output Format
<exact shape the output must take — file structure, file names, format>

## Stop Rules
<when to stop — "stop after 3 iterations", "stop if X fails", "stop if you hit Y constraint">
```

**Key placement rules:**
- **Skills Loaded** is placed right after Goal — the sub-agent must know what reasoning frameworks
  it's expected to use *before* it reads the detailed instructions.
- **Success Criteria** is placed immediately after Task — the "what to do" and "how to know it's
  done" are adjacent, not separated by intervening sections.
- **Persona** sits between Skills Loaded and Why This Matters — the sub-agent knows its lenses
  and its identity before learning the stakes.

### Section-by-Section Guidance

#### Goal
One sentence. The sub-agent should be able to read just this and know what it's building.

```
✅ Good: "Fix the session timeout bug in the auth module so expired tokens don't crash the app."
❌ Bad:  "Fix the auth bug."
```

#### Skills Loaded (moved to top)
List every skill loaded in the `skill` parameter, with a one-line explanation of why it's
relevant. This is the first thing the sub-agent sees after the goal — it establishes the
reasoning frameworks that will govern the work.

```
✅ Good:
Skills loaded:
- tdd — write tests first, then implement
- subagent-laws — non-negotiable rules: don't fix pre-existing issues outside scope, don't break passing tests
- root-cause-analysis — trace the actual cause, not the symptom
- diagnose — structured reproduction → minimise → hypothesise loop

❌ Bad: (omitting this section or burying it at the bottom)
```

#### Persona (new)
Tell the sub-agent who it should be. Role assignment is one of the highest-leverage
patterns in LLM delegation: it primes the model to activate the right knowledge and
tone for the task.

```
✅ Good: "You are a senior platform engineer who has owned this auth module for 3 years.
          You value correctness over speed and always write the regression test first."

✅ Good: "You are a freshly onboarded junior developer seeing this code for the first time.
          You follow instructions literally and never make assumptions about intent."

✅ Good: "You are a security engineer performing a threat model review. You assume every
          input is malicious until proven otherwise."
```

**When to use which persona:**
- **Senior expert** — for bug fixes, refactoring, and implementation where judgment matters
- **Junior / literalist** — for mechanical tasks where you need exact compliance, no creativity
- **Security reviewer** — for audits, threat modeling, and any code handling auth / data / storage
- **Fresh eyes** — for code review and UX critique, where anchoring to prior assumptions hurts

#### Why This Matters
Explain the stakes in one sentence. This gives the sub-agent *judgment* when it encounters
choices you didn't anticipate. A sub-agent that understands why a constraint exists can make
the right call without asking.

```
✅ Good: "Users lose their work when the token silently expires. This is the #1 support complaint
          this week."
❌ Bad:  "This is important."
```

#### Context You Need
The most important section. Include:
- **Relevant files and their paths** — don't make the sub-agent guess
- **Existing patterns it should follow** — point to analogous code that shows the expected style
- **Known constraints** — "the backend is Rails", "we can't use external packages", "the API is read-only"
- **Data shapes it will work with** — schema excerpts, type definitions, sample payloads
- **What's already been tried** — prevents re-running failed approaches
- **Stakeholders or consumers** — "the frontend team is blocked on this"

**Compression rule:** For files under ~100 lines, inline key excerpts. For larger files, use
the `reads` parameter to pre-load them — this keeps the task field focused on instructions:

```python
subagent({
    reads: ['src/auth/SessionManager.ts', 'src/auth/TokenService.ts'],
    task: "## Context You Need\nSessionManager.ts and TokenService.ts are pre-loaded above..."
})
```

Longer context dumps (data schemas, existing pattern catalogs) belong in a scratchpad file
referenced by path, not inline in the task field.

```
✅ Good:
Relevant files:
- src/auth/SessionManager.ts — the file with the bug
- src/auth/TokenService.ts — the retry pattern to follow (see handleRefresh at line 30)
- src/auth/types.ts — Session and Token types

Current state:
- Token refresh fires at 54 minutes (55-minute expiry)
- The bug: on refresh failure, the app navigates to /login instead of retrying once
- Last commit: abc1234 — moved token logic from App.tsx to SessionManager

Data shape:
- Session: { userId: string, token: string, expiresAt: number }
- The expiresAt field is in milliseconds since epoch
```

❌ Bad: "Look at the auth files and fix the bug."
```

#### Your Task
Step-by-step instructions. If the work has a natural order, describe it. If there are choices
to make, say how to choose. If some steps depend on others, say so.

```
✅ Good:
1. Write a failing test that reproduces the bug: expired token + failed refresh = navigation instead of retry
2. Find the error path in SessionManager.ts (around line 89)
3. Add one retry attempt before navigating to /login
4. Make the test pass
5. Run the full auth test suite to confirm no regressions
```
❌ Bad: "Fix the bug and write a test."
```

#### Success Criteria
Specific, measurable, testable conditions. The sub-agent should be able to check these itself.
This section is intentionally placed *immediately after* the task steps — the "what to do" and
"how to know it's done" should be adjacent in the brief, not separated by rules and boundaries.

```
✅ Good:
- [ ] Failing test reproduces the bug deterministically (run it 3 times, it fails each time)
- [ ] Fix is in SessionManager.ts only (git diff shows only this file modified)
- [ ] All auth tests pass (npm test -- auth)
- [ ] No new console.log or console.error statements
- [ ] Lint passes (npm run lint)
```
❌ Bad: "The bug should be fixed."
```

#### Rules to Follow
Non-negotiable constraints. These are the guardrails the sub-agent must not cross.

```
✅ Good:
- Follow the existing error boundary pattern in TokenService.ts — do not add new try/catch blocks
- Use the existing retry logger at src/utils/logger.ts — do not import console
- All public functions must have JSDoc comments (project convention)
- Never modify node_modules or lock files
```
❌ Bad: "Write good code."
```

#### Boundaries
Explicit exclusions. State clearly what is *not* in scope. This prevents the sub-agent from
drifting into adjacent work that isn't part of this task.

**Pre-existing issues rule:** If the sub-agent discovers lint errors, failing tests, or code
quality issues in files *outside* their assigned scope, they must:
1. Note them in the output report
2. Stop — do NOT fix them unless explicitly instructed

A sub-agent assigned to fix one file should not "fix" lint errors in five other files, expand
its scope to refactor a neighboring module, or rewrite tests that were already passing before
it started. Pre-existing failures in unrelated code are someone else's problem.

```
✅ Good:
This task is scoped to SessionManager.ts only. Do NOT:
- Modify the login form or navigation logic
- Change the token refresh interval (that's a separate config task)
- Touch the backend API
- Update CHANGELOG.md or package.json versions
- Fix lint errors or failing tests in other files — note them in your report and stop
```
❌ Bad: "Just fix the session bug." (no guard against scope creep)
❌ Bad: "Fix the auth bug." — sub-agent then rewrites 6 other files because their linter is noisy
```

#### Output Format
Exact shape of what the sub-agent should produce. Include file names, paths, format.

```
✅ Good:
After completing the fix, write a summary to /tmp/auth-fix-report.md with:
1. Root cause (one paragraph)
2. Files changed (git diff --name-only)
3. Tests added/modified
4. Verification: commands run and their output (pass/fail)

Do NOT commit. Do NOT open a PR.
```
❌ Bad: "Let me know when you're done."
```

#### Stop Rules
When to stop iterating. Prevents the sub-agent from running forever on "one more improvement."

```
✅ Good:
Stop after all success criteria are met. Do not add extra refactoring, cleanup, or
"improvements" beyond what is specified. If you hit a blocker that requires a decision
not covered by the brief, use intercom to escalate — do not decide unilaterally.
```
❌ Bad: "Keep going until it's good."
```

---

## Part 3: Context Levels

Not every task needs the full brief. Choose the level that matches the task.

| Level | Sections | Word Budget | When to Use |
|-------|----------|-------------|-------------|
| **Minimal** | Goal → Skills Loaded → Task → Success Criteria → Output Format → Stop Rules | ~100 words | Simple, low-risk, familiar codebase; mechanical tasks; one-file changes |
| **Standard** | Goal → Skills Loaded → Persona → Why → Context → Task → Success Criteria → Rules → Boundaries → Output Format → Stop Rules | ~300–500 words | Typical code work; most delegations; moderate complexity |
| **Comprehensive** | All sections + detailed context dump + `reads` for large files | ~500–1000 words (+ `reads`) | Complex, high-risk, unfamiliar codebase, or multi-step; security-critical; cross-module |

**Rule**: When in doubt, use Standard. Under-contexting is the most common sub-agent failure mode.
**Template mappings**: Minimal ↔ Basic Template in Part 8, Standard ↔ Standard Template,
Comprehensive ↔ Full Template.

### Blocker Escalation

When a sub-agent hits a decision not covered by the brief, it should escalate rather than decide
unilaterally. Use `intercom` to reach the parent session:

```
Use intercom when you hit a blocker:
intercom({ action: "ask", to: "<parent-session-name>", message: "The invitations table lacks an expiresAt column. Should I add it, or should the expiry be computed?" })
```

The parent session name is available from the task context. If unknown, ask the user directly.

---

## Part 4: Multi-Agent Context Patterns

When dispatching multiple sub-agents in parallel (via `parallel` or `chain` modes), each agent
needs its own context slice — not the same full context, and not disjointed fragments.

### Per-Agent Context Principles

1. **Each agent gets a self-contained brief** — no agent should need to read another agent's
   output to understand its own task (unless the task is explicitly sequential/dependent).
2. **Shared contracts go in every brief** — if two agents must agree on types or file formats,
   include the contract definition in both briefs, not just one.
3. **Dependency order matters** — agent B should not launch until agent A's artifacts are in
   the shared workspace. Brief B should reference the artifact paths from A.
4. **No cross-contamination** — an agent solving problem A should not receive context about
   problem B's implementation details, only the interface contract it depends on.

### Pattern: Parallel Implementation

```
Task: Build a new "favorites" feature with a backend endpoint and a UI tab.

Agents:
- Agent A (backend): implements /api/favorites GET endpoint
- Agent B (frontend): implements Favorites tab in the app

Brief for Agent A:
- Goal: Build GET /api/favorites
- Context: Types in src/types/favorites.ts (attached), existing /api/profile pattern to follow
- Output: src/api/favorites.ts + tests in src/api/__tests__/favorites.test.ts
- Contract: Returns { favorites: Favorite[] } where Favorite = { id, title, addedAt }

Brief for Agent B:
- Goal: Build Favorites tab
- Context: Types in src/types/favorites.ts (attached), existing Profile tab as pattern reference
- Contract: Expects GET /api/favorites to return { favorites: Favorite[] }
- Note: The backend agent (A) is building the endpoint — you will receive the types file from A
  at src/types/favorites.ts. Do not create the types file yourself; wait for A's output or
  use the provided contract definition in this brief.
```

### Pattern: Sequential Chain

```
Task: Research a library, then implement an integration based on findings.

Chain:
- Agent A (researcher): research library behavior, write research.md
- Agent B (implementer): read {previous} (A's output), implement integration

Brief for Agent A:
- Goal: Research how Stripe handles webhook signature verification
- Context: We currently use bare HTTP POST — no signature check
- Output: research.md covering: verification flow, required headers, recommended library,
  code examples, security considerations

Brief for Agent B:
- Goal: Implement Stripe webhook signature verification
- Context: {previous} — research output from Agent A (attached)
- Rules: Follow the pattern described in the research, use the recommended library
- Output: src/payments/stripe-webhook.ts + tests
```

### Pattern: Iterative Delegation (NEW)

Some tasks benefit from multi-round delegation with review gates between rounds. This is
useful when the task has high uncertainty, the approach is not yet settled, or you want
to course-correct before the sub-agent commits to a full implementation.

**Round-based workflow:**

```
Round 1 — Sketch / Research / Explore:
Agent: "Sketch 2-3 approaches for [problem]. Output trade-off analysis to /tmp/approaches.md."
Parent: Reviews approaches, picks one, writes Round 2 brief.

Round 2 — Prototype / Phase 1:
Agent: "Implement the chosen approach for [module A]. Write tests. No optimizations yet."
Parent: Reviews implementation, checks tests, writes Round 3 brief.

Round 3 — Complete / Polish:
Agent: "Complete the remaining modules (B, C). Add error handling. Run full suite."
```

**Template for iterative delegation:**

```python
# Round 1
subagent({
    agent: "worker",
    skill: ["subagent-laws", "research"],
    task: f"""## Goal
Explore 3 approaches for implementing [feature].

## Persona
You are a senior architect evaluating options. You compare trade-offs, not completeness.

## Your Task
1. Research [domain/problem]
2. Write 2-3 approaches with pros/cons for each
3. Recommend one

## Success Criteria
- [ ] Each approach has concrete trade-offs listed
- [ ] Recommendation is justified

## Output
Write to workspace/_artifacts/exploration.md
Do NOT implement anything.

Skills loaded:
- subagent-laws — scope discipline
- research — structured exploration""",
    output: "exploration.md",
    outputMode: "file-only"
})

# ... parent reviews, then Round 2 ...
subagent({
    agent: "worker",
    skill: ["tdd", "subagent-laws"],
    reads: ["workspace/_artifacts/exploration.md"],
    task: f"""## Goal
Implement the chosen approach from the exploration phase.

## Persona
You are a disciplined engineer implementing a reviewed design. You follow the spec exactly.

## Context You Need
The exploration artifact is pre-loaded at workspace/_artifacts/exploration.md.
The recommended approach is: [approach name].

## Your Task
[phase 1 implementation steps]

## Success Criteria
[phase 1 criteria]

## Boundaries
Do NOT optimize, refactor beyond scope, or change the chosen approach.

Skills loaded:
- tdd — tests first
- subagent-laws — scope discipline""",
    output: "phase1.md",
    outputMode: "file-only"
})
```

**When to use iterative delegation:**
- The solution space is not well understood (explore first, then commit)
- The parent wants a review gate before the sub-agent invests in full implementation
- The task spans multiple natural phases with different skill requirements per phase
- The cost of a wrong full implementation is high

**When NOT to use iterative delegation:**
- The task is well-understood and bounded (one-shot is faster)
- The parent doesn't have time to review between rounds
- The phases are tightly coupled and can't be reviewed independently

---

## Part 5: Anti-Patterns

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

## Part 6: Context Parameter — fork vs fresh

The `context` parameter controls what the sub-agent inherits from the parent session. Choose
deliberately:

- **`context: "fork"`** (default, recommended for most cases) — The sub-agent receives a
  compressed summary of the parent conversation. Use when the sub-agent needs awareness of
  prior decisions, architectural context, or constraints established earlier. Cost: inherits
  parent's anchoring assumptions. Mitigation: keep the brief self-contained; state confirmed
  decisions explicitly rather than relying on inherited context.

- **`context: "fresh"`** — The sub-agent starts with zero parent context. Use when you want
  independent reasoning: adversarial review, competing hypotheses, or when the parent's
  assumptions would bias the result. Cost: the sub-agent knows nothing about prior work unless
  you state it in the brief. Mitigation: over-context in the brief to compensate.

**Common mistake**: saying `context: "fork"` gives "no access" to parent context. It gives
*compressed* access — enough to anchor on, not enough to reconstruct the full conversation.
Be precise about what you want the sub-agent to inherit vs. ignore.

---

## Part 7: Updated Examples (Full Briefs)

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

## Part 8: Invocation Templates

> For the Minimal, Standard, Full, Parallel chain templates and template variables, see [`references/invocation-templates.md`](references/invocation-templates.md)

---

## Part 9: Cost & Budget Awareness

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

## Part 10: Post-Delegation Verification

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

## Agent Rules

### Do
- always load `subagent-laws` and `tdd` for every sub-agent dispatch — these are non-negotiable
- assign a **Persona** in every brief — the sub-agent needs to know *who to be*
- add any other task-relevant skills on top (debugging, security, API design, architecture, etc.)
- match extra skills to the task's primary risk areas
- tell the sub-agent *why* each skill was loaded ("use X for Y")
- place **Skills Loaded** right after Goal, not at the bottom of the brief
- place **Success Criteria** immediately after Task (adjacent pairing)
- use `context: "fork"` for awareness of prior decisions, `context: "fresh"` for independent reasoning
- include the full context the sub-agent needs — file paths, type definitions, existing patterns, constraints
- use `reads` for files larger than ~100 lines instead of inlining them
- set explicit boundaries — state what is NOT in scope
- define specific success criteria — measurable, testable, verifiable
- include stop rules — prevent infinite "improvement" loops
- use `intercom` for blocker escalation — don't let sub-agents decide unilaterally when blocked
- **verify the output yourself after the sub-agent returns** — run tests, inspect the diff, check scope
- use the **Delegation Decision Tree** before deciding to delegate at all
- consider **Iterative Delegation** for high-uncertainty tasks — sketch first, implement later
- match model capability to task complexity — use strongest models for diagnosis, security, and architecture
- be cost-aware: a compressed brief + strong sub-agent model beats a verbose brief + cheap sub-agent model

### Do Not
- dispatch a sub-agent without considering what skills it needs
- load skills or models that are irrelevant to the task (wastes context and confuses)
- skip TDD because "this is just a small change" (small changes cause big bugs)
- assume a sub-agent will naturally use TDD without being told to
- give a "figure it out" brief — name the files, patterns, and constraints explicitly
- give a "no boundaries" brief — always state what is out of scope
- give a "vague success criteria" brief — specific or don't bother
- inline large files in the brief — use `reads` or scratchpad files instead
- let a sub-agent run forever — always include stop rules
- anchor a sub-agent to the parent's wrong assumptions — strip parent reasoning, keep only facts
- omit scope discipline for pre-existing issues — sub-agents will fix everything they can see unless told not to
- omit a **Persona** — the sub-agent defaults to generic if you don't give it an identity
- trust the sub-agent's "all tests pass" claim — **verify it yourself** after return
- re-delegate with the same brief when the first attempt had issues — the sub-agent will repeat the same mistakes
- dispatch more than 4 parallel agents — coordination overhead exceeds benefit
- use a cheap model for a hard reasoning task — the cost of fixing wrong output exceeds the model savings
- change requirements mid-dispatch — freeze requirements, then dispatch a new task if they change

---

## Pairing Guide

- **subagent-laws** — loaded automatically in every sub-agent dispatch; contains persistent rules for scope discipline, test hygiene, code structure, and communication standards that apply regardless of task type
- **TDD** — the core `tdd` skill is always loaded for code tasks; this skill layers context and skill composition on top
- **Octopus** — use octopus for contract-driven decomposition before dispatching; use subagent-composer to write each arm's brief
- **pi-subagents** — this skill describes *what to write* in the brief; pi-subagents describes *which tool invocation shape* to use (SINGLE / CHAIN / PARALLEL), `async: true` for long-running work, `control` parameters for attention tracking, and `intercom` for cross-session coordination
- **Separation of Concerns** — keep each sub-agent's brief scoped to one concern; don't mix concerns within a single brief
- **Weak-Link Detection** — if a sub-agent's output looks weak, weak-link-detection tells you how to score and repair it
- **Advocatus Diaboli** — use subagent-composer to load the Diaboli with an adversarial system prompt and adversarial reasoning skills
- **Pre-Mortem / Inversion** — use before the final brief dispatch as a "last check" gate: "what would cause this delegation to fail?"

---

## Definition of Done

A sub-agent brief is high-context when:

- [ ] The task type was identified and the skill mapping was consulted
- [ ] `subagent-laws` was included in every sub-agent dispatch
- [ ] `tdd` was included for any code-producing task
- [ ] All relevant skills were loaded with explanations
- [ ] Skills Loaded appears **right after Goal** (not at the bottom of the brief)
- [ ] A **Persona** is assigned — the sub-agent knows who to be
- [ ] The brief includes Goal, Skills Loaded, Persona, Why, Context, Task, Success Criteria, Rules, Boundaries, Output Format, and Stop Rules (or appropriate subset per context level)
- [ ] Task and Success Criteria are adjacent (not separated by intervening sections)
- [ ] Context uses `reads` for files >100 lines rather than inlining
- [ ] Context includes file paths, type definitions, and existing patterns — not vague references
- [ ] Boundaries explicitly state what is NOT in scope
- [ ] Pre-existing issues are explicitly addressed — the brief states that the sub-agent should note, not fix, problems outside scope
- [ ] Success criteria are specific and measurable
- [ ] Stop rules are present
- [ ] Blocker escalation via `intercom` is documented in stop rules
- [ ] `context: "fork"` vs `"fresh"` was chosen deliberately
- [ ] The **Delegation Decision Tree** supports the decision to delegate (not do it yourself)
- [ ] **Model capability** matches task complexity
- [ ] **Parallel count** is ≤4 if multiple agents
- [ ] For code tasks: the output is test-first and addresses the concerns each loaded skill covers
- [ ] For non-code tasks: the output reflects the reasoning frameworks loaded

And after the sub-agent returns:

- [ ] **Parent verification checklist** was run (tests, lint, diff, scope check)
- [ ] If issues found: correction brief was written (not a re-send of the original brief)
- [ ] If output was wrong: it was discarded, not half-integrated
