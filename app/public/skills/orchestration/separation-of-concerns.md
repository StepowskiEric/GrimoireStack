# Skill: Separation of Concerns for AI Agent Orchestration

## Purpose

Use this skill when the agent is orchestrating a multi-step task and needs to prevent different concerns from contaminating each other's reasoning, side effects, or state.

This skill is inspired by Dijkstra's *On the Role of Scientific Thought* (1974), which introduced Separation of Concerns as a principle for managing intellectual complexity, and its decades of application in software engineering.

Applied to agent orchestration, Separation of Concerns means:
- **planning concerns** are separate from **execution concerns**
- **diagnosis concerns** are separate from **remediation concerns**
- **observation concerns** are separate from **interpretation concerns**
- one sub-task's assumptions and side effects do not silently leak into another sub-task's state

This is not primarily about code architecture.
It is about orchestration discipline: keeping each phase of a complex task intellectually clean so that errors in one phase do not corrupt others.

---

## Core Rule

Do not mix concerns.

Identify which concern each part of the work belongs to.
Execute each concern in its proper phase.
Do not let the output of one concern pre-solve or contaminate the next.

---

## When to Use

Use this skill when:
- orchestrating a multi-step task that involves planning, then investigation, then action, then verification
- debugging a complex system where diagnosis and remediation have been happening simultaneously and producing confusing results
- managing multiple sub-agents or sub-tasks that share context or state
- a previous attempt at a task produced confused output because different kinds of reasoning were happening at the same time
- the task is large enough that a lack of structure is causing the agent to answer the wrong question

Do not use when:
- the task is simple enough to complete in one step without concern mixing
- the concerns are genuinely inseparable in this context

---

## The Key Concern Pairs to Separate

### Planning vs. Execution
**Planning**: deciding what to do, in what order, with what tools.
**Execution**: doing it.

These must not happen simultaneously.
An agent that plans and executes at the same time tends to plan only far enough ahead to justify the action it was already inclined to take.

Rule: complete the plan before beginning execution. Revise the plan before resuming execution if the plan changes.

### Diagnosis vs. Remediation
**Diagnosis**: understanding what is wrong and why.
**Remediation**: fixing it.

An agent that diagnoses and remediates simultaneously tends to:
- fix symptoms before understanding root causes
- apply the first plausible fix before confirming the diagnosis
- generate a post-hoc diagnosis that justifies the fix that was already attempted

Rule: diagnosis must produce a clear root cause hypothesis before remediation begins. The root cause hypothesis must be documented before the fix is implemented.

### Observation vs. Interpretation
**Observation**: collecting raw data — logs, metrics, error messages, test output, tool output.
**Interpretation**: deciding what that data means.

An agent that interprets while observing tends to:
- filter observations through its prior interpretation, missing disconfirming evidence
- stop observing when it has enough data to justify its current interpretation
- conflate what was observed with what was inferred

Rule: observations should be recorded before interpretation is applied. The raw evidence should be preserved separately from the agent's conclusions about it.

### Design vs. Review
**Design**: generating or proposing an approach.
**Review**: critiquing it for correctness, completeness, and risks.

An agent that designs and reviews simultaneously tends to:
- not apply the same scrutiny to its own proposals that it would apply to an external proposal
- rationalize design decisions rather than genuinely questioning them

Rule: generate the design or draft fully before applying critique. Do not edit while generating if the edit is really a review.

### Scope Definition vs. Scope Execution
**Scope definition**: deciding what is in and out of this task.
**Scope execution**: doing exactly what was scoped.

An agent that executes while deciding scope tends to:
- expand scope mid-execution when adjacent work becomes visible
- complete work outside the stated scope without flagging it
- lose track of what the original goal was

Rule: define scope explicitly before execution begins. When adjacent work is discovered during execution, note it for later rather than acting on it immediately.

---

## Separation of Concerns Template

