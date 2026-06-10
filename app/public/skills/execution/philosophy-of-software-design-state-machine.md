# Skill: A Philosophy of Software Design — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must manage complexity, design deeper modules, and avoid shallow abstraction sprawl.

This version adds hard gates for:
- consumer discovery before shared-interface edits
- unknowns/blast-radius declaration
- bounded change scope
- explicit stopping rules

---

## Mandatory Diagnostic Artifacts

Before execution, create:

### `complexity-design-brief.md`
```md
# Complexity Design Brief

## Task
<goal>

## Complexity Problem
<what makes this hard>

## Candidate Deep Module / Boundary
<module or interface>

## Shared Surfaces Potentially Affected
- <surface>

## Consumer Discovery Method
<global search>

## Known Consumers
- <consumer>

## Unknown Consumers
- <unknown>

## Blast Radius Confidence
<high / medium / low>

## Change Amplification Risk
<how many places would change>

## Stop Condition
<when to stop>
```

---

## State Machine

## State 0 — Intake
Goal:
- identify the real complexity problem

Examples:
- shallow wrappers
- leaked complexity
- change amplification
- too many low-value files
- interfaces exposing implementation detail

Exit condition:
- complexity problem stated clearly

---

## State 1 — Shared Surface Scan
Goal:
- bound the impact of any module/interface change

Mandatory rule:
Before modifying a public interface, shared utility, or common contract, run a global search and list consumers.

If not all consumers can be identified:
- declare unknown consumers
- reduce blast-radius confidence
- narrow scope or stop if risk is high

Exit condition:
- consumers listed or blast radius marked unknown

---

## State 2 — Deep Boundary Design
Goal:
- choose the boundary that actually hides complexity

Questions:
- what caller complexity disappears?
- what implementation details become internal?
- does the interface get simpler than the implementation?
- are we reducing change amplification?

Exit condition:
- candidate deep boundary justified

---

## State 3 — Execution Unlock
Goal:
- perform bounded structural change only after complexity and blast-radius analysis

Rules:
- no wrapper inflation
- no splitting purely for aesthetics
- no second cleanup campaign
- focus on one complexity problem per session

Exit condition:
- bounded complexity reduction completed

---

## State 4 — Validation
Goal:
- verify that the new boundary is actually deeper and simpler for callers

Checks:
- fewer concepts exposed?
- less caller burden?
- lower change amplification?
- no unexpected consumer breakage?

Exit condition:
- complexity reduction demonstrated

---

## State 5 — Stop / Relinquish Control
Stop when:
- one meaningful complexity problem is reduced
- shared consumers remain safe
- the new boundary is simpler from the outside

Escalate when:
- consumer discovery failed on a risky shared surface
- the candidate boundary keeps expanding
- the refactor is becoming file-shuffling without actual information hiding

---

## Tool Gating

### Scan/design phases
Allowed:
- search/read/list/map
- artifact writing

Disallowed:
- shared-interface edits before consumer discovery

### Execution phase
Allowed:
- bounded structural edits after boundary justification

---

## Circuit Breakers

Stop and reassess if:
- consumer list remains incomplete
- the design is getting shallower, not deeper
- more files are being created without reducing caller burden
- change amplification is not actually improving

---

## Definition of Done

This skill is correctly applied when:
- `complexity-design-brief.md` exists
- consumer discovery happened before shared-boundary changes
- a deeper module/boundary was justified
- blast radius was handled honestly
- the agent stopped after reducing one meaningful complexity problem

---

## Final Instruction

Hide more complexity than you create.
