# Skill: Thoroughness Check (ETTO) — State Machine Protocol for AI Agents

## Purpose

Use this skill as a universal preflight protocol before the agent performs any meaningful task.

This is not a philosophy note.  
This is a gating protocol.

It converts the Efficiency–Thoroughness Trade-Off into an executable control system that decides:
- how much evidence is required
- whether the agent may act yet
- what tools are permitted
- how much validation is mandatory
- when the agent must stop, escalate, or reduce scope

The purpose is to prevent a fast low-rigor response from being applied to a high-risk task.

---

## Core Law

The agent must not begin execution until it classifies the task’s required balance between:
- efficiency
- thoroughness
- reversibility
- blast radius
- uncertainty
- cost of error

This skill should run before most other non-trivial skills.

---

## Output Artifact (Mandatory Before Action)

Before execution, the agent must create `etto-preflight.md`.

Required fields:

```md
# ETTO Preflight

## Task
<one-sentence task statement>

## Primary Objective
<what success means>

## Cost of Error
<trivial / moderate / high / severe>

## Reversibility
<easy / partial / difficult / irreversible>

## Blast Radius
<local / shared / system-wide / external>

## Uncertainty
<low / medium / high>

## Time Pressure
<low / medium / high>

## Required Precision
<approximate / moderate / exact>

## Chosen ETTO Level
<1-5>

## Execution Mode
<fast / balanced / thorough / maximum caution>

## Required Evidence Before Action
<list>

## Required Validation Before Completion
<list>

## Escalation Triggers
<list>
```

No execution should begin until this artifact exists.

---

## State Machine

## State 0 — Intake

Goal:
- identify the real task
- identify whether this is trivial or meaningful
- decide whether ETTO is required

If the task is clearly trivial and reversible, ETTO may be lightweight.
If the task is non-trivial, ETTO is mandatory.

Allowed actions:
- restate task
- identify task class
- identify obvious risk factors

Disallowed actions:
- modifying code, files, configs, or external state
- high-confidence recommendations before classification

Exit condition:
- task is clearly framed
- ETTO artifact must be created

---

## State 1 — Classification

Goal:
- rate the task on the ETTO scale

### ETTO-1
Speed dominant.  
Examples: brainstorming, rough ideation, low-stakes drafts.

### ETTO-2
Lean but careful.  
Examples: simple edits, routine transformations, low-risk suggestions.

### ETTO-3
Balanced.  
Examples: non-trivial implementation, debugging, planning, code review.

### ETTO-4
Thoroughness dominant.  
Examples: migrations, auth, security, production-risk changes, destructive operations.

### ETTO-5
Maximum caution.  
Examples: medical, legal, financial, privacy/security incidents, irreversible actions, critical compliance tasks.

Allowed actions:
- risk scoring
- uncertainty declaration
- evidence planning
- defining validation level

Disallowed actions:
- treating ETTO-4/5 tasks like ETTO-1/2 tasks
- vague “I’ll just be careful” without a classification artifact

Exit condition:
- ETTO level chosen
- evidence threshold defined
- execution mode chosen

---

## State 2 — Evidence Gate

Goal:
- determine what minimum evidence is required before acting

### ETTO-1
Minimal evidence acceptable.

### ETTO-2
Basic evidence acceptable.

### ETTO-3
At least moderate evidence required:
- check assumptions
- inspect key dependencies
- compare alternatives if needed

### ETTO-4
Strong evidence required:
- verify load-bearing assumptions
- inspect blast radius
- identify second-order effects
- define rollback or containment

### ETTO-5
Very strong evidence required:
- conservative scope
- explicit uncertainty
- refusal or safe redirection where appropriate
- strong external support and validation

Allowed actions:
- research
- checking assumptions
- scoping validation needs

Disallowed actions:
- acting before evidence threshold is met
- hiding missing evidence

Exit condition:
- evidence threshold satisfied
- or task must be narrowed / escalated / refused

---

## State 3 — Execution Unlock

Goal:
- permit action only at the level allowed by the ETTO rating

### Fast Mode (ETTO-1/2)
- move quickly
- avoid over-research
- deliver concise, low-ceremony output
- note uncertainty briefly when relevant

### Balanced Mode (ETTO-3)
- verify important assumptions
- avoid first-answer lock-in
- test major alternatives mentally or directly
- act with moderate caution

### Thorough Mode (ETTO-4)
- use bounded, reversible steps
- verify before acting
- surface residual uncertainty
- prefer containment over aggressive change

### Maximum Caution Mode (ETTO-5)
- conservative action only
- strong evidence
- narrow scope
- explicit safety boundaries
- refuse unsafe action when needed

Allowed actions:
- those consistent with the chosen execution mode

Disallowed actions:
- behaving more casually than the chosen ETTO level permits
- pretending all tasks deserve the same rigor

Exit condition:
- action completed within allowed rigor envelope

---

## State 4 — Validation Gate

Goal:
- verify completion using the validation level declared in the preflight artifact

Validation should match ETTO level.

### ETTO-1
Light plausibility check.

### ETTO-2
Basic consistency check.

### ETTO-3
Validation of core assumptions and outcome.

### ETTO-4
Strong verification with risk review.

### ETTO-5
Maximum validation or safe non-execution/refusal.

Allowed actions:
- validate
- compare result to objective
- state residual uncertainty honestly

Disallowed actions:
- claiming completion without matched validation
- using low-effort validation for high-effort risk

Exit condition:
- validation meets pre-declared threshold
- or task is reported as incomplete/uncertain

---

## State 5 — Stop / Escalate

Goal:
- end cleanly
- avoid scope creep
- avoid accidental downgrade of rigor
- escalate when the task cannot be safely completed under current certainty

Escalate when:
- blast radius is unknown
- facts remain highly uncertain
- evidence threshold cannot be met
- the task moved into a higher ETTO class midstream
- acting would require pretending certainty that does not exist

---

## Tool Gating Guidance

### ETTO-1 / ETTO-2
Tools may be used lightly or not at all depending on task.

### ETTO-3
Use tools or checks when they materially improve confidence.

### ETTO-4 / ETTO-5
Critical assumptions must be checked before action.
Verification and scoping tools are not optional.

Rule:
Higher ETTO means the burden of proof rises before action.

---

## Circuit Breakers

Stop and reassess immediately if:
- the task appears more irreversible than first believed
- new evidence expands blast radius
- uncertainty jumps materially
- a “simple” task becomes a multi-system task
- high confidence was based on thin evidence

---

## Failure Modes This Skill Prevents

- speed-first hallucination on high-risk work
- over-analysis of trivial work
- false confidence
- one-mode behavior across all tasks
- silent mismatch between stakes and rigor

---

## Definition of Done

This skill is correctly applied when:
- `etto-preflight.md` exists
- the ETTO level is explicit
- evidence threshold matched the risk
- execution matched the chosen mode
- validation matched the chosen mode
- the agent stopped instead of quietly improvising past the risk boundary

---

## Final Instruction

Do not be always fast.  
Do not be always thorough.  
Be appropriately rigorous for the real stakes of the task.
