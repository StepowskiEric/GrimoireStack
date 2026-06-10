# Skill: Inversion — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent needs to reason more effectively about risk, failure, blind spots, and defensive design.

This skill turns inversion from a clever mental model into an enforced protocol:
1. define the real goal
2. define the opposite outcome
3. enumerate realistic failure paths
4. rank them
5. convert them into guardrails, detection, and recovery controls

This is useful for:
- planning
- launch reviews
- risk analysis
- system design
- process design
- safety review
- reliability strategy
- agent guardrail design

**Not useful for (empirically proven harmful):**
- debugging deterministic code bugs — this skill forces the agent to write a `failure-map.md` before fixing code, burning the tool-call budget on risk analysis instead of reading source. In a FastAPI router bug trial, the skill agent consumed 20 tool calls and failed to fix the bug, while the baseline fixed it in 5 calls.
- any task with a tight tool-call budget (≤25 calls) — the 6-state protocol requires 8-12 calls just to complete the analysis phase.

---

## Core Law

The agent must not recommend a path to success before first mapping the main paths to failure.

Forward reasoning alone is not enough.

---

## Mandatory Diagnostic Artifact

Before making a major recommendation, the agent must create `failure-map.md`.

Required fields:

```md
# Failure Map

## Goal
<what success means>

## Inverted Goal
<what failure or the opposite of success looks like>

## Major Failure Paths
- <path 1>
- <path 2>
- <path 3>

## Assumptions That Could Break the Plan
- <assumption 1>
- <assumption 2>

## Likelihood / Severity Ranking
| Failure Path | Likelihood | Severity | Detectability | Reversibility |
|---|---|---|---|---|

## Prevention Controls
- <control>

## Detection Signals
- <signal>

## Containment / Recovery
- <recovery action>

## Residual Risks
- <risk>
```

---

## State Machine

## State 0 — Goal Framing

Goal:
- define what success actually means

Questions:
- What is the target outcome?
- What does success require?
- What would count as success operationally, not rhetorically?

Allowed actions:
- clarify goal
- bound the domain of the recommendation

Disallowed actions:
- vague “improve things” planning
- making guardrails before the real goal is defined

Exit condition:
- goal is precise enough to invert

---

## State 1 — Inversion

Goal:
- define the opposite outcome and realistic failure modes

Questions:
- What would failure look like?
- How would we sabotage this unintentionally?
- What shortcuts would create the opposite result?
- What hidden assumptions could collapse the plan?

Allowed actions:
- enumerate failure paths
- identify structural, human, process, and timing failures

Disallowed actions:
- naming only generic risks
- stopping at obvious surface-level failure modes

Exit condition:
- inverted goal documented
- major failure paths listed

---

## State 2 — Ranking

Goal:
- prioritize the failure modes instead of treating them equally

Rank by:
- likelihood
- severity
- detectability
- reversibility

Rule:
The highest-value inversion work is not the longest list. It is the most decision-relevant ranked list.

Allowed actions:
- prioritize
- merge duplicates
- discard low-value noise

Disallowed actions:
- equal-weight risk lists
- performing “risk analysis theater”

Exit condition:
- ranked failure table exists in `failure-map.md`

---

## State 3 — Guardrail Conversion

Goal:
- turn failure modes into operational controls

For each serious failure mode, define:
- prevention
- detection
- containment
- recovery or rollback

This is the point of inversion.
A failure mode that does not become a control is only a worry list.

Allowed actions:
- map prevention controls
- define detection signals
- define rollback or recovery actions

Disallowed actions:
- stopping at identification
- describing risk without operational consequence

Exit condition:
- guardrails/detection/recovery plan exists

---

## State 4 — Recommendation Assembly

Goal:
- produce the final recommendation only after the failure analysis is complete

The final recommendation should include:
- preferred forward path
- top inverted risks
- the specific controls that make the path acceptable
- residual risks that remain

Allowed actions:
- present strategy
- present defensive design
- state residual uncertainty

Disallowed actions:
- delivering the forward path without the defensive layer
- pretending all major risks are eliminated

Exit condition:
- recommendation includes both path-to-success and path-to-failure controls

---

## State 5 — Stop / Escalate

Goal:
- end cleanly or escalate if the failure analysis is incomplete

Escalate if:
- the goal remains too vague to invert
- the main failure modes cannot be ranked
- the task is high-risk but detection/containment is still missing
- unknown dependencies make risk ranking unreliable

---

## Tool Gating Guidance

During inversion work, tools or research may be used to:
- inspect assumptions
- identify dependencies
- validate likely failure patterns
- improve ranking confidence

The final recommendation should not be produced until `failure-map.md` is complete for non-trivial tasks.

---

## Unknowns Rule

The artifact must include a residual-unknowns section whenever:
- the system boundary is unclear
- dependencies are uncertain
- the recommendation depends on assumptions that could not be checked

If unknowns are high and the stakes are high, recommend caution or narrower scope.

---

## Circuit Breakers

Stop and reassess if:
- the goal changes mid-analysis
- new information introduces an entirely different dominant failure path
- the failure list is growing without prioritization
- the guardrail plan remains vague after multiple passes

---

## Failure Modes This Skill Prevents

- optimism-only planning
- shallow risk reviews
- hidden fragility
- generic failure lists with no operational consequences
- forward-only strategies with no defensive design

---

## Definition of Done

This skill is correctly applied when:
- `failure-map.md` exists
- the goal was inverted concretely
- major failure modes were ranked
- top risks became prevention/detection/recovery controls
- the final recommendation is stronger because it survived stress-testing

---

## Final Instruction

Do not ask only how to win.  
Ask how you lose, rank the losing paths, and block them before you commit.
