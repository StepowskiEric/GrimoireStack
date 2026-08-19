# Advocatus Diaboli — Reference Details

This file contains the detailed reference material for the Advocatus Diaboli skill.

## Challenge Categories in Detail

The Diaboli attacks from all applicable angles:

### 1. Assumptions
> "What must be true for this to work?"
Probe each assumption for fragility, verification status, and wishful thinking. If a central assumption is wrong, what happens?

### 2. Evidence
> "What would change your mind?"
Identify every claim that lacks direct evidence. Question whether the evidence supports the conclusion, or just correlates. Ask what evidence would contradict the proposal.

### 3. Completeness
> "Who and what is not in the room?"
Find stakeholders, scenarios, environments, and edge cases the proposal ignores. Look for silent defaults — paths where the proposal works for the average case but fails for anyone outside it.

### 4. Tradeoffs
> "What are you not saying you're sacrificing?"
Every decision is a tradeoff. The devil's advocate finds the hidden costs: flexibility, simplicity, future options, non-target users, non-goal metrics.

### 5. Temporal
> "How does this age?"
Trace the proposal forward: 1 month, 6 months, 2 years. Does the benefit hold, erode, or reverse? Does the maintenance burden grow? Does the solution become the problem?

### 6. Scale
> "What happens at 10x?"
What works for one case breaks at ten. What works for ten breaks at a hundred. Find the scaling ceilings: performance, complexity, coordination, cost.

### 7. Failure
> "How does this break?"
Identify the most likely failure mode and the most catastrophic one. Are they the same? Is there a single point of failure? Is the failure mode detectable before damage?

### 8. Costs
> "What is the full price?"
Beyond obvious implementation cost: migration cost, legacy burden, cognitive load on future maintainers, opportunity cost of not doing something else, onboarding cost for new team members.

### 9. Alternatives
> "What are you dismissing too fast?"
Build the strongest version of a dismissed alternative. The Diaboli does not have to agree with it — just test whether the dismissal was fair. What would have to be true for the dismissed option to be better?

### 10. Unknowns
> "What do you not know but rely on?"
Catalog unknown unknowns, unknown knowns (things the domain knows but this agent does not), and known unknowns being treated as settled. Explicit ignorance is better than implicit assumption.

---

---

## Example: Advocatus Diaboli in Action

**Proposal**: Migrate the auth system from JWT-based sessions to database-backed sessions for better revocation.

**Diaboli challenges** (excerpt):

| # | Challenge | Category | Question |
|---|-----------|----------|---------|
| 1 | Database-backed sessions mean every authenticated request hits the DB. At current request volume (~500 RPS), this adds 3-8ms per request. Has the performance budget been verified? | Scale / Evidence | What is the measured latency budget, and have you load-tested at peak traffic? |
| 2 | A DB-backed session approach ties auth availability to database availability. A DB outage now becomes a full auth outage. JWT auth could serve stale-but-valid tokens during DB downtime. | Failure | What is the degradation strategy when the DB is unavailable? |
| 3 | Session migration requires all active users to re-authenticate. How will you handle the UX transition? What happens to users with long-lived refresh tokens? | Completeness | What is the cutover plan and how are existing sessions handled? |
| 4 | What other approaches were considered (e.g., short-lived JWTs + refresh token rotation, opaque tokens with a lightweight cache layer)? Why is full DB-backed sessions better than a hybrid? | Alternatives | Build the strongest case for short-lived JWTs + refresh rotation and explain why it loses. |

**Main agent responses** (excerpt):

| # | Type | Response |
|---|------|----------|
| 1 | ACCEPT | Performance budget was guesstimated, not measured. We'll add a load test before shipping and set a P0/S0 revert threshold at +5ms p99 latency. |
| 2 | ACCEPT | We'll add a circuit breaker: if DB is unreachable, fall back to a short-lived cache of recently validated sessions (5 min TTL). Degraded but not broken. |
| 3 | DISTINGUISH | We're not invalidating existing JWTs on deploy. The migration is additive: new sessions use DB-backed; old JWTs expire naturally per their existing TTL. No forced re-auth. |
| 4 | REBUT | Short-lived JWTs + refresh rotation halves the window but does not solve the revocation problem. The core requirement is instant revocation on admin action. Only DB-backed sessions provide that. The tradeoff (DB dependency) is real and addressed by the circuit breaker in #2. |

**Confidence delta**: 6/10 → 8/10. The proposal was strengthened by surfacing the performance and availability gaps that were not initially considered.

---

---

## Distinction from Related Skills