```md
## Task
<description>

## Concern Map
| Phase | Concern | What Belongs Here | What Does NOT Belong Here |
|-------|---------|-------------------|--------------------------|
| 1 | Observation | raw data, logs, measurements | interpretation, hypotheses |
| 2 | Interpretation | model of what the data means | fixes, changes, designs |
| 3 | Planning | what to do and in what order | execution, premature fixes |
| 4 | Execution | bounded action on the plan | new planning, scope expansion |
| 5 | Review | critique against criteria | generation of new alternatives |
| 6 | Verification | confirming the result | new execution |

## Concern Separation Violations Identified
- Violation: <what concern was mixed with another concern>
  - Effect: <what confusion or error it caused>
  - Correction: <how to re-separate>

## Execution Plan (separated by concern phase)
### Phase 1: Observation
- <what will be observed>

### Phase 2: Interpretation
- <what will be interpreted from the observations>

### Phase 3: Planning
- <what actions will be planned based on the interpretation>

### Phase 4: Execution
- <what will be executed from the plan, bounded to scope>

### Phase 5: Review
- <how the execution result will be reviewed>

### Phase 6: Verification
- <how correctness will be confirmed>
```

---

## Agent Rules

### Do
- complete the current phase before beginning the next
- note discoveries from one phase for later phases rather than acting on them immediately
- preserve raw observations separate from interpretations
- generate a plan before executing it, even if the plan is simple

### Do Not
- diagnose and fix simultaneously
- plan while executing
- expand scope mid-execution without a deliberate scope revision
- let the urgency of one phase bleed into the rigor of the next

---

## Common Concern Mixing Patterns

### Planning-Execution Conflation
"I'll figure out the rest as I go."
Effect: the plan is only as good as the first step; later steps are improvised without the benefit of upfront reasoning.
Fix: write the plan to the end before beginning any execution.

### Diagnosis-Remediation Conflation
The agent applies the first plausible fix before confirming the diagnosis.
Effect: the fix is a symptom treatment; the root cause persists.
Fix: stop at a documented root cause hypothesis before remediation begins.

### Observation-Interpretation Conflation
The agent starts interpreting before all relevant observations are in.
Effect: interpretation anchors on early observations; later observations are filtered to fit.
Fix: gather observations in a separate phase from interpretation.

### Scope Drift
During execution, the agent notices adjacent work and starts doing it.
Effect: the original goal may be completed but the scope has silently expanded, producing unexpected side effects.
Fix: note adjacent work as a future item; do not act on it in the current execution phase.

---

## Failure Modes This Skill Prevents

- premature remediation that treats symptoms instead of root causes
- scope drift during execution that produces unintended side effects
- observation bias caused by interpreting while observing
- plan collapse caused by designing only far enough ahead to justify the current impulse
- review failure caused by the same agent that generated also approving without genuine scrutiny

---

## Pairing Guide

- **Agentic Design Patterns** — agentic orchestration patterns (planning, reflection, verification) align with the concern phases; Separation of Concerns ensures they do not blur
- **OODA Loop** — OODA separates Observe and Orient explicitly; Separation of Concerns generalizes that principle across all orchestration phases
- **How to Solve It** — How to Solve It separates problem-framing from problem-solving; Separation of Concerns extends this to all work phases
- **Bounded Self-Revision** — Bounded Self-Revision separates generation from critique; Separation of Concerns names this as one instance of a broader principle

---

## Definition of Done

This skill was applied correctly when:
- the task was decomposed into distinct concern phases
- each concern was executed in its proper phase
- concern mixing violations were identified and corrected
- observations were preserved separately from interpretations
- the plan was complete before execution began
- scope was defined before execution and scope drift was prevented during execution

---

## Final Instruction

Do not diagnose while you fix.
Do not execute while you plan.
Do not interpret while you observe.
Do not review while you generate.

Each concern has its phase.
Complete the phase.
Then move to the next.
