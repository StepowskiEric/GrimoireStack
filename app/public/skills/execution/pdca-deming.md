# Skill: PDCA / Shewhart Cycle — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must improve a process, system, or output through a measurement-anchored cycle of planning, execution, and verification before standardizing or escalating.

This skill is based on the Plan-Do-Check-Act cycle introduced by Walter Shewhart and developed by W. Edwards Deming.

PDCA is not the same as Toyota Kata.
Toyota Kata focuses on one obstacle at a time and discovers the path through rapid experimentation.
PDCA is more explicitly about measurement: the Check phase requires comparing actual results against a standard or prediction, and the Act phase standardizes the improvement or escalates the problem.

The protocol enforces:
- planning with a measurable prediction before doing
- measuring actual results before acting on them
- standardizing only what worked
- escalating or restarting when the check fails

---

## Core Law

Do not standardize what you have not measured.
Do not act on results you have not checked against the plan.

---

## Mandatory Diagnostic Artifact

Before beginning, create `pdca-cycle.md`.

Required structure:

```md
# PDCA Cycle

## Cycle Number
<iteration>

## Problem Statement
<what needs improving and why>

## Current Baseline
<measurable current state with evidence>

## Plan

### Goal
<specific measurable target>

### Root Cause Hypothesis
<what is believed to be causing the current state>

### Planned Change
<what will be done differently>

### Predicted Result
<what the measurement should show if the change works>

### Check Method
<how the result will be measured and against what standard>

## Do
### Actions Taken
- <action>

### Scope Limits
<what was explicitly excluded from this cycle>

## Check
### Actual Result
<what was measured>

### Comparison to Prediction
<did the result match the prediction? by how much?>

### Explanation of Gap (if any)
<why did the result differ from prediction?>

## Act
### Decision
<standardize / escalate / modify / abandon>

### If Standardize
<what standard or procedure was updated>

### If Escalate
<what needs broader attention>

### If Modify
<what changes before the next cycle>

### Next Cycle Trigger
<what starts the next PDCA cycle, if any>
```

---

## State Machine

## State 0 — Intake

Goal:
- determine whether PDCA is the right protocol for this task

Use PDCA when:
- a process, system, or output is underperforming against a measurable standard
- improvement is desired but the correct change is not yet certain
- previous attempts at change were not validated before being standardized
- the improvement must be reproducible and verifiable, not just felt

Do not use PDCA as the primary skill when:
- the problem is a one-time incident requiring immediate containment
- the problem is fully understood and the fix is obvious and verified
- exploration is more important than measurement (use Toyota Kata or Explore vs Exploit instead)

Exit condition:
- task is confirmed as a measurable-improvement problem

---

## State 1 — Plan

Goal:
- define a specific, measurable target, a root cause hypothesis, a planned change, and a predicted result

The plan must include:
- a baseline measurement of the current state
- a specific target (not "better" but "response time under 200ms for the p95 path")
- a hypothesis for why the current state exists
- a prediction of what the measurement will show if the change works

Rules:
- if the baseline cannot be measured, fix observability before planning a change
- if the root cause is genuinely unknown, use a diagnostic skill first (How to Solve It or Thinking in Systems)
- predictions must be specific enough to falsify

Disallowed:
- starting with a change before a baseline exists
- vague goals ("make it better") that cannot be checked
- plans that mix multiple hypotheses into a single change

Exit condition:
- `pdca-cycle.md` Plan section is complete
- prediction is specific and measurable

---

## State 2 — Do

Goal:
- execute the planned change, within the defined scope

Rules:
- do exactly what was planned
- do not expand scope because adjacent problems are visible
- do not change the plan mid-execution without restarting from State 1
- document exactly what was done and what was excluded

This is a bounded execution, not an open-ended improvement session.

Disallowed:
- improvising beyond the plan
- skipping steps that feel unnecessary
- treating Do as permission to address other problems simultaneously

Exit condition:
- planned change executed within scope
- actions documented in `pdca-cycle.md`

---

## State 3 — Check

Goal:
- measure the actual result and compare it to the prediction

This is the most discipline-requiring state.
Most improvement cycles skip or abbreviate Check.
PDCA derives its power from refusing to skip it.

