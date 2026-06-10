---
source: "jerry-skills"
name: skill-ab-evaluation
description: A/B evaluate any jerrysagentskill against a baseline using isolated subagents, 5 trials each, and an objective rubric. Measures real % improvement without touching current projects.
category: testing
priority: high
tags: [evaluation, ab-test, subagent, skill-quality, benchmarking]
...



---

## Overview
Run paired A/B trials to measure whether loading a specific jerrysagentskill actually improves outcomes vs. general knowledge. Uses isolated git worktrees or temp directories so zero risk to current projects. Minimum 5 trials per condition for statistical relevance.

## When to use
- You want to know if a skill is worth keeping / promoting
- You suspect a skill is fluff or counter-productive
- You need empirical data to justify skill refinement
- A skill's domain is narrow enough to create a reproducible task

## When NOT to use
- The skill is purely preventative (e.g., security audit) — failures are rare and catastrophic, requiring adversarial test cases instead of random tasks
- You cannot define a clear "done" criteria for the task
- Token budget is severely constrained (10 subagent runs = 10× cost of single run)
- The skill is a planning/risk-analysis framework (e.g., `specter` for simple bugs where the cause is obvious, `inversion-mental-model-state-machine`, `pdca-deming`) being tested on deterministic code bugs. These skills burn tool-call budgets on analysis theater and empirically fail on typical code bugs.

## Prerequisites
1. **Target skill** — which skill to evaluate
2. **Task definition** — a self-contained prompt the subagent can execute (e.g., "Fix this Convex auth bug in the provided repo")
3. **Repository state** — a known commit or temp repo with a reproducible problem
4. **Test harness** — a script or criteria that can score the result objectively

## Where to get real bugs (better than synthetic)

Synthetic bugs often have tell-tale comments or trivial fixes. For realistic evaluation, use actual buggy commits from real repos.

**Method:**
1. Clone a small repo (<1GB, has tests): `fastapi`, `express`, `flask`, `axios`
2. Find a fix commit: `git log --oneline --grep='fix' -- '*.py'`
3. Check out the commit *before* the fix: `git checkout <fix-commit>~1`
4. Cherry-pick *only the test* from the fix commit (the test should fail on buggy code)
5. Task: "Make this test pass"

This gives you a real bug with ground-truth verification.

## Core protocol

### Step 1 — Prepare isolation (disposable snapshots, NOT worktrees)

**Do not use git worktrees or shared node_modules.** Worktrees share state and contaminate results. Use disposable copied snapshots instead.

```bash
# Good: per-run copied snapshot
cp -r benchmarks/repo-a/base /tmp/skill-eval-{n}-skill
cp -r benchmarks/repo-a/base /tmp/skill-eval-{n}-base

# Better: tarball extraction for speed
tar -xzf repo-a-base.tar.gz -C /tmp/skill-eval-{n}-skill
```

After the run, delete the temp directory. Never run in active project directories.

### Step 2 — Run 5 Skill trials
For `n` in 1..5:
- Spawn subagent with the **target skill loaded**
- Prompt: identical task instruction pointing at the isolated worktree
- Collect: final state, test results, diff, time elapsed, token usage

### Step 3 — Run 5 Baseline trials
For `n` in 1..5:
- Spawn subagent **without the target skill** (general knowledge only)
- Prompt: identical task instruction pointing at the isolated worktree
- Collect same metrics

### Step 4 — Score each trial

**Important:** When comparing skill vs baseline, account for skill-read overhead.

- If the skill agent must `read_file` the skill before starting, that costs 1+ tool calls and tokens.
- For a fair comparison, either **pre-inject the skill into context** or **measure only the debugging phase** (time from first source file read to fix).

Use this rubric (0-100 per trial):

| Dimension | Weight | How to measure |
|-----------|--------|----------------|
| Correctness | 40% | Tests pass? Bug actually fixed? |
| Completeness | 25% | All requirements met? No partial fixes? |
| Efficiency | 15% | Time to solution, token usage, files touched |
| Safety | 10% | No unintended changes outside scope? |
| Code quality | 10% | Matches style? Clean diff? No hacks? |

**Critical rule:** If the agent hits its tool-call limit without fixing the bug, correctness = 0 regardless of analysis quality. A skill that burns the budget on hypothesis generation or failure-map creation before touching code is a failed trial.

A human or a second "judge" subagent can apply the rubric if no automated tests exist.

### Step 5 — Calculate improvement
```
skill_avg    = average score of 5 skill trials
baseline_avg = average score of 5 baseline trials
improvement  = ((skill_avg - baseline_avg) / baseline_avg) × 100
```

Report:
- Skill average ± stddev
- Baseline average ± stddev
- % improvement
- Anecdotal observations (e.g., "skill trials consistently found root cause in step 3 instead of step 7")

## Safety rules
- **Never** run trials in current working directories or active projects
- **Always** use `/tmp/` or disposable worktrees
- If a subagent tries to modify files outside its worktree, kill it
- After scoring, delete all `/tmp/skill-eval-*` directories

## Benchmark pack structure

For reproducible evaluation, organize tasks as frozen snapshots:

```
benchmarks/
  repo-a/
    base/                 # frozen repo snapshot with dependencies installed
    tasks/
      task-001-.../       # each task has prompt, metadata, verify script
        prompt.md
        metadata.json
        verify.sh
```

Each task:
- Defines exact starting snapshot
- Includes verification script (pass/fail)
- Runs in disposable copy, never in active worktree

## Example

