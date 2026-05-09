---
name: token-budget-operator
description: Master token-efficiency protocol that orchestrates context compression, CoT pruning, selective halting, and SOP capture in sequence. For long-horizon tasks where token burn is the bottleneck.
category: reasoning
tags: [token-efficiency, hybrid, context-management, reasoning, budget, orchestration]
author: Research synthesis
source: arXiv:2604.17091, arXiv:2312.08901, arXiv:2604.18103
date: 2026-04-22
version: 1.0.0
...



---

# Token Budget Operator

## When to Use

Use this skill when:
- Context window is filling during multi-step tasks
- Previous tasks burned excessive tokens on redundant reasoning
- You expect the task to exceed 10 reasoning steps
- You want experience to compound across similar tasks (SOP capture)
- Token cost or latency is a primary concern

## When NOT to Use

- Task is trivial (single-step fix, obvious change) — skill overhead exceeds savings
- Task requires exhaustive enumeration with no pruning possible
- No prior similar tasks exist and SOP index is empty

## Architecture

```
├── PHASE 1: Context Density (pre-reasoning)
│   └── Inventory → Classify → Compress → Verify density > 0.6
├── PHASE 2: CoT Pruning (during reasoning)
│   └── Draft → Coarse prune → Fine prune → Verify sufficiency
├── PHASE 3: Selective Halt (convergence detection)
│   └── Define criteria → Compute delta → 3 no-changes → HALT
└── PHASE 4: SOP Capture (post-success)
    └── Annotate decisions → Distill to 500-token SOP → Index → Archive old
```

## Phase 1 — Context Density

Run `context-density-operator` protocol before first reasoning step:

1. **Snapshot** current context items with token estimates
2. **Classify** each: DECISION-CRITICAL / REFERENCE / HISTORICAL / REDUNDANT / NOISE
3. **Compress** in tiers: Drop noise → Deduplicate → Summarize historical → Compress reference to key+summary
4. **Verify** density score: `decision_critical_tokens / total_tokens > 0.6`

**Output:** Clean, dense context ready for reasoning.

## Phase 2 — CoT Pruning

During reasoning, run `cot-pruning-reasoning` protocol:

1. **Draft** full reasoning chain (no self-censorship)
2. **Coarse prune** (step level): For each step, ask "does removing this change the conclusion?" Drop dead ends, compress restatements.
3. **Fine prune** (token level): Keep assertions + key evidence + logical connectors. Drop hedging, examples that don't add info, verbose implications.
4. **Verify sufficiency:** Would a reader reach the same conclusion from pruned steps alone?

**Output:** Compressed reasoning chain with no loss of decision-relevant info.

## Phase 3 — Selective Halt

After each reasoning iteration, run `selective-halt-reasoning` protocol:

1. **Define halting criteria** before starting (e.g., "test passes, root cause identified, fix applied")
2. **Compute semantic delta** after each step:
   - CONCLUSION_CHANGED → continue
   - CONFIDENCE_INCREASED → continue (once more)
   - NO_CHANGE → increment no-change counter
   - REGRESSION → backtrack
3. **3 consecutive NO_CHANGE** → review criteria → if met, HALT; if not, force action (run test, read new file)
4. **Confidence threshold:** If confidence > 0.9 and criteria met → HALT immediately

**Output:** Clean stop when reasoning has converged, before token waste begins.

## Phase 4 — SOP Capture

After successful task completion, run `sop-evolution-memory` protocol:

1. **Annotate key decisions** during the task (already done in reasoning)
2. **Distill** trajectory into SOP (max 500 tokens):
   - Trigger (50 tokens)
   - Root cause pattern (100 tokens)
   - Diagnostic steps (150 tokens)
   - Fix pattern (150 tokens)
   - Verification (50 tokens)
3. **Index** with metadata: domain, tech stack, triggers, success_count=1
4. **Retrieve** next time: if task matches triggers with confidence > 0.7, load SOP instead of reasoning from scratch

