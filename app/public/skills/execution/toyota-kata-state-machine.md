# Skill: Toyota Kata — State Machine Protocol for Continuous-Improvement AI Agents
## Purpose

Use this skill when the agent must improve a system through disciplined iteration instead of one large speculative change.

This is not a brainstorming note.
This is a controlled improvement protocol.

It converts Toyota Kata into an executable operating model that makes the agent:

- define the direction clearly
- understand the current condition with evidence
- define the next target condition
- identify the immediate obstacle
- run the smallest useful experiment
- learn from the result before taking the next step

The purpose is to stop the agent from jumping from problem statement directly into broad redesign.

* * *
## Core Law

Do not optimize by intuition alone.

The agent must improve through short evidence-bearing cycles:

1. understand the direction
2. understand the current condition
3. define the next target condition
4. identify the limiting obstacle
5. run one bounded experiment
6. learn
7. repeat only if the next step is justified

This skill should be used when the right answer is not fully knowable upfront and progress must be discovered iteratively.

* * *
## Output Artifacts (Mandatory Before Meaningful Execution)

Before major action, the agent must create `kata-improvement-board.md`.

Required structure:

    # Kata Improvement Board

    ## Task
    <one-sentence task statement>

    ## Challenge / Direction
    <what longer-term improvement matters>

    ## Current Condition
    <what is true now, with evidence>

    ## Target Condition
    <specific next condition, not final dream state>

    ## Gap
    <difference between current and target>

    ## Ranked Obstacles
    1. <obstacle>
    2. <obstacle>
    3. <obstacle>

    ## Current Focus Obstacle
    <one obstacle only>

    ## Next Experiment
    <single bounded step>

    ## Expected Result
    <what the agent predicts will happen>

    ## Check Method
    <how the result will be measured>

    ## Stop / Escalation Triggers
    <list>

If the task involves more than one experiment, the agent must also maintain `kata-experiment-log.md`.

Required log row format:

    | Iteration | Obstacle | Experiment | Expected | Actual | Learning | Next Decision |
    |-----------|----------|------------|----------|--------|----------|---------------|

No broad implementation should begin until the improvement board exists.

* * *
## State Machine
## State 0 — Intake

Goal:

- determine whether the task is an improvement kata problem

Use this skill when:

- the system is underperforming but not fully broken
- the correct path is uncertain
- the agent is tempted to redesign too much at once
- gradual improvement is safer than a rewrite
- multiple candidate causes or improvements exist
- the user wants experimentation, optimization, or process improvement

Do not use this as the primary skill when:

- the task is trivial and obvious
- a direct local fix is already proven
- emergency incident handling requires immediate containment first

Exit condition:

- task is confirmed as iterative-improvement work

* * *
## State 1 — Direction and Current Condition

Goal:

- make the desired direction and current reality explicit

Allowed actions:

- inspect code, configs, docs, tests, logs, metrics, benchmarks, workflow traces
- identify the improvement dimension
- create `kata-improvement-board.md`

Mandatory questions:

- What longer-term capability is being improved?
- What is the current condition, in observable terms?
- What evidence supports that description?
- What is happening now that should not be happening?
- What is not happening yet that should be happening?

Disallowed actions:

- broad refactors
- architecture rewrites
- multi-file speculative edits
- trying several unrelated fixes at once

Exit condition:

- current condition is evidence-backed
- improvement direction is explicit

* * *
## State 2 — Target Condition Framing

Goal:

- define the next meaningful condition, not the final fantasy state

A valid target condition must be:

- near-term
- observable
- specific
- achievable without assuming miracles
- framed as a system condition, not a vague wish

Good examples:

- CI feedback returns in under 8 minutes for the common path
- agent can refactor one slice without touching unrelated modules
- queue backlog clears within normal load after bounded retry changes
- onboarding doc lets a new operator complete setup without backtracking

Bad examples:

- make the system better
- fix performance forever
- fully modernize the architecture
- eliminate all bugs

Exit condition:

- one concrete target condition is stated
- the gap from current condition is explicit

