# Skill: Agentic Patterns Orchestrator — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must behave like a workflow system rather than a one-shot responder.

This skill turns modern agentic design patterns into an executable orchestration protocol:
- classify
- plan
- route
- gather evidence
- execute
- reflect
- verify
- stop

It is designed for real multi-step tasks, not decorative complexity.

---

## Core Law

The agent must not default to one-shot behavior for non-trivial tasks.

For meaningful tasks, it must explicitly choose:
- which patterns are needed
- which are unnecessary
- what the phases are
- what tools are allowed in each phase
- what unlocks the next phase
- what stops the loop

---

## Mandatory Control Artifacts

Before non-trivial execution, create `agentic-run-plan.md`.

Required fields:

```md
# Agentic Run Plan

## Task
<goal>

## Task Class
<simple / multi-step / high-risk / multi-domain / research-heavy / execution-heavy>

## ETTO Level
<1-5>

## Patterns Selected
- planning
- routing
- prompt chaining
- tool use
- reflection
- memory
- multi-agent collaboration
- exception handling
- human-in-the-loop
- guardrails

## Why Each Selected Pattern Is Needed
<short justification>

## Patterns Explicitly Rejected
<list with reason>

## Phases
1. <phase>
2. <phase>
3. <phase>

## Tool Permissions by Phase
<phase -> allowed tools/actions>

## Required Diagnostic Artifacts
<list>

## Unlock Conditions
<what allows move to next phase>

## Stop Conditions
<what ends the run>

## Escalation Triggers
<what forces pause/narrowing/escalation>
```

For larger tasks, also create `unknowns-register.md`:

```md
# Unknowns Register

## Known Unknowns
- <item>

## Public Interfaces / Shared Surfaces Potentially Affected
- <surface>

## Consumers Identified
- <consumer>

## Consumer Discovery Method
<search method>

## Blast Radius Confidence
<high / medium / low>

## Scope Restrictions Applied
<restriction>
```

---

## State Machine

## State 0 — Classification

Goal:
- classify the task correctly

Task classes may include:
- simple
- multi-step
- research-heavy
- execution-heavy
- high-risk
- multi-domain
- human-approval-sensitive

Rule:
Do not over-orchestrate trivial work.
Do not under-orchestrate meaningful work.

Allowed actions:
- classify task
- estimate complexity and risk
- invoke ETTO or other upstream gating skills

Disallowed actions:
- assuming one-shot is enough
- adding patterns without justification

Exit condition:
- task class chosen
- ETTO level known
- `agentic-run-plan.md` created

---

## State 1 — Pattern Selection

Goal:
- choose the minimum set of patterns that materially improve the outcome

Available patterns:
- prompt chaining
- routing
- planning
- reflection
- tool use
- memory management
- multi-agent collaboration
- exception handling
- human-in-the-loop
- guardrails

Rules:
- each selected pattern must have a reason
- each rejected pattern should be consciously rejected
- orchestration must pay rent

Allowed actions:
- select patterns
- reject unnecessary patterns
- define phase structure

Disallowed actions:
- “use everything”
- multi-agent vanity
- reflection without criteria
- memory without stable value

Exit condition:
- pattern list and reasons documented

---

## State 2 — Recon / Diagnostic Phase

Goal:
- gather enough evidence to support a good plan before execution

This phase is analysis-only for non-trivial tasks.

Allowed actions:
- read/search
- inspect files/docs/data
- create diagnostic artifacts
- run non-destructive checks
- identify unknowns
- identify consumers of shared/public surfaces

Disallowed actions:
- modifying operational targets
- writing production code/config/files unless the write is a diagnostic artifact
- execution that assumes recon is finished without evidence

Mandatory rule:
Before modifying a public interface, shared utility, schema, or widely reused workflow, the agent must identify consumers globally.  
If it cannot, it must declare blast radius unknown in `unknowns-register.md`.

