---
name: debug-subagent
description: A dedicated debugging subagent that must be consulted before making code edits. Wraps debugger complexity behind natural-language queries and enforces "debug before edit" workflow. Based on Debug2Fix research (+13-22% bug fix rate).
category: debugging
priority: high
tags: [debugging, subagent, interactive-debugging, program-repair]
...



---

## Overview

Instead of exposing raw debugger tools to the main agent, spawn a **specialized Debug Subagent** that handles all debugging complexity. The main agent can only ask it natural-language questions like "Why does this test fail?" or "What is the value of `customerId` at line 45?"

Research shows this subagent architecture achieves **>98% debug tool call rate** vs ~60% when tools are exposed directly. Models with a debug subagent **outperform stronger models without one**.

## When to use

- Any bug where the fix is not immediately obvious from the error message
- Multi-file bugs requiring runtime state inspection
- Bugs where static analysis (reading code) hasn't revealed the root cause

## When NOT to use

- Trivial syntax errors or clear one-line fixes
- When token budget is severely constrained (subagent adds overhead)

## Core protocol

### Step 0 — Gate editing behind debugging

Before ANY code edit is made, the main agent MUST consult the Debug Subagent at least once. If the bug is obvious (e.g., typo), this step can be a no-op confirmation.

### Step 1 — Spawn Debug Subagent

Give the subagent:
- The failing test or error message
- Access to the codebase (read/search/terminal)
- Debugger tools (if available) or simulated instrumentation
- A limited scope: only debug this specific failure

```
Debug Subagent, investigate why [test X] fails with [error Y].
You have access to: read_file, search_files, terminal (run tests).
Report back with:
1. Root cause
2. The minimal code change needed
3. Confidence (high/medium/low)
```

### Step 2 — Main agent reviews findings

The main agent evaluates the subagent's report:
- Does the explanation account for ALL symptoms?
- Is the proposed fix minimal and safe?
- What files would be touched?

### Step 3 — Apply fix or iterate

If confidence is high: apply the fix and verify.
If confidence is medium: ask the subagent for a second opinion or run additional tests.
If confidence is low: spawn a fresh subagent with a different angle.

## Subagent prompt template

```markdown
You are a Debug Subagent. Your ONLY job is to diagnose why a specific test or error occurs.

Rules:
- Do NOT write code fixes yourself. Only diagnose and recommend.
- Use runtime inspection (debugger, print statements, test runs) over static analysis.
- If you need to see a variable's value at runtime, insert a temporary print/log, run the test, and report the output.
- Explain your reasoning step by step.
- Rate confidence: HIGH (clear root cause), MEDIUM (likely but unverified), LOW (multiple possibilities).

Task: {{TASK_DESCRIPTION}}
```

## Research basis

- **Debug2Fix** (arXiv:2602.18571): Subagent architecture achieves +13-22% bug fix rate over direct tool exposure.
- **Key insight**: Tool-limiting strategy (editing gated behind debugging) increases debug call rates from ~60% to ~99%.
- **Cost**: Adds ~20-50% more tokens but fixes significantly more bugs.

## Example

**Main agent** sees test failure. Instead of guessing:

1. Spawns Debug Subagent: "Why does `test_process_order` fail with KeyError: 'id'?"
2. Subagent traces: runs test → sees KeyError in `payments.py:7` → checks caller in `orders.py` → notices `orders.py` passes `customer` dict with key `customer_id`, but `payments.py` expects `id`
3. Subagent reports: "Root cause: key mismatch. `payments.py` line 7 expects `customer['id']` but caller passes `customer['customer_id']`. Fix: change line 7 to `customer['customer_id']`. Confidence: HIGH."
4. Main agent applies one-line fix.

## Anti-patterns

- **Don't** give the subagent write access to source files — it should only diagnose.
- **Don't** skip the subagent for "obvious" bugs — the gate enforces discipline.
- **Don't** spawn multiple subagents in parallel for the same bug — serial investigation is more token-efficient.
