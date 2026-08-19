---
name: separation-of-concerns
description: "Keep planning, diagnosis, observation, and execution phases intellectually isolated."
triggers:
  - concern-contamination-risk
  - phase-isolation
  - sub-task-leak-prevention
---

# Separation of Concerns for Agent Orchestration

**Do not diagnose while you fix. Do not execute while you plan. Do not interpret while you observe. Do not review while you generate.** Each concern has its phase — complete the phase, then move to the next. Errors in one phase corrupt the others when the phases run together: premature fixes treat symptoms, early interpretation filters later observations, and plan collapse follows designing only far enough to justify the current impulse.

## When to Use
- Orchestrating multi-step tasks (planning → investigation → action → verification)
- Debugging where diagnosis and remediation have been happening simultaneously
- Managing sub-agents that share context or state
- Previous attempts produced confused output from mixed reasoning kinds
- The task is large enough that missing structure causes answering the wrong question

Skip it: tasks simple enough for one step, or concerns genuinely inseparable in context.

## The Move

### 1. Map the concerns
For the task, list the phases and what belongs in each: **observation** (raw data only), **interpretation** (what it means), **planning** (what to do, in order), **execution** (bounded action), **review** (critique), **verification** (confirming). Name what does NOT belong in each phase.

### 2. Separate the five pairs
- **Planning vs execution** — complete the plan before executing; revise the plan before resuming if it changes. Planning while executing plans only far enough to justify the action already wanted.
- **Diagnosis vs remediation** — document the root-cause hypothesis before fixing. Simultaneous diagnosis+remediation produces symptom fixes and post-hoc diagnoses that justify the attempted fix.
- **Observation vs interpretation** — record raw evidence before interpreting; preserve it separately from conclusions. Interpreting while observing filters out disconfirming evidence.
- **Design vs review** — generate fully before critiquing. The same agent editing while generating rationalizes instead of scrutinizing.
- **Scope definition vs scope execution** — define in/out explicitly before executing; note adjacent discoveries for later instead of acting on them.

### 3. Execute phase by phase
Complete the current phase before beginning the next. When a discovery belongs to a later phase, note it — do not act on it. Preserve raw observations separate from interpretations. Write the plan to the end before executing, even when it is simple.

### 4. Identify and correct violations
Watch the common mixing patterns: planning-execution conflation ("I'll figure out the rest as I go"), diagnosis-remediation conflation (first plausible fix before confirmation), observation-interpretation conflation (anchoring on early data), scope drift (adjacent work started mid-execution). For each violation, name the effect and re-separate.

## Reference
For the concern-map template with the phase table, the violation catalog with fixes, failure modes, and pairing guide, see [`references/concerns-details.md`](references/concerns-details.md).

## Rules
- **Do** complete the current phase before starting the next.
- **Do** note cross-phase discoveries for later instead of acting on them.
- **Do** preserve raw observations separately from interpretations.
- **Do** write the plan to the end before executing.
- **Do** flag scope drift the moment it appears — silent expansion is the quiet failure.
