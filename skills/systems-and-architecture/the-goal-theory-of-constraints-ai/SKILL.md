---
name: the-goal-theory-of-constraints-ai
description: "Find the one constraint, ignore non-constraints, exploit then elevate it, repeat when it moves."
triggers:
  - throughput-capped
  - bottleneck-hunting
  - micro-optimization-fatigue
  - pipeline-slowdown
---

# The Goal — Theory of Constraints for Engineering Agents

**Every system has one Herbie.** In *The Goal*, the scout troop's pace is set by the slowest boy — everyone else waits on him. Same for systems: total throughput is capped by the current constraint, and improving anything else may move the total by zero. Find the Herbie. Protect it. Improve it. Then repeat.

## When to Use
- Performance is poor but causes are diffuse
- Many micro-optimizations are being proposed
- Throughput is capped by one hidden stage
- Build/test/release times are painful
- One service is saturated while others are underused
- Work piles up in one stage of a pipeline

## The Move

### 1. Find the Herbie
Model the end-to-end flow: stages, queues, handoffs, wait times, failure/retry points. Locate the constraint by evidence:
- **Accumulation** — backlog builds before it
- **Starvation** — downstream stages go idle waiting for it
- Throughput plateaus even when other stages have headroom

Busy is not limiting: high utilization everywhere is not a bottleneck signal. Then **ignore the non-constraints** — local speedups with no end-to-end effect, micro-optimizations, cleanup disguised as performance work. If the DB is the Herbie, making controllers 15% faster is irrelevant.

### 2. Exploit it — low-cost wins first
Get maximum useful output from the current constraint without redesign: remove wasted work at the bottleneck, improve batching, reduce duplicate requests reaching it, reorder work to keep it busy on highest-value tasks, fix noisy retries that consume constrained capacity.

### 3. Subordinate the rest
Align non-constraints to support the constraint instead of optimizing themselves: cap upstream concurrency so the bottleneck doesn't thrash, slow producers when consumers are saturated, shape work to match constraint capacity, prioritize valuable work over feeding the bottleneck garbage.

### 4. Elevate it — only after exploit and subordinate
Add capacity or redesign: shard the bottleneck, denormalize or precompute strategically, split pipelines, parallelize the constrained stage, automate a constrained human step, redesign ownership if organizational friction is the real constraint.

### 5. Re-run the analysis
Once the constraint moves, a new one appears and old assumptions may be wrong. Improvement is iterative, not final — reassess after every meaningful improvement.

## Reference
For where constraints hide (technical, process, product/policy), the failure modes with counters, the analysis template, and prompt snippets, see [`references/goal-details.md`](references/goal-details.md).

## Rules
- **Do** identify the constraint with evidence (accumulation + starvation) before proposing any change.
- **Do** ignore non-constraint optimizations — they don't move total throughput.
- **Do** exploit before elevating; low-cost wins come first.
- **Do** protect the constraint from upstream floods.
- **Do** reassess after each improvement — the Herbie moves.
