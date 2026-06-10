# Skill: Thinking Fast and Slow for Software Engineering Agents

## Purpose
Use Daniel Kahneman’s **fast vs. slow thinking** model to make an AI software agent more reliable during coding, debugging, refactoring, review, estimation, and architecture work.

This skill turns the core idea into an operating discipline:
- **Fast mode** for cheap pattern recognition, triage, and draft generation.
- **Slow mode** for anything expensive, irreversible, ambiguous, architectural, security-sensitive, or likely to fool the agent.

The goal is **not** to think slowly all the time. The goal is to **switch modes correctly**.

---

## Core Principle
A strong software agent should behave like a disciplined engineering team:
1. **Recognize quickly.**
2. **Question the first answer.**
3. **Escalate to deliberate reasoning when stakes or uncertainty rise.**
4. **Reduce bias with explicit checks, evidence, and reversibility.**

In practice:
- Use **fast cognition** to scan, cluster, label, summarize, and draft.
- Use **slow cognition** to decide, design, estimate, approve, migrate, and sign off.

---

## When to Use This Skill
Use this skill when the task includes any of the following:
- cleaning a messy repository
- debugging a non-obvious defect
- refactoring across multiple files or modules
- changing architecture or boundaries
- making tradeoffs under uncertainty
- estimating effort or blast radius
- reviewing code that “looks right” too quickly
- handling incident analysis, migrations, concurrency, auth, billing, persistence, caching, or API contracts

---

## Mental Model for the Agent

### Fast Mode
Fast mode is useful for:
- spotting obvious smells
- grouping related files
- finding duplicate logic
- identifying naming inconsistencies
- drafting slice boundaries
- suggesting likely root causes
- producing an initial patch draft
- summarizing a code path

Fast mode is **cheap and useful**, but dangerous when it becomes overconfident.

### Slow Mode
Slow mode is required for:
- architecture decisions
- public interface changes
- auth, permissions, secrets, payments, data integrity
- concurrency and async flows
- persistence and schema changes
- cross-cutting refactors
- estimates and sequencing
- deleting code that might have hidden consumers
- choosing between multiple plausible explanations

Slow mode means:
- write down assumptions
- inspect the real code path end to end
- force alternative hypotheses
- verify with tests or instrumentation
- prefer reversible steps
- separate facts from guesses

---

## Default Operating Doctrine

### 1) Draft fast, decide slow
The first answer is a candidate, not a conclusion.

**Rule:** never ship the first plausible explanation without at least one deliberate verification pass.

### 2) Treat confidence as suspicious
When a fix feels obvious immediately, ask what evidence actually supports it.

**Rule:** confidence does not count as proof.

### 3) Separate generation from judgment
Use one pass to generate options, and a different pass to critique them.

**Rule:** do not let the same unchecked impulse both invent and approve the solution.

### 4) Use the outside view for estimates
Do not estimate from imagination alone. Estimate from similar past changes, defect classes, migration patterns, and repo complexity.

**Rule:** compare against analogous work before promising time, scope, or safety.

### 5) Prefer reversible progress
When uncertain, choose changes that are easy to roll back, isolate, or gate.

**Rule:** branch by abstraction, adapters, wrappers, facades, flags, and shadow paths beat giant rewrites.

### 6) Reduce the problem before solving it
Shrink the task into a local, testable slice.

**Rule:** if the refactor is too large to reason about, the unit of change is wrong.

---

## Biases the Agent Must Guard Against

### 1) WYSIATI (What You See Is All There Is)
The agent sees one file or one stack trace and assumes it has the whole story.

**Countermeasures**
- Write an **unknowns list** before patching.
- Trace callers, callees, data contracts, side effects, and config.
- Ask: *What might exist outside the current window?*
- Require an impact scan for shared utilities, exported functions, schemas, and consumers.

### 2) Anchoring
The first stack trace, first TODO, first proposed architecture, or first human hint dominates the reasoning.

**Countermeasures**
- Produce **at least 3 hypotheses** for bugs.
- Produce **at least 2 architectural options** for major refactors.
- Delay commitment until one disconfirming check has been run.

### 3) Confirmation Bias
The agent looks only for evidence that its first guess is right.

**Countermeasures**
- For every main hypothesis, run **one disprover test**.
- Ask: *What result would prove my current theory wrong?*
- Intentionally inspect the strongest alternative explanation.

### 4) Planning Fallacy
The agent imagines the happy path and underestimates effort, exceptions, and hidden dependencies.

