# Inversion — Reference Details

## failure-map.md template

Create before making a major recommendation.

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

## Tool gating

During inversion work, tools or research may be used to: inspect assumptions, identify dependencies, validate likely failure patterns, improve ranking confidence. The final recommendation is not produced until `failure-map.md` is complete for non-trivial tasks.

## Unknowns rule

The artifact must include a residual-unknowns section whenever:
- the system boundary is unclear
- dependencies are uncertain
- the recommendation depends on assumptions that could not be checked

If unknowns are high and the stakes are high, recommend caution or narrower scope.

## Circuit breakers

Stop and reassess if:
- the goal changes mid-analysis
- new information introduces an entirely different dominant failure path
- the failure list grows without prioritization
- the guardrail plan remains vague after multiple passes

## Failure modes this skill prevents

- Optimism-only planning
- Shallow risk reviews
- Hidden fragility
- Generic failure lists with no operational consequences
- Forward-only strategies with no defensive design

## Definition of done

Correctly applied when:
- `failure-map.md` exists
- the goal was inverted concretely
- major failure modes were ranked
- top risks became prevention/detection/recovery controls
- the final recommendation is stronger because it survived stress-testing
