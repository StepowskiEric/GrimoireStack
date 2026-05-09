---
source: "jerry-skills"
name: context-budget-operator
description: Manage finite context windows explicitly. Track token budget, classify information needs, compress aggressively, and decide breadth-vs-depth based on remaining runway. Prevents silent context overflow and instruction dropout.
category: execution
priority: high
tags: [context-management, token-efficiency, scaling, agent-safety, long-horizon]
...



---

## Overview

Context windows are finite. In long sessions or large codebases, agents silently exceed their budget, causing earlier instructions to drop out, reasoning to fragment, and coherence to collapse. The failure mode is invisible until the agent contradicts itself or forgets constraints set 10 turns ago.

**Context Budget Operator** treats token budget as a first-class resource:
1. **ASSESS** current context usage before every LLM call
2. **CLASSIFY** the information need (summary vs full vs index)
3. **COMPRESS** when usage crosses the compression threshold
4. **DECIDE** breadth vs depth based on remaining budget
5. **LOG** consumption per operation to detect runaway growth

Research shows that simply making the agent aware of its remaining budget improves performance without architectural changes (BATS, Liu et al. 2025). Explicit budget tracking is the cheapest scaling intervention.

## When to use

- Working on codebases with >20 files or files >500 lines
- Sessions exceeding 15 turns
- Before reading multiple files in parallel
- When the task requires cross-file reasoning (architecture, refactoring)
- When you notice the agent repeating questions or forgetting constraints
- Before any operation expected to return >1000 tokens of output

## When NOT to use

- Single-file edits under 100 lines
- Sessions under 5 turns with minimal context
- When the full context easily fits in the window with >50% headroom
- Time-critical fixes where compression overhead exceeds the savings

## Companion script (optional)

A companion Python script estimates token counts, suggests compression strategies, and tracks session budget.

```bash
# Estimate token cost of files
python scripts/context_budget.py --files src/main.py src/utils.py

# Check if content fits budget
python scripts/context_budget.py --file large_output.txt --budget 4000

# Track session usage
python scripts/context_budget.py --log "read_file:main.py:1200" --budget 16000
python scripts/context_budget.py --log "grep:utils:50" --budget 16000
python scripts/context_budget.py --report

# Suggest compression for oversized content
python scripts/context_budget.py --file huge_log.txt --suggest --budget 4000
```

The script is optional — the skill works equally well with manual estimation.

## Core protocol

### Step 1 — ASSESS current context usage

Before every LLM call, estimate where you stand:

```markdown
Context budget assessment:
- Window limit: ~16000 tokens (estimate)
- Current usage: ~9000 tokens (reasoning + file contents + history)
- Headroom: ~7000 tokens
- Safety threshold: 50% (8000 tokens)
- Status: ABOVE threshold → compression required
```

**Estimation rules (approximate):**
| Content type | Tokens per unit |
|-------------|-----------------|
| English text | ~1.3 tokens per word |
| Code | ~0.5 tokens per word (more symbols) |
| File path / short string | ~2-4 tokens |
| Line of code | ~5-10 tokens |
| Reasoning paragraph | ~50-100 tokens |

### Step 2 — CLASSIFY the information need

Determine how much fidelity you need:

| Need level | Description | Approximate token cost |
|-----------|-------------|----------------------|
| **Summary** | "What does this file do?" | 50-100 tokens |
| **Signature** | "What functions exist and what are their args?" | 100-200 tokens |
| **Section** | "Read lines 50-100 only" | 200-400 tokens |
| **Full** | "I need the complete file" | 500-3000 tokens |
| **Multi-file** | "Cross-reference 3+ files" | 1500-8000 tokens |

Default to the **lowest** need level that can answer the question. Escalate only when the lower level proves insufficient.

### Step 3 — COMPRESS when over threshold

**Compression threshold: 50% of window.**

When current usage exceeds the threshold, apply compression before adding new content:

```markdown
Compression checklist:
- [ ] Summarize older reasoning (keep conclusions, drop derivations)
- [ ] Replace full file reads with signature-only extracts
- [ ] Collapse multi-turn conversations into decision summaries
- [ ] Remove code comments from quoted snippets
- [ ] Use ellipsis (...) for repetitive or boilerplate sections
- [ ] Offload to external memory (notes, files) instead of inline context
```

**Compression techniques by content type:**

