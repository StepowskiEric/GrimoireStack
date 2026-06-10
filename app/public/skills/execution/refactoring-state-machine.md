# Skill: Refactoring — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must improve structure without drifting into endless cleanup.

This protocol adds:
- mandatory refactor target definition
- shared-surface consumer discovery
- bounded transformation budget
- explicit stop condition
- anti-loop circuit breaker

---

## Mandatory Diagnostic Artifacts

Before execution, create:

### `refactor-target.md`
```md
# Refactor Target

## Task
<goal>

## Target Smell / Structural Problem
<one primary smell>

## Behavior to Preserve
- <behavior>

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

## Transformation Budget
<default max 3 structural transformations>

## Validation Required
- <tests/checks>

## Stop Condition
<when to relinquish control>
```

---

## State Machine

## State 0 — Intake
Goal:
- identify one primary structural problem

Examples:
- duplicated logic
- long function/module
- mixed concerns
- shallow wrapper
- ambiguous naming
- dead code cluster
- scattered conditionals

Rule:
One session, one primary smell family.

Exit condition:
- `refactor-target.md` created

---

## State 1 — Consumer Discovery / Unknowns Scan
Goal:
- bound impact before touching shared surfaces

Mandatory rule:
Before modifying a public interface, shared utility, or reused contract, run global consumer discovery.

If incomplete:
- declare unknown consumers
- lower blast-radius confidence
- narrow scope or stop if risk is high

Exit condition:
- shared impact bounded or explicitly unknown

---

## State 2 — Safety and Plan
Goal:
- define the smallest transformation sequence

Rules:
- default max 3 structural transformations
- each transformation must target the primary smell
- no second major objective
- preserve behavior unless separately declared

Typical transformation sequence:
1. clarify naming / isolate seam
2. extract/move/consolidate
3. remove obsolete duplication or wrapper

Exit condition:
- bounded sequence chosen
- required validation known

---

## State 3 — Execution Unlock
Goal:
- perform the bounded transformations

Allowed actions:
- only transformations in budget
- only changes tied to primary smell

Disallowed:
- opening new smell families
- global cleanup drift
- aesthetic file churn without structural gain

Exit condition:
- budget spent or smell materially reduced

---

## State 4 — Verification
Goal:
- verify behavior preserved and structure improved

Checks:
- required tests/checks
- did the target smell decrease?
- did caller burden or duplication decrease?
- did shared consumers remain safe?

Exit condition:
- validation passes
- structural improvement is real

---

## State 5 — Stop / Relinquish Control
Stop when:
- primary smell is materially reduced
- validation passes
- transformation budget is spent
- no essential evidence requires reopening the plan

Escalate when:
- more than 3 structural transformations are needed to remain safe
- shared blast radius is unknown
- verification keeps revealing unplanned structural work

---

## Tool Gating

### Scan/plan phases
Allowed:
- search/read/list/test
- artifact writing

Disallowed:
- shared-surface edits before consumer discovery
- structural changes before plan

### Execution phase
Allowed:
- bounded edits inside transformation budget

---

## Circuit Breakers

Stop immediately if:
- the agent starts chasing a second smell family
- it wants “one more cleanup” after the main target is reduced
- consumer discovery failed on a risky shared surface
- validation passes but the agent still wants to keep polishing

---

## Definition of Done

This skill is correctly applied when:
- `refactor-target.md` exists
- one primary smell guided the session
- shared consumer discovery happened when needed
- transformation budget bounded the work
- validation confirmed structural gain
- the agent stopped when the job was done

---

## Final Instruction

Reduce one meaningful structural problem, verify it, and stop.
