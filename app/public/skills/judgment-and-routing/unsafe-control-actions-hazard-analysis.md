# Skill: Unsafe Control Actions / Hazard Analysis

## Purpose

Use this skill when the agent is about to recommend or perform an action that could create serious harm, instability, or irreversible damage.

This skill is built around a simple question:

**How could this control action become unsafe?**

The danger is often not just:
- the action itself

It may also be:
- not taking the action when needed
- taking it when it should not be taken
- taking it too early or too late
- taking it in the wrong order
- applying it for too long
- stopping it too soon

This skill is especially strong for high-risk agent loops because it forces the agent to reason about **control**, **timing**, **constraints**, and **safeguards** before acting.

---

## Best Use-Cases

Use this skill for:
- risky automations
- infra or production changes
- migrations
- database or data-mutation actions
- permission/security-sensitive operations
- rollout decisions
- tool actions that change external state
- any task where “do the thing” is not enough and timing/sequence matters

Good fit:
- “Could this action make the system unsafe?”
- “What control mistakes are possible here?”
- “What must be true before this action is allowed?”

Bad fit:
- trivial low-risk tasks
- brainstorming
- general ideation with no consequential action

---

## Core Behavior

Before recommending or performing a consequential action, the agent should map:

### 1. Losses
What unacceptable outcomes must be avoided?
Examples:
- data loss
- outage
- privilege escalation
- corruption
- customer harm
- financial loss
- broken authentication
- destructive irreversible state

### 2. Hazards
What unsafe system states could lead to those losses?

### 3. Control Actions
What exact action is being recommended, triggered, or withheld?

### 4. Unsafe Control Actions
For each action, ask:

- What if the action is **not given** when it is needed?
- What if the action is **given** when it should not be?
- What if it is given at the **wrong time** or in the **wrong order**?
- What if it is applied for the **wrong duration**?

### 5. Safety Constraints
What must always or never happen?

### 6. Safeguards
What gating checks, monitoring, rollback, containment, or recovery mechanisms must exist?

---

## Hazard Analysis Template

```md
## Task
<what action is being considered>

## Potential Losses
- <loss>

## Hazards
- <unsafe state>

## Control Action
<the action>

## Unsafe If Not Given
<risk>

## Unsafe If Given
<risk>

## Unsafe Timing / Order
<risk>

## Unsafe Duration
<risk>

## Safety Constraints
- <constraint>

## Safeguards
- <check>
- <monitoring>
- <rollback>
- <containment>
```

---

## Agent Rules

### Do
- name the concrete losses first
- identify hazardous states, not just vague “risks”
- analyze omission, commission, timing, sequencing, and duration
- define gating conditions before action
- define rollback or containment for serious actions
- treat weak feedback signals as a real risk factor

### Do Not
- say “be careful” and stop there
- only ask whether the action is good in the happy path
- ignore timing and ordering effects
- recommend irreversible action without a safeguard story
- assume that “probably fine” is good enough for a high-loss task

---

## Strong Invocation Examples

### Production action
“Use Unsafe Control Actions / Hazard Analysis. Before recommending this rollout, map the major losses, hazards, unsafe control actions, and safeguards.”

### Migration
“Treat this as a hazard-analysis problem. I want to know how the migration could become unsafe if done too early, too late, in the wrong order, or without a rollback.”

### Tool-using agent
“Use Unsafe Control Actions / Hazard Analysis before allowing the agent to perform external-state-changing actions.”

---

## When to Pair It with Other Skills

Good pairings:
- **ETTO** -> decide how cautious the task must be
- **Thinking in Systems** -> if the action affects loops, queues, dependencies, or downstream behavior
- **Agentic Patterns Orchestrator** -> if this hazard analysis is part of a larger workflow
- **Recognition-Primed Triage** -> if urgent containment must happen before slower analysis

---

## Failure Modes This Skill Prevents

- “safe in theory, unsafe in timing”
- dangerous omission
- dangerous sequencing
- agent actions that mutate external state without safeguards
- irreversible control actions with weak feedback
- rollout/migration advice that ignores containment and rollback

---

## Quick Summary

Use this for **high-consequence actions** where the real risk is in whether, when, or how the action is applied.

Name the losses.  
Map the hazards.  
Analyze unsafe control actions.  
Define constraints and safeguards before acting.
