---
name: "occams-razor"
description: "Apply Occam's Razor to favor the simplest sufficient explanation or solution. Forces the agent to try the simplest thing that fits the evidence before escalating to more complex alternatives. Prevents over-engineering, premature abstraction, and scope creep."
---

# Skill: Occam's Razor for AI Agents

## Purpose

LLMs have a documented bias toward over-engineering. They reach for frameworks, add layers of abstraction, expand scope, and propose elegant but unnecessary solutions before the simple ones have been exhausted.

This skill enforces a simplicity discipline:

> Among explanations or solutions that fit the evidence, prefer the simplest.

Simplicity here means: fewest moving parts, fewest assumptions, least new infrastructure, least change from the current state. Not "least code" — least *complexity*.

---

## When to Use

Use this skill when:
- diagnosing a bug — multiple explanations are possible
- designing a solution — there are several approaches with different complexity levels
- answering a question — several interpretations are consistent with the evidence
- proposing a change — the solution could be a tiny edit or a large refactor
- reviewing code or a plan — checking whether anything is over-engineered

Do not use when:
- the simplest explanation has already been tested and ruled out
- the problem genuinely requires a complex solution (e.g., distributed consensus)
- the task is purely creative with no correctness constraint

---

## Core Rule

Before proposing any explanation or solution, ask:

**"What is the simplest thing that fits the evidence?"**

List alternatives explicitly, rank them by complexity, and commit to the simplest viable one. Only escalate if it fails.

---

## The Protocol

### Step 1: Name the simplest explanation

Before any analysis, write down the simplest plausible explanation or solution. Do not start with the most comprehensive one.

```
Simplest explanation:
<one sentence — the version that requires the fewest new assumptions>
```

### Step 2: List alternatives ranked simplest → most complex

Generate alternatives explicitly so they are visible, not implicit.

```
Alternatives (simplest first):
1. <simplest> — assumptions: X, Y
2. <next> — assumptions: X, Y, Z + new component
3. <most complex> — assumptions: X, Y, Z + new component + new infrastructure
```

Each additional assumption, dependency, or abstraction is a complexity cost. Every alternative beyond the simplest must earn its place.

### Step 3: Test the simplest that fits

Do the cheapest check available to see if the simplest explanation holds.

- For debugging: read the relevant log, inspect the relevant state, run a targeted test
- For design: sketch the solution, check whether it covers the actual requirement
- For answering: verify the simplest interpretation against the question

If it fits → commit and stop. Do not explore alternatives that are already unnecessary.

### Step 4: Escalate only on failure

If the simplest explanation fails or is falsified by evidence, move to the next simplest. Do not skip — the ordering encodes the hypothesis that complexity costs are real.

```
Result:
- Simplest explanation: FALSIFIED by <evidence>
- Next simplest: fits evidence so far → proceed
```

### Step 5: Apply the complexity tax

Every solution component must answer: "What does this buy us that a simpler approach doesn't?"

If the answer is "nothing" or "I'm not sure" → remove it. If the answer is a concrete, verified benefit → keep it.

---

## Simplicity Checklist

Before finalizing any explanation or solution, run this checklist:

- [ ] Does this fit all the evidence?
- [ ] Is it the simplest explanation I've listed?
- [ ] Have I tested or falsified the simpler alternatives first?
- [ ] Does every added component/assumption have a verified benefit?
- [ ] Could a future reader understand this without a 10-minute explanation?
- [ ] If I removed the most complex part, would the core still work?

If any checklist item fails, simplify before proceeding.

---

## Complexity Ranking Guide

Use these rough tiers when ranking alternatives:

| Tier | Description | Example |
|------|-------------|---------|
| **0 — Read/observe** | No change. Just look at the existing state. | Check the existing log file |
| **1 — Single edit** | One file, one conceptual change | Fix a condition, add a null guard |
| **2 — Local refactor** | One module, extract/reorganize within existing boundaries | Extract a helper, rename for clarity |
| **3 — New abstraction** | New function, component, or module | New utility, new hook, new service boundary |
| **4 — New infrastructure** | New dependency, database table, service, or external system | New API, new queue, new third-party SDK |