Mandatory behaviors:
- measure using the check method defined in Plan
- compare the actual result to the prediction, not just to the prior baseline
- if the result matches the prediction, note it
- if the result does not match, investigate why — this is information, not failure

Questions:
- Did the measurement match the prediction?
- If not, what explains the gap?
- Was the root cause hypothesis correct?
- Was the change implemented as planned?
- Are there confounding factors that invalidated the measurement?

Rules:
- do not skip to Act without completing Check
- a result that "feels like improvement" is not the same as a measured result
- if the check method was inadequate, note this and rebuild observability before the next cycle

Exit condition:
- actual result is measured and documented
- comparison to prediction is recorded with explanation of any gap

---

## State 4 — Act

Goal:
- decide what to do with the result: standardize, modify, escalate, or abandon

Four possible decisions:

**Standardize:**
The change worked and the prediction was confirmed.
Update the relevant process, procedure, configuration, or documentation.
Establish the new state as the baseline for future cycles.

**Modify:**
The change showed partial or directional improvement but the prediction was not fully confirmed.
Identify what to adjust before the next cycle.
Do not standardize a partially-confirmed change.

**Escalate:**
The change produced no improvement or made things worse.
The root cause hypothesis was wrong.
Broader investigation, different tooling, or different expertise is required.

**Abandon:**
The current approach cannot produce the desired result within acceptable cost or risk.
Name what was learned.
Redirect to a different goal.

Rules:
- do not standardize a change that was not confirmed by the Check
- do not repeat the same change cycle without updating the hypothesis
- do not escalate before Check has been completed
- document the decision and the reasoning regardless of outcome

Exit condition:
- Act decision is documented
- next steps are defined or the cycle is cleanly closed

---

## State 5 — Stop / Loop

Stop when:
- the target condition is confirmed by measurement
- the decision was to abandon the current approach and a different path is now needed
- the cycle has produced diminishing returns and the investment exceeds the improvement value

Loop when:
- the decision was to Modify (return to Plan with an updated hypothesis)
- the target condition was confirmed but a new improvement opportunity was revealed
- Escalate resolved and a new plan is ready

---

## Tool Gating

### Plan phase
Allowed:
- read, inspect, gather metrics, analyze baselines
- artifact writing

Disallowed:
- writes to the system being improved
- configuration changes

### Do phase
Allowed:
- only the bounded planned change

Disallowed:
- scope expansion
- parallel improvements

### Check phase
Allowed:
- measurement tools, test runners, metrics queries, log inspection

Disallowed:
- additional changes to the system before Check is complete

---

## Circuit Breakers

Stop immediately if:
- the baseline was never measured (observability gap — fix this first)
- the prediction was never written down (restart from Plan)
- Check is being skipped or summarized ("it seemed better")
- the same cycle is repeating without a hypothesis update
- the scope of the planned change grew during Do

---

## Failure Modes This Skill Prevents

- standardizing improvements that were never verified
- acting on felt improvement instead of measured improvement
- implementing changes without a prediction (nothing to check against)
- repeating the same failed approach without updating the hypothesis
- mixing multiple changes in one cycle (obscures which change caused the result)

---

## Definition of Done

This skill is correctly applied when:
- `pdca-cycle.md` exists with all four phases completed
- the baseline was measured before the change
- the prediction was written before the change was executed
- the Check compared actual results to the prediction explicitly
- the Act decision was based on the Check, not on intuition
- any standardization was grounded in a confirmed check

---

## Pairing Guide

- **Toyota Kata** — when the obstacle is unknown, use Toyota Kata to discover it; when the obstacle is known, use PDCA to eliminate it with measurement discipline
- **Thinking in Systems** — use before Plan if the root cause involves feedback loops
- **Theory of Constraints** — identify the constraint first, then apply PDCA to elevate it
- **Bounded Self-Revision** — use PDCA structure when the "system" being improved is an output like a document or prompt

---

## Final Instruction

Plan with a prediction.
Do exactly what was planned.
Check against the prediction, not just against the baseline.
Act on what the measurement tells you, not on what it felt like.