**Output:** Reusable SOP that compresses 3000+ token trajectories to 500 tokens.

## Integration Rules

1. **Always run Phase 1 before Phase 2** — pruning a noisy context is harder than pruning a clean one
2. **Phase 3 gates Phase 2** — halt before generating another pruned reasoning step if converged
3. **Phase 4 only on success** — never capture failed trajectories
4. **Skip Phase 4 if task is one-off** — no point indexing a task that won't recur
5. **Abort any phase if it consumes >20% of remaining token budget** — the cure can't be worse than the disease

## Token Budget Accounting

Track tokens across phases:

```
Budget: 10,000 tokens
Phase 1 overhead: -200 tokens (compression logic)
Phase 1 savings: +1,500 tokens (context reduced from 3,000 to 1,500)
Phase 2 overhead: -100 tokens (pruning logic)
Phase 2 savings: +800 tokens (CoT reduced from 1,200 to 400)
Phase 3 overhead: -50 tokens (delta checks)
Phase 3 savings: +600 tokens (halted 3 steps early)
Phase 4 overhead: -100 tokens (SOP generation)
Phase 4 savings: +0 now, +2,500 next time (SOP loaded)
Net this task: +2,450 tokens recovered
Net next similar task: +4,950 tokens recovered
```

## Example: Full Task Lifecycle

**Task:** Debug Convex Auth loading race (3rd time this month)

**Phase 1:**
```
Before: 3,200 tokens (full tool outputs, previous reasoning, logs)
After:  1,400 tokens
Dropped: verbose search results, duplicate error messages, completed plan steps
Kept: current task, active plan, error at failure point, key variable values
```

**Phase 2:**
```
Step 1: Auth returns null after sign-in → bug confirmed
Step 2: loading bundles user+token+onboarding → root cause
Step 3: useQuery returns undefined while loading → mechanism
Step 4: waitForUser checks user?.id && !loadingRef.current → fix
→ Pruned from 8 steps to 4, 340 tokens → 89 tokens
```

**Phase 3:**
```
Iteration 4: fix identified, test passes → HALT
Saved: 2 more iterations of polishing and re-verification (~400 tokens)
```

**Phase 4:**
```
SOP created: convex-auth-loading-race (380 tokens)
Next time: load SOP instead of reasoning → 380 tokens vs 3,200 tokens
```

## Expected Improvements

| Metric | No skill | With token-budget-operator | After 3 uses |
|--------|----------|---------------------------|--------------|
| First task tokens | 10,000 | 7,500 | 7,500 |
| Similar task tokens | 10,000 | 7,500 | 3,000 (SOP loaded) |
| Reasoning steps | 15 | 8 | 4 (SOP guides) |
| Time to fix | 20 min | 14 min | 6 min |

**Compounding effect:** SOPs make each subsequent similar task cheaper.

## Research Basis

- **GenericAgent** (arXiv:2604.17091): Context density + SOP self-evolution
- **CoT-Influx** (arXiv:2312.08901): CoT pruning with reinforced context selection
- **DASH** (arXiv:2604.18103): Selective halting via semantic stabilization
- **Sufficiency-Conciseness** (arXiv:2602.14002): Information bottleneck for explanation compression

## Pitfalls

- **Overhead on short tasks:** A 3-step task may spend more tokens on protocol than it saves. Skip this skill for trivial work.
- **SOP staleness:** Codebases evolve. An SOP from 3 months ago may reference renamed functions. Version SOPs and validate on load.
- **False convergence:** Phase 3 may halt on a locally optimal but wrong conclusion. Always verify with external tests before halting.
- **Compression artifacts:** Phase 1 may drop a critical detail. Keep error messages and test assertions until addressed.
- **SOP index bloat:** Too many SOPs make retrieval noisy. Archive low-success-count SOPs and merge duplicates quarterly.