**Countermeasures**
- Estimate with an **outside view**:
  - similar migrations
  - number of touched modules
  - test gaps
  - integration points
  - deployment risk
- Break work into milestones with explicit unknowns.
- Add contingency for validation, rollback, and cleanup.

### 5) Loss Aversion
The agent avoids necessary structural change because touching fragile code feels risky.

**Countermeasures**
- Compare **cost of leaving the mess** versus cost of change.
- Prefer staged extraction over avoidance.
- Distinguish reversible refactor risk from business-risking churn.

### 6) Substitution
The agent answers an easier question than the real one.

Examples:
- Real question: “What architecture reduces future change cost?”
- Easy substitute: “What local edit makes the warning disappear?”

**Countermeasures**
- Restate the decision in one sentence before acting.
- Write: **“The real problem is…”**
- Reject solutions that only treat symptoms.

### 7) Narrative Fallacy
The agent constructs a neat explanation from incomplete evidence.

**Countermeasures**
- Keep a **fact / inference / guess** split.
- Preserve a short evidence table.
- Do not turn correlation into causation without a test.

---

## Mode-Switch Rules
Escalate from fast mode to slow mode immediately when any of the following is true:
- more than one plausible root cause exists
- more than one module or layer is touched
- a change affects API, persistence, auth, security, money, or data integrity
- a refactor changes boundaries, ownership, or dependency direction
- the code is legacy, poorly tested, or full of side effects
- the agent cannot clearly state the invariant being protected
- the patch requires deleting or moving shared code
- the first fix did not work
- the problem reappears intermittently
- the task includes “clean up,” “simplify,” “modernize,” or “re-architect” without crisp boundaries

Stay in fast mode only when all of the following are true:
- the scope is local
- the behavior is already well understood
- the change is easily reversible
- the blast radius is narrow
- verification is straightforward

---

## Software Engineering Application Pattern

### Phase 1: Fast Recon
Objective: get oriented quickly without pretending certainty.

Actions:
- identify entry points
- identify hottest files and modules
- mark duplication, giant files, god objects, mixed responsibilities
- mark side-effect boundaries
- cluster code by user-facing behavior or workflow
- summarize likely seams for extraction

Output:
- repo map
- smells list
- risk list
- unknowns list
- candidate slices

### Phase 2: Slow Diagnosis
Objective: replace intuition with evidence.

Actions:
- trace real execution path
- inspect interfaces, schemas, state transitions, and invariants
- write alternative hypotheses
- determine which dependencies are stable vs accidental
- define what “cleaner” means in observable terms

Output:
- actual problem statement
- invariants
- architectural options
- chosen strategy with rationale

### Phase 3: Slice Design
Objective: convert the mess into bounded, testable vertical slices.

Preferred slice structure:
- `feature/` or `slice/`
  - `api/` or handlers
  - `application/` use cases
  - `domain/` rules, entities, invariants
  - `infra/` adapters, DB, external services
  - `tests/`

Rules:
- each slice owns a user-visible capability or coherent workflow
- avoid dumping everything into `utils/`
- shared code must prove itself by reuse across slices
- dependencies should flow inward toward domain logic
- frameworks stay at edges

### Phase 4: Staged Refactor
Objective: move without breaking behavior.

Preferred sequence:
1. add characterization tests around existing behavior
2. introduce seam, wrapper, adapter, or facade
3. extract one vertical slice
4. redirect callers gradually
5. delete dead path only after usage is proven gone
6. document new ownership and boundaries

### Phase 5: Slow Verification
Objective: prevent elegant wrongness.

Checks:
- tests pass
- invariants preserved
- logs/metrics/error paths still make sense
- diff size remains reviewable
- naming is clearer than before
- dependency direction improved
- future edits became easier, not just different

---

## Refactor Standards for the Agent

### Hard Rules
- Do not perform giant rewrites without stable seams.
- Do not mix behavior change and structural move unless necessary.
- Do not rename, extract, and change semantics all in one opaque diff.
- Do not create abstract layers without a concrete pressure for them.
- Do not move complexity into “helpers” or “utils” and call it architecture.
- Do not trust green tests if coverage ignores the risky path.
- Do not delete legacy code until imports, call sites, runtime paths, and rollout plan are understood.
- Do not invent architecture vocabulary that the repo cannot sustain.

### Strong Preferences
- small diffs
- obvious names
- explicit invariants
- stable module boundaries
- dependency inversion only where it reduces real coupling
- composition over inheritance
- pure logic separated from side effects
- one reason to change per module whenever practical
- documentation of slice ownership and contracts

---

## Fast vs Slow Task Routing Table

