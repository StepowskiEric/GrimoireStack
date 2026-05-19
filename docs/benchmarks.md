# Skill Benchmarks

Reproducible A/B evaluation results for jerrysagentskills. All benchmarks use isolated environments — zero risk to active projects.

## Benchmark Methodology

### Environment Isolation
- Disposable copied snapshots (`cp -r`) — never git worktrees or active project directories
- Fresh Python venv per trial (`uv venv && uv pip install -e .`)
- Repositories deleted after scoring

### Task Selection
- Real bugs from real commits (FastAPI commit `ed2512a~1`)
- Test cherry-picked from fix commit provides ground-truth verification
- Bug requires multi-file tracing (not a single-file typo)

### Rubric (0-100 per trial)

| Dimension | Weight | Measurement |
|-----------|--------|-------------|
| Correctness | 40% | Tests pass? Bug fixed? |
| Completeness | 25% | All requirements met? |
| Efficiency | 15% | Tool calls, duration, tokens |
| Safety | 10% | No unintended changes? |
| Code quality | 10% | Minimal diff, matches style? |

### Subagent Configuration
- `max_iterations: 25` tool calls per trial
- Identical prompts except skill loading instruction
- `toolsets: ["terminal", "file"]` only

---

## Results

### `cot-pruning-reasoning`

**Date:** 2026-04-22  
**Task:** Fix FastAPI APIRouter startup handler registration bug  
**Trials:** N=3 baseline, N=1 skill (partial run — full 5-trial interrupted after 42 min)  
**Bug:** `on_startup` handlers set before `super().__init__()`, overwritten by Starlette Router

| Metric | Baseline | Skill | Improvement |
|--------|----------|-------|-------------|
| **Pass rate** | 67% (2/3) | 100% (1/1) | +33pp |
| **Avg tool calls** | 87 | 68 | **-22%** |
| **Avg duration** | 1,590s* | 654s | **-59%** |
| **Output tokens** | 36,956 | 16,478 | **-55%** |
| **Reasoning conciseness** | 60 tokens | 20 tokens | **-67%** |

*Baseline trial 3 hit output token exhaustion and failed (2,671s, no fix). This is a real failure mode the skill avoids.*

**Fix quality comparison:**
- Baseline: +9 lines (clean additive patch after `super().__init__()`)
- Skill: +14/-11 lines (moved existing code block + `lifespan_context`, functionally equivalent but broader diff)

**Verdict:** Skill reduces reasoning verbosity by ~60% while preserving correctness. Main benefit is consistent conciseness, not guaranteed speed (subagent variance dominates duration).

**Limitations:** N=1 for skill condition insufficient for statistical confidence. Subagent stochasticity high. Task is single-shot debugging; skill may show more value on multi-step chains.

---

### `debug-subagent`

**Date:** 2026-04-22  
**Task:** Same FastAPI bug  
**Trials:** N=1  
**Result:** Did NOT fix the bug. Subagent hit 30-tool-call limit during investigation.

| Metric | Baseline | debug-subagent |
|--------|----------|----------------|
| Bug fixed | ✓ | ✗ |
| Tool calls | 64 | 30 (limit) |
| Duration | 766s | 382s |

**Root cause:** Skill protocol requires reading skill file + running test + spawning subagent + subagent investigating + applying fix. The subagent investigation alone consumed the full 30-call budget. Fix identified but not applied.

**Verdict:** Concept validated by research (+13-22% fix rate), but implementation requires too many intermediate steps for current tool-call budgets. Needs: pre-injected skill, concise subagent prompt, or merged approach.

---

### `purify-test-output`

**Date:** 2026-04-22  
**Task:** Same FastAPI bug with purified vs raw test output  
**Trials:** N=1 each  
**Result:** Both fixed, but skill condition was **worse**.

| Metric | Baseline (Raw) | Skill (Purified) | Delta |
|--------|---------------|------------------|-------|
| Bug fixed | ✓ | ✓ | — |
| Tool calls | 67 | 76 | +13% |
| Duration | 361s | 537s | **+49% slower** |
| Input tokens | 2.00M | 2.75M | **+37%** |

**Why it failed:** The test output was already minimal (66 lines, no framework stack trace). Purification stripped useful signal (test body showing `FastAPI(on_startup=[...])`). The skill agent burned 20+ extra calls reconstructing context the baseline already had.

**Verdict:** `purify-test-output` is conditionally correct. Trigger heuristic ("output >20 lines") is too crude. Should detect *framework frame density*, not raw line count. Useful for verbose failures with deep `site-packages` traces; harmful for simple assertion failures.

---

## Lessons Learned

### 1. Subagent Variance Dominates
A single subagent run can vary 3-5x in duration and token usage for the same task. N=1 benchmarks are meaningless. Minimum N=3, ideally N=5.

### 2. Skill Overhead Matters
Reading a skill file costs 1-2 tool calls and ~1,000 input tokens. For a 10-call baseline task, that's 10-20% overhead before any benefit. Pre-inject skills for fair comparison.

### 3. Task Must Match Skill's Unique Value
- `cot-pruning` → needs verbose reasoning chains to prune
- `purify-test-output` → needs verbose test output with framework noise
- `debug-subagent` → needs bugs requiring deep investigation (not trivial fixes)
- `context-density-operator` → needs long-horizon tasks with context pressure

A shallow task makes any skill look like overhead.

### 4. Real Bugs > Synthetic Bugs
The FastAPI commit `ed2512a~1` was far more discriminating than any synthetic bug we tried. Real bugs have:
- No tell-tale comments
- Multiple plausible locations
- Framework interaction complexity
- Ground-truth verification via actual test suite

**Method:** `git log --oneline --grep='fix'` → checkout `commit~1` → cherry-pick test from fix commit.

### 5. Output Token Exhaustion is a Real Failure Mode
Baseline trial 3 burned 41,728 output tokens on reasoning and had none left for the response. This is a timeout variant — the agent "thinks" itself to death. Skills that reduce output verbosity directly prevent this.

---

## Running Benchmarks Yourself

```bash
# 1. Pick a real bug
cd /tmp
git clone https://github.com/fastapi/fastapi.git bench-repo
cd bench-repo
git checkout <fix-commit>~1

# 2. Cherry-pick just the test
git cherry-pick -n <fix-commit>  # take test file only
git checkout HEAD -- tests/test_foo.py  # keep only test

# 3. Create paired snapshots
cp -r /tmp/bench-repo /tmp/eval-skill
cp -r /tmp/bench-repo /tmp/eval-base

# 4. Delegate to subagents with/without skill
# See skill-ab-evaluation protocol for full procedure
```

---

## Benchmark Wishlist

Skills needing evaluation:
- [ ] `context-density-operator` — needs long-horizon task with context pressure
- [ ] `selective-halt-reasoning` — needs iterative task with clear convergence
- [ ] `sop-evolution-memory` — needs 2+ similar tasks to measure compounding
- [ ] `context-lifecycle-manager` (absorbs token-budget-operator) — needs task benefiting from all 4 phases
- [ ] `bisect-debugging` — needs regression introduced across multiple commits
- [ ] `simulate-instrumentation` — needs runtime state-dependent bug
