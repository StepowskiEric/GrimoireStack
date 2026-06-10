# Skill: Agent Memory Hygiene for AI Agents

## Purpose

Use this skill when the agent must decide what to remember, what to forget, how long to trust stored context, and when to treat cached knowledge as stale.

Memory is a double-edged tool for agents. Good memory enables continuity, avoids repeated work, and surfaces relevant prior context. Poor memory causes agents to:
- act on stale facts as if they were current
- accumulate low-value context that degrades retrieval quality
- over-trust cached beliefs that should be re-verified
- treat prior decisions as constraints when they should be revisited

This skill provides a hygiene framework for managing what the agent stores, retrieves, trusts, and discards.

Related to research on RAG (Retrieval-Augmented Generation) architectures, MemGPT/LangMem memory systems, and epistemic hygiene principles from philosophy of knowledge.

---

## Core Rule

Stored memory is not ground truth.
It is a record of what was believed at a point in time, by a system that could have been wrong.

Treat retrieved context with the same critical evaluation applied to new evidence.

---

## When to Use

Use this skill when:
- starting a new task where prior session context is available and could influence decisions
- deciding whether to store a fact, decision, or observation for future retrieval
- noticing that a prior stored belief conflicts with current evidence
- a recurring task has been done before and memory of prior approaches is available
- the agent suspects it is operating on stale or over-trusted cached context

Do not use when:
- the task is fully contained within a single session with no cross-session memory
- memory storage is not available in the current environment
- the task is exploratory and no prior context exists

---

## Memory Categories

### Durable facts (long-lived, high-trust)
Facts that change rarely and were verified against reliable sources.

Examples:
- architectural decisions that were explicitly agreed to
- constraints that are structurally embedded in the system (schema choices, API contracts)
- user preferences that were explicitly stated

Handling:
- store with a source and timestamp
- review if the system has changed materially since the fact was established
- do not update silently — changes to durable facts should be deliberate

### Working context (session-scoped, ephemeral)
Information gathered during the current task that is useful now but not worth persisting.

Examples:
- intermediate diagnostic observations
- file contents read during the current session
- partial results from a reasoning chain in progress

Handling:
- use freely within the session
- do not persist to long-term memory unless it graduates to a durable fact or insight
- discard at session close without regret

### Provisional beliefs (limited-trust, should expire)
Beliefs formed from inference, pattern-matching, or under-evidenced reasoning.

Examples:
- hypotheses about root causes that have not yet been tested
- assumptions about user intent that have not been explicitly confirmed
- design choices that were provisional and flagged for reconsideration

Handling:
- label as provisional at time of storage
- set a review trigger (next relevant task, specific event, time window)
- do not treat as confirmed without re-verification

### Decisions and rationale (long-lived, but context-dependent)
Decisions made with specific rationale that may not apply if the context changes.

Examples:
- "We chose technology X because of constraint Y" — if Y changes, X may no longer be the right choice
- "We deferred task Z because of priority P" — if P changes, Z should be reconsidered

Handling:
- store the rationale alongside the decision, not just the decision
- note the conditions under which the decision should be revisited
- do not treat a prior decision as permanent if its rationale conditions have changed

---

## Staleness Signals

Retrieved memory should be treated with suspicion when any of the following is true:

- the memory was created more than N time units ago and the domain is volatile
- a new piece of evidence contradicts the stored belief
- the task context has changed materially since the memory was stored
- the memory was a provisional belief, not a confirmed fact
- the memory was stored by inference, not by direct observation
- the source of the memory is unknown or unverifiable

When staleness signals are present:
- note the potential staleness
- re-verify if feasible and if the stakes justify the cost
- if re-verification is not feasible, use the memory as a prior, not as a fact, and state the uncertainty

---

## Memory Hygiene Checklist

### Before storing
- [ ] What category is this? (durable fact / working context / provisional belief / decision + rationale)
- [ ] Is this worth persisting, or is it useful only in this session?
- [ ] What is the source? Was it verified?
- [ ] Should this expire or have a review trigger?

### Before using retrieved memory
- [ ] When was this stored? Is the domain stable or volatile?
- [ ] Was this a confirmed fact or a provisional belief?
- [ ] Does any current evidence contradict it?
- [ ] What is the cost of being wrong if this memory is stale?

### Periodic review
- [ ] Is any stored provisional belief now resolvable as confirmed or discarded?
- [ ] Are there stored decisions whose rationale conditions have changed?
- [ ] Is the memory store accumulating low-value context that should be pruned?

---

## Memory Hygiene Template

```md
## Memory Operation
<store / retrieve / review / prune>

## Item
<what is being stored or reviewed>

## Category
<durable fact / working context / provisional belief / decision + rationale>

## Source
<how was this established? direct observation / inference / stated by user / other>

## Verified?
<yes / no / partially>

## Staleness Risk
<low — stable domain / medium — somewhat volatile / high — volatile domain>

## Expiration or Review Trigger
<time window / event / condition that should prompt re-verification>

## Current Trust Level
<confirmed / probable / provisional / uncertain>

## Staleness Check (for retrieval)
- Created: <when>
- Domain stability: <stable / volatile>
- Contradicting evidence: <none / describe>
- Should re-verify: yes / no — because: <reason>

## Action
<use as fact / use as prior with stated uncertainty / re-verify before using / discard>
```

---

## Agent Rules

### Do
- label stored beliefs with their category and confidence at time of storage
- treat retrieved memory as evidence to be evaluated, not as ground truth
- re-verify provisional beliefs when they become decision-relevant again
- prune accumulated low-value working context that was never elevated to a durable fact

### Do Not
- treat all stored memory as equally reliable regardless of how it was established
- use a memory silently without noting when it was established and what its confidence was
- accumulate memory indefinitely without pruning low-value or expired items
- update a durable fact silently — changes to confirmed beliefs should be deliberate and traceable

---

## Failure Modes This Skill Prevents

### 1) Stale fact overconfidence
An architectural constraint, user preference, or system state was stored months ago, the situation has changed, but the agent treats it as current.

### 2) Provisional belief calcification
A hypothesis was stored as provisional but was never re-verified and has been treated as confirmed in subsequent sessions.

### 3) Memory pollution
Low-value working context accumulates and degrades retrieval quality when the agent needs to find relevant prior decisions.

### 4) Rationale amnesia
A decision is stored without its rationale. The conditions that justified the decision change, but the agent cannot recognize that the decision should be revisited.

### 5) Source blindness
The agent uses a stored belief without knowing where it came from, and cannot assess whether the source was reliable.

---

## Pairing Guide

- **Agentic Design Patterns** — memory management is one of the core agentic patterns; this skill provides a hygiene discipline for how memory should be managed in practice
- **Bayesian Updating** — beliefs stored as provisional should be updated using Bayesian principles as new evidence arrives
- **Socratic Clarification** — before acting on a stored belief that might be stale, use Socratic Clarification to confirm whether it still holds
- **ETTO** — use ETTO to decide how much re-verification effort is warranted before trusting retrieved memory on a high-stakes decision

---

## Definition of Done

Memory hygiene was applied correctly when:
- stored items are labeled with category, source, confidence, and review trigger
- retrieved items are evaluated for staleness before use
- provisional beliefs are not treated as confirmed facts
- decisions are stored with their rationale and the conditions under which they should be revisited
- memory is pruned of low-value accumulated context

---

## Final Instruction

Memory is not a database of facts.
It is a record of beliefs at a point in time.

Evaluate what you retrieve.
Label what you store.
Expire what has aged.
Prune what has no value.