| Content | Compression technique |
|---------|----------------------|
| Long reasoning chain | Keep final conclusion + key decision points only |
| Full file content | Extract signatures + relevant section only |
| Test output | Purify to failure-relevant lines only |
| Error logs | Keep first and last 5 lines + exception message |
| Multi-turn chat | Summarize each turn to 1-2 sentences |
| Stack traces | Keep user frames only (see purify-test-output skill) |

### Step 4 — DECIDE breadth vs depth

With remaining budget R:

```markdown
If R > 50% of window:
  → Depth mode: Read full files, explore deeply

If R is 25-50% of window:
  → Balanced mode: Summarize most files, read 1-2 key files fully

If R < 25% of window:
  → Breadth mode: Signatures only, search for specific terms
  → OR: Pause and compress existing context before proceeding

If R < 10% of window:
  → Halt: Compress immediately or escalate to user
```

**BATS insight:** Telling the agent "you still have budget, explore more" is effective. Conversely, when budget is low, explicitly state "budget constrained — choose the single most important check."

### Step 5 — LOG consumption

Track every operation that adds tokens:

```markdown
Context budget log:
[Turn 1] reasoning: ~400 tokens
[Turn 2] read_file config.py: ~200 tokens
[Turn 3] read_file main.py (full): ~1800 tokens
[Turn 4] grep search results: ~300 tokens
[Turn 5] reasoning: ~500 tokens
___

Total: ~3200 tokens | Remaining: ~12800 tokens | Status: GREEN
```

When total crosses thresholds, note the color:
- **GREEN** (< 50%): No action needed
- **YELLOW** (50-75%): Apply compression before next addition
- **RED** (> 75%): Halt and compress existing context
- **BLACK** (> 90%): Stop. Summarize and reset, or escalate.

## Rules for budget management

| Do | Don't |
|----|-------|
| Estimate before every LLM call | Guess and hope it fits |
| Default to summary/signature level | Always read full files "just in case" |
| Compress older reasoning first | Compress the user's instructions |
| Log consumption per operation | Track nothing and wonder why context broke |
| Use breadth mode when budget is low | Keep drilling deep with 5% remaining |
| Offload to files/memory when possible | Inline everything into the context |
| State budget status explicitly | Hide the constraint from yourself |

## Integration with other skills

- **assumption-grounding**: Verify file sizes before reading full contents
- **purify-test-output**: Strip test noise before adding failure output to context
- **explore-codebase**: Use graph/index search instead of reading every file
- **debug-issue**: Focus on single failure path rather than full system state

## Research basis

- **ContextBudget** (arXiv:2604.01664): Budget-aware context compression for long-horizon agents, framed as sequential decision-making.
- **BATS** (Liu et al., 2025): Budget-aware tool-use scaling. Simply informing agents of remaining budget pushes the cost-performance Pareto frontier.
- **Externalization in LLM Agents** (arXiv:2604.08224): As context windows saturate, reliability depends on relocating cognitive burdens to external memory, tool registries, and protocol definitions.

## Example

**Scenario:** Agent needs to refactor a 2000-line monolith across 15 files.

**Without budget management:**
```
[Turn 3] Read full monolith → +3000 tokens
[Turn 5] Read 5 dependencies → +4000 tokens
[Turn 8] Context overflows. Agent forgets refactoring constraints.
[Turn 12] Agent contradicts earlier decisions. Session derailed.
```

**With budget management:**
```
[Turn 1] ASSESS: 0/16000 tokens. GREEN.
[Turn 2] CLASSIFY: Need signatures of 15 files, not full contents.
[Turn 3] Read 15 files at signature level → +800 tokens
[Turn 4] Identify 3 key files for full read.
[Turn 5] Read 3 files fully → +1500 tokens
[Turn 6] ASSESS: 2800/16000. GREEN. Proceed with refactor.
[Turn 8] ASSESS: 8200/16000. YELLOW. Compress old reasoning.
[Turn 9] Summarize turns 1-6 into 200 tokens. Net save: 600 tokens.
[Turn 12] Refactor complete. Peak usage: 9400 tokens. No overflow.
```

## Pitfalls

- **Optimistic estimation**: Underestimating code token density. Code is ~0.5 tokens/word but symbols and indentation add up.
- **Compression resistance**: Refusing to summarize your own reasoning because "it's all important." If everything is important, nothing is.
- **Threshold panic**: Compressing at 30% because you're anxious. Compression has overhead — only apply when needed.
- **Instruction dropout**: Compressing the user's original constraints. Never drop the task definition or success criteria.
- **Log neglect**: Tracking budget but not acting on yellow/red status. The log is useless without the decision gate.
