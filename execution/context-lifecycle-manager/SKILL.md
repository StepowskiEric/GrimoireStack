---
source: "jerry-skills"
name: context-lifecycle-manager
category: execution
description: >
  Insane hybrid of context-rot-pruner + context-budget-operator + token-budget-operator.
  Full lifecycle management: messages are born → tracked by budget operator → decayed/pruned by rot-pruner →
  optimized by token-budget-operator. Shares one context_state.jsonl artifact.
---

# Context Lifecycle Manager

## Objective

Manage the **entire lifecycle** of context messages across three phases:

1. **Birth & Tracking** (`context-budget-operator`) — messages enter, budget is tracked, warnings issued before overflow
2. **Decay & Pruning** (`context-rot-pruner`) — messages lose weight over time, low-weight items pruned
3. **Optimization** (`token-budget-operator`) — remaining context is compressed, summarized, optimized

All three phases share **one artifact**: `context_state.jsonl`

## When to Use

- Long sessions (30+ turns) where context management is critical
- Coppermind daemon sessions (running for hours)
- Multi-step tasks where context accumulates rapidly
- When you want **maximum context utilization** (2-3x life extension)

## Workflow (Strictly Follow)

### Phase 1: Birth & Tracking (context-budget-operator)

1. **Initialize** `context_state.jsonl` with:
   ```json
   {"msg_id": "m1", "content": "...", "born_turn": 1, "weight": 1.0, "tokens": 150, "type": "user", "last_referenced": 1}
   ```

2. **Track budget** — after each turn, update total tokens. Warn at 80%, error at 95%.

3. **Register new messages** — every user/agent/tool message gets an entry with `born_turn`, initial `weight=1.0`.

### Phase 2: Decay & Pruning (context-rot-pruner)

4. **Apply decay** — each turn, messages not referenced → `weight = weight * 0.9`

5. **Reference reset** — messages referenced in current turn → `weight = reset to initial`, `last_referenced = current_turn`

6. **Prune** — if near budget limit, sort by weight (ascending), prune lowest until under limit. **Never prune** messages with `weight > 0.5`.

### Phase 3: Optimization (token-budget-operator)

7. **Compress** — for kept messages with `weight < 0.8`, compress content (summarize, remove fluff).

8. **Prioritize** — sort messages by `(weight * relevance)` for the current task.

9. **Deliver** — the final context sent to LLM = optimized, pruned, compressed messages.

### Phase 4: Audit & Health Check

10. **Run health check** — distribution of weights, tokens saved by pruning, compression ratio.

11. **Export report** — `context_lifecycle.py report` shows the full lifecycle state.

## Shared Artifact: `context_state.jsonl`

One file, three skill phases:

| Field | Phase 1 (Budget) | Phase 2 (Rot) | Phase 3 (Token) |
|---|---|---|---|
| `msg_id` | ✓ Created | ✓ Used | ✓ Used |
| `born_turn` | ✓ Tracked | — | — |
| `weight` | — | ✓ Decayed | ✓ Used for priority |
| `last_referenced` | — | ✓ Updated | — |
| `tokens` | ✓ Counted | ✓ Counted | ✓ Optimized |
| `compressed` | — | — | ✓ Added after compression |

## Companion Script

`scripts/context_lifecycle.py` — pure stdlib Python, combines all three:

- `init` — create context_state.jsonl
- `add <msg_id> <type> <content>` — register new message (Phase 1)
- `update <turn>` — apply decay + update references (Phase 2)
- `prune <budget>` — prune low-weight messages (Phase 2)
- `optimize` — compress + prioritize remaining (Phase 3)
- `report` — full health check + lifecycle statistics
- `simulate <turns>` — show how context evolves over N turns

## Usage Example

```
Turn 1: User asks "Build a JWT auth system"
  → context_lifecycle.py add m1 user "Build a JWT auth system" → Phase 1

Turn 5: Context at 40k tokens (budget 100k)
  → context_lifecycle.py update 5 → Phase 2: m1 weight=0.9^4=0.656
  → m1 still referenced (agent mentioned it) → weight reset to 1.0

Turn 15: Context at 85k tokens (near limit)
  → context_lifecycle.py prune 80000 → Phase 2: prune 3 low-weight tool outputs
  → Saved 12k tokens

Turn 20: Context at 90k tokens
  → context_lifecycle.py optimize → Phase 3: compress 5 old messages
  → Final context: 70k tokens, high-density

Turn 30: Check health
  → context_lifecycle.py report
    Messages: 45 total, 38 kept, 7 pruned
    Token savings: 35k (pruning) + 15k (compression) = 50k
    Context extended by ~2.5x
```

## Integration with Other Skills

- **Coppermind daemon** — run this on every daemon turn to extend session life
- **plan-with-judge** — the plan steps can specify "use context-lifecycle-manager"
- **long-task-survival-kit** — complements checkpointing with context management

## Pitfalls

- **Over-optimization:** Don't compress messages that are still important. Only compress `weight < 0.8`.
- **Broken artifact:** All three phases must use the **same** `context_state.jsonl`. Don't create separate files.
- **Pruning too aggressively:** If you prune everything below 0.3, you'll lose context the agent still needs. Start with threshold 0.5.
- **Manual updates:** This only works if you actually call `add`, `update`, `prune` every turn. It's not automatic.

## Rule of Thumb

Messages are born → they live → they decay → they die (get pruned). Respect the lifecycle.
