# Skill: Recognition-Primed Triage — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must execute a formal, gated incident-response or urgent-triage protocol — not just make a fast first move, but make it through an enforced sequence that prevents reckless action while maintaining response tempo.

This is the protocol version of the Recognition-Primed Triage framework.
The framework version (conceptual) applies RPD as a reasoning lens.
This state machine version enforces gates at each step:
1. explicit pattern recognition and confidence declaration before any action
2. mandatory mental simulation before the action is executed
3. bounded first action within declared scope
4. mandatory reassessment after the action
5. explicit hand-off when the situation requires a different skill

Source: Gary Klein's Recognition-Primed Decision model, *Sources of Power*.

---

## Core Law

Speed and recklessness are not the same.

The agent must move fast — but through the gates, not around them.

---

## Mandatory Diagnostic Artifact

At triage start, create `triage-record.md`.

Required structure:

```md
# Triage Record

## Situation
<what is happening>

## Gate 1: Pattern Recognition
- Situation pattern:
  - <what kind of incident/problem this resembles>
- Key diagnostic cues:
  - <cue>
- Pattern confidence: high / medium / low
- Alternative patterns considered:
  - <alternative> — ruled out because: <reason>

## Gate 2: Mental Simulation
- Proposed first action:
  - <action>
- Expected immediate result:
  - <prediction>
- What could go wrong:
  - <risk>
- Failure signal (what would prove this action was wrong):
  - <signal>
- Reversibility: reversible / partially reversible / irreversible
- Simulation verdict: proceed / refine / reject

## Gate 3: First Action Execution
- Action executed:
  - <exact action taken>
- Declared scope limit:
  - <what is explicitly excluded>
- Observations during execution:
  - <side observations noted for next cycle>

## Gate 4: Reassessment
- Actual result:
  - <what happened>
- Expected vs. actual:
  - <match / mismatch — and why>
- Situation update:
  - <how the situation has changed>
- Next action:
  - <continue triage loop / hand off to deeper diagnosis / escalate>

## Hand-Off Decision
- Hand-off trigger met: yes / no
- Skill to hand off to: <skill name>
- Reason: <why triage is complete or insufficient>
```

---

## State Machine

## State 0 — Triage Activation

Goal:
- confirm this is a triage situation and not a task requiring slower deliberation

Triage is appropriate when:
- something is wrong and action is needed before full analysis is possible
- delay has real cost (downtime, user impact, data loss risk)
- the first move must be chosen from incomplete information

Triage is not appropriate when:
- the situation is stable and slower analysis is feasible
- no urgency exists
- a full diagnostic protocol (How to Solve It, Thinking in Systems) is both feasible and appropriate

Exit condition:
- triage is confirmed appropriate
- `triage-record.md` is created

---

## State 1 — Pattern Recognition (Gate 1)

Goal:
- match the situation to a known pattern and declare confidence level

The agent must:
1. state what kind of situation this resembles
2. name the key diagnostic cues that support the pattern match
3. name at least one alternative pattern and why it was ruled out
4. declare a confidence level: high / medium / low

High confidence: the pattern match is strong and cues clearly distinguish it from alternatives.
Medium confidence: the pattern is the best match but alternatives remain plausible.
Low confidence: the situation is novel or cues are ambiguous.

Rules:
- do not name a pattern without stating the cues that support it
- do not skip the alternative patterns step
- low confidence does not prevent proceeding — it constrains the first action to more reversible options

Exit condition:
- pattern is declared with cues and confidence level
- at least one alternative pattern is addressed

---

## State 2 — Mental Simulation (Gate 2)

Goal:
- mentally simulate the proposed first action before executing it

The agent must:
1. state the proposed first action
2. predict the expected immediate result
3. identify what could go wrong
4. name the failure signal (what result would prove this action was wrong)
5. assess reversibility
6. declare the simulation verdict: proceed / refine / reject

