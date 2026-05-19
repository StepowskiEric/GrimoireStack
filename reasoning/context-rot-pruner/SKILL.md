---
source: "jerry-skills"
name: context-rot-pruner
category: reasoning
description: Apply exponential decay to context messages so old, unreferenced content loses weight and gets pruned before the context window overflows. Extends useful context life by 2-3x.
...



---

# Context Rot Pruner

## ⚠️ Absorbed by context-lifecycle-manager

This skill's protocol is now part of **`context-lifecycle-manager`** (Phase 2: Decay & Pruning). Use the lifecycle manager for unified context management across birth, decay, and optimization.

- **`context-budget-operator`** → lifecycle-manager Phase 1 (Birth & Tracking)
- **`context-rot-pruner`** → lifecycle-manager Phase 2 (Decay & Pruning)
- **`token-budget-operator`** → lifecycle-manager Phase 3 (Optimization)

Detailed estimation heuristics and decay formulas are preserved in `context-lifecycle-manager/references/budget-and-rot-details.md`.

---

## Objective

LLMs lose performance as context accumulates "rot" — old messages, irrelevant digressions, and stale data that dilute attention. This skill applies exponential decay to context messages and prunes low-weight items before the context window overflows.

## When to Use

- Long sessions (20+ turns) where earlier context becomes stale
- Multi-step tasks with intermediate results that are no longer relevant
- Agent is approaching context limit but still has critical work to do
- Coppermind memory sessions (long-running daemon interactions)

## Core Concept

Each message has a **weight** (0.0 to 1.0) that decays over time unless explicitly referenced.

**Decay formula:** `weight = initial_weight * (decay_rate ^ turns_since_referenced)`

- `initial_weight`: 1.0 for user messages, 0.8 for tool outputs, 0.6 for agent reasoning
- `decay_rate`: 0.9 (10% decay per unreferenced turn)
- `turns_since_referenced`: how many turns since this message was last mentioned by the agent

## Workflow (Strictly Follow)

### 1. Initialize Context Weights

Create `context_weights.jsonl`. Each line:

```json
{"msg_id": "m1", "content_preview": "User: What is...", "weight": 1.0, "last_referenced_turn": 0, "type": "user", "timestamp": "2026-05-05T10:00:00Z"}
```

### 2. After Each Turn

Update weights for all messages:
- Messages referenced in the agent's last response → `last_referenced_turn = current_turn`, `weight = reset to initial`
- All other messages → `weight = weight * 0.9`

Add new messages from this turn with `weight = initial_weight`.

### 3. Before Next LLM Call

Check total context size. If near limit:
1. Sort messages by weight (ascending)
2. Prune lowest-weight messages until under budget
3. **Never prune** messages where `weight > 0.5` (critical threshold)
4. Log pruned messages to `pruned_log.jsonl` for audit

### 4. Audit Context Health

Run periodically:
- Show weight distribution (how many messages in each weight bucket)
- Identify "zombie messages" (low weight but still in context)
- Flag if pruning is happening too aggressively (agent losing needed context)

## Companion Script

`scripts/context_rot.py` — pure stdlib Python:

- `init` — create empty context_weights.jsonl
- `update` — apply decay after a turn, update references
- `prune` — prune low-weight messages, output reduced context
- `simulate` — show how context degrades over N turns with a sample message set
- `audit` — weight distribution + zombie message report

## Usage Example

```
Turn 1: User asks "Implement JWT auth in FastAPI"
  → msg m1 added (weight 1.0, type=user)

Turn 5: Agent is still working, context is 25k tokens
  → m1 weight: 0.9^4 = 0.656 (still referenced this turn → reset to 1.0)
  → m3 (old tool output) weight: 0.9^4 = 0.656 → pruned
  → m7 (agent reasoning) weight: 0.6 * 0.9^2 = 0.486 → pruned

Turn 10: Context at 80k tokens, limit is 100k
  → Prune all messages with weight < 0.3
  → Saved 15k tokens, still have all critical context
```

## Pitfalls

- **Over-pruning:** If decay_rate is too aggressive (e.g., 0.7), you'll lose context the agent still needs. Start with 0.9.
- **Reference detection:** The script needs a simple heuristic to detect "message was referenced" (e.g., agent's response contains a quote or ID from that message). If detection fails, weights decay falsely.
- **Critical messages:** Some messages (user's original task, key constraints) should be marked `protected: true` to never decay below 0.5.
- **Token counting:** Use a simple approximation (1 token ≈ 4 chars) rather than an actual tokenizer. Precision isn't needed for pruning decisions.

## Integration with Other Skills

- Use with `context-budget-operator` — prune first, then the budget operator can do finer-grained management
- Use with `token-budget-operator` — the pruner reduces total tokens, the budget operator optimizes what remains
- Coppermind-specific: Apply to daemon session context to extend useful session life

## Rule of Thumb

If a message hasn't been referenced in 10 turns and isn't protected, it's probably rot. Prune it.
