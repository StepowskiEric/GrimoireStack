---
name: agentic-design-patterns-orchestrator-state-machine
description: "Enforce a phased workflow with explicit gates between classify, plan, execute, reflect, and verify."
triggers:
  - Task is non-trivial and one-shot replies are insufficient
  - Need to enforce a phased workflow with explicit gates
  - Need to choose which patterns are needed and which are unnecessary
disable-model-invocation: true
---

# Agentic Patterns Orchestrator — State Machine Protocol

**Conceptual overview:** Do not treat all tasks as one-shot responses. Choose the right pattern from a small toolkit: prompt chaining, routing, planning, reflection, tool use, memory management. This protocol gates that choice — classify first, select the minimum viable set, run recon, plan, execute, reflect, verify. Each phase has explicit entry/exit criteria.

---

## Core Law

The agent must not default to one-shot behavior for non-trivial tasks. It must explicitly choose which patterns are needed, which phases to run, what tools are allowed in each, and what unlocks the next phase.

---

## States

### 0 — Classification
**Goal:** classify task complexity and risk.
**Task classes:** simple, multi-step, research-heavy, execution-heavy, high-risk, multi-domain, human-approval-sensitive.
**Allowed:** classify, estimate risk, invoke ETTO or upstream gating.
**Disallowed:** assuming one-shot is enough, adding patterns without justification.
**Exit:** task class chosen, ETTO level known, `agentic-run-plan.md` created.

### 1 — Pattern Selection
**Goal:** choose the minimum set of patterns that materially improve the outcome.
**Available patterns:** prompt chaining, routing, planning, reflection, tool use, memory management, multi-agent, exception handling, human-in-the-loop, guardrails.
**Rules:** each selected pattern needs a reason; rejected patterns should be consciously rejected; orchestration must pay rent.
**Disallowed:** use-everything, multi-agent vanity, reflection without criteria.
**Exit:** pattern list with reasons documented.

### 2 — Recon / Diagnosis
**Goal:** gather evidence to support a good plan.
**Allowed:** read/search, inspect, diagnostic artifacts, non-destructive checks, identify unknowns and consumers.
**Disallowed:** modifying operational targets, writing production code, executing before recon has evidence.
**Mandatory:** before touching a shared surface, identify consumers globally. If you can't, declare blast radius unknown in `unknowns-register.md`.
**Exit:** recon evidence gathered, unknowns register updated.

### 3 — Planning
**Goal:** convert findings into an executable run plan.
**Plan must include:** objective, bounded scope, phase order, tool permissions, validation needs, stop conditions, escalation triggers.
**Disallowed:** execution without a bounded plan on non-trivial work.
**Exit:** execution path is bounded, unlock criteria met.

### 4 — Execution Unlock
**Goal:** execute within the run plan.
**Allowed:** only what the current plan phase permits.
**Disallowed:** scope expansion without plan update, switching objectives mid-run, bypassing prior gates.
**Exit:** step completed — move to verification or stop.

### 5 — Reflection / Verification
**Goal:** critique result against explicit criteria.
**Questions:** Did output meet objective? Wrong pattern chosen? Scope drift? Evidence support action? Unknowns handled? Stop conditions met?
**Allowed:** compare against criteria, catch defects, bounded correction.
**Disallowed:** endless self-critique loops, cosmetic iteration past stop condition.
**Exit:** passes verification, or bounded correction needed, or escalation required.

### 6 — Stop / Relinquish
**Goal:** end cleanly.
**Stop when:** objective complete, validation met, no invalidating evidence, change budget spent. Use a change budget (one primary objective + bounded cleanup; no second major objective after first completes).

---

## Tool Gating

| Phase | Allowed | Disallowed |
|-------|---------|------------|
| Recon | Search, read, inspect, test, diagnostic | Operational writes, production mutations |
| Planning | Artifact creation, plan updates | Execution writes |
| Execution | Only what the plan permits | Everything else |
| Verification | Tests, checks, review, bounded corrective edits | New execution |

---

## Circuit Breakers

Stop and reassess if: task changes class mid-run, unknown blast radius appears, execution reveals a second unplanned major objective, recon contradicts plan, reflection keeps finding optional cleanup, run is pattern-heavy without results.

---

## Failure Modes Prevented

One-shot misuse on multi-step tasks, over-engineered orchestration, undefined phase boundaries, tool misuse, reflection loops, multi-agent vanity, hidden blast radius, endless improvement churn.

---

## Definition of Done

`agentic-run-plan.md` exists. Required diagnostic artifacts exist. Pattern choice is justified. Phase boundaries enforced. Tools gated by phase. Unknowns handled explicitly. Stop conditions ended the run before loop.

---

**Final:** Use orchestration as a control system, not theater. Choose the minimum patterns that make the task safer, clearer, and more reliable.
