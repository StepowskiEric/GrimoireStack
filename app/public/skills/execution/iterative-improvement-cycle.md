# Skill: Iterative Improvement Cycle for AI Agents

## Purpose

Fuses Toyota Kata, PDCA/Deming, and Philosophy of Software Design into one sequential improvement protocol.

- Toyota Kata provides: target condition framing, current-condition analysis, obstacle selection, bounded experiments, learning review
- PDCA provides: measurement discipline, prediction-before-action, check-against-prediction (not just baseline), standardize/escalate decisions
- Philosophy of Software Design provides: design quality gates — deep modules, information hiding, complexity reduction, consumer discovery, blast-radius awareness

Without this fusion, agents either iterate blindly (Kata without measurement), measure without design quality (PDCA without depth), or refactor without iteration discipline (PoSD without Kata/PDCA structure).

This skill makes the agent: define a target → measure the gap → experiment → evaluate against design quality criteria → incorporate or revert.

* * *

## When to Use

- System is underperforming but not fully broken
- Correct path is uncertain
- Agent is tempted to redesign too much at once
- Gradual improvement is safer than a rewrite
- Multiple candidate improvements exist
- Code quality or design depth is part of the improvement dimension
- User wants experimentation, optimization, or process improvement with design rigor

Do NOT use when:

- Task is trivial and obvious
- Direct local fix is already proven
- Emergency incident requiring immediate containment
- User wants a one-shot fix, not iterative improvement

* * *

## Core Law

Do not optimize by intuition alone.
Do not standardize what you have not measured.
Do not skip design quality gates because the experiment "seemed to work."

* * *

## Diagnostic Artifact

Before major action, create `iterative-improvement-cycle.md`.

```md
# Iterative Improvement Cycle

## Task
<one-sentence task statement>

## Direction / Challenge
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

## Design Quality Criteria
<which PoSD criteria apply to this experiment>

## Actual Result
<measured after execution>

## Comparison to Prediction
<did result match prediction?>

## Design Quality Evaluation
<did the change improve or harm deep module structure, information hiding, complexity?>

## Decision
<adopt / revert / adjust>

## Learning
<what was learned, what next step is justified>
```

* * *

## Phase 1: TARGET

Define target condition and current condition with evidence.

1. Inspect code, configs, docs, tests, logs, metrics, benchmarks, workflow traces
2. Identify the improvement dimension (performance, reliability, design quality, complexity, onboarding, etc.)
3. State the current condition in observable, measurable terms with evidence
4. State what is happening now that should not be happening
5. State what is not happening yet that should be happening
6. Frame the next target condition: near-term, observable, specific, achievable without miracles
7. Express the gap between current and target explicitly
8. Populate `iterative-improvement-cycle.md` fields through Design Quality Criteria

Good target examples:
- CI feedback returns in under 8 minutes for common path
- Agent can refactor one slice without touching unrelated modules
- Module exposes simple interface hiding implementation details
- No caller needs to understand more than one concept to use the feature

Bad target examples:
- Make the system better
- Fix performance forever
- Fully modernize the architecture

Exit condition: target condition is concrete, gap is explicit, current condition is evidence-backed.

* * *

## Phase 2: GAP

Identify what blocks the target condition. Select one obstacle.

1. List all likely obstacles blocking the target condition
2. Rank obstacles by impact on the gap
3. Select the single most blocking obstacle as current focus
4. Check if the obstacle involves a shared surface (public interface, utility, contract) — if yes, run consumer discovery before proceeding
5. Assess blast radius: how many places would change if this obstacle is addressed?
6. If blast radius confidence is low, narrow scope or stop
7. Populate `iterative-improvement-cycle.md` obstacle fields

Consumer discovery rules (from Philosophy of Software Design):
- Before modifying a public interface, shared utility, or common contract, run a global search and list consumers
- If not all consumers can be identified, declare unknown consumers and reduce blast-radius confidence
- If blast-radius confidence is low and risk is high, stop and escalate

Exit condition: one obstacle selected, blast radius assessed, consumer discovery done if shared surface involved.

* * *

## Phase 3: EXPERIMENT

Design and execute the smallest possible change against the selected obstacle.

Design rules:
1. Experiment must be the smallest useful move
2. Reversible or low-blast-radius when possible
3. Measurable
4. Tied to a specific prediction (not just "it should get better")
5. Narrow enough that result teaches something clear
6. Must not mix cleanup, feature work, and optimization together
7. Must state expected result and check method before execution
8. Must state design quality expectations: will this deepen or shallow the module?

