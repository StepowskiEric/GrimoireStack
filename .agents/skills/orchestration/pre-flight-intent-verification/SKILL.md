---
name: pre-flight-intent-verification
description: Unified pre-action gate that prevents the #1 agent failure mode: confidently executing the wrong task. Fuses socratic-clarification (assumption surfacing), intent-specification-protocol (testable spec crystallization), and assumption-grounding (factual verification) into one mandatory gate before any significant task execution. Use when about to start a feature, bug fix, code change, refactor, or any task with ambiguity, blast radius, or irreversible side effects — especially when the request could be interpreted multiple ways, touches existing behavior, or the stakes of being wrong are non-trivial.
---

# Pre-Flight Intent Verification

## Core Law

One wrong assumption makes perfect execution worthless. Map the assumptions. Find the critical one. Specify the intent precisely. Ground the facts. Then act from a known basis.

Do not proceed to any significant code change, mutation, or external action until this gate is green.

---

## The Three Phases

Execute all three phases in order. Skip none.

### Phase 1 — Clarify (Socratic)

Purpose: surface the single most consequential ambiguity before any action.

**States:**

1. **INTAKE** — Decide whether this task has consequential ambiguity. If the request is trivially unambiguous (single clear interpretation, no existing-behavior touch, no irreversible side effects) → skip to Phase 2. Otherwise proceed.
2. **ASSUMPTION MAPPING** — Write down what you believe you know. Separate facts (confirmed) from assumptions (inferred). For each assumption, name the consequence if it is wrong. Focus on the assumptions that, if wrong, would redirect the entire work — not surface-level details.
3. **RANK** — Rank assumptions by (consequence if wrong) × (likelihood of being wrong) × (verifiable with one question). Pick the single highest-priority assumption.
4. **QUESTION** — Formulate one specific, minimal, answerable question that resolves that assumption. Do not bundle questions. Do not cascade into interrogation — one question, then await answer.
5. **ACTION GATE** — Ask the question and wait for an answer before proceeding. Exception: explicitly accept the ambiguity when the consequence is reversible, blast radius is small, or the user has said "use your best judgment." When accepting ambiguity, state the assumption explicitly and flag the signal that would indicate it was wrong.
6. **RESOLVE** — Update the assumption map with the answer. Proceed to Phase 2.

---

### Phase 2 — Specify (Intent Specification)

Purpose: crystallize intent into a precise, testable spec so execution cannot drift.

**States:**

1. **PARSE** — Strip the request to its essential intent. Identify the core intent (one sentence), the minimal surface area of change, and which parts of the user's request are suggestions vs. mandates. List all plausible interpretations.
2. **CONSTRAIN** — Identify invariants — what must NOT change. For each invariant, state it as a negative constraint: "X must continue to Y when Z." Check existing callers, tests, data/state contracts, public API signatures, and performance characteristics. This is the most commonly skipped and most valuable step — never skip it.
3. **FORMALIZE** — Write 2–5 Given/When/Then scenarios. Minimum: happy path + one edge case + one invariant-check scenario (verifying something that must NOT change). Each scenario must have specific inputs and expected outputs — no "handle appropriately" or "should work" language.
4. **GATE** — Check every scenario for completeness. If any scenario has unresolved interpretations or missing concrete outputs → return to the user for clarification before proceeding. No exceptions.

---

### Phase 3 — Ground (Assumption Verification)

Purpose: verify key factual claims about the codebase, environment, and dependencies before acting on them.

For each of the following that applies to the current task, state the assumption, then verify with the cheapest possible check:

| Assumption Type              | Cheapest Verification                             |
| ---------------------------- | ------------------------------------------------- |
| File/dir exists at a path    | `ls <path>` or `test -f <path>`                   |
| Function/class/symbol exists | `grep "def <name>" <file>` or read first 30 lines |
| Variable/constant/enum value | `grep "<NAME>" <file>`                            |
| Package/tool installed       | `python -c "import pkg"` or `which <binary>`      |
| API signature                | Read the function definition (first 10 lines)     |
| Config value / env var       | `grep "<KEY>" <config_file>` or `echo $VAR`       |
| Git state                    | `git status --short` or `git log --oneline -1`    |

**Rules:**

- State the assumption in falsifiable form _before_ verifying.
- Verify one assumption at a time — no bundling.
- If verification fails → reformulate the assumption and re-verify.
- If verification is ambiguous (multiple matches) → ask the user, do not guess.
- Log all verified assumptions (both passes and failures).
- Do not over-verify: only verify assumptions that, if wrong, would derail the task.

---

## Artifact: `pre-flight-record.md`

