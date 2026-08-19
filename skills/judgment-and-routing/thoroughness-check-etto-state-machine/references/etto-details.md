# Thoroughness Check (ETTO) — Reference Details

## etto-preflight.md template

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

## Per-level matrix

| ETTO | Examples | Evidence bar | Execution mode | Validation |
|---|---|---|---|---|
| **1 Speed** | brainstorming, rough ideation, low-stakes drafts | minimal | fast, low ceremony | light plausibility check |
| **2 Lean** | simple edits, routine transformations, low-risk suggestions | basic | lean | basic consistency check |
| **3 Balanced** | non-trivial implementation, debugging, planning, code review | moderate: check assumptions, inspect key dependencies, compare alternatives | verify important assumptions, test major alternatives mentally or directly | validate core assumptions and outcome |
| **4 Thorough** | migrations, auth, security, production-risk changes, destructive operations | strong: verify load-bearing assumptions, inspect blast radius, identify second-order effects, define rollback/containment | bounded reversible steps, verify before acting, surface residual uncertainty, prefer containment | strong verification with risk review |
| **5 Maximum** | medical, legal, financial, privacy/security incidents, irreversible actions, critical compliance | very strong: conservative scope, explicit uncertainty, strong external support and validation | conservative action only, narrow scope, explicit safety boundaries, refuse unsafe action | maximum validation or safe non-execution/refusal |

## Tool gating

- **ETTO-1 / ETTO-2:** tools used lightly or not at all, depending on task.
- **ETTO-3:** use tools or checks when they materially improve confidence.
- **ETTO-4 / ETTO-5:** critical assumptions must be checked before action; verification and scoping tools are not optional.

Higher ETTO means the burden of proof rises before action.

## Circuit breakers

Stop and reassess immediately if:
- the task appears more irreversible than first believed
- new evidence expands blast radius
- uncertainty jumps materially
- a "simple" task becomes a multi-system task
- high confidence was based on thin evidence

## Failure modes this skill prevents

- Speed-first hallucination on high-risk work
- Over-analysis of trivial work
- False confidence
- One-mode behavior across all tasks
- Silent mismatch between stakes and rigor

## Definition of done

Correctly applied when:
- `etto-preflight.md` exists
- the ETTO level is explicit
- evidence threshold matched the risk
- execution matched the chosen mode
- validation matched the chosen mode
- the agent stopped instead of quietly improvising past the risk boundary