Required fields before execution:
- experiment description
- expected result
- check method
- fallback or rollback condition
- design quality expectation (deeper module? less caller burden? reduced change amplification?)

Execution rules:
1. Execute exactly as scoped — no scope expansion mid-run
2. Do not stack multiple unrelated improvements because "we are already here"
3. If experiment reveals a different dominant obstacle, stop and reframe (go back to Phase 2)
4. Collect the specified evidence

Disallowed:
- Large rewrites framed as "one experiment"
- Mixing cleanup, feature work, and optimization
- Any experiment that cannot teach a specific lesson
- Skipping design quality evaluation because "it works"

Exit condition: experiment executed within scope, evidence collected, design quality expectations documented.

* * *

## Phase 4: EVALUATE

Check results against prediction AND design quality criteria from Philosophy of Software Design.

Measurement evaluation (from PDCA):
1. Measure using the check method defined in Phase 3
2. Compare actual result to prediction, not just to prior baseline
3. If result matches prediction, note it
4. If result does not match, investigate why — this is information, not failure
5. Was the root cause hypothesis correct?
6. Were there confounding factors that invalidated the measurement?

Design quality evaluation (from Philosophy of Software Design):
1. Fewer concepts exposed to callers?
2. Less caller burden after the change?
3. Lower change amplification?
4. No unexpected consumer breakage?
5. Did the module get deeper (more functionality hidden behind simpler interface)?
6. Did information hiding improve or degrade?
7. Is the new boundary simpler from the outside?

Combined decision matrix:

| Prediction Match | Design Quality | Decision |
|-----------------|----------------|----------|
| Yes | Improved | Adopt |
| Yes | Degraded | Revert or redesign — correct function + wrong design is not acceptable |
| No | Improved | Investigate — may be measurement error or wrong hypothesis |
| No | Degraded | Revert and reframe |

Exit condition: prediction comparison recorded, design quality criteria evaluated, decision reached.

* * *

## Phase 5: INCORPORATE

Adopt, revert, or adjust based on Phase 4 evaluation.

**Adopt (standardize):**
1. Update the relevant process, procedure, configuration, or documentation
2. Establish new state as baseline for future cycles
3. Record learning: what worked and why
4. Determine if new improvement opportunity was revealed — if yes, start new cycle from Phase 1

**Revert (escalate/abandon):**
1. Roll back the experiment
2. Record what was learned from the failed experiment
3. If root cause hypothesis was wrong, reframe from Phase 2 with updated hypothesis
4. If broader intervention is required, escalate to human operator

**Adjust (modify):**
1. Identify what to change before next cycle
2. Do not standardize a partially-confirmed change
3. Return to Phase 3 with modified experiment design
4. Update hypothesis if needed

Rules:
- Do not standardize a change that was not confirmed by the check
- Do not repeat the same cycle without updating the hypothesis
- Do not escalate before evaluation is complete
- Document the decision and reasoning regardless of outcome
- Learning is an output, not an afterthought

Exit condition: decision made, learning captured, next step defined or cycle cleanly closed.

* * *

## Anti-Patterns

- Skipping Phase 4 evaluation because "it seemed to work" (PDCA's Mental-Reality Gap)
- Jumping from problem statement directly into broad redesign (leaving Kata mode)
- Expanding scope mid-experiment because "we're already here"
- Standardizing changes never verified by measurement
- Refactoring without iteration discipline (PoSD without Kata/PDCA)
- Designing deep modules without checking against prediction (PoSD without PDCA)
- Running Phase 3 indefinitely on the same obstacle without learning
- Skipping consumer discovery before shared-interface changes
- Mixing multiple hypotheses into a single experiment
- Treating "feels like improvement" as a measured result
- Making the module shallower while claiming complexity reduction
- More files created without reducing caller burden
- Same cycle repeating without hypothesis update

* * *

## Exit Criteria

This skill is correctly applied when:

- `iterative-improvement-cycle.md` exists with all fields populated
- Current condition was evidence-based
- Target condition was near-term and specific
- One obstacle was selected at a time
- Blast radius was assessed before shared-surface changes
- Each experiment had a prediction, check method, and design quality expectation
- Evaluation compared actual results to prediction explicitly
- Design quality criteria from Philosophy of Software Design were checked
- Decision was based on evaluation, not intuition
- Learning was captured after execution
- Agent stopped instead of turning iteration into endless tinkering
- If adopted, standardization was grounded in a confirmed check