Create this file before Phase 2. Required structure:

```md
# Pre-Flight Record

## Task as Stated

<exact statement of the task>

---

## Phase 1 — Clarify

### What I Believe I Know

- [confirmed] <fact>
- [assumption] <inferred belief>

### Critical Assumption

Assumption: <highest-priority assumption>

- If wrong, this would: <consequence>
- Question asked: <the clarifying question>
- Answer received: <answer / "ambiguity accepted: <reason>">

---

## Phase 2 — Specify

### Core Intent

<one sentence>

### Invariants (must NOT change)

- <constraint>
- <constraint>

### Scenarios

#### Scenario 1: [name]

Given <preconditions>
When <action>
Then <expected result>

#### Scenario 2: [edge case]

Given <preconditions>
When <action>
Then <expected result>

#### Scenario 3: [invariant check]

Given <existing behavior context>
When <action that would trigger old behavior>
Then <old behavior still works exactly as before>

### Gate Decision

[ ] All scenarios concrete → proceed to Phase 3
[ ] Ambiguity found → return to user

---

## Phase 3 — Ground

| Assumption | Check            | Result      |
| ---------- | ---------------- | ----------- |
| `<claim>`  | `<command used>` | PASS / FAIL |
| `<claim>`  | `<command used>` | PASS / FAIL |

---

## Gate Decision

[ ] All phases green → EXECUTE
[ ] Blocked: <reason>
```

---

## Tool Gating

| Phase             | Read / Inspect | Write                  | External State Change | Irreversible Action |
| ----------------- | -------------- | ---------------------- | --------------------- | ------------------- |
| Phase 1 — Clarify | ✅             | ✅ (artifact only)     | ❌                    | ❌                  |
| Phase 2 — Specify | ✅             | ✅ (artifact only)     | ❌                    | ❌                  |
| Phase 3 — Ground  | ✅             | ✅ (artifact only)     | ❌                    | ❌                  |
| Execute           | ✅             | ✅ (planned work only) | ✅ (in scope)         | ✅ (in scope)       |

---

## Circuit Breakers

Stop and escalate to human input if:

- The task, once assumptions are mapped and intent is parsed, appears to be a _different task_ than the one described.
- The highest-priority assumption cannot be resolved with one question and the consequence of being wrong is severe and irreversible.
- The answer to the clarifying question creates a new set of equally critical ambiguities (the task needs re-scoping, not more questions).
- More than 5 scenarios are needed to describe the change — the change is too large; decompose it first.

---

## Failure Modes This Skill Prevents

- **Confident wrong execution** — acting with full competence in the wrong direction because an assumption was never questioned.
- **Assumption inheritance** — carrying forward assumptions from prior context that do not apply to the current task.
- **Question flooding** — asking many questions instead of the one most important one.
- **Ambiguity avoidance** — proceeding without acknowledging the assumptions being made.
- **Assumption drift** — letting assumptions shift silently during execution without re-verification.
- **Scope creep in execution** — adding features not covered by any scenario.
- **Specification theater** — writing vague scenarios that pass the gate check but leave real ambiguity unresolved.

---

## Definition of Done

This skill was correctly applied when:

- `pre-flight-record.md` exists with all three phases completed.
- The single most critical assumption was identified and resolved (or explicitly accepted with stated reasoning).
- At least 2 Given/When/Then scenarios exist (happy path + edge case minimum), and at least 1 invariant-check scenario.
- Key factual assumptions about files, functions, and environment were verified with the cheapest check, and results logged.
- Execution proceeded from the documented basis — not from tacit assumptions or partially-completed phases.

---

## Integration

- **`thoroughness-check-etto`** — use before Phase 1 to calibrate how much rigor is warranted.
- **`refactoring-state-machine`** or `pragmatic-programmer-state-machine` — the spec produced by Phase 2 feeds directly into bounded execution.
- **`pre-mortem`** — the assumption map from Phase 1 is direct input for pre-mortem failure story generation.
- **`improve-codebase-architecture`** — Phase 2 (Constrain) aligns with its Deletion Test; the invariant list is compatible with its candidate format.
- **`verification-before-completion`** — Phase 3's verify-before-act discipline is a lighter-weight precursor; use both when the task is large enough to warrant pre-flight _and_ post-completion gates.
- **`checklist-manifesto`** — for recurring high-stakes tasks, encode the most critical clarifying questions into the pre-procedure checklist.
- **`root-cause-analysis`** — if this skill was _not_ applied and execution went wrong, the RCA's causal chain will often trace back to a missed Phase 1 assumption or Phase 2 spec gap.
