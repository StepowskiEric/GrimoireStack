---
name: skill-ab-evaluation
description: "A/B evaluate any GrimoireStack skill against a baseline using isolated subagents, 5 trials each, and an objective rubric."
triggers:
  - skill-impact-measurement
  - skill-vs-baseline
  - empirical-skill-evidence
  - skill-quality-audit
---

# Skill A/B Evaluation

**Measure whether loading a skill actually improves outcomes — or just feels like it does.** Run paired A/B trials: the target skill loaded vs general knowledge alone, 5 trials each on an identical reproducible task, scored with an objective rubric in isolated snapshots so no real project is at risk. The evidence decides keep / retire / refine.

## When to Use
- You want to know if a skill is worth keeping or promoting
- You suspect a skill is fluff or counter-productive
- You need empirical data to justify a skill refinement
- The skill's domain is narrow enough to create a reproducible task

Skip it: purely preventative skills (security audits need adversarial cases, not random tasks), tasks without clear "done" criteria, severely constrained token budgets (10 runs = 10× cost), and planning/risk-analysis frameworks tested on deterministic code bugs — they burn tool-call budgets on analysis theater and empirically fail on typical bugs.

## The Move

### 1. Prepare isolation — disposable snapshots
Do NOT use git worktrees or shared `node_modules` — worktrees share state and contaminate results. Copy the frozen repo snapshot per run (`cp -r` or `tar -xzf` a tarball into `/tmp/skill-eval-{n}-{condition}`). Delete after scoring. Never run in active project directories.

### 2. Run the trials — 5 skill, 5 baseline
For n in 1..5, spawn a subagent on an identical task prompt pointing at the isolated snapshot — one condition with the target skill loaded, one without (general knowledge only). Collect per trial: final state, test results, diff, time elapsed, token usage. Account for skill-read overhead: pre-inject the skill into the prompt, or measure only the phase after the skill read.

### 3. Score each trial — objective rubric
| Dimension | Weight | Measure |
|-----------|--------|---------|
| Correctness | 40% | Tests pass? Bug actually fixed? |
| Completeness | 25% | All requirements met? No partial fixes? |
| Efficiency | 15% | Time, tokens, files touched |
| Safety | 10% | No unintended changes outside scope? |
| Code quality | 10% | Clean diff? No hacks? |

**Critical rule:** hitting the tool-call limit without the fix means correctness = 0, regardless of analysis quality. A skill that burns the budget on hypothesis generation before touching code is a failed trial. A human or judge subagent applies the rubric when no automated tests exist.

### 4. Calculate improvement
```
skill_avg    = average of 5 skill trials
baseline_avg = average of 5 baseline trials
improvement  = ((skill_avg - baseline_avg) / baseline_avg) × 100
```
Report both averages ± stddev, the % improvement, and anecdotal observations.

### 5. Write the justification memo
One page: the decision (Keep / Retire / Refine, one sentence), an evidence summary table (source, type, sample size, finding), limitations (what the evidence does NOT show, what changed alongside the skill, cherry-picking risk), and a recommendation with confidence, reversal conditions, and next review date. Store it beside the skill source so future maintainers see why.

## Reference
For real-bug sourcing (fix-commit method), the benchmark pack structure, task-design table, pitfalls, empirically validated benchmark tasks, fast alternatives, and observed failure modes, see [`references/ab-evaluation-details.md`](references/ab-evaluation-details.md).

## Rules
- **Do** run all 5 trials per condition — N=1 is noise.
- **Do** isolate every trial in a disposable snapshot; a contaminated trial is invalid.
- **Do** score correctness 0 when the budget is exhausted without a fix.
- **Do** design tasks that exercise the skill's unique tools — a task both solve trivially teaches nothing.
- **Do** smoke-test 1 skill + 1 baseline before committing tokens; if both score 100 trivially, redesign the task.
