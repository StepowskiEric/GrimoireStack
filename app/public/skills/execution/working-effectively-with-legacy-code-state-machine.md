# Skill: Working Effectively with Legacy Code — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must change brittle code with weak tests, unclear behavior, or heavy coupling.

The protocol goal is:
- make change safe first
- preserve required behavior
- create seams
- add characterization coverage
- prevent rewrite gambling
- prevent endless cleanup drift

---

## Mandatory Diagnostic Artifacts

Before execution, the agent must create:

### `characterization-test-plan.md`
```md
# Characterization Test Plan

## Task
<goal>

## Behavior That Must Be Preserved
- <behavior>

## Behavior That Must Change
- <behavior>

## Risky Entrypoints
- <entrypoint>

## Existing Coverage
- <what exists>

## Gaps in Coverage
- <gap>

## Proposed Characterization Tests
- <test>

## Proposed Seams
- <seam>

## Unknowns
- <unknown>

## Blast Radius Confidence
<high / medium / low>
```

### `legacy-change-budget.md`
```md
# Legacy Change Budget

## Primary Objective
<one objective>

## Allowed Transformations
<default max 3 structural transformations>

## Validation Required
- <tests/checks>

## Stop Condition
<when to relinquish control>

## Escalation Triggers
- <trigger>
```

---

## State Machine

## State 0 — Intake
Goal:
- confirm that the code should be treated as legacy

Trigger signs:
- poor or missing tests
- hidden side effects
- globals/singletons
- framework entanglement
- large unclear methods/modules
- risky unknown behavior

Exit condition:
- preservation target and change target are separated

---

## State 1 — Characterization Recon
Goal:
- understand current behavior before refactoring it

Allowed actions:
- inspect call sites
- inspect tests
- inspect runtime behavior
- create `characterization-test-plan.md`

Disallowed actions:
- structural refactor
- direct behavior change
- large extraction or rewrite

Mandatory rule:
No non-trivial code edits until the characterization plan exists.

Exit condition:
- preserved behaviors and risky entrypoints are listed

---

## State 2 — Seam Design
Goal:
- define the smallest seam that makes safe change possible

Typical seams:
- wrapper around IO
- pure function extraction
- dependency injection point
- façade around framework code
- split construction from side effects
- adapter boundary

Exit condition:
- at least one viable seam is identified
- test plan references that seam

---

## State 3 — Safety Gate
Goal:
- create enough safety to justify change

The agent should:
- add characterization tests where possible
- add narrow assertions or fixtures where useful
- state clearly what remains unprotected

If no meaningful safety can be created:
- narrow the scope
- or state heightened risk explicitly

Exit condition:
- minimum viable safety exists
- or risk is explicitly elevated

---

## State 4 — Execution Unlock
Goal:
- perform the smallest necessary change

Rules:
- one primary objective only
- default max 3 structural transformations in one session
- no second cleanup campaign after the main goal is done
- opportunistic cleanup only inside the touched area

Allowed examples:
1. create seam
2. add/adjust characterization test
3. make required behavior or structural change

Disallowed:
- repo-wide modernization
- speculative architecture cleanup
- “while I’m here” expansion into unrelated areas

Exit condition:
- primary objective completed within budget

---

## State 5 — Verification
Goal:
- verify preserved behavior and intended change

Checks:
- characterization tests
- relevant local tests
- contract validation
- explicit review of preserved vs changed behavior

Exit condition:
- required checks pass
- preserved behavior remains intact where intended

---

## State 6 — Stop / Relinquish Control
Stop when:
- the primary objective is complete
- required validation passes
- the target risky area is safer than before
- change budget is spent

Escalate when:
- preserved behavior is still unclear
- no workable seam exists
- blast radius is unknown on a shared surface
- more than 3 structural transformations would be needed to stay safe

---

## Tool Gating

### Recon / Safety phases
Allowed:
- read/search/list/test
- diagnostic artifact writing
- characterization test writing

Disallowed:
- broad structural refactors
- behavior-changing edits before safety gate

### Execution phase
Allowed:
- bounded edits only after safety gate passes

---

## Circuit Breakers

Stop immediately if:
- the agent starts changing behavior it previously marked as preserved
- the scope expands beyond the original objective
- a shared/public interface is touched without consumer discovery
- the agent has already used its change budget and is still finding new cleanup opportunities

---

## Definition of Done

This skill is correctly applied when:
- `characterization-test-plan.md` exists
- preserved vs changed behavior is explicit
- a seam was identified before deep changes
- structural change stayed within the change budget
- tests/checks validate the result
- the agent stopped instead of drifting into endless cleanup

---

## Final Instruction

Make change safe first. Then make it better. Then stop.