* * *
## State 3 — Obstacle Selection

Goal:

- choose the single obstacle that most blocks the target condition

The agent must list likely obstacles, then rank them.

Examples:

- missing test seam
- flaky benchmark harness
- slow dependency step
- oversized module boundary
- retry policy noise
- unclear ownership
- bad fixture setup
- absent observability

Mandatory rule:

Focus on one obstacle at a time.

If the agent is trying to remove three obstacles in one move, it has left kata mode.

Exit condition:

- one current focus obstacle is selected

* * *
## State 4 — Next Experiment Design

Goal:

- design one bounded experiment against the selected obstacle

A valid experiment must be:

- the smallest useful move
- reversible or low-blast-radius when possible
- measurable
- tied to a prediction
- narrow enough that the result teaches something clear

Required fields:

- experiment
- expected result
- check method
- fallback or rollback condition

Preferred experiment types:

- add one measurement point
- isolate one seam
- reduce one source of variability
- change one parameter
- split one dependency path
- test one narrower design boundary
- remove one bottlenecking step
- create one thin characterization test

Disallowed:

- large rewrites framed as “one experiment”
- mixing cleanup, feature work, and optimization together
- any experiment that cannot teach a specific lesson

Exit condition:

- one bounded experiment is specified
- expected result is written down before execution

* * *
## State 5 — Execution Unlock

Goal:

- permit only the bounded experiment

Allowed actions:

- execute the experiment exactly as scoped
- collect the specified evidence
- update `kata-experiment-log.md` if used

Disallowed actions:

- expansion of scope mid-run without a fresh obstacle choice
- stacking multiple unrelated improvements because “we are already here”
- declaring success without checking the predicted result

If the experiment reveals a different dominant obstacle, the agent must stop and reframe rather than continue blindly.

Exit condition:

- experiment executed within scope
- evidence collected

* * *
## State 6 — Learning Review

Goal:

- compare expectation to reality and decide the next move consciously

The agent must record:

- what was expected
- what actually happened
- what was learned
- whether the obstacle weakened
- whether the target condition is closer
- what the next most justified step is

Possible decisions:

- repeat with another bounded experiment on the same obstacle
- choose a different obstacle
- accept the target condition as reached
- stop because evidence is too weak or risk rose
- escalate because broader intervention is required

Mandatory rule:

Learning is an output, not an afterthought.

Exit condition:

- learning is written clearly enough that another operator could continue

* * *
## State 7 — Stop / Escalate

Stop when:

- the target condition is reached
- the next justified step is outside the current scope
- the improvement curve has flattened and evidence no longer supports iteration
- the task has turned into architecture redesign rather than incremental improvement

Escalate when:

- the current condition cannot be measured reliably
- obstacle ranking remains too uncertain
- the required experiment is not low enough risk
- the dominant obstacle lies outside the agent’s authority or visibility
- repeated experiments fail to move the target condition materially

* * *
## Tool Gating

### Recon / framing phase

Allowed:

- read/search/list/test/benchmark/log inspection
- artifact writing only

Disallowed:

- broad writes
- migrations
- large refactors
- rollout actions

### Experiment phase

Allowed:

- only the bounded experiment
- only evidence collection needed for that experiment

Disallowed:

- opportunistic side changes
- adjacent cleanup not required for the experiment

* * *
## Circuit Breakers

Stop immediately if:

- the agent cannot state the current condition clearly
- no measurable target condition exists
- more than one obstacle becomes the active focus simultaneously
- the experiment grows into a rewrite
- evidence collection is too weak to distinguish success from noise
- the user’s actual need is containment, not improvement kata

* * *
## Definition of Done

This skill is correctly applied when:

- `kata-improvement-board.md` exists
- the current condition was evidence-based
- the target condition was near-term and specific
- one obstacle was selected at a time
- each experiment had a prediction and a check method
- learning was captured after execution
- the agent stopped instead of turning iteration into endless tinkering

* * *
## Final Instruction

Do not jump to the grand redesign.
See the current condition clearly, target the next condition, remove one obstacle, learn, and repeat only with evidence.
