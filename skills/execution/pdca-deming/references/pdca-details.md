# PDCA — Reference Details

## pdca-cycle.md template

Create before beginning; complete all four phases.

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

## Tool gating per phase

### Plan
- **Allowed:** read, inspect, gather metrics, analyze baselines, artifact writing
- **Disallowed:** writes to the system being improved, configuration changes

### Do
- **Allowed:** only the bounded planned change
- **Disallowed:** scope expansion, parallel improvements

### Check
- **Allowed:** measurement tools, test runners, metrics queries, log inspection
- **Disallowed:** additional changes to the system before Check is complete

## Failure modes this skill prevents

- Standardizing improvements that were never verified
- Acting on felt improvement instead of measured improvement
- Implementing changes without a prediction (nothing to check against)
- Repeating the same failed approach without updating the hypothesis
- Mixing multiple changes in one cycle (obscures which change caused the result)

## Definition of done

Correctly applied when:
- `pdca-cycle.md` exists with all four phases completed
- the baseline was measured before the change
- the prediction was written before the change was executed
- Check compared actual results to the prediction explicitly
- the Act decision was based on the Check, not on intuition
- any standardization was grounded in a confirmed check

## Pairing guide

- **Toyota Kata** — obstacle unknown: use Toyota Kata to discover it; obstacle known: use PDCA to eliminate it with measurement discipline
- **Thinking in Systems** — use before Plan if the root cause involves feedback loops
- **Theory of Constraints** — identify the constraint first, then apply PDCA to elevate it
- **Bounded Self-Revision** — use PDCA structure when the "system" being improved is an output like a document or prompt
