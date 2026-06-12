---
name: "advocatus-diaboli"
description: "Use this skill when the main agent must stress-test a proposal, plan, code change, or decision against a SEPARATE adversarial sub-agent before committing. This is NOT self-critique (steelmanning). It is tool-mediated adversarial review using a genuinely different cognitive entity with no prior investment in the proposal."
---

# Skill: Advocatus Diaboli — Adversarial Review via Separate Sub-Agent

## Purpose

Use this skill when the main agent must stress-test a proposal, plan, code change, or decision against a **separate adversarial sub-agent** before committing.

This is not steelmanning. Steelmanning is self-critique — the same agent building the strongest opposing argument. This skill uses a *different cognitive entity* via the sub-agent tooling, which is systematically stronger because it has zero anchoring to the original reasoning.

The name comes from the historical *Advocatus Diaboli* (Devil's Advocate) — the official role in Catholic canonization proceedings whose job was to argue against a candidate's sainthood, ensuring no case was approved without surviving genuine adversarial scrutiny.

In the AI agent context, this skill works by:
1. The main agent crystalizes a concrete proposal.
2. A **separate sub-agent** is invoked (via `subagent` tool, preferably with a `fork` context) specifically to attack it — find every hole, blind assumption, missing edge case, hidden tradeoff, and failure path.
3. The main agent responds to each challenge (accept, rebut with evidence, or distinguish).
4. The output is a refined proposal that has survived genuine adversarial pressure from a separate mind.

---

## Core Principle

**Self-critique is not critique.**

The same agent that built a proposal cannot genuinely test it. Unconscious anchoring, confirmation bias, and commitment to the reasoning already invested mean self-review always produces weaker challenges than a separate agent would.

A separate adversarial agent — dispatched via the sub-agent tooling with no investment in the original proposal — will find holes the main agent never considered.

---

## When to Use

Use this skill when:
- committing to a significant decision, architecture, plan, or code change
- the proposal has meaningful consequences (technical, product, user-facing, or business)
- the main agent has already invested reasoning time and is anchored to its conclusion
- a review or critique is needed *before* presenting the proposal to a human
- the domain is complex enough that blind spots are likely
- you want higher confidence that a proposal has been genuinely tested
- **steelmanning would help, but you want an even stronger test** — a genuinely separate mind attacking the proposal

Do not use this skill for:
- trivial, bounded, easily reversible decisions
- urgent situations where decision speed outweighs deliberation value
- purely factual or computational problems with a single correct answer
- situations where adversarial review would cause analysis paralysis on a low-stakes choice

---

## When to Use This vs. Steelmanning

| Situation | Use Steelmanning | Use Advocatus Diaboli |
|-----------|-----------------|----------------------|
| Quick self-check before responding | ✅ | ❌ (too heavy) |
| Proposal has meaningful consequences | ✅ | ✅ (even better) |
| Needs to be tested *now*, no sub-agent available | ✅ | ❌ |
| The agent is deeply anchored to its proposal | ❌ (same agent) | ✅ (separate agent breaks anchoring) |
| You want genuinely surprising counter-arguments | ❌ | ✅ |
| The stakes are high enough to justify the overhead | ✅ | ✅ |
| Code review / architecture review | ✅ (quick pass) | ✅ (deep adversarial pass) |

**Recommendation**: Use steelmanning for quick self-checks and low-to-medium stakes. Use Advocatus Diaboli when the proposal is significant enough that you want a genuinely separate mind to try to break it before you commit.

---

## How It Works: The Two-Agent Model

This skill requires *two distinct cognitive roles*:

| Role | Who | Goal |
|------|-----|------|
| **Proponent** | The main agent (you) | Propose, defend, and refine the plan |
| **Advocatus Diaboli** | A separate sub-agent | Attack the plan — find every weakness |

The interaction is structured, not adversarial in tone. The Diaboli is not rude or dismissive. It is relentlessly probing, systematically skeptical, and wholly unconvinced — but professional.

---

## Standard Workflow

### Step 1: Crystallize the Proposal (Main Agent)

Before invoking the Diaboli, the main agent must state the proposal clearly and concretely, including:

- **What** is being proposed
- **Why** — the primary rationale
- **Key assumptions** — what must be true for this to work
- **Tradeoffs** — what is being accepted or sacrificed
- **Alternatives considered** — what options were dismissed and why

If the proposal cannot be stated this clearly, it is not ready for adversarial review.
Clarify it first.

### Step 2: Brief the Diaboli (Main Agent → Sub-Agent)

Invoke a sub-agent with the following brief:

```
Your role: Advocatus Diaboli (Devil's Advocate).

You are a separate, adversarial agent. Your ONLY job is to attack the following
proposal. Find every weakness, hidden assumption, blind spot, edge case,
failure mode, and tradeoff. Do not be balanced. Do not be fair. Be relentless.

You have zero investment in this proposal. You owe it nothing.

Proposal to attack:
<the crystallized proposal from Step 1>

Attack it from as many of the following angles as apply:

1. ASSUMPTIONS — What must be true for this to work? Which of those are
   fragile, unverified, or wishful?
2. EVIDENCE — What claims lack evidence? What evidence would change the
   conclusion?
3. COMPLETENESS — What scenarios, edge cases, or stakeholders are ignored?
4. TRADEOFFS — What is being sacrificed that the proposal does not acknowledge
   honestly?
5. TEMPORAL — How does this hold up in 1 month, 6 months, 2 years? Does the
   benefit erode or compound?
6. SCALE — What happens when load, users, data, or team size grows?
7. FAILURE — How does this break? What is the most likely failure mode? The
   most catastrophic?
8. COSTS — What are the full costs (not just obvious ones)? Migration, debt,
   opportunity cost, cognitive load?
9. ALTERNATIVES — What approach is being dismissed too quickly? Build the
   strongest case for it.
10. UNKNOWNS — What does the proposal not know but assume anyway?

Output: a structured list of challenges, each with:
- The specific claim or assumption being challenged
- Why it is weak
- What evidence or counterargument supports the challenge
- A question the proponent must answer
```

### Step 3: Receive and Respond (Main Agent)

For each challenge from the Diaboli, the main agent must respond with one of:

- **ACCEPT** — the challenge identifies a genuine weakness. Acknowledge it and adjust the proposal.
- **REBUT** — the challenge is addressable with evidence the proponent already has. Provide the evidence.
- **DISTINGUISH** — the challenge applies to a different scenario than the one proposed. Show why it does not apply here.

Track each response in a table.

### Step 4: Synthesize the Final Proposal (Main Agent)

After responding to all challenges, produce:

1. **Refined proposal** — what changed as a result of adversarial review
2. **Challenges accepted** — what the Diaboli correctly identified that was fixed
3. **Challenges rebutted** — what was addressed with evidence, and what that evidence is
4. **Residual tensions** — tradeoffs that remain, now consciously accepted
5. **Confidence delta** — how did adversarial review change confidence in the proposal?

---

## Full Template

```md
## Step 1: The Proposal

### What
<what is being proposed>

### Why
<primary rationale>

### Key Assumptions
- <assumption 1>
- <assumption 2>
- <assumption 3>

### Tradeoffs Acknowledged
- <tradeoff>

### Alternatives Briefly Considered
- <alternative> — dismissed because <reason>

---

## Step 2: Diaboli Challenges

| # | Challenge | Category | Question for Proponent |
|---|-----------|----------|----------------------|
| 1 | <challenge> | Assumptions | <question> |
| 2 | <challenge> | Evidence | <question> |
| 3 | <challenge> | Completeness | <question> |
| ... | ... | ... | ... |

---

## Step 3: Responses

| # | Challenge | Response Type | Main Agent Response |
|---|-----------|--------------|--------------------|
| 1 | <challenge> | ACCEPT / REBUT / DISTINGUISH | <response> |
| 2 | <challenge> | ACCEPT / REBUT / DISTINGUISH | <response> |
| ... | ... | ... | ... |

---

## Step 4: Final Proposal

### Refined Proposal
<what the proposal now is, after adversarial review>

### Challenges Accepted & Changes Made
- <challenge>: <what changed>

### Challenges Rebutted
- <challenge>: <why the proposal stands>

### Residual Tensions
- <tradeoff that remains, consciously accepted>

### Confidence Delta
- Before adversarial review: <X/10>
- After adversarial review: <Y/10>
- Change: <+/-Z>
- Why: <explanation>
```

---

## Direct Implementation: Invoking the Diaboli

This is the core tool-mediated pattern. When you identify a proposal needs adversarial review, the implementation is:

### Prerequisites
- A configured sub-agent to serve as the Diaboli. Use the strongest model available — adversarial reasoning benefits from higher capability.
- **Always use a `fork` context** to ensure zero contamination between the main agent's reasoning and the Diaboli's review.

### Invocation Pattern

```
1. Crystallize the proposal.
2. Invoke the Diaboli sub-agent:

   subagent({
     agent: "<strongest-available-agent>",
     context: "fork",    ← CRITICAL: prevents shared anchoring
     task: `Your role is Advocatus Diaboli (Devil's Advocate).
     You are a SEPARATE adversarial agent, not the proponent.
     You have zero investment in the following proposal.
     Attack it from every angle listed in the advocatus-diaboli skill.
     Do not be balanced. Do not be fair. Be relentless.
     ---
     ${proposal}
     ---
     Produce a structured list of challenges, each with:
     - The claim or assumption being challenged
     - Why it is weak
     - A question the proponent must answer`
   })

3. For each challenge: accept, rebut, or distinguish.
4. Synthesize the final proposal with the confidence delta.
```

### What If No Sub-Agent Is Available?

If you lack a second configured agent, you can achieve partial separation by:

1. Run steelmanning (self-critique) as the first pass.
2. Then re-read the proposal from scratch with this prompt:
   *"Read the following proposal as if you have NEVER seen it before. You have no investment in it. Find every hole you can."*

This is weaker than a true separate agent but stronger than standard steelmanning because it forces a cognitive reset between proposal-building and critique.

### Agent Selection Tips

- **Best model available** — adversarial reasoning benefits from the strongest model
- **Different provider/model than the main agent** if possible — maximizes cognitive diversity
- **Different temperature** (higher = more creative attacks, lower = more systematic) — 0.7 is a good default for the Diaboli
- **Fork context** — always use `context: "fork"` to prevent the Diaboli from seeing the main agent's internal reasoning

---

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

## Agent Rules

### Do
- invoke the Diaboli as a *separate* sub-agent, not as self-critique by the same agent
- brief the Diaboli explicitly on the adversarial posture — "your job is to attack, not to be balanced"
- respond to every challenge explicitly (accept, rebut, or distinguish)
- adjust the proposal when a challenge reveals a genuine weakness
- track the confidence delta before and after review

### Do Not
- have the same agent play both roles (this defeats the purpose)
- make the Diaboli polite or accommodating — its job is to find holes
- ignore a challenge because it is uncomfortable (those are the most valuable ones)
- produce a token adversarial review with one or two surface-level challenges
- use the adversarial review to justify the original proposal without genuine engagement

---

## Why a Separate Agent Matters

The entire premise of this skill rests on one finding: **self-critique is systematically weaker than external critique**.

| | Self-critique | Separate adversarial agent |
|---|---|---|
| **Anchoring** | Anchored to own reasoning; unconsciously defends it | No prior investment; sees only what is presented |
| **Confirmation bias** | Reads the evidence supporting the proposal more favorably | Reads all evidence equally suspiciously |
| **Commitment** | Has already committed reasoning tokens to the proposal | Has committed nothing |
| **Blind spots** | Shares the same blind spots as the reasoning that built the proposal | Brings different cognitive patterns |
| **Social pressure** | Feels pressure to approve its own work | Feels pressure only to find flaws |

The separate agent does not need to be "smarter" than the main agent. It only needs to be *free* from the main agent's commitments and blind spots.

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

## Pairing Guide

- **Steelmanning** — use steelmanning *first* (same agent builds the strongest opposition), then invoke the Diaboli (separate agent attacks). The steelman prepares you; the Diaboli tests you.
- **Inversion + Pre-Mortem** — use inversion/pre-mortem during proposal development to catch obvious risks before presenting to the Diaboli. The Diaboli then finds what those missed.
- **Second-Order Thinking** — the Diaboli should include temporal challenges (how this ages). For proposals with significant long-term consequences, also run full second-order thinking separately.
- **Bayesian Updating** — after adversarial review, update your confidence in the proposal using the Bayesian framework. A proposal that survives a strong Diaboli should have higher posterior confidence.
- **Separation of Concerns** — run the Diaboli in a forked context (via `pi-subagents` fork mode) to ensure zero contamination between the main agent's reasoning and the Diaboli's review.
- **PI Subagents** — use the `pi-subagents` skill to dispatch the Diaboli as a parallel agent with a `fork` context, ensuring genuine cognitive separation.

---

## Definition of Done

Advocatus Diaboli was applied correctly when:

- [ ] The proposal was crystallized clearly before invoking the Diaboli
- [ ] The Diaboli was invoked as a separate sub-agent with explicit adversarial brief
- [ ] The Diaboli produced challenges from at least 5 of the 10 categories (or convincingly explains why the others do not apply)
- [ ] Each challenge received an explicit response: accept, rebut, or distinguish
- [ ] The proposal was genuinely adjusted where challenges revealed weaknesses
- [ ] Residual tensions were named explicitly
- [ ] The confidence delta was measured and recorded

---

## Final Instruction

Your proposal has not been tested until a separate mind has tried to break it.

You cannot be your own devil's advocate.
You are too invested.

Invoke a separate agent. Give it one job: attack.
Then respond to every challenge.

What survives is credible. What does not was not ready.
