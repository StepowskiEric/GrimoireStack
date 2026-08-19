# Recognition-Primed Triage — Reference Details

## triage-record.md template

Create at triage start; complete through the hand-off decision.

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

## Tool gating per gate

### Pattern recognition and simulation (Gates 1–2)
- **Allowed:** read, inspect, search for diagnostic data
- **Disallowed:** writes to the system, state changes

### First action execution (Gate 3)
- **Allowed:** only the declared action within declared scope
- **Disallowed:** scope expansion; simultaneous diagnosis and remediation

### Reassessment (Gate 4)
- **Allowed:** measurement, observation, further reads
- **Disallowed:** new execution before reassessment is documented

## Circuit breakers

Stop immediately if:
- pattern confidence is low and the proposed first action is irreversible
- the simulation verdict was Reject and the agent proceeds anyway
- scope expanded beyond the declared action without a new Gate 2 simulation
- the same action has been tried twice with the same failed result (pattern match was wrong — reassess)
- the situation is escalating faster than the triage loop can contain

## Failure modes this skill prevents

- Reckless action without pattern matching or simulation
- Scope explosion during execution
- Skipping reassessment after the first action
- Continuing triage when deeper analysis is now needed
- Applying triage to non-urgent situations

## Definition of done

Correctly applied when:
- `triage-record.md` exists with all four gates documented
- pattern was declared with cues and confidence level
- mental simulation was completed before execution
- first action was bounded by declared scope
- reassessment compared actual to expected
- hand-off decision was documented and executed

## Pairing guide

- **Recognition-Primed Triage (conceptual)** — the framework version for lighter, advisory, non-protocol use
- **Cynefin State Machine** — classifies the domain; RPD is the execution skill for Chaotic domains
- **OODA Loop** — RPD finds the first strong move; OODA maintains tempo after it in dynamic situations
- **How to Solve It** — the most common hand-off target after triage reduces urgency
