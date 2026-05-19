---
name: Long-Task Survival Kit
description: "Fuse of Assumption Grounding + Trajectory Guard + Context Budget Operator. Recurring checkpoint protocol that prevents agent decay on complex tasks: context overflow, failure spirals, and hallucinated facts."
---


---

## Long-Task Survival Kit

A recurring checkpoint protocol for long tasks (10+ tool calls, multi-file changes, migrations). Runs every 5 tool calls to prevent the three failure modes that compound over time.

Fuses Assumption Grounding (verify facts before acting), Trajectory Guard (detect loops and drift), and Context Budget Operator (prevent overflow).

### The Checkpoint Protocol

Every 5 tool calls, run this 3-part checkpoint. It takes <1 minute and prevents hours of wasted work.

#### CHECK 1: Context Health

```
Budget remaining: [estimate % of context window used]
Threshold: <30% remaining → COMPRESS NOW
Action if triggered:
  - Summarize completed work into compact notes
  - Drop tool outputs that have been fully processed
  - Switch to minimal detail_level on graph queries
```

Signs of context pressure:
- You're repeating information already stated
- You forgot what was decided earlier in the conversation
- Tool outputs feel overwhelming

#### CHECK 2: Trajectory Health

```
Questions:
1. Have I made 3+ attempts at the same thing without progress? → STUCK
2. Have I drifted from the original task? Check: what was the user's first message? → DRIFTED
3. Am I still in the same approach after it failed? → FIXATED
4. Is the diff growing beyond what was asked? → SCOPE CREEP
```

| Signal | Action |
|--------|--------|
| STUCK | Stop retrying. Change approach. Ask for help. |
| DRIFTED | Re-read the original request. Delete unrelated changes. |
| FIXATED | Switch to a different debugging strategy. |
| SCOPE CREEP | Shrink the diff to only what was requested. |

#### CHECK 3: Assumption Health

```
For the next action I'm about to take:
1. What fact am I assuming? [state it]
2. Have I verified this fact? [yes/no]
3. If no, what's the cheapest way to verify? [do that first]
```

Common unverified assumptions:
- "This function is called from X" (verify with grep/search)
- "This type is Y" (verify with type checker)
- "This behavior exists" (verify with test)
- "This file is the right one" (verify by reading it)
- "This API works the way I think" (verify with docs or code)

### Execution Flow

```
START TASK
  |
  v
[Do work: up to 5 tool calls]
  |
  v
CHECKPOINT ──→ CHECK 1 (Context) ──→ CHECK 2 (Trajectory) ──→ CHECK 3 (Assumption)
  |                                                                    |
  |                  Any check fails? → Fix before continuing          |
  v                                                                    |
[Continue work] ←─────────────────────────────────────────────────────
  |
  v
[Task complete] → Final verification
```

### Emergency Protocols

**Context Emergency (<15% remaining):**
1. Stop all exploration
2. Summarize everything into 10 bullet points
3. Pick ONE remaining action
4. Execute it
5. Present result

**Trajectory Emergency (5+ failed attempts):**
1. Stop everything
2. Write a one-sentence description of what you're stuck on
3. List 3 fundamentally different approaches (not variants of the same approach)
4. Present to user for guidance

**Assumption Emergency (key assumption was wrong):**
1. Stop execution
2. Re-read the original request
3. Identify what changes based on the corrected assumption
4. Start fresh with corrected understanding

### When to Use

- Any task that will take 10+ tool calls
- Multi-file refactors
- Migration work
- Complex debugging sessions
- Tasks where context pressure is likely

### Anti-Patterns

- Skipping checkpoints because "I'm almost done" (you're not)
- Checking context but ignoring trajectory (the most common form of agent decay)
- Verifying assumptions by reading old tool output instead of re-running (state may have changed)
- Treating the checkpoint as optional on "easy" tasks (easy tasks become hard when they go wrong)