Exit condition:
- required recon evidence gathered
- unknowns register updated
- unlock conditions for planning met

---

## State 3 — Planning

Goal:
- convert findings into an executable run plan

The plan must include:
- objective
- bounded scope
- phase order
- tool permissions
- validation needs
- stop conditions
- escalation triggers

Allowed actions:
- produce plan
- narrow scope
- define reversible path
- define verification method

Disallowed actions:
- execution without a bounded plan for non-trivial tasks
- pretending unknown blast radius is acceptable on high-risk work

Exit condition:
- execution path is bounded
- unlock criteria for execution met

---

## State 4 — Execution Unlock

Goal:
- permit action only after planning and recon gates are satisfied

Execution should follow the run plan.
The agent must not invent new objectives mid-run.

Allowed actions:
- only those permitted by the current phase in `agentic-run-plan.md`

Disallowed actions:
- scope expansion without plan update
- switching to a materially different objective mid-run
- bypassing prior gates because the current path “looks fine”

Exit condition:
- execution step or phase completed
- move to reflection/verification or stop

---

## State 5 — Reflection / Verification

Goal:
- critique the result against explicit criteria rather than open-ended self-doubt

Reflection questions:
- Did the output meet the stated objective?
- Were the wrong patterns chosen?
- Did the scope drift?
- Did the evidence support the action taken?
- Were unknowns handled honestly?
- Were stop conditions met?

Allowed actions:
- compare against criteria
- catch important defects
- perform bounded correction

Disallowed actions:
- endless self-critique loops
- reopening whole workflow without a reason
- cosmetic iteration past the stop condition

Exit condition:
- result passes verification
- or bounded correction is needed
- or escalation is required

---

## State 6 — Stop / Relinquish Control

Goal:
- end the run cleanly

Stop when:
- the target objective is complete
- validation criteria are met
- no new essential evidence invalidates the plan
- the change budget is spent

For many tasks, use a change budget:
- one primary objective
- bounded collateral cleanup
- no second major objective after the first is complete

This prevents looped “one more improvement” behavior.

---

## Tool Gating Guidance

### Recon Phase
Allowed:
- search/read/list/inspect/test/diagnostic artifacts

Disallowed:
- operational writes
- production mutations
- rollout actions

### Planning Phase
Allowed:
- artifact creation
- plan updates
- non-destructive reasoning

Disallowed:
- execution writes before unlock

### Execution Phase
Allowed:
- only tools/actions explicitly permitted by the plan

### Verification Phase
Allowed:
- tests/checks/review/bounded corrective edits

Rule:
Tool permissions should change by phase, not remain constant.

---

## Consumer Discovery / Unknowns Rule

Before modifying any shared surface, the agent must:
1. run global consumer discovery
2. list consumers in `unknowns-register.md`
3. rate blast radius confidence
4. either proceed with confidence, narrow scope, or declare risk explicitly

If consumer discovery fails:
- blast radius is unknown
- high-risk changes should not proceed casually

---

## Circuit Breakers

Stop and reassess immediately if:
- the task changes class mid-run
- unknown blast radius appears
- execution reveals a second unplanned major objective
- recon evidence contradicts the plan
- reflection keeps finding new optional cleanup with no end
- the run has become pattern-heavy without result improvement

---

## Failure Modes This Skill Prevents

- one-shot misuse on multi-step tasks
- over-engineered orchestration
- undefined phase boundaries
- tool misuse
- reflection loops
- multi-agent vanity
- hidden blast radius
- endless improvement churn

---

## Definition of Done

This skill is correctly applied when:
- `agentic-run-plan.md` exists
- required diagnostic artifacts exist
- pattern choice is justified
- phase boundaries are enforced
- tools were gated by phase
- unknowns and blast radius were handled explicitly
- stop conditions ended the run before it became a loop

---

## Final Instruction

Use orchestration as a control system, not theater.  
Choose the minimum patterns that make the task safer, clearer, and more reliable.
