# Skill: Analogy and Transfer Reasoning for AI Agents

## Purpose

Use this skill when the agent must solve a problem that resembles a problem already solved somewhere else — and can deliberately import the structure of that prior solution.

This skill is a companion to the How to Solve It state machine, focused specifically on Polya's analogy technique: *Can you find a related problem that has been solved before?*

Where First Principles Thinking strips away analogies to reason from axioms, this skill does the opposite: it deliberately searches for the best-matching analog and transfers the structural solution across domains.

The two skills are the two poles of a reasoning routing decision:
- **First Principles**: the current context is novel or the analogy does not hold; reason from the ground up
- **Analogy and Transfer**: the current context structurally resembles a solved problem; import the structure

Using the wrong pole is costly:
- First Principles when a good analog exists: unnecessary work
- Analogy when the context is not actually analogous: confident wrong direction

Source: George Polya's *How to Solve It* (the four-question heuristic), structural mapping theory (Dedre Gentner), and cross-domain transfer in cognitive science.

---

## Core Rule

A good analogy accelerates dramatically.
A bad analogy deceives completely.

Before importing a prior solution, verify that the structural mapping holds — not just that the surface looks similar.

---

## When to Use

Use this skill when:
- the problem resembles one the agent has seen in a different domain or context
- a design pattern, algorithm, or architectural approach from another domain seems applicable
- the agent is asked to design something new and wants to leverage known solutions
- the problem space is too large for brute-force analysis and a structural guide would help
- there is a strong intuition that "this is like X" but the mapping has not been made explicit

Do not use when:
- the problem is genuinely novel with no meaningful structural analogs
- the domain differences between the current problem and the analog are more significant than the similarities
- first principles are already established and the analogy would introduce unnecessary constraints

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

## Analogy Routing Decision

Before using this skill, ask: which pole is right for this problem?

**Use Analogy Transfer when:**
- a good structural analog exists and has been validated
- the analog is in the agent's knowledge base with a clear solution
- the mapping holds across the important dimensions
- importing the structure will significantly reduce work

**Use First Principles instead when:**
- no good analog exists
- the available analogs have weak or misleading structural mappings
- the problem has constraints that are genuinely novel
- previous analog-based solutions have failed on this type of problem

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

### Do
- make the structural mapping explicit before committing to an analog
- evaluate multiple candidate analogs before selecting the best one
- identify what does not transfer — not just what does
- validate that the transferred solution works in the current context

### Do Not
- import an analog because it looks similar on the surface without verifying the structural mapping
- ignore domain differences that invalidate the mapping
- use analogy as a substitute for validation of the transferred solution
- conflate familiarity with structural equivalence

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

## Failure Modes This Skill Prevents

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

---

## Final Instruction

Do not solve a problem that has already been solved.
Find the right analog, verify the structural mapping, import the structure, adapt it, and validate.

But verify the mapping first.
A bad analogy is worse than no analogy.
