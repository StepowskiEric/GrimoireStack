---
name: Failure Analysis Protocol
description: "Fuse of Pre-Mortem + Inversion + Second-Order Thinking. Three failure lenses merged: invert success, narrate specific failures, trace cascading consequences. Strongest pre-commitment analysis."
...



---

## Failure Analysis Protocol

Three complementary failure-analysis lenses merged into a tightening funnel. Run this before committing to any plan, architecture decision, or significant change.

Fuses Inversion Mental Model (define what failure looks like), Pre-Mortem (imagine specific failure stories), and Second-Order Thinking (trace cascading consequences).

### Phase 1: INVERT

Define what failure looks like explicitly.

1. **State the goal** — what does success look like?
2. **Invert** — what is the exact opposite of success?
   - Not "the project fails" but specifically: "the migration loses data for 3% of users"
   - Not "the code is bad" but: "the function returns wrong results for empty arrays in production"
3. **Enumerate failure modes** — list every way the inverted outcome could happen
4. **Rank by probability × impact**

**Output:** Ranked list of specific failure modes.

### Phase 2: NARRATE

Generate vivid, specific failure stories.

For each top-ranked failure mode from Phase 1:

1. **Write the story** — "It is 3 months from now. The project failed because..."
   - Be specific: what broke, who noticed, what was the impact?
   - Include the chain of events that led to failure
2. **Identify the trigger** — what early warning sign would have caught this?
3. **Identify the prevention** — what specific action now would prevent this story?

**Rules:**
- Generate at least 3 failure stories (minimum)
- Each story must be specific enough to be testable
- Each story must have a different root cause

**Output:** Failure stories with triggers and preventions.

### Phase 3: TRACE

Trace cascading consequences for 2+ levels.

For each proposed action in the plan:

1. **First-order:** What is the direct consequence?
2. **Second-order:** How do people/systems adapt to the first-order consequence?
3. **Third-order:** What new dynamics emerge from those adaptations?

**Example:**
- Action: Add caching to reduce latency
- 1st order: Faster reads
- 2nd order: Stale data seen by users, cache invalidation complexity
- 3rd order: Users learn to refresh manually, trust in data decreases

**Output:** Consequence chains for each major action.

### Phase 4: GUARD

Convert analysis into actionable guardrails.

For each failure story + consequence chain:

1. **Prevention guard** — what precondition prevents this failure?
2. **Detection guard** — what signal indicates this failure is happening?
3. **Recovery guard** — what is the rollback/mitigation if it happens?

**Output:** A guardrail table:

| Failure | Prevention | Detection | Recovery |
|---------|-----------|-----------|----------|
| [specific failure] | [precondition to enforce] | [signal to watch] | [rollback plan] |

### Verdict

After all 4 phases, give one of:
- **PROCEED** — risks are understood and guarded
- **ADJUST** — specific changes needed before proceeding (list them)
- **STOP** — fundamental problem identified that invalidates the approach

### When to Use

- Before major architecture decisions
- Before data migrations
- Before changing shared interfaces
- Before deploying significant refactors
- Any situation where the cost of being wrong is high

### Anti-Patterns

- Generating generic failure stories ("the project might be late") — be specific
- Only tracing one level of consequences — the danger is in the second and third order
- Skipping GUARD and just listing risks — risks without guardrails are useless
- Doing this for low-stakes reversible decisions (overkill)
