# Skill: OODA Loop — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must operate in an environment where conditions are changing rapidly, adversarial, or unpredictable between actions.

This skill converts Boyd's OODA Loop into an enforced operating protocol:
1. **Observe** — gather raw, unfiltered data from the environment
2. **Orient** — build a mental model from that data, filtered through experience and context
3. **Decide** — select a course of action from the oriented picture
4. **Act** — execute the decision with bounded scope
5. **Loop** — immediately re-observe after acting, because the environment has changed

OODA is not the same as Toyota Kata.
Toyota Kata is for iterative improvement in a stable-enough system.
OODA is for maintaining decision tempo against an environment that shifts between every move.

---

## Core Law

The agent with the faster, more accurate OODA cycle wins.

Speed without accuracy is recklessness.
Accuracy without speed loses tempo.

The agent must move through the loop faster than the situation deteriorates — but it must orient correctly, not just react blindly.

---

## Mandatory Diagnostic Artifact

Before the first action, create `ooda-cycle-log.md`.

Required structure:

```md
# OODA Cycle Log

## Task / Mission
<one-sentence description>

## Cycle Number
<iteration count>

## Observe
- Raw signals observed:
  - <signal>
- Gaps or missing data:
  - <gap>

## Orient
- Prior mental model:
  - <what was believed before>
- Model update:
  - <what changed>
- Active hypotheses:
  - <hypothesis>
- Mismatches with prior model:
  - <mismatch>

## Decide
- Options considered:
  - <option>
- Selected action:
  - <action>
- Why this action fits the oriented picture:
  - <reason>

## Act
- Executed action (bounded scope):
  - <action taken>
- Time-box or scope limit:
  - <limit>

## Re-observe (loop trigger)
- Environment changed how:
  - <change>
- Next cycle warranted: yes / no
- Stop condition met: yes / no
```

---

## State Machine

## State 0 — Mission Framing

Goal:
- define the mission objective and success condition clearly

Questions:
- What outcome must be achieved?
- What signals would indicate success?
- What signals would indicate the situation has escalated beyond this skill?

Allowed actions:
- read context, gather available signals
- create `ooda-cycle-log.md`

Disallowed actions:
- acting without framing the mission first
- skipping to action because urgency feels high

Exit condition:
- mission statement is clear
- initial observation context is ready

---

## State 1 — Observe

Goal:
- collect raw, unfiltered data about the current environment

Mandatory behaviors:
- do not interpret yet
- do not filter to confirm prior beliefs
- capture what is actually present, not what is expected

Observation sources:
- tool outputs, logs, error messages, metrics
- recent state changes, deploys, configuration changes
- user signals, external events, system feedback
- gaps and absences (what is missing that should be present)

Questions:
- What signals are actually present right now?
- What is changing versus what is stable?
- What is absent that is normally present?
- What data was expected but did not arrive?

Disallowed:
- filtering observations through the prior mental model before they are captured
- treating absence of signal as confirmation of prior belief

Exit condition:
- raw observations are recorded without interpretation

---

## State 2 — Orient

Goal:
- build or update the mental model from observations

This is the most important state in the loop.

Orientation is not just analysis. It includes:
- prior experience with similar patterns
- cultural and domain context
- implicit knowledge about how the system behaves
- detection of mismatches between expectation and reality

Mandatory questions:
- How does what I observed compare to what I expected?
- What prior assumptions need to be revised?
- What is the most accurate picture of the situation right now?
- What hypotheses explain the observations?
- Which hypothesis is currently strongest and why?

Rules:
- if two or more hypotheses explain the observations equally well, record both; do not collapse prematurely
- update the mental model explicitly, do not silently carry forward a stale picture
- if orientation is blocked by missing information, note the gap and decide whether to seek it or act with explicit uncertainty

Disallowed:
- acting from the prior mental model without updating
- treating the first explanation as final without checking alternatives
- orientation loops that last longer than the action tempo requires

