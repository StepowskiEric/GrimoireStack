---
name: process-reward-model-protocol
description: Self-assign process rewards to each reasoning step and backtrack when cumulative reward drops below threshold. Prevents committing to wrong reasoning paths. Based on PRM research (arXiv:2504.18429, 2603.29500).
category: execution
tags: [process-reward, prm, step-reward, backtracking, reasoning-quality]
author: Research synthesis
date: 2026-04-20
version: 1.0.0
...



---

# Process Reward Model Protocol

## When to Use

Use this skill when:
- Long reasoning chains risk compounding errors
- Need to detect when reasoning goes off track mid-process
- Want to reward "how" not just "what" (process vs outcome)
- Previous attempts committed to wrong paths early
- Each step has verifiable quality criteria

## The Concept

Unlike outcome reward models (ORM) that only judge final results, **Process Reward Models (PRM)** assign rewards to each intermediate step.

This allows:
- **Early detection** of reasoning going wrong
- **Backtracking** before too much depends on bad steps
- **Credit assignment** — knowing which specific step caused failure
- **Process improvement** — learning from step-level feedback

## State Machine Protocol

```
┌─────────────┐
│    INIT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   REWARD    │
│   CONFIG    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   DRAFT     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    SCORE    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   UPDATE    │────▶│   CHECK     │
│   RUNNING   │     │   REWARD    │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │  REWARD OK  │           │  REWARD LOW │
       └──────┬──────┘           └──────┬──────┘
              │                         │
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   COMMIT    │           │  BACKTRACK  │
       └──────┬──────┘           └──────┬──────┘
              │                           │
              │                 ┌─────────┴─────────┐
              │                 │                   │
              │                 ▼                   ▼
              │          ┌─────────────┐     ┌─────────────┐
              │          │   REVISE    │     │   RESTART   │
              │          └──────┬──────┘     └──────┬──────┘
              │                 │                   │
              │                 └─────────┬─────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  COMPLETE?  │
                     └──────┬──────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │   FINAL     │       │   DRAFT     │
          └──────┬──────┘       └─────────────┘
                 │
                 ▼
          ┌─────────────┐
          │    DONE     │
          └─────────────┘
```

## States

### INIT
**Purpose:** Setup PRM tracking

**Entry Actions:**
- Define step quality criteria
- Set reward thresholds (min_acceptable, warning_level)
- Initialize running reward accumulator
- Set decay factor for past rewards (optional)

**Exit Conditions:** Always → REWARD_CONFIG

**Output Format:**
```yaml
prm_config:
  criteria:
    - correctness: 0.4
    - clarity: 0.2
    - progress: 0.3
    - efficiency: 0.1
  min_step_reward: 0.5
  min_cumulative_reward: 0.6
  decay_factor: 0.9  # Past rewards weighted less
  max_backtracks: 3
```

___


### REWARD_CONFIG
**Purpose:** Document reward criteria

**Entry Actions:**
- Explain what each criterion means
- Provide examples of good/bad scores
- Set expectations for self-assessment

**Prompt Template:**
```
PROCESS REWARD MODEL CONFIGURATION

Step Quality Criteria:

1. Correctness (0.4 weight)
   - 1.0: Logically sound, no errors
   - 0.7: Minor issues, mostly correct
   - 0.5: Significant concerns
   - 0.0: Incorrect or nonsensical

2. Clarity (0.2 weight)
   - 1.0: Crystal clear reasoning
   - 0.7: Mostly clear
   - 0.5: Ambiguous or unclear
   - 0.0: Cannot understand

3. Progress (0.3 weight)
   - 1.0: Significantly advances toward goal
   - 0.7: Moderate progress
   - 0.5: Minimal progress
   - 0.0: No progress or backwards

4. Efficiency (0.1 weight)
   - 1.0: Most direct path
   - 0.7: Slight detour
   - 0.5: Circuitous
   - 0.0: Wasteful

Running reward starts at 1.0
Each step updates: new_reward = decay * old_reward + step_reward
```

**Exit Conditions:** Always → DRAFT

___


### DRAFT
**Purpose:** Generate next reasoning step

**Entry Actions:**
- Draft next step toward solution
- Consider running reward context
- Try to maintain/improve reward trajectory

**Prompt Template:**
```
Draft next step with PRM awareness:

Current running reward: {{running_reward}}
Previous steps: {{step_history}}

Draft a step that:
- Is logically correct
- Is clearly explained
- Makes clear progress
- Is reasonably efficient

Next step:
```

**Exit Conditions:** Always → SCORE

___


### SCORE
**Purpose:** Assign process reward to current step

**Entry Actions:**
Score the drafted step on each criterion:

**Prompt Template:**
```
PROCESS REWARD SCORING

Step: {{drafted_step}}

Score on each criterion (0-1):

Correctness: {{score}}
- Evidence: {{why}}

Clarity: {{score}}
- Evidence: {{why}}

Progress: {{score}}
- Evidence: {{why}}

Efficiency: {{score}}
- Evidence: {{why}}

Weighted Step Reward:
= (correctness * 0.4) + (clarity * 0.2) + (progress * 0.3) + (efficiency * 0.1)
= {{step_reward}}
```

**Exit Conditions:** Always → UPDATE_RUNNING

___


### UPDATE_RUNNING
**Purpose:** Update cumulative reward

**Entry Actions:**
Calculate new running reward:
```
running_reward = (decay_factor * running_reward) + step_reward
```

Also track:
- Step count
- Average step reward
- Minimum step reward seen
- Trend (improving/declining/stable)

**Exit Conditions:** Always → CHECK_REWARD

___


### CHECK_REWARD
**Purpose:** Decide if current path is viable

