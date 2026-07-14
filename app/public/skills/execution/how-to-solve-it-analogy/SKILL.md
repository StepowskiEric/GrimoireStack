---
name: how-to-solve-it-analogy
description: Apply analogy to a problem — find a structurally related solved problem, map the correspondence, transfer the solution, adapt it. Use when a problem resembles one solved in another domain, when a design pattern from elsewhere seems applicable, or when brute-force analysis needs a structural guide.
triggers:
  - Problem resembles one solved in a different domain or context
  - Design pattern or architectural approach from another domain seems applicable
  - Problem space too large for brute-force analysis and a structural guide would help
---

# How to Solve It — Analogy

Apply analogy to transfer a structural solution from a known problem to the current one. Before importing, verify the structural mapping holds — not just surface similarity.

This skill is a companion to the How to Solve It state machine, focused on Polya's analogy technique. Where First Principles reasons from axioms, analogy searches for the best-matching analog and transfers structure across domains.

Using the wrong pole is costly:
- First Principles when a good analog exists: unnecessary work
- Analogy when the context is not actually analogous: confident wrong direction

Source: Polya's *How to Solve It*, structural mapping theory (Dedre Gentner), and cross-domain transfer in cognitive science.

---

## Core Rule

A good analogy accelerates dramatically.
A bad analogy deceives completely.

Before importing a prior solution, verify that the structural mapping holds — not just that the surface looks similar.

---

## The Four Analogy Questions (from Polya)

### Question 1: Can you find a related problem that has been solved before?
Scan for problems with a similar structure:
- same type of relationship between inputs and outputs
- same type of constraint
- same type of failure mode
- same type of optimization target

The analog does not need to be in the same domain.
The structure is what matters.

### Question 2: What is the structural mapping?
For the identified analog, make the structural mapping explicit:
- what corresponds to what?
- what is the role of X in the analog, and what plays that role here?
- what constraints in the analog correspond to constraints here?

If the mapping requires contortion — if it is hard to state clearly — the analog may not be as good as it appeared.

### Question 3: What transfers and what does not?
Not everything in the analog transfers to the current problem.
Identify:
- what structural elements transfer (the solution technique, the decomposition approach, the invariant being preserved)
- what does not transfer (domain-specific constraints that change the problem shape)

If more does not transfer than transfers, this is a weak analog or a false analog.

### Question 4: How must the transferred solution be adapted?
Apply the analog's solution structure to the current problem.
Identify:
- what must be modified to account for the differences
- what new constraints the current problem introduces that the analog did not have
- what validations are needed to confirm the transfer worked

---

## Analogy Transfer Template

```md
## Problem
<description of the current problem>

## Candidate Analogs
### Analog 1: <name / domain>
- Why it resembles the current problem:
  - <structural similarity>
- Structural mapping:
  - <element in analog> corresponds to <element in current problem>
  - <element in analog> corresponds to <element in current problem>
- What transfers:
  - <element>
- What does not transfer:
  - <element> — because: <domain difference>
- Mapping quality: strong / moderate / weak / false
- Reason for quality assessment:

### Analog 2: <name / domain> (if applicable)
(repeat structure)

## Best Analog Selected
<which analog and why it was selected over alternatives>

## Transferred Solution Structure
<the core of the analog's solution, adapted for the current problem>

## Required Adaptations
- <what must change relative to the analog's solution>
- <why>

## Validation Needed
<how to confirm the transferred solution actually works in the current context>

## Fallback
<what to do if the transferred solution fails — first principles, different analog, or a hybrid>
```

---

## Agent Rules

- Verify the structural mapping before committing to an analog
- Evaluate multiple candidate analogs before selecting the best one
- Identify what does not transfer — and account for domain differences
- Validate the transferred solution in the current context
- Distinguish surface familiarity from structural equivalence

---

## Common Strong Analogy Patterns in Software Engineering

| Current Problem | Structural Analog | Transfers |
|----------------|------------------|----------|
| Service request queuing with backpressure | Token bucket / leaky bucket rate limiting | Pacing + overflow handling |
| Distributed lock with timeout | Mutex + watchdog timer | Mutual exclusion + deadlock prevention |
| Incremental migration of a tightly coupled system | Strangler Fig (from forestry) | Parallel run + gradual cutover |
| Multi-step task with failure rollback | Saga pattern (from distributed databases) | Compensating transactions |
| Agent replanning under changed conditions | OODA loop | Observe → reorient → decide → act |
| Encoding a domain constraint once | Single Source of Truth | Canonical representation + derivation |

---

## Failure Modes

### 1) Surface analogy misuse
The agent identifies that two problems "look similar" without verifying the structural mapping, imports a solution that does not fit, and produces confident wrong output.

### 2) Domain constraint blindness
The analog's solution is imported without accounting for a critical domain constraint of the current problem that the analog did not have.

### 3) Analogy over-extension
The agent uses an analog past the boundary of where it holds, generating increasingly poor recommendations as the structural mapping breaks down.

### 4) Not searching for analogs
The agent solves a problem from scratch that has a well-known structural analog, wasting effort that could have been transferred.

---

## Pairing Guide

- **How to Solve It State Machine** — this skill extends one of Polya's four techniques (analogy) in depth; use it when the How to Solve It protocol reaches the "find a related problem" heuristic
- **First Principles** — the opposing pole; use when no good analog exists or when available analogs are misleading
- **Explore vs. Exploit** — use Explore phase to search for candidate analogs; use this skill to evaluate whether the best one found is strong enough to exploit
- **Domain-Driven Design** — when designing a new bounded context, analogize from known context patterns (customer-supplier, shared kernel) rather than designing each integration from scratch

---

## Definition of Done

Analogy Transfer was applied correctly when:
- at least one candidate analog was identified and evaluated
- the structural mapping was made explicit
- what transfers and what does not was stated
- the best analog was selected with reasoning
- the transferred solution was adapted for current-problem constraints
- validation was specified to confirm the transfer worked
