# Context Management Reference: Budget Operator & Rot Pruner Details

This reference preserves the unique details from the absorbed `context-budget-operator` and `context-rot-pruner` skills. The lifecycle manager provides the unified protocol; this reference contains the specific estimation heuristics and decay formulas.

---

## Token Estimation Heuristics (from context-budget-operator)

| Content type | Approximate tokens per unit |
|-------------|------------------------------|
| English text | ~1.3 tokens per word |
| Code | ~0.5 tokens per word (more symbols) |
| File path / short string | ~2-4 tokens |
| Line of code | ~5-10 tokens |
| Reasoning paragraph | ~50-100 tokens |

## Information Need Classification (from context-budget-operator)

| Need level | Description | Approximate token cost |
|-----------|-------------|----------------------|
| **Summary** | "What does this file do?" | 50-100 tokens |
| **Signature** | "What functions exist and what are their args?" | 100-200 tokens |
| **Section** | "Read lines 50-100 only" | 200-400 tokens |
| **Full** | "I need the complete file" | 500-3000 tokens |
| **Multi-file** | "Cross-reference 3+ files" | 1500-8000 tokens |

Default to the **lowest** need level that can answer the question. Escalate only when the lower level proves insufficient.

## Context Budget Status Levels (from context-budget-operator)

- **GREEN** (< 50%): No action needed
- **YELLOW** (50-75%): Apply compression before next addition
- **RED** (> 75%): Halt and compress existing context
- **BLACK** (> 90%): Stop. Summarize and reset, or escalate.

## Compression Techniques by Content Type (from context-budget-operator)

| Content | Compression technique |
|---------|----------------------|
| Long reasoning chain | Keep final conclusion + key decision points only |
| Full file content | Extract signatures + relevant section only |
| Test output | Purify to failure-relevant lines only |
| Error logs | Keep first and last 5 lines + exception message |
| Multi-turn chat | Summarize each turn to 1-2 sentences |
| Stack traces | Keep user frames only |

## Decay Formula (from context-rot-pruner)

`weight = initial_weight * (decay_rate ^ turns_since_referenced)`

- `initial_weight`: 1.0 for user messages, 0.8 for tool outputs, 0.6 for agent reasoning
- `decay_rate`: 0.9 (10% decay per unreferenced turn)
- `turns_since_referenced`: how many turns since this message was last mentioned

Messages referenced in the current turn → `weight = reset to initial`, `last_referenced = current_turn`

**Critical threshold:** Never prune messages where `weight > 0.5`.

**Rule of thumb:** If a message hasn't been referenced in 10 turns and isn't protected, it's probably rot. Prune it.

## Shared Artifact Schema (context_state.jsonl)

One file across all three phases:

| Field | Phase 1 (Budget) | Phase 2 (Rot) | Phase 3 (Token) |
|---|---|---|---|
| `msg_id` | ✓ Created | ✓ Used | ✓ Used |
| `born_turn` | ✓ Tracked | — | — |
| `weight` | — | ✓ Decayed | ✓ Used for priority |
| `last_referenced` | — | ✓ Updated | — |
| `tokens` | ✓ Counted | ✓ Counted | ✓ Optimized |
| `compressed` | — | — | ✓ Added after compression |

## Pitfalls (Consolidated from all three)

- **Over-pruning** (rot-pruner): If decay_rate is too aggressive (e.g., 0.7), you'll lose context the agent still needs. Start with 0.9.
- **Reference detection failure** (rot-pruner): The script needs a simple heuristic to detect "message was referenced." If detection fails, weights decay falsely.
- **Optimistic estimation** (budget-operator): Underestimating code token density. Code is ~0.5 tokens/word but symbols and indentation add up.
- **Compression resistance** (budget-operator): Refusing to summarize your own reasoning because "it's all important." If everything is important, nothing is.
- **Threshold panic** (budget-operator): Compressing at 30% because you're anxious. Only apply compression when actually needed.
- **Instruction dropout** (budget-operator): Compressing the user's original constraints. Never drop the task definition or success criteria.
- **Broken artifact** (lifecycle-manager): All three phases must use the **same** `context_state.jsonl`. Don't create separate files.
- **Manual updates** (lifecycle-manager): Only works if you actually call add/update/prune every turn. It's not automatic.