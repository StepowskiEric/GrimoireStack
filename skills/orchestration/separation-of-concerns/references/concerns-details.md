# Separation of Concerns — Template, Violations & Pairings

## Concern-map template

```md
## Task
<description>

## Concern Map
| Phase | Concern | What Belongs Here | What Does NOT Belong Here |
|-------|---------|-------------------|--------------------------|
| 1 | Observation | raw data, logs, measurements | interpretation, hypotheses |
| 2 | Interpretation | model of what the data means | fixes, changes, designs |
| 3 | Planning | what to do and in what order | execution, premature fixes |
| 4 | Execution | bounded action on the plan | new planning, scope expansion |
| 5 | Review | critique against criteria | generation of new alternatives |
| 6 | Verification | confirming the result | new execution |

## Concern Separation Violations Identified
- Violation: <what concern was mixed with another concern>
  - Effect: <what confusion or error it caused>
  - Correction: <how to re-separate>

## Execution Plan (separated by concern phase)
### Phase 1: Observation
- <what will be observed>
### Phase 2: Interpretation
- <what will be interpreted from the observations>
### Phase 3: Planning
- <what actions will be planned based on the interpretation>
### Phase 4: Execution
- <what will be executed from the plan, bounded to scope>
### Phase 5: Review
- <how the execution result will be reviewed>
### Phase 6: Verification
- <how correctness will be confirmed>
```

## Common concern-mixing patterns

### Planning-execution conflation
"I'll figure out the rest as I go." The plan is only as good as the first step; later steps are improvised without upfront reasoning. Fix: write the plan to the end before executing.

### Diagnosis-remediation conflation
First plausible fix before confirming the diagnosis. The fix treats a symptom; the root cause persists. Fix: stop at a documented root-cause hypothesis before remediation.

### Observation-interpretation conflation
Interpreting before all relevant observations are in. Interpretation anchors on early data; later observations get filtered to fit. Fix: gather observations in a separate phase.

### Scope drift
Adjacent work noticed during execution gets started. The original goal completes but scope silently expanded with unexpected side effects. Fix: note adjacent work as a future item; do not act on it now.

## Failure modes this skill prevents

- Premature remediation treating symptoms instead of root causes
- Scope drift producing unintended side effects
- Observation bias from interpreting while observing
- Plan collapse from designing only far enough to justify the impulse
- Review failure from the generating agent approving without genuine scrutiny

## Pairing guide

- **Agentic Design Patterns** — orchestration patterns align with the concern phases; Separation of Concerns keeps them from blurring
- **OODA Loop** — OODA separates Observe and Orient explicitly; this generalizes the principle across all phases
- **How to Solve It** — separates problem-framing from problem-solving; this extends it to all work phases
- **Bounded Self-Revision** — separates generation from critique; one instance of the broader principle

## Definition of done

Applied correctly when:
- the task was decomposed into distinct concern phases
- each concern was executed in its proper phase
- concern-mixing violations were identified and corrected
- observations were preserved separately from interpretations
- the plan was complete before execution began
- scope was defined before execution and drift prevented during it