Exit condition:
- updated mental model is written
- active hypotheses are listed
- decision-relevant uncertainties are named

---

## State 3 — Decide

Goal:
- select one bounded action based on the oriented picture

Rules:
- choose the action that best fits the current mental model
- prefer actions that are bounded, reversible, and information-producing when possible
- prefer speed over perfection when the environment is degrading faster than analysis can complete
- if no option dominates clearly, choose the one with the best fallback

Allowed actions:
- select a course of action
- record the selection and the reasoning

Disallowed:
- deciding by exhaustive option comparison when tempo matters
- making decisions that far exceed the scope of what the orientation supports
- deciding to do nothing without explicitly naming it as the chosen action

Exit condition:
- one action is selected
- rationale for selection is documented

---

## State 4 — Act

Goal:
- execute the selected action within a bounded scope

Rules:
- act within the scope decided — no expansion
- hold scope tight even if adjacent problems become visible
- complete the action within a defined time-box or scope limit
- do not treat "act" as permission to fix everything at once

Adjacent observations during action:
- note them for the next Observe phase
- do not allow them to derail the current action

Exit condition:
- action executed within scope
- side observations captured for next cycle

---

## State 5 — Loop Assessment

Goal:
- determine whether to loop, stop, or escalate

Loop if:
- the mission objective is not yet met
- the environment changed materially since the last Observe
- new signals are present that require updated orientation
- the last action produced unexpected results

Stop if:
- the mission objective is met
- conditions have stabilized and a slower, deeper skill is now more appropriate
- the task requires more deliberate analysis than OODA tempo supports

Escalate if:
- orientation is consistently blocked by missing data that cannot be gathered
- the environment is escalating faster than the loop can keep up
- actions are not producing expected effects and the model is not converging
- the situation now requires human judgment or broader authority

---

## Tool Gating

### Observe phase
Allowed:
- read, search, inspect, fetch logs, gather metrics, check state

Disallowed:
- write operations
- irreversible state changes

### Orient phase
Allowed:
- artifact writing (update ooda-cycle-log.md)
- additional light reads to close gaps

Disallowed:
- broad writes
- actions that change external state

### Act phase
Allowed:
- only the scoped action selected in Decide

Disallowed:
- expansion beyond the decided scope
- cleanup or optimization not tied to the decided action

---

## Circuit Breakers

Stop and escalate if:
- more than three consecutive cycles fail to produce convergent orientation
- actions are not producing expected effects and no new observation explains why
- the mission objective has changed but the loop has not been reset
- the agent is looping without learning (same observe → same orient → same decide)
- the situation has moved from fast-moving to stable, making a deeper skill more appropriate

---

## Failure Modes This Skill Prevents

- reacting without observing (acting on stale mental model)
- observing without orienting (confusing data with understanding)
- orienting without deciding (analysis paralysis)
- deciding without acting (plan without execution)
- acting without looping (one-shot response when the situation keeps moving)
- looping without learning (identical cycles with no model update)

---

## Definition of Done

This skill is correctly applied when:
- `ooda-cycle-log.md` exists and was updated each cycle
- observations were recorded before interpretation
- orientation was updated, not just carried forward
- decisions were bounded and action-scoped
- the loop was closed: re-observation happened after action
- the agent stopped when the mission was met or the situation required a different skill

---

## Pairing Guide

- **Recognition-Primed Triage** — use RPT for the initial Decide when pattern recognition dominates
- **Unsafe Control Actions** — use before Act when the selected action has high consequence
- **Cynefin** — use to determine whether OODA is the right skill at all (chaotic or rapidly-complex domains)
- **Thinking in Systems** — use when orientation repeatedly fails due to feedback loops or delays

---

## Final Instruction

Observe what is actually there.
Orient to build the truest picture you can.
Decide with bounded confidence.
Act within scope.
Loop — the environment will not wait.
