---
name: occam-mcts
description: "Combo — Occam's Razor ranks branches by complexity (simplest first), then Monte Carlo Tree Search allocates effort to the simplest viable branches before touching complex ones. Prevents exploring fancy solutions when a simple one would suffice."
---

# Skill: Occam's Razor + Monte Carlo Tree Search

## Purpose

Raw MCTS explores branches by evidence strength. But it has no built-in bias toward simplicity — it will happily spend 5 rounds exploring a distributed-tracing architecture when a log file would have answered the question in round 1.

This combo injects Occam's Razor as the **primary branch prioritization heuristic** inside the MCTS loop:

1. Generate branches
2. **Rank by complexity** (Occam's) — simplest first
3. MCTS explores and scores, but **simplicity is a first-class scoring dimension**
4. **Stop-early gate** — if the simplest viable branch passes its probe, stop. Do not exhaust the budget on alternatives that were already less promising.

This prevents the core failure mode: exploring expensive branches before cheap ones have been falsified or confirmed.

---

## When to Use

Use this combo when:
- there are multiple plausible approaches and they differ substantially in complexity
- the problem could be solved at different architectural tiers (Tier 0 → Tier 4)
- you want to enforce "try the simple thing first" as a systematic discipline, not a heuristic
- the cost of exploring a wrong complex branch is high (time, complexity debt, scope)

Do not use when:
- all viable branches are roughly similar in complexity
- the problem genuinely requires a complex solution (all simple options are falsified upfront)
- the task is purely generative with no correctness constraint

---

## How It Works

```
Phase 1: Branch Generation
  → Generate 3–5 genuinely different approaches

Phase 2: Complexity Ranking (Occam's Razor)
  → Assign each branch a complexity tier (0–4)
  → Rank: simplest → most complex

Phase 3: MCTS Loop with Simplicity Scoring
  → Select next branch: favor simplest + highest evidence
  → Run bounded probe
  → Score: correctness + progress + simplicity (primary)
  → Backpropagate
  → STOP if simplest-viable branch is confirmed

Phase 4: Commit or Escalate
  → Winner is the simplest branch that earned it through evidence
  → If simplest branches all fail, escalate to next tier
```

---

## Step-by-Step Protocol

### Phase 1: Generate Candidate Branches

Generate 3–5 genuinely different approaches. Do not generate minor variations of the same approach — each branch must differ in strategy or complexity tier.

```md
### Branch A: Check the existing log
- Strategy: Read the log file that already exists. No new code.
- Complexity tier: 0 (read/observe)
- Why it might work: Errors are usually logged somewhere.

### Branch B: Add a guard clause
- Strategy: Add a null check in the handler. One file, one condition.
- Complexity tier: 1 (single edit)
- Why it might work: Most runtime errors are null/undefined access.

### Branch C: Refactor the error handler
- Strategy: Extract a shared error handler with structured types.
- Complexity tier: 2 (local refactor)
- Why it might work: Error handling is inconsistent across handlers.

### Branch D: Add structured logging infrastructure
- Strategy: Introduce a logging framework with levels, sinks, and correlation IDs.
- Complexity tier: 3 (new abstraction)
- Why it might work: Current logging is unstructured and hard to query.
```

---

### Phase 2: Complexity Ranking (Occam's Razor)

Assign each branch a complexity tier using the Occam's Razor tier guide, then sort simplest → most complex.

| Tier | Description | Moving Parts |
|------|-------------|--------------|
| **0** | Read/observe — no change | 0 new |
| **1** | Single edit — one file, one conceptual change | 1 new |
| **2** | Local refactor — one module, within existing boundaries | 1–2 new |
| **3** | New abstraction — new function, component, or service | 1 new + interface |
| **4** | New infrastructure — new dependency, DB table, external system | 2+ new |

```md
## Ranked Branches
1. A — Tier 0 (log file) → no new code
2. B — Tier 1 (guard clause) → one condition
3. C — Tier 2 (refactor handler) → extracted function
4. D — Tier 4 (logging framework) → new infra
```

The ranking is now the **exploration order**. Tier 0 is investigated first. Tier 4 is a last resort.

---

### Phase 3: MCTS Loop with Simplicity Scoring

Run the standard MCTS loop, but **simplicity is the primary scoring dimension**. When two branches have similar evidence, prefer the simpler one unconditionally.

**Scoring dimensions (in priority order):**
1. **Simplicity** — lower tier = higher score (primary tiebreaker)
2. **Correctness evidence** — does it actually solve the problem?
3. **Progress** — are we closer to a working state?
4. **Blast radius** — how much can this break?
5. **Reversibility** — can we undo this easily?

#### Round template

```md
### Round N
- Selected branch: A (Tier 0) — simplest, unexplored
- Reason selected: simplest unprobed branch
- Expansion performed: read the error log
- Rollout / mini-sim: grep for the error ID in today's logs
- Evidence observed: log shows null pointer at line 47 in userHandler.ts
- Score update:
  - simplicity: tier 0 → highest
  - correctness evidence: high (direct log match)
  - progress: high (identified exact line)
  - blast radius: low (read-only)
- Decision: Branch A is confirmed. Simplicity + evidence = stop. Do not probe B/C/D.
```

#### The stop-early gate

After each probe, ask:

> "Does the current simplest-viable branch fit the evidence?"

If **yes** → stop MCTS. Commit to this branch. Do not continue exploring more complex alternatives.

If **no** → falsify it explicitly, then move to the next simplest.

```md
### Falsification record
- Branch: A (Tier 0 — read log)
- Falsified by: Log file does not exist; errors are not being written to disk
- Next branch: B (Tier 1 — guard clause)
```

---

### Phase 4: Commit or Escalate

```md
## Final Branch Ranking
| Branch | Tier | Evidence | Simplicity | Decision |
|--------|------|----------|------------|----------|
| A      | 0    | FALSIFIED | highest | Pruned |
| B      | 1    | pending  | high      | Testing |
| C      | 2    | —        | medium    | Reserve  |
| D      | 4    | —        | low       | Last resort |

## Winning Branch
- Branch: B (Tier 1 — guard clause)
- Why it won: simplest un-falsified branch; evidence from stack trace confirms null access at the handler boundary
- Why others lost: A was falsified; C/D have not been reached because B was sufficient

## Complexity Escalation Justification
- Did NOT escalate to C or D: B fixed the problem at Tier 1. No evidence requiring higher tiers.
```

---

## Complexity Escalation Rules

The agent must explicitly justify every tier escalation:

| Escalation | Required Justification |
|------------|----------------------|
| Tier 0 → 1 | Read-only investigation yielded no actionable evidence |
| Tier 1 → 2 | Single edit was falsified or is insufficient for the requirement |
| Tier 2 → 3 | Local refactor cannot express the required structure |
| Tier 3 → 4 | New abstraction cannot satisfy the requirement without new infrastructure |

Escalation without falsification of the current tier is a protocol violation.

---

## Practical Examples

### Debugging: 500 on profile fetch

```
Branches (simplest first):
1. [Tier 0] Check existing error logs → already logged?
2. [Tier 1] Add null guard on user ID → is the ID null?
3. [Tier 2] Refactor profile merge → edge case in merge logic?
4. [Tier 3] Restructure auth middleware → token validation gap?

MCTS:
Round 1 → Branch 1: Check logs → "null pointer at getUser" logged at 14:03
Round 2 → Branch 2: Check if ID is null → ID is null in the failing request
→ STOP. Tier 1 solution confirmed. Do not explore 3 or 4.
```

### Design: Notification system

```
Branches (simplest first):
1. [Tier 0] Send email from existing billing cron → one line added
2. [Tier 1] Add a notification function + call it from billing cron → new function
3. [Tier 2] New notification service with templates → separate service
4. [Tier 4] Multi-channel notification platform → new infrastructure

MCTS:
Round 1 → Branch 0: Check if billing cron exists and runs daily → yes, runs at 2am
Round 2 → Branch 0: Check if we can add an email call → 10 lines, uses existing mailer
→ STOP. Tier 0 confirmed. No need for 1, 2, or 4.
```

---

## What This Combo Prevents

| Failure Mode | Raw MCTS | Occam-MCTS |
|---|---|---|
| Exploring complex branches before simple ones | Possible | Impossible — simplicity is primary ordering |
| First-branch lock-in on a complex solution | Possible | Prevented — Tier 0–1 always probed first |
| Sunk-cost loyalty to a complex branch | Possible | Simplicity penalty makes escalation unjustifiable without falsification |
| Over-engineering "for future flexibility" | Possible | Complexity tax forces explicit justification |
| Wasting budget on tiers that aren't needed | Possible | Stop-early gate terminates as soon as simplest-viable is found |

---

## Pairing Guide

- **Tree of Thoughts** — ToT generates the initial candidate branches; pass them to occam-mcts for complexity-ranked exploration
- **Abductive First Debugging** — generates hypotheses; occam-mcts orders them by complexity and explores simplest first
- **Root Cause Analysis** — RCA verifies causal chains; occam-mcts narrows the candidate cause list before RCA runs
- **Avoid Feature Creep** — occam-mcts picks the simplest design; avoid-feature-creep validates it against vision
- **Pre-Mortem** — run pre-mortem on the winning branch before committing, especially if the winning branch is Tier 3+

---

## Definition of Done

This combo was applied correctly when:
- Branches were generated that actually differ in complexity, not just parameters
- Complexity tiers were assigned before any probing began
- The MCTS loop used simplicity as the primary tiebreaker and stop-early gate
- Tier escalation was justified by explicit falsification, not by assumption
- The winning branch was the simplest viable one, not the most comprehensive one
- If a simpler branch was found during MCTS that superseded the current leader, it was adopted

---

## Final Instruction

List branches from simplest to most complex. Probe simplest first. Stop when you find a solution that fits. Complexity is not free — make it earn its way into the solution.
