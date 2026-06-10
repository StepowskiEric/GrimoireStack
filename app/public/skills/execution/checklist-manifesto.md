# Skill: Checklist Manifesto — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must perform a high-stakes procedure where expert knowledge is necessary but not sufficient, and where skip-ahead errors cause most failures.

This skill is based on Atul Gawande's *The Checklist Manifesto*.

The core insight: in complex high-stakes domains, failure does not usually come from lack of expertise. It comes from experts skipping steps they know but fail to execute under pressure, time constraints, or cognitive overload.

The solution is not more expertise. It is a minimal, purpose-built checklist that enforces the steps that matter.

This skill converts that principle into an agent protocol:
- distinguish routine tasks from exception-triggering events
- build the smallest useful checklist before executing
- walk the checklist explicitly before proceeding
- gate execution on checklist completion, not on confidence
- stop cleanly and escalate if the checklist cannot be cleared

---

## Core Law

Confidence is not a substitute for the checklist.

The agent must not proceed on a high-stakes task because it feels ready. It must proceed because the checklist is cleared.

---

## Two Checklist Types

### Read-Do
Read each item, then do it.
Use when the steps must happen in a specific order and each depends on the prior.

### Do-Confirm
Do the work from memory, then confirm against the checklist.
Use when experts know the steps but need a final gate before proceeding to a critical point.

The agent should select the appropriate type at the start of each protocol invocation.

---

## Mandatory Diagnostic Artifact

Before executing any high-stakes procedure, create `procedure-checklist.md`.

Required structure:

```md
# Procedure Checklist

## Task
<one-sentence description of the procedure>

## Checklist Type
<read-do / do-confirm>

## Risk Level
<low / medium / high / critical>

## Pause Points
<the specific moments where execution must halt for human review or external confirmation>

## Pre-Procedure Checks
- [ ] <item>
- [ ] <item>

## Procedure Steps (with inline checks)
- [ ] Step: <action>
  - Confirm: <what proves this step is correctly done>
- [ ] Step: <action>
  - Confirm: <what proves this step is correctly done>

## Post-Procedure Checks
- [ ] <item>

## Exception Triggers
<conditions that, if true at any step, halt execution and escalate>

## Rollback / Recovery
<what to do if a check fails mid-procedure>
```

---

## State Machine

## State 0 — Procedure Classification

Goal:
- determine whether this task requires a formal checklist

Use a checklist when any of the following is true:
- the task is high-stakes or has significant blast radius
- the task is a known procedure with documented steps
- the task has been done before but mistakes have occurred
- the agent is operating under time pressure or uncertainty
- the steps involve external state change, irreversible actions, or shared system impact
- previous attempts at this procedure have failed due to skipped steps

Do not invoke this skill for:
- trivial, well-understood, low-impact single steps
- exploratory work with no defined procedure
- situations where the checklist itself is more complex than the task

Exit condition:
- confirmed that checklist discipline applies

---

## State 1 — Checklist Construction

Goal:
- build the minimal, purposeful checklist

Rules for checklist construction:
- include only items that genuinely matter and have caused failures before
- keep each item brief and unambiguous
- each item must be actionable and binary (done / not done)
- do not pad with obvious items that add ceremony without value
- mark the pause points where execution must stop for external confirmation
- define the exception triggers that halt the whole procedure

The checklist must fit on one screen.
If it does not, it is too complex. Split the task into sub-procedures with their own checklists.

Disallowed:
- long exhaustive checklists that become skimmed rather than executed
- vague checklist items that cannot be confirmed with evidence
- checklists that encode the entire task rather than the critical gate items

Exit condition:
- `procedure-checklist.md` exists
- checklist has fewer items than the complexity of the task might suggest
- each item is binary and confirmable

---

## State 2 — Pre-Procedure Confirmation

Goal:
- clear the pre-procedure section before any execution begins

The agent must walk each pre-procedure item explicitly, not in summary.

For read-do type: read the item aloud (state it), then confirm it done.
For do-confirm type: the agent may have already done the action; now confirm it.

If any pre-procedure item cannot be cleared:
- stop
- document which item blocked
- do not proceed to execution

Exit condition:
- all pre-procedure items are cleared with explicit confirmation, not presumed

---

## State 3 — Procedure Execution with Inline Checks

Goal:
- execute the procedure step by step, with each step confirmed before the next

Rules:
- do not skip steps because they seem obvious
- do not batch confirm multiple steps together
- confirm each step with evidence, not assumption
- if a pause point is reached, stop and wait for the required confirmation before continuing
- if an exception trigger activates, halt execution immediately

What to do when a step confirmation fails:
- stop
- document the failure
- do not attempt to continue unless the step is explicitly resolved or a recovery path is defined
- execute rollback/recovery if defined in the checklist

Exit condition:
- all procedure steps executed and confirmed
- no outstanding exception triggers
- pause points were respected

---

## State 4 — Post-Procedure Confirmation

Goal:
- clear the post-procedure checks after execution

Common post-procedure checks:
- system is in expected state
- data integrity is preserved
- no unintended side effects are visible
- downstream dependencies are unaffected
- monitoring or alerting is active

Exit condition:
- all post-procedure checks are cleared

---

## State 5 — Done or Escalate

Done when:
- pre-procedure checks cleared
- procedure executed with all inline checks confirmed
- post-procedure checks cleared
- no exception triggers activated

Escalate when:
- any item cannot be cleared with reasonable effort
- an exception trigger activates and the recovery path fails
- a pause point requires human confirmation that is not available
- the procedure itself appears to be wrong for the actual situation

---

## Tool Gating

### Construction phase
Allowed:
- read, inspect, draft artifacts

Disallowed:
- execution

### Execution phase
Allowed:
- only the defined procedure steps in order

Disallowed:
- improvisation or scope expansion
- skipping steps based on prior confidence
- batching confirms

---

## Circuit Breakers

Stop immediately if:
- a step confirm fails and recovery is not defined
- an exception trigger activates
- confidence is being used as a reason to skip a step
- the agent cannot confirm a step with evidence and is assuming it was done
- the task scope has changed since the checklist was built (rebuild the checklist)

---

## Failure Modes This Skill Prevents

- expert skip-ahead on high-stakes steps
- confidence-based assumption that a step was completed
- checklist theater (long lists that get skimmed rather than cleared)
- parallel execution of dependent steps without proper sequencing
- proceeding through a pause point without required confirmation

---

## Definition of Done

This skill is correctly applied when:
- `procedure-checklist.md` existed before execution began
- the checklist was the minimal useful version, not exhaustive
- each step was confirmed with evidence, not assumed
- pause points and exception triggers were honored
- the agent stopped rather than improvised when a check failed

---

## Pairing Guide

- **ETTO** — use to decide whether this task warrants a formal checklist at all
- **Unsafe Control Actions** — use when deciding which steps should be pause points or exception triggers
- **OODA Loop** — use OODA in dynamic environments; use the Checklist in well-defined high-stakes procedures
- **Working Effectively with Legacy Code** — checklist before any seam-cutting or major structural intervention

---

## Final Instruction

Do not rely on expertise to remember the important steps.
Build the smallest checklist that catches the failures.
Clear it item by item.
Then execute.
