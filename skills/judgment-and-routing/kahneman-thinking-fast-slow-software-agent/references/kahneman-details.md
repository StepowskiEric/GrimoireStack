# Kahneman Thinking Fast & Slow — Reference Details

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

---

