# Occam's Razor — Checklist, Tiers & Examples

## Simplicity checklist

Before finalizing any explanation or solution:
- [ ] Does this fit all the evidence?
- [ ] Is it the simplest explanation I listed?
- [ ] Have I tested or falsified the simpler alternatives first?
- [ ] Does every added component/assumption have a verified benefit?
- [ ] Could a future reader understand this without a 10-minute explanation?
- [ ] If I removed the most complex part, would the core still work?

## Complexity tiers

| Tier | Description | Example |
|------|-------------|---------|
| **0 — Read/observe** | no change; look at existing state | check the existing log file |
| **1 — Single edit** | one file, one conceptual change | fix a condition, add a null guard |
| **2 — Local refactor** | one module, extract/reorganize within existing boundaries | extract a helper, rename for clarity |
| **3 — New abstraction** | new function, component, or module | new utility, hook, service boundary |
| **4 — New infrastructure** | new dependency, table, service, or external system | new API, queue, third-party SDK |

## Worked example: debugging

```
Problem: API returns 500 on user profile fetch

Alternatives ranked:
1. [Tier 1] Bad input: profile ID is null — one null check
2. [Tier 1] Bad state: stale cache entry — invalidate cache
3. [Tier 2] Bad logic: profile merge edge case — debug merge
4. [Tier 3] Systemic: auth token expiry not handled — refactor auth layer

Test #1: Is user ID null in the failing request? → ID present. Falsified.
Test #2: Check cache entry → stale (created before migration). Fits.

Result: escalation to #3/#4 unnecessary. Tier-2 fix (cache invalidation) resolves it.
```

## Worked example: design

```
Problem: Users need to be notified when their subscription is about to expire

Alternatives ranked:
1. [Tier 0] Send email from existing cron job — no new infrastructure
2. [Tier 2] New notification service with template engine
3. [Tier 3] Event-driven notification system with queue
4. [Tier 4] Real-time notification platform with multi-channel

Test #1: Can we add one email call to the existing billing cron?
→ Billing cron already runs daily; adding an email call is 10 lines. Fits.

Result: Tier-0 solution sufficient. Propose it and stop.
```

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Propose the most comprehensive solution first | wastes effort; the simple one might suffice |
| Add abstractions "for future flexibility" | unused flexibility is complexity with no return |
| Treat the simplest explanation as "too simple" | simplicity is not a bug; it is evidence the model may be correct |
| Escalate after the first failure without checking evidence | one failure does not validate the most complex option |
| Combine multiple solutions without testing individually | cannot identify which part actually works |
| Justify complexity by analogy to other projects | each project has different constraints |

## When to stop

- The simplest viable explanation/solution was tested and works
- The problem genuinely requires a higher tier (verified by evidence, not assumption)
- Simpler alternatives are exhausted and one option remains

Do not razor your way to under-solving — if the simplest approach demonstrably cannot work, escalate.

## Pairing guide

- **Monte Carlo Tree Search** — rank branches by complexity before MCTS allocates effort; simplicity as primary scoring dimension
- **Root Cause Analysis** — narrow the candidate list, then verify the causal chain of the simplest remaining hypothesis
- **Abductive First Debugging** — abductive reasoning generates hypotheses; Occam orders them by complexity
- **First Principles** — strips assumptions; Occam prevents re-adding unnecessary complexity during reconstruction
- **Pre-Mortem** — pick the simplest plan first, then pre-mortem the winner
- **Avoid Feature Creep** — Occam is the upstream discipline: choose the simplest feature first

## Definition of done

Applied correctly when:
- the simplest explanation/solution was stated explicitly before any others
- alternatives were ranked by complexity, not just listed
- the simplest viable option was tested or falsified before moving on
- complexity was escalated only with evidence-tied justification
- the complexity tax was applied — every component earned its place
- a simpler solution found mid-process was adopted over the more complex one