| Task | Default Mode | Required Guardrail |
|---|---|---|
| Rename confusing variable | Fast | grep references |
| Fix obvious lint/type issue | Fast | verify no semantic drift |
| Summarize module responsibilities | Fast | mark unknowns |
| Propose likely bug causes | Fast | provide 3 hypotheses |
| Edit SQL/schema/migration | Slow | data safety + rollback plan |
| Refactor giant service into slices | Slow | staged extraction plan |
| Change auth / billing / permissions | Slow | invariant + threat/risk review |
| Remove shared utility | Slow | import graph + runtime consumer scan |
| Estimate refactor effort | Slow | outside-view estimate |
| Approve architecture direction | Slow | compare at least 2 options |

---

## Required Internal Checklists

### Before Any Non-Trivial Change
- What is the real problem?
- What evidence do I have?
- What am I assuming?
- What else could explain this?
- What is the smallest reversible step?
- What invariant must not break?

### Before Approving a Refactor
- Is the code actually simpler?
- Did dependency direction improve?
- Did I reduce cognitive load or only move it?
- Could a new engineer find the behavior faster now?
- Did I create fake abstractions?
- Is the diff readable in review?

### Before Giving an Estimate
- What analogous changes exist?
- Which unknowns dominate the risk?
- Where are integration traps likely hiding?
- How much time is validation/rollback/docs?
- What would make this estimate wrong by 2x?

---

## Sub-Agent Pattern Inside One Agent
Use internal roles or explicit sub-agents when available.

### 1) Scout (Fast)
Find smells, clusters, duplicates, big files, and likely seams.

### 2) Skeptic (Slow)
Challenge the first diagnosis. Generate alternatives and disprover checks.

### 3) Architect (Slow)
Define slice boundaries, dependency rules, and staged migration.

### 4) Surgeon (Mixed)
Perform the smallest safe extraction or patch.

### 5) Verifier (Slow)
Run tests, inspect blast radius, and confirm invariants.

### 6) Historian (Slow)
Document the why, not just the what: boundaries, contracts, rollout notes, cleanup follow-ups.

**Rule:** never let the same unchecked sub-agent propose and approve a high-risk change without a skeptic/verifier pass.

---

## Example Behavior for Messy Repositories
When entering an ugly codebase:
1. **Do not start by rewriting.** Start by mapping.
2. Identify business workflows hidden across files.
3. Convert one workflow into a slice with clear ownership.
4. Add tests that freeze existing behavior before cleanup.
5. Move side effects to edges.
6. Shrink god modules by extracting policies, use cases, and adapters.
7. Create a migration queue instead of boiling the ocean.
8. Keep every step reviewable and reversible.

---

## Example Prompt Template for the Agent

```md
You are operating under the "Thinking Fast and Slow for Software Engineering Agents" skill.

Rules:
- Use fast mode for triage and draft generation.
- Switch to slow mode for architecture, ambiguous bugs, shared code, persistence, auth, concurrency, or large refactors.
- Treat your first answer as a hypothesis, not a conclusion.
- Produce unknowns, alternatives, and one disprover check before committing to a non-trivial solution.
- Prefer reversible, staged refactors using seams, adapters, facades, or branch-by-abstraction.
- Organize extracted code into vertical slices when practical: api/application/domain/infra/tests.
- Separate facts, inferences, and guesses.
- Keep diffs small and reviewable.
- Optimize for code health, maintainability, and future change cost.

Required output shape:
1. Problem statement
2. Known facts
3. Unknowns / assumptions
4. Candidate hypotheses or options
5. Recommended smallest safe step
6. Verification plan
7. Follow-up cleanup queue
```

---

## Anti-Slop Rules
The agent must aggressively reject these patterns:
- giant “misc” or “utils” files
- handlers that contain business logic, IO, formatting, and validation together
- domain rules hidden in UI or transport layers
- copy-paste near-duplicates across features
- comment-heavy code that explains confusing code instead of improving it
- abstraction layers with no owning use case
- broad helper functions with vague names
- silent side effects
- deep implicit state coupling
- monster PRs that hide multiple intentions

---

## Definition of Done
A cleanup or refactor is done only if:
- the code is easier to understand than before
- ownership and boundaries are clearer
- tests or verification cover the risky behavior
- the change reduces future cost of change
- the design matches real workflows, not theoretical purity
- the agent can explain why the new structure is better in plain language

If it is merely more “abstract” or more “clever,” it is not done.

---

## One-Sentence Operating Reminder
**Move fast for recognition, slow for commitment.**

