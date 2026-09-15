---
name: skill-ab-evaluation
description: "A/B evaluate any GrimoireStack skill against a baseline using isolated subagents, 5 trials each, and an objective rubric."
triggers:
  - skill-impact-measurement
  - skill-vs-baseline
  - empirical-skill-evidence
  - skill-quality-audit
disable-model-invocation: true
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

**Done when:** every upcoming run owns a private snapshot copy, and nothing outside those copies was touched.

### 2. Run the trials — 5 skill, 5 baseline
For n in 1..5, spawn a subagent on an identical task prompt pointing at the isolated snapshot — one condition with the target skill loaded, one without (general knowledge only). Keep the runner **blind**: task prompt plus the skill text is all it sees — no rubric, no bar, no expected fix. Collect per trial: final state, test results, diff, tool-call count, token usage. Account for skill-read overhead: pre-inject the skill into the prompt, or measure only the phase after the skill read.

**Done when:** ten finished trials exist, five per condition, each scored-ready with its metrics collected.

Before spending them, calibrate difficulty with 3 baseline-only probes. Keep only tasks where the baseline fails 30–70% of the time: a baseline that always passes has no headroom to measure improvement in (ceiling), and one that never passes cannot show the skill rescuing anything (floor). A null at calibration retires the task, not the skill.

### 3. Score each trial — objective rubric
| Dimension | Weight | Measure |
|-----------|--------|---------|
| Correctness | 40% | Tests pass? Bug actually fixed? |
| Completeness | 25% | All requirements met? No partial fixes? |
| Efficiency | 15% | Tool calls, tokens, files touched |
| Safety | 10% | No unintended changes outside scope? |
| Code quality | 10% | Clean diff? No hacks? |

**Critical rule:** hitting the tool-call limit without the fix means correctness = 0, regardless of analysis quality. A skill that burns the budget on hypothesis generation before touching code is a failed trial. A human or judge subagent applies the rubric when no automated tests exist.

When the skill claims to PREVENT a specific failure, grade the trap-fall rate instead of a blended score: plant exactly one instance of that failure and count how often each condition falls into it. Prevention skills are invisible to aggregate correctness — the errors they stop are the ones that never happen.

### 4. Calculate improvement
```
skill_avg    = average of 5 skill trials
baseline_avg = average of 5 baseline trials
improvement  = ((skill_avg - baseline_avg) / baseline_avg) × 100
```
Report both averages ± stddev, the % improvement, and anecdotal observations.
If `baseline_avg` is 0 the percentage is undefined — compare with the absolute delta instead, and treat large percentages off tiny baselines as noise, not wins.

### 5. Write the justification memo
One page: the decision (Keep / Retire / Refine, one sentence), an evidence summary table (source, type, sample size, finding), limitations (what the evidence does NOT show, what changed alongside the skill, cherry-picking risk), and a recommendation with confidence, reversal conditions, and next review date. Store it beside the skill source so future maintainers see why.

## Reference
For real-bug sourcing (fix-commit method), the benchmark pack structure, task-design table, pitfalls, empirically validated benchmark tasks, fast alternatives, and observed failure modes, see [`references/ab-evaluation-details.md`](references/ab-evaluation-details.md).

## Rules
- **Run all 10 trials before concluding** — an early green is noise, not evidence.
- **Do** keep the judge blind to condition — the scorer grades artifacts without knowing which trial loaded the skill.
- **Smoke first**: 1 skill + 1 baseline before committing tokens — if both pass trivially, the task is too shallow; redesign it.
