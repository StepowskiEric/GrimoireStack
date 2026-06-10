---
name: context-density-operator
description: Maximize decision-relevant information per token in the agent's working context. Hierarchical memory, on-demand detail expansion, and redundant-context pruning. Based on GenericAgent (arXiv:2604.17091) and information bottleneck principles.
category: reasoning
tags: [token-efficiency, context-management, memory, reasoning, information-density]
author: Research synthesis
source: arXiv:2604.17091, arXiv:2602.14002
date: 2026-04-22
version: 1.0.0
...



---

# Context Density Operator

## When to Use

Use this skill when:
- Context window is filling up during long-horizon tasks
- Retrieved memories, tool outputs, or logs are drowning out decision-relevant info
- You need to preserve reasoning quality while reducing token burn
- Working with repetitive or redundant context items

## The Problem

Long-horizon agents are fundamentally limited by context. As interactions grow:
- Tool descriptions accumulate
- Retrieved memories pile up
- Raw environmental feedback dominates the window
- Decision-relevant information gets pushed out

**The issue isn't context length — it's information density.**

GenericAgent (arXiv:2604.17091) shows that performance is determined by how much decision-relevant information is maintained within a finite context budget.

## Core Protocol

### Step 1 — Snapshot Current Context

Before each reasoning step, list all context items with estimated token counts:

```
Context Inventory:
1. System prompt (fixed)           ~ 400 tokens
2. Task description                ~ 80 tokens
3. Tool results (3 calls)          ~ 1,200 tokens
4. Previous reasoning chain        ~ 600 tokens
5. Retrieved memories (5 items)    ~ 900 tokens
6. Current code snippet            ~ 300 tokens
Total: ~3,480 tokens / 4,096 budget
```

### Step 2 — Classify Each Item

Tag each item by information type:

| Tag | Meaning | Action |
|-----|---------|--------|
| `DECISION-CRITICAL` | Needed for next action | Keep fully |
| `REFERENCE` | May be needed if something fails | Compress to summary |
| `HISTORICAL` | Already incorporated into reasoning | Archive or drop |
| `REDUNDANT` | Duplicates info elsewhere | Deduplicate |
| `NOISE` | Irrelevant to current task | Drop immediately |

### Step 3 — Apply Compression Tier

**Tier 1: Drop Noise** (immediate, no loss)
- Verbose tool output headers/footers
- Duplicate error messages
- Obsolete plan steps already completed

**Tier 2: Deduplicate** (merge equivalent items)
- If 3 memory items all say "user prefers X", keep one with citation count
- If tool results contain overlapping fields, merge into single table

**Tier 3: Summarize Historical** (lossy but safe)
- Replace full reasoning chain with conclusion + key assumptions
- Replace executed plan steps with "Step N: COMPLETE (result: Y)"
- Replace long code blocks with signatures + changed lines

**Tier 4: Compress Reference** (on-demand detail)
- Store full content in a keyed reference table
- In main context, keep only key + 1-line summary
- Expand on demand when needed

### Step 4 — Verify Density Score

After compression, verify:

```
Decision-critical tokens / Total tokens > 0.6
```

If below 0.6, repeat Tier 3-4 more aggressively.

## Hierarchical Memory Layout

```
[LEVEL 1: Always Visible] ~ 30% of budget
- Current task + constraints
- Active plan (next 2 steps only)
- Decision-critical context items

[LEVEL 2: Summarized] ~ 50% of budget
- Previous steps (compressed)
- Tool results (summarized)
- Retrieved memories (ranked, top N)

[LEVEL 3: Reference Table] ~ 20% of budget
- Full outputs keyed by ID
- Historical reasoning chains
- Source code snippets
- Expand via: "Expand ref #3"
```

## Rules

1. **Never drop the current task description or constraints**
2. **Never drop error messages that haven't been addressed**
3. **Never drop the active plan step you're about to execute**
4. **Always keep variable values at the failure point when debugging**
5. **Summarize AFTER verifying the summary captures the decision-relevant info**

## Example

**Before compression (2,847 tokens):**
```
Tool: web_search
Query: "FastAPI APIRouter on_startup bug"
Results:
1. Title: "FastAPI lifespan events" URL: ... Description: ...
2. Title: "Starlette Router init" URL: ... Description: ...
3. Title: "GitHub issue #1234" URL: ... Description: ...
[full descriptions of 10 results]

Tool: read_file
Path: fastapi/routing.py
Content: [300 lines of code]

Previous reasoning:
I searched for the bug and found... [500 words of narration]
Then I read the file and noticed... [300 words of narration]
```

**After compression (412 tokens):**
```
Search: APIRouter on_startup bug → Starlette Router.__init__ overwrites handlers
Ref: #search-results (10 items, expand if needed)

Code: fastapi/routing.py:954-984
Key: on_startup set before super().__init__(); Starlette sets self.on_startup=[] after
Ref: #full-routing-py (expand if needed)

Reasoning: Root cause identified → Starlette overwrites. Fix: assign after super().__init__.
```

## Research Basis

- **GenericAgent** (arXiv:2604.17091): Contextual Information Density Maximization. Hierarchical on-demand memory + context truncation. Outperforms leading agents with significantly fewer tokens.
- **Sufficiency-Conciseness Trade-off** (arXiv:2602.14002): Information bottleneck principle. Explanations can be compressed while preserving accuracy — excessive compression degrades performance, moderate compression preserves it.

## Pitfalls

- **Over-compressing errors**: A 1-line error summary may omit the critical detail. Keep full error until addressed.
- **Compressing too early**: Don't summarize a reasoning chain until you've verified the conclusion is correct.
- **Losing provenance**: When deduplicating memories, keep at least one source citation so you can trace back.
- **Reference table bloat**: The reference table itself can grow. Prune items not accessed in the last N turns.