Evaluate `convex-auth-expo-debugging`:
1. Create temp Expo repo with a known auth bug (e.g., missing `loading` check causing race)
2. Task: "Fix the auth redirect loop. Do not change anything else."
3. Run 5 subagents with skill loaded → score each
4. Run 5 subagents without skill → score each
5. Result: "Skill avg 82/100, Baseline avg 61/100, +34.4% improvement. Skill trials correctly identified `loading` bundling issue 4/5 times; baseline only 1/5."

## Designing test cases that actually exercise the skill

A task that both agents solve trivially teaches you nothing. Match complexity to the skill's unique capabilities:

| Skill type | Shallow task (bad) | Deep task (good) |
|------------|-------------------|------------------|
| Graph-powered debug (`debug-issue`) | Single-file typo or KeyError | Bug spans 3+ files, requires tracing call chains |
| Log trace correlation | Error message names the broken line | Stack trace is deep, root cause is 4 calls away |
| Git bisect | Bug in latest commit only | Bug introduced 10 commits ago, mixed with refactors |
| Architecture design | "Should I use REST or GraphQL?" | Multi-service data flow with consistency trade-offs |
| Security audit | Obvious SQL injection in one file | Auth bypass requiring multi-step state manipulation |

**Key rule:** If the skill's unique tools (graph queries, bisect, structured protocol) are never invoked during the trial, the task is too shallow. Check the agent's tool trace — if it never used `query_graph`, `semantic_search_nodes`, etc., redesign the test.

**Smoke test first.** Before running all 5 trials, do 1 skill + 1 baseline. If both score 100 with trivial effort, redesign the test case before committing tokens.

## Pitfalls
- **N=1 is noise.** Run the full 5 trials even if the first skill trial looks amazing.
- **Task too vague.** "Make this better" is unscoreable. Use "Fix bug X so test Y passes."
- **Contamination.** If the baseline subagent stumbles across the skill file and reads it, the trial is invalid. Isolate by directory or explicitly instruct baseline subagent not to load skills.
- **Regression skills.** Skills like `bisect-debugging` only help when preconditions hold (tests pass on old commit). Craft test cases that satisfy preconditions or the skill will score unfairly low.
- **False confidence from shallow tasks.** A simple bug may show the skill agent is "faster" (fewer tool calls) but that measures prompt discipline, not skill value. Design tasks where the skill's unique tools or protocol are required to succeed.

## Empirically validated benchmark tasks

These are tasks that have actually discriminated between skilled and unskilled agents in real runs:

| Repo | Commit | Bug type | What it tests |
|------|--------|----------|---------------|
| FastAPI | `ed2512a~1` | APIRouter startup handler overwritten by Starlette `super().__init__()` | Debugging multi-file framework interaction |

**Why FastAPI `ed2512a~1` works:**
- No tell-tale comments pointing to the fix
- Root cause spans FastAPI → Starlette boundary
- Requires understanding `super().__init__()` ordering
- Simple synthetic versions of this bug are trivial; the real commit has real complexity
- Test provides ground-truth verification

**Setup:**
```bash
git clone https://github.com/fastapi/fastapi.git /tmp/fastapi-bench
cd /tmp/fastapi-bench
git checkout ed2512a~1
git cherry-pick -n ed2512a  # grab only the test file
git checkout HEAD -- tests/test_router_events.py
# Bug: on_startup handlers set before super().__init__(), overwritten
```

## Fast validation alternatives (when 5 trials is too expensive)

Full 5-trial A/B can take 1-2 hours and cost significant tokens. If you need faster signal:

### Option A: Token-count micro-benchmark (5 minutes)
- Give identical reasoning tasks to the main agent with/without skill
- Count output tokens and reasoning steps
- No subagents, no isolation overhead
- Good for: `cot-pruning-reasoning`, `context-density-operator`

### Option B: Smoke test (15 minutes)
- 1 skill trial + 1 baseline trial
- If both score 100 trivially → task is too shallow, redesign
- If one fails dramatically → strong signal even at N=1
- Good for: catching obviously broken or obviously amazing skills

### Option C: Parallel batches with early stopping
- Run batches of 3 trials in parallel (e.g., baseline-1/2/3 simultaneously)
- If all 3 baseline pass trivially and skill shows no difference, stop
- If skill shows dramatic divergence, continue to full 5
- Good for: screening many skills quickly

## Failure modes observed in practice

### Output token exhaustion
A subagent burned 41,728 output tokens on verbose reasoning and had none left for the actual response. This is a timeout variant — the agent "thinks" itself to death.

**Mitigation:** Set tighter `max_iterations` (20 instead of 30) for tasks where reasoning verbosity is the risk. Skills that reduce output verbosity (`cot-pruning-reasoning`) directly prevent this.

### Skill-read overhead
Reading the skill file costs 1-2 tool calls and ~1,000 input tokens before any work begins. For a 10-call baseline task, that's 10-20% overhead.

**Mitigation:** Pre-inject the skill into the subagent prompt instead of having it `read_file`. Or measure only the post-skill-read phase for fair comparison.

### Testing the wrong skill on the wrong task
We tested `cot-pruning-reasoning` on a single-shot debugging task. The skill showed -55% token reduction, but its *true* value is on multi-step reasoning chains where pruning compounds. Single-shot tasks understate the benefit.

**Rule:** Match the task complexity to the skill's unique value proposition. If the skill's protocol is never invoked during the trial (e.g., no reasoning chain to prune), the benchmark is invalid.

### Subagent timeout on batch runs
Three baseline trials took 42 minutes. This is mostly subagent startup and model latency, not the actual task.

**Mitigation:** Use `delegate_task` with parallel `tasks` array (up to 3 concurrent). Pre-install all dependencies in snapshots to avoid per-trial setup.