| Skill | How it works | Key difference from Advocatus Diaboli |
|-------|-------------|--------------------------------------|
| **Steelmanning** | Same agent builds the strongest opposing argument | Same agent; balanced; builds the *best* version of the other side. Diaboli uses a separate agent with adversarial posture — not balanced, purely attacking. |
| **Inversion** | Same agent asks "how could this fail?" | Abstract risk enumeration by the same agent. Diaboli uses a separate agent for interactive, concrete challenge. |
| **Pre-Mortem** | Same agent narrates a specific failure story | Narrative failure scenario by the same agent. Diaboli is a live adversarial dialogue with a separate mind. |
| **Second-Order Thinking** | Same agent traces downstream effects | Temporal chain by the same agent. Diaboli covers all categories (not just temporal) using a separate agent. |
| **Six Thinking Hats (Black Hat)** | Same agent puts on a "critical judgment" hat | Still the same agent. The Black Hat is a self-applied lens; Diaboli is a genuinely separate cognitive entity. |
| **Code Review** | Expert review of code quality and correctness | Narrower scope (code). Diaboli covers proposals, plans, architecture, decisions — not just code. |

**Bottom line**: Advocatus Diaboli is the only skill that uses a genuinely separate cognitive entity via tool-mediated sub-agent dispatch. All the others are self-applied thinking frameworks by the same agent.

---

---

## Failure Modes This Skill Prevents

### 1) Self-review illusion
The agent does its own critique and concludes "looks good" — but never really challenged its assumptions because self-critique is always weaker than external critique.

Counter: separate agent with adversarial posture.

### 2) Confirmation-heavy proposals
The proposal is supported by evidence the agent found favorable, but contrary evidence was never seriously engaged.

Counter: the Diaboli actively seeks contrary evidence and challenges its absence.

### 3) Hidden tradeoff blindness
The agent presents a proposal as having no serious downsides because it never fully engaged with what is being traded away.

Counter: the Diaboli finds what the proposal is not saying.

### 4) Overconfident recommendations
High confidence with thin justification. The agent is confident because it has not encountered genuine resistance.

Counter: surviving adversarial review calibrates confidence downward or confirms it with evidence.

### 5) Premature convergence
The agent commits to the first reasonable solution and stops searching.

Counter: the Diaboli forces consideration of alternatives that were dismissed too early.

### 6) Anchoring in shared blind spots
Both agent and reviewer share the same training data and reasoning patterns, so they miss the same things.

Counter: the Diaboli is explicitly instructed to think differently from the main agent — to be suspicious, contrarian, and exhaustive.

---

---

## Configuring a Dedicated Diaboli Sub-Agent

For best results, configure a sub-agent *specifically* for the Advocatus Diaboli role:

```
subagent({
  action: "create",
  config: {
    name: "advocatus-diaboli",
    systemPrompt: `You are the Advocatus Diaboli (Devil's Advocate).
    Your ONLY job is to attack proposals. You are NEVER asked to build, design,
    or create — only to find weaknesses, blind spots, hidden assumptions,
    missing edge cases, unexamined tradeoffs, and failure paths.
    
    You are not rude or dismissive. You are relentlessly probing,
    systematically skeptical, and wholly unconvinced — but professional.
    
    You have zero investment in any proposal you review. You owe it nothing.
    Do not be balanced. Do not be fair. Attack every angle.`,
    inheritProjectContext: false,   // Don't bias with project knowledge
    inheritSkills: false,           // Don't load other skills
    defaultContext: "fork"          // Always start fresh, no shared reasoning
  }
})
```

With this agent configured, invoking a devil's advocate review becomes a single call:

```
subagent({
  agent: "advocatus-diaboli",
  task: `Review this proposal using the 10-category framework:
  ---
  ${proposal}
  ---
  Produce a structured list of challenges.`
})
```

---

---

## Pairing Guide

- **Steelmanning** — use steelmanning *first* (same agent builds the strongest opposition), then invoke the Diaboli (separate agent attacks). The steelman prepares you; the Diaboli tests you.
- **Inversion + Pre-Mortem** — use inversion/pre-mortem during proposal development to catch obvious risks before presenting to the Diaboli. The Diaboli then finds what those missed.
- **Second-Order Thinking** — the Diaboli should include temporal challenges (how this ages). For proposals with significant long-term consequences, also run full second-order thinking separately.
- **Bayesian Updating** — after adversarial review, update your confidence in the proposal using the Bayesian framework. A proposal that survives a strong Diaboli should have higher posterior confidence.
- **Separation of Concerns** — run the Diaboli in a forked context (via `pi-subagents` fork mode) to ensure zero contamination between the main agent's reasoning and the Diaboli's review.
- **PI Subagents** — use the `pi-subagents` skill to dispatch the Diaboli as a parallel agent with a `fork` context, ensuring genuine cognitive separation.

---

---

