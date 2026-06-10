# Skill: The Pragmatic Programmer — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must work pragmatically in a real system:
- bounded changes
- reversible choices
- automation instead of repeated toil
- root-cause fixes instead of symptom patches
- practical scope control

This version adds enforcement for:
- public interface consumer discovery
- unknowns declaration
- blast-radius accounting
- bounded execution
- clean stopping

---

## Mandatory Diagnostic Artifacts

Before meaningful execution, create:

### `pragmatic-run-brief.md`
```md
# Pragmatic Run Brief

## Task
<goal>

## Real Problem
<what is actually wrong or needed>

## Smallest Correct Move
<bounded move>

## Reversibility
<easy / partial / hard>

## Shared Surfaces Potentially Affected
- <surface>

## Consumer Discovery Method
<global search method>

## Known Consumers
- <consumer>

## Unknown Consumers
- <unknown>

## Blast Radius Confidence
<high / medium / low>

## Automation Opportunity
<what could be scripted, linted, or enforced>

## Stop Condition
<when to stop>
```

---

## State Machine

## State 0 — Intake
Goal:
- identify the real engineering problem, not just the ticket wording

Exit condition:
- real problem and smallest correct move are stated

---

## State 1 — Consumer Discovery / Unknowns Scan
Goal:
- bound the blast radius before touching shared surfaces

Mandatory rule:
Before modifying any public interface, shared utility, common workflow, schema, or reused contract, the agent must run a global search and list consumers.

If consumer discovery is incomplete:
- unknown consumers must be declared
- blast radius confidence must be lowered
- scope may need to be narrowed

Allowed actions:
- global search
- call-site inspection
- dependency mapping
- artifact writing

Disallowed actions:
- editing shared surfaces before consumer scan

Exit condition:
- consumer list exists
- or blast radius is explicitly unknown

---

## State 2 — Practical Option Selection
Goal:
- choose the smallest move that solves the real problem

Prefer:
- reversible changes
- local improvements with system awareness
- automation of recurring toil
- root-cause fixes

Avoid:
- speculative framework-building
- giant rewrites
- “nice cleanup” that is not part of the core need

Exit condition:
- bounded pragmatic move chosen

---

## State 3 — Execution Unlock
Goal:
- act within the bounded move

Rules:
- do not open a second major objective
- opportunistic cleanup only inside touched scope
- if a repeated manual step is discovered, note an automation opportunity

Exit condition:
- bounded move completed

---

## State 4 — Validation and Process Improvement
Goal:
- verify the change and ask what recurring toil should become process/tooling

Checks:
- did the move solve the real problem?
- did shared consumers stay safe?
- should this now be encoded as automation, lint, template, or CI guardrail?

Exit condition:
- result validated
- automation opportunity recorded when applicable

---

## State 5 — Stop / Relinquish Control
Stop when:
- the smallest correct move is complete
- validation passes
- no new essential evidence expands the problem

Escalate when:
- blast radius is unknown on a risky shared surface
- consumer discovery failed
- the “small move” became a multi-system migration

---

## Tool Gating

### Consumer discovery phase
Allowed:
- read/search/list/map
- artifact writing

Disallowed:
- editing shared surfaces

### Execution phase
Allowed:
- bounded edits only after blast-radius handling

---

## Circuit Breakers

Stop and reassess if:
- the agent is about to change a shared surface with low blast-radius confidence
- a second major objective appears
- the agent is “improving things” without evidence that it serves the main goal
- the task drifts from pragmatic fix into speculative redesign

---

## Definition of Done

This skill is correctly applied when:
- `pragmatic-run-brief.md` exists
- shared consumers were searched before shared changes
- unknowns were declared honestly
- the smallest correct move was chosen
- automation opportunities were identified
- the agent stopped after solving the real problem

---

## Final Instruction

Be practical, bounded, and honest about blast radius.