**Entry Actions:**
Check against thresholds:
- If step_reward < min_step_reward → REWARD LOW
- If running_reward < min_cumulative_reward → REWARD LOW
- If min_step_reward ≤ step_reward AND running_reward ≥ min_cumulative → REWARD OK

**Exit Conditions:**
- Path viable → COMMIT
- Path concerning → BACKTRACK

___


### COMMIT
**Purpose:** Accept step and continue

**Entry Actions:**
- Add step to verified chain
- Log reward for this step
- Update trajectory metrics

**Exit Conditions:** Always → COMPLETE?

___


### BACKTRACK
**Purpose:** Handle low reward situation

**Entry Actions:**
Analyze why reward is low:

**Prompt Template:**
```
BACKTRACK ANALYSIS

Low reward detected:
- Step reward: {{step_reward}}
- Running reward: {{running_reward}}
- Threshold: {{min_threshold}}

Why is reward low?
- [Specific criterion that failed]
- [What went wrong]

Options:
1. REVISE - Fix this specific step
2. RESTART - This path is fundamentally flawed

Decision: REVISE / RESTART
Reason: {{why}}
```

**Exit Conditions:**
- Decision = REVISE → REVISE state
- Decision = RESTART → RESTART state

___


### REVISE
**Purpose:** Improve the low-reward step

**Entry Actions:**
- Identify specific improvements needed
- Redraft with focus on weak criteria
- Re-score the revised step

**Prompt Template:**
```
STEP REVISION

Original step: {{original_step}}
Original scores: {{original_scores}}

Focus on improving:
- {{weak_criterion_1}}: [specific fix]
- {{weak_criterion_2}}: [specific fix]

Revised step:
[Improved version]

Revised scores:
- [New scores, should be higher]
```

**Exit Conditions:** Return to SCORE with revised step

___


### RESTART
**Purpose:** Abandon current path and start fresh

**Entry Actions:**
- Log why path was abandoned
- Reset running reward to 1.0
- Clear step history (or archive it)
- Try different approach

**Exit Conditions:** Return to DRAFT with fresh start

___


### COMPLETE?
**Purpose:** Check if solution is complete

**Entry Actions:**
- Evaluate if goal achieved
- Check if all constraints satisfied
- Verify final solution quality

**Exit Conditions:**
- Complete → FINAL
- More steps needed → DRAFT

___


### FINAL
**Purpose:** Assemble final solution with reward history

**Entry Actions:**
- Compile all steps
- Include reward trajectory
- Calculate final metrics

**Output Format:**
```markdown
## Solution

[Final answer]

## Process Reward Trajectory

| Step | Reward | Cumulative | Assessment |
|------|--------|------------|------------|
| 1    | 0.85   | 0.85       | ✓ Strong   |
| 2    | 0.90   | 0.87       | ✓ Strong   |
| 3    | 0.60   | 0.78       | ⚠️ Warning |
| 4    | 0.88   | 0.82       | ✓ Recovered|
| ...  | ...    | ...        | ...        |

## Summary Statistics
- Total steps: {{N}}
- Average step reward: {{avg}}
- Minimum step reward: {{min}}
- Backtracks required: {{count}}
- Final cumulative reward: {{final}}

## Quality Assessment
[Based on reward trajectory]
```

**Exit Conditions:** Always → DONE

___


### DONE
**Purpose:** Return solution with process quality metrics

**Entry Actions:**
- Return final answer
- Include PRM transparency

## Example Usage

```markdown
Problem: Design a database schema for user preferences

[INIT] PRM config with focus on correctness and progress

[DRAFT] Step 1: Identify core entities (User, Preference, Category)
[SCORE]
- Correctness: 1.0 (sound logic)
- Clarity: 0.9 (clear)
- Progress: 0.8 (good start)
- Efficiency: 0.9 (direct)
- Step reward: 0.93

[UPDATE] Running: 0.93
[CHECK] OK (≥ 0.5 and ≥ 0.6)
[COMMIT] ✓

[DRAFT] Step 2: Add PreferenceValue table with JSON column
[SCORE]
- Correctness: 0.6 (JSON might cause issues)
- Clarity: 0.7
- Progress: 0.7
- Efficiency: 0.8
- Step reward: 0.69

[UPDATE] Running: 0.93*0.9 + 0.69 = 1.53 → normalized 0.77
[CHECK] Warning: correctness low

[BACKTRACK] Decision: REVISE
Why: JSON column is lazy design, will cause query issues

[REVISE] Step 2: Use typed columns instead of JSON
[SCORE]
- Correctness: 0.95 (proper schema)
- Clarity: 0.9
- Progress: 0.85
- Efficiency: 0.8
- Step reward: 0.88

[UPDATE] Running: 0.93*0.9 + 0.88 = 1.72 → normalized 0.86
[CHECK] OK
[COMMIT] ✓

... continues ...

[FINAL]
Solution with proper typed schema
Reward trajectory shows early recovery from JSON mistake
```

## Pitfalls

1. **Reward hacking:** Don't game the criteria — be honest in self-assessment
2. **Over-backtracking:** Set min_step_reward reasonably (0.5 not 0.9)
3. **Decay confusion:** High decay = long memory, low decay = short memory
4. **Criterion imbalance:** Weights should reflect actual importance
5. **False precision:** Scores are estimates, not exact measurements

## Integration

Combine with:
- `step-level-verification-protocol`: Use PRM as verification method
- `tree-of-thoughts`: Track rewards per branch, prune low-reward branches
- `cognitive-friction-governor`: Budget total reasoning effort

## Research Basis

- Process Reward Models for LLM Reasoning (arXiv:2504.18429)
- Learning to Generate Formally Verifiable Step-by-Step Logic (arXiv:2603.29500)
- Outcome vs Process supervision in reasoning tasks