The agent must justify why the problem cannot be solved at a lower tier before escalating. Tier 0 is almost always worth trying first. Tier 4 is a last resort.

---

## Debugging Example

```
Problem: API returns 500 on user profile fetch

Alternatives ranked:
1. [Tier 1] Bad input: profile ID is null — simplest, one null check
2. [Tier 1] Bad state: stale cache entry — invalidate cache
3. [Tier 2] Bad logic: profile merge has an edge case — debug merge logic
4. [Tier 3] Systemic: auth token expiry not handled in middleware — refactor auth layer

Test #1: Check if user ID is null in the failing request
→ ID is present. Falsified.

Test #2: Check cache entry for this user
→ Cache entry is stale (created before migration). Fits.

Result: Escalation to #3 and #4 was unnecessary. Tier 2 fix (cache invalidation) resolves it.
```

---

## Design Example

```
Problem: Users need to be notified when their subscription is about to expire

Alternatives ranked:
1. [Tier 0] Send email from existing cron job — no new infrastructure
2. [Tier 2] New notification service with template engine
3. [Tier 3] Event-driven notification system with queue
4. [Tier 4] Real-time notification platform with multi-channel

Test #1: Can we add one email call to the existing billing cron?
→ Billing cron already runs daily. Adding an email call is 10 lines. Fits.

Result: Tier 0 solution sufficient. Propose it and stop.
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Propose the most comprehensive solution first | Wastes effort; the simple one might suffice |
| Add abstractions "for future flexibility" | Flexibility that is never used is complexity with no return |
| Treat the simplest explanation as "too simple" | Simplicity is not a bug; it is evidence that the model may be correct |
| Escalate after the first failure without checking evidence | Failure of one explanation does not validate the most complex one |
| Combine multiple solutions without testing them individually | Cannot identify which part actually works |
| Justify complexity by analogy to other projects | Each project has different constraints; verify against this one |

---

## When to Stop Applying This Skill

Stop when:
- The simplest viable explanation/solution has been tested and works
- The problem genuinely requires a higher complexity tier (verified by evidence, not assumption)
- You have run out of simpler alternatives and the next one is the only one left

Do not apply Occam's Razor to the point of under-solving — if the simplest approach demonstrably cannot work, escalate. The discipline is "simplest viable," not "simplest possible."

---

## Pairing Guide

- **Monte Carlo Tree Search** — Occam's Razor ranks branches by complexity *before* MCTS allocates effort; MCTS uses simplicity as the primary scoring dimension, exploring simplest branches first and stopping when a simple viable branch is confirmed
- **Root Cause Analysis** — Occam's Razor narrows the candidate cause list; RCA then verifies the causal chain of the simplest remaining hypothesis
- **Abductive First Debugging** — Occam's Razor orders competing hypotheses by complexity; abductive reasoning generates them
- **First Principles** — First principles strips assumptions; Occam's Razor prevents re-adding unnecessary complexity during reconstruction
- **Pre-Mortem** — Apply Occam's Razor first to pick the plan, then pre-mortem the winning plan for failure modes
- **Avoid Feature Creep** — Occam's Razor is the upstream discipline: choose the simplest feature before avoid-feature-creep validates it against the vision

---

## Definition of Done

Occam's Razor was applied correctly when:
- The simplest explanation/solution was stated explicitly before any others
- Alternatives were ranked by complexity (not just listed)
- The simplest viable option was tested or falsified before moving to the next
- Complexity was only escalated with explicit justification tied to evidence
- The complexity tax was applied: every additional component earned its place
- If a simpler solution was found during the process, it was adopted over the more complex one

---

## Final Instruction

Start simple. Stay simple as long as the evidence permits. Escalate only when you must. Complexity is expensive — make it earn its keep.
