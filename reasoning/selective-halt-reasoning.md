---
name: selective-halt-reasoning
description: Monitor reasoning output for semantic stabilization and halt early when consecutive steps converge on equivalent conclusions. Based on DASH (arXiv:2604.18103) delta-attention selective halting adapted for agent reasoning.
category: reasoning
tags: [reasoning, early-stopping, token-efficiency, convergence, selective-halting]
author: Research synthesis
source: arXiv:2604.18103
date: 2026-04-22
version: 1.0.0
...



---

# Selective Halt Reasoning

## When to Use

Use this skill when:
- Reasoning is converging on a clear conclusion but continuing to elaborate
- You're iterating on a solution and subsequent iterations make no meaningful change
- Token budget is constrained and you need to know when to stop
- The problem has a threshold or satisficing ("good enough") criterion

## The Problem

Agents often continue reasoning past the point of diminishing returns:
- Repeating the same conclusion with different words
- Adding justification that doesn't strengthen confidence
- Exploring alternatives after a solution is already verified

**DASH** (arXiv:2604.18103) observes that tokens evolve toward "semantic fixing points" — further processing becomes redundant. This applies to reasoning too.

## Core Protocol

### Step 1 — Establish Halting Criteria

Before reasoning, define what "done" looks like:

```
Halting Criteria:
- [ ] Root cause identified with specific file/line
- [ ] Fix implemented and tested
- [ ] Test passes
- [ ] No regressions introduced
Stop when ALL checked.
```

### Step 2 — Reasoning Iteration with Delta Check

After each reasoning step or iteration, compute the semantic delta:

> "Did this step change my conclusion, confidence level, or next action?"

| Delta Type | Meaning | Action |
|------------|---------|--------|
| `CONCLUSION_CHANGED` | New information altered the answer | Continue |
| `CONFIDENCE_INCREASED` | Same conclusion, stronger support | Continue (once more, then check) |
| `NO_CHANGE` | Same conclusion, same confidence | **Halt candidate** |
| `REGRESSION` | New info weakens conclusion | Backtrack |

### Step 3 — Consecutive No-Change Rule

If **3 consecutive steps** produce `NO_CHANGE`:
1. Review whether any halting criteria are unmet
2. If criteria met → **HALT immediately**
3. If criteria unmet → Force a novel action (e.g., run test, read new file) rather than more reasoning

### Step 4 — Confidence Threshold Halting

For problems with quantifiable confidence:

```
If confidence > 0.9 AND no halting criteria unmet → HALT
If confidence > 0.7 AND token budget > 80% used → HALT with caveat
If confidence < 0.5 → Continue (don't halt on uncertainty)
```

## Semantic Equivalence Check

Two reasoning steps are semantically equivalent if:
- They produce the same next action
- They identify the same root cause
- They recommend the same fix
- They merely rephrase without adding evidence

**Not equivalent if:**
- One introduces new evidence
- One changes the scope of the fix
- One reveals a new constraint or edge case

## Example

**Iteration 1:**
```
The bug is in APIRouter.__init__. Starlette overwrites on_startup.
Fix: move assignment after super().__init__().
```
→ Confidence: high. Criteria: root cause found, fix identified. Tests not yet run.

**Iteration 2:**
```
Confirmed: Starlette Router.__init__ sets self.on_startup = [].
FastAPI sets it before, so it gets wiped. Moving after fixes.
```
→ Delta: CONFIDENCE_INCREASED (same conclusion, more evidence). Continue once.

**Iteration 3:**
```
The fix is definitely to move the assignment after super().__init__().
This prevents Starlette from overwriting the handlers.
```
→ Delta: NO_CHANGE. Halting candidate. Unmet criteria: test not run. → Don't halt yet, run test.

**Iteration 4 (after test passes):**
```
Test passes. Fix confirmed working.
```
→ Criteria met. HALT.

## Rules

1. **Never halt on an untested fix** — always verify before stopping
2. **Never halt when confidence is low** (< 0.5) — keep exploring
3. **Never halt after only 1 no-change step** — wait for 3 consecutive
4. **Always force action after 3 no-changes** — don't reason in circles
5. **Halt immediately if fix is verified and no regressions** — don't polish

## Research Basis

- **DASH** (arXiv:2604.18103): Delta Attention Selective Halting. Monitors layer-wise update dynamics to halt stabilized tokens. Training-free, generalizes across language and vision. Significant speedups while preserving accuracy.

## Pitfalls

- **Premature halting on complex problems**: Multi-step fixes may have lulls between breakthroughs. Don't halt during implementation just because reasoning stabilized.
- **False convergence**: A locally optimal but globally wrong conclusion can appear stable. Always verify with external validation (tests, data).
- **Confidence miscalibration**: Agents often overestimate confidence. Use concrete checks (tests pass, specific line numbers) rather than gut feeling.
- **Halting before edge cases**: A fix that works for the main case may fail on edge cases. Check at least one boundary condition before halting.
