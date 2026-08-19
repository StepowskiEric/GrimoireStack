# Checklist Manifesto — Reference Details

## procedure-checklist.md template

Create before executing any high-stakes procedure.

```md
# Procedure Checklist

## Task
<one-sentence description of the procedure>

## Checklist Type
<read-do / do-confirm>

## Risk Level
<low / medium / high / critical>

## Pause Points
<the specific moments where execution must halt for human review or external confirmation>

## Pre-Procedure Checks
- [ ] <item>
- [ ] <item>

## Procedure Steps (with inline checks)
- [ ] Step: <action>
  - Confirm: <what proves this step is correctly done>
- [ ] Step: <action>
  - Confirm: <what proves this step is correctly done>

## Post-Procedure Checks
- [ ] <item>

## Exception Triggers
<conditions that, if true at any step, halt execution and escalate>

## Rollback / Recovery
<what to do if a check fails mid-procedure>
```

## Tool gating

### Construction phase
- **Allowed:** read, inspect, draft artifacts
- **Disallowed:** execution

### Execution phase
- **Allowed:** only the defined procedure steps, in order
- **Disallowed:** improvisation or scope expansion; skipping steps based on prior confidence; batching confirms

## Circuit breakers

Stop immediately if:
- a step confirm fails and recovery is not defined
- an exception trigger activates
- confidence is being used as a reason to skip a step
- the agent cannot confirm a step with evidence and is assuming it was done
- the task scope changed since the checklist was built — rebuild the checklist

## Failure modes

- **Expert skip-ahead** — skipping steps on high-stakes procedures because they feel obvious
- **Confidence-based assumption** — assuming a step was completed without evidence
- **Checklist theater** — long lists that get skimmed rather than cleared
- **Parallel execution of dependent steps** — without proper sequencing
- **Proceeding through a pause point** — without required confirmation

## Definition of done

Correctly applied when:
- `procedure-checklist.md` existed before execution began
- the checklist was the minimal useful version, not exhaustive
- each step was confirmed with evidence, not assumed
- pause points and exception triggers were honored
- the agent stopped rather than improvised when a check failed

## Pairing guide

- **ETTO** — use to decide whether this task warrants a formal checklist at all
- **Unsafe Control Actions** — use when deciding which steps should be pause points or exception triggers
- **OODA Loop** — OODA for dynamic environments; the Checklist for well-defined high-stakes procedures
- **Working Effectively with Legacy Code** — checklist before any seam-cutting or major structural intervention
