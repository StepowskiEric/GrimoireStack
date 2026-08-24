# Skill A/B Evaluation — Reference Details

## Where to get real bugs (better than synthetic)

Synthetic bugs often have tell-tale comments or trivial fixes. For realistic evaluation, use actual buggy commits from real repos:

1. Clone a small repo (<1GB, has tests): `fastapi`, `express`, `flask`, `axios`
2. Find a fix commit: `git log --oneline --grep='fix' -- '*.py'`
3. Check out the commit *before* the fix: `git checkout <fix-commit>~1`
4. Copy *only the test* from the fix commit onto the buggy tree: `git checkout <fix-commit> -- <test-file>`. Never `cherry-pick -n` here — it stages the entire fix, handing the runner a solved bug.
5. Task: "Make this test pass"

This gives a real bug with ground-truth verification.

## Benchmark pack structure

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

Each task defines the exact starting snapshot, includes a pass/fail verification script, and runs in a disposable copy.

## Designing test cases that exercise the skill

| Skill type | Shallow task (bad) | Deep task (good) |
|------------|-------------------|------------------|
| Graph-powered debug | Single-file typo or KeyError | Bug spans 3+ files, requires tracing call chains |
| Log trace correlation | Error message names the broken line | Stack trace is deep, root cause is 4 calls away |
| Git bisect | Bug in latest commit only | Bug introduced 10 commits ago, mixed with refactors |
| Architecture design | "Should I use REST or GraphQL?" | Multi-service data flow with consistency trade-offs |
| Security audit | Obvious SQL injection in one file | Auth bypass requiring multi-step state manipulation |

Key rule: if the skill's unique tools (graph queries, bisect, structured protocol) are never invoked during the trial, the task is too shallow. Check the tool trace — if `query_graph`, `semantic_search_nodes`, etc. were never used, redesign the test.

## Pitfalls

- **N=1 is noise** — run the full 5 trials even if the first skill trial looks amazing
- **Task too vague** — "make this better" is unscoreable; use "fix bug X so test Y passes"
- **Contamination** — if the baseline subagent stumbles across the skill file and reads it, the trial is invalid; isolate by directory or instruct the baseline not to load skills
- **Regression skills** — `bisect-debugging` only helps when preconditions hold (tests pass on old commit); craft tasks that satisfy preconditions or the skill scores unfairly low
- **False confidence from shallow tasks** — a simple bug showing the skill agent is "faster" measures prompt discipline, not skill value

## Empirically validated benchmark task

| Repo | Commit | Bug type | What it tests |
|------|--------|----------|---------------|
| FastAPI | `ed2512a~1` | APIRouter startup handler overwritten by Starlette `super().__init__()` | Multi-file framework interaction |

Why it works: no tell-tale comments, root cause spans the FastAPI → Starlette boundary, requires understanding `super().__init__()` ordering, and the test gives ground-truth verification.

```bash
git clone https://github.com/fastapi/fastapi.git /tmp/fastapi-bench
cd /tmp/fastapi-bench
git checkout ed2512a~1
# Grab ONLY the test file from the fix commit; the code stays buggy:
git checkout ed2512a -- tests/test_router_events.py
# Bug: on_startup handlers set before super().__init__(), overwritten
```

## Fast alternatives (when 5 trials is too expensive)

### Option A: token-count micro-benchmark (5 minutes)
Identical reasoning tasks with/without the skill; count output tokens and reasoning steps. No subagents, no isolation overhead. Good for `cot-pruning-reasoning`, `context-density-operator`.

### Option B: smoke test (15 minutes)
1 skill + 1 baseline. Both score 100 trivially → task too shallow, redesign. One fails dramatically → strong signal even at N=1. Catches obviously broken or obviously amazing skills.

### Option C: parallel batches with early stopping
Batches of 3 trials in parallel; stop if baseline passes trivially with no skill difference; continue to full 5 on dramatic divergence. Good for screening many skills.

## Failure modes observed in practice

### Field-tested additions (2026-08-24 campaign)

- **Grade process traces alongside outcomes.** A runner can pass by luck while skipping every discipline the skill teaches. Score adherence from the session trace (tool calls, file touches, verification steps) and weight outcome still highest.
- **Blind judges for judgment skills.** For review/critique skills, have a fresh judge rank sanitized artifacts under neutral labels; strip paths and condition-revealing words first.
- **Model tier changes the answer.** In one campaign, a verification scaffold helped a mid-tier model but vanished at a lower tier (below a capability floor it is not executed even when loaded), while a reasoning-discipline skill helped the LOWER tier. Confirm keep verdicts on a second tier before generalizing.
- **Ceiling nulls are findings.** When both conditions ace the task, the model's defaults already cover it — record the null and lean toward retirement rather than redesigning forever.
- **Synthetic fixtures bias conservative.** Sparse toy repos make verification artificially cheap, which understates a skill's real-world value; confirm any KEEP on a real-repo checkout before finalizing.
- **Concurrency:** batch runner spawns 2–4 at a time; more risks provider rate-limit stalls that silently park subagents mid-read.

### Output token exhaustion
A subagent burned 41,728 output tokens on verbose reasoning and had none left for the response. Mitigation: tighter `max_iterations` (20 instead of 30) on tasks where verbosity is the risk.

### Skill-read overhead
Reading the skill file costs 1–2 tool calls and ~1,000 input tokens before any work. For a 10-call baseline task that's 10–20% overhead. Mitigation: pre-inject the skill into the prompt, or measure only the post-read phase.

### Testing the wrong skill on the wrong task
`cot-pruning-reasoning` showed -55% token reduction on a single-shot debugging task — but its value is on multi-step chains where pruning compounds. Match task complexity to the skill's value proposition; if the protocol is never invoked, the benchmark is invalid.

### Subagent timeout on batch runs
Three baseline trials took 42 minutes (startup + model latency, not task time). Mitigation: parallel `delegate_task` (up to 3 concurrent); pre-install all dependencies in snapshots.