Proceed: simulation shows the action is likely safe, bounded, and informative.
Refine: the action is too broad or has an unnecessary risk that can be reduced.
Reject: the simulation reveals the action is likely to make things worse; choose a different first action.

Rules:
- do not execute without completing the simulation
- if the simulation verdict is Reject, return to State 1 with updated information
- if the simulation verdict is Refine, narrow the action before proceeding

Exit condition:
- simulation is complete
- verdict is documented
- if Proceed: execution is unlocked

---

## State 3 — First Action Execution (Gate 3)

Goal:
- execute exactly the action decided in State 2 within the declared scope

Rules:
- do only what was declared
- do not expand scope because adjacent issues are visible during execution
- note side observations for Gate 4 without acting on them during this gate
- document exactly what was done

Low confidence pattern (from Gate 1) means:
- prefer information-gathering actions over state-change actions
- prefer reversible actions
- keep the blast radius as small as possible

Exit condition:
- action executed as declared
- observations from execution are noted

---

## State 4 — Reassessment (Gate 4)

Goal:
- compare actual result to expected result and decide the next move consciously

The agent must:
1. record the actual result
2. compare it to the expected result from Gate 2
3. update the situation model based on what changed
4. decide: continue triage loop, hand off to deeper diagnosis, or escalate

Continue triage:
- the first action reduced urgency but the situation is not resolved
- a second bounded action is appropriate

Hand off to deeper diagnosis:
- the immediate urgency is reduced
- the root cause requires non-triage analysis (How to Solve It, Thinking in Systems, etc.)
- the situation is now Complicated rather than Chaotic

Escalate:
- the first action made things worse
- the pattern match was wrong and the situation is not resolving
- the situation requires authority or intervention beyond the agent's scope

Exit condition:
- reassessment is documented
- next decision is recorded and acted upon

---

## State 5 — Hand-Off

Goal:
- cleanly transfer to the appropriate deeper skill when triage is complete

Triage is complete when:
- immediate instability is reduced
- the most urgent risk is contained
- the situation requires analysis that triage is not the right tool for

Hand-off documentation must include:
- current situation status
- what was tried and what happened
- current best hypothesis for root cause
- remaining risks
- recommended next skill

---

## Tool Gating

### Pattern recognition and simulation
Allowed:
- read, inspect, search for diagnostic data

Disallowed:
- writes to the system
- state changes

### First action execution
Allowed:
- only the declared action within declared scope

Disallowed:
- scope expansion
- simultaneous diagnosis and remediation

### Reassessment
Allowed:
- measurement, observation, further reads

Disallowed:
- new execution before reassessment is documented

---

## Circuit Breakers

Stop immediately if:
- the pattern match confidence is low and the proposed first action is irreversible
- the simulation verdict was Reject and the agent is proceeding anyway
- scope expanded beyond the declared action without a new State 2 simulation
- the same action has been tried twice with the same failed result (pattern match was wrong — reassess)
- the situation is escalating faster than the triage loop can contain

---

## Failure Modes This Skill Prevents

- reckless action without pattern matching or simulation
- scope explosion during execution
- failure to reassess after the first action
- continuing triage when deeper analysis is now needed
- applying triage to non-urgent situations

---

## Definition of Done

This skill was correctly applied when:
- `triage-record.md` exists with all four gates documented
- pattern was declared with cues and confidence level
- mental simulation was completed before execution
- first action was bounded by declared scope
- reassessment compared actual to expected
- hand-off decision was documented and executed

---

## Pairing Guide

- **Recognition-Primed Triage (conceptual)** — the framework version for lighter, advisory, or non-protocol use
- **Cynefin State Machine** — Cynefin classifies the domain; RPD State Machine is the appropriate execution skill for Chaotic domain
- **OODA Loop** — RPD finds the first strong move; OODA maintains decision tempo after that first move in dynamic situations
- **How to Solve It** — the most common hand-off target after triage reduces urgency

---

## Final Instruction

Pattern first.
Simulate before acting.
Act within scope.
Reassess after.
Hand off when triage is done.
