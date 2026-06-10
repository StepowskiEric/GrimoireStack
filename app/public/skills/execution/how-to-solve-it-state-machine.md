# Skill: How to Solve It — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent is solving a hard problem under uncertainty.

This protocol enforces:
- problem framing before action
- evidence gathering before writing
- hypothesis-driven exploration
- plan before execution
- reflection before closure

It is explicitly designed to prevent premature coding.

---

## Mandatory Diagnostic Artifacts

Before execution, the agent must create:

### `problem-frame.md`
```md
# Problem Frame

## Problem
<precise statement>

## Expected Behavior
<what should happen>

## Observed Behavior
<what does happen>

## Known Facts
- <fact>

## Unknowns
- <unknown>

## Constraints
- <constraint>

## Candidate Hypotheses
- <hypothesis>

## Cheapest Evidence-Rich Next Steps
- <step>
```

### `evidence-log.md`
The agent must record the commands or inspections it used to gather evidence.

```md
# Evidence Log

- grep/find/search: <what was searched>
- tests/run: <what was run>
- files inspected: <which files>
- result summary: <what was learned>
```

---

## State Machine

## State 0 — Intake
Goal:
- convert a vague task into a precise problem statement

Exit condition:
- `problem-frame.md` exists with knowns, unknowns, and candidate hypotheses

---

## State 1 — Recon (Read-Only)
Goal:
- gather evidence before editing

Allowed actions:
- grep/search/find
- read files/docs
- inspect tests
- run non-destructive checks/tests
- update `evidence-log.md`

Disallowed actions:
- write-to-file on operational targets
- code modification
- config changes
- implementation drafts masquerading as recon

Mandatory rule:
If the runtime supports tool permissions, repo-modifying write permissions should remain disabled until this state exits.

Exit condition:
- at least one evidence-gathering command or inspection has been executed
- evidence materially updates one or more hypotheses

---

## State 2 — Hypothesis Ranking
Goal:
- rank explanations or solution paths by evidence

Rules:
- distinguish fact from guess
- keep alternatives alive until evidence narrows them
- reject first-answer lock-in

Exit condition:
- leading hypothesis or plan emerges
- or scope must be narrowed because uncertainty remains too high

---

## State 3 — Plan
Goal:
- decide the next bounded move

The plan must include:
- objective
- why this step follows from evidence
- what would falsify it
- what counts as success
- whether action is reversible

Exit condition:
- bounded plan exists

---

## State 4 — Execution Unlock
Goal:
- permit action only after recon and planning

Allowed actions:
- actions justified by the evidence and plan

Disallowed:
- broad speculative edits
- unbounded trial-and-error

Exit condition:
- bounded action completed

---

## State 5 — Look Back
Goal:
- reflect on the result

Questions:
- which hypothesis was right?
- what assumption was wrong?
- what evidence mattered most?
- what guardrail/test/process should be added next time?

Exit condition:
- reflection recorded in concise form

---

## Tool Gating

### Recon phase
Allowed:
- grep/find/search/read/run_tests/list
- diagnostic artifact writing only

Disallowed:
- repo modifications

### Execution phase
Allowed:
- bounded edits only after evidence gate

---

## Unknowns Rule

If the problem touches a shared interface or utility, the agent must add:
- known consumers
- unknown consumers
- search method used
- blast radius confidence

If it cannot identify consumers, it must declare blast radius unknown.

---

## Circuit Breakers

Stop and reassess if:
- recon never produced new information
- hypotheses keep multiplying without narrowing
- the task becomes broader than the original problem frame
- a shared/public surface is about to change without blast-radius knowledge

---

## Definition of Done

This skill is correctly applied when:
- `problem-frame.md` exists
- `evidence-log.md` shows real evidence gathering
- the first phase stayed read-only
- action followed evidence rather than impatience
- the agent reflected before closure

---

## Final Instruction

Understand first. Search second. Plan third. Act fourth. Reflect fifth.
