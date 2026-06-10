# Skill: First Principles Thinking for AI Agents

## Purpose

Use this skill when the agent needs to reason from the ground up rather than from convention, analogy, or received wisdom.

First principles thinking means decomposing a problem down to its fundamental, axiomatic constraints — what must be true — and then reasoning upward from those foundations rather than inheriting assumptions from how the problem has been framed or solved before.

This skill prevents the agent from:
- accepting a solution pattern because it is familiar
- reasoning by analogy when the analogy does not hold
- inheriting unnecessary constraints embedded in how the problem was stated
- optimizing inside a bad framing instead of questioning the framing

Sources: Aristotle's *Posterior Analytics*, Descartes' *Discourse on the Method*, Feynman's teaching philosophy, widely applied in physics and engineering.

---

## Core Rule

Before reasoning toward a solution, ask: what must actually be true here?

Do not inherit the constraints of prior solutions.
Do not inherit the vocabulary of the requester's framing.
Decompose to the real foundations and rebuild from there.

---

## When to Use

Use this skill when:
- a problem feels intractable because every option has been "tried"
- the solution space seems narrow and none of the options are good
- the framing of the problem is being imported unchanged from a prior context
- the agent is reasoning by "this is how we do it" rather than "this is why we do it this way"
- a creative or novel solution is needed
- the agent is optimizing an existing design but suspects the design itself is the problem
- conventional approaches have failed and the agent must question the assumptions behind them

Do not use this skill when:
- the problem is genuinely well-understood and the standard approach is correct
- speed matters more than re-examination
- the goal is incremental improvement within a known-good framework (use Toyota Kata or PDCA instead)

---

## The Core Questions

### Step 1: What is the actual goal?
Strip the goal of any assumed method.
Not "add a caching layer" but "reduce response latency under load."
Not "fix the bug" but "ensure this behavior is reliably correct."

### Step 2: What do we actually know?
Separate:
- established facts (measured, observed, proven)
- strong inferences (well-supported, but not directly observed)
- inherited assumptions (believed because it is how things have always been done)
- requirements from first principles (what must be true for the goal to be achieved)

### Step 3: What are the real constraints?
Distinguish:
- hard constraints (physical, mathematical, regulatory — truly non-negotiable)
- soft constraints (organizational, conventional, historical — can be questioned)
- assumed constraints (believed to be hard but never actually tested)

For each assumed constraint, ask: has this been tested, or is it inherited?

### Step 4: What would the solution look like if we had no prior solution?
Build from the verified foundations.
Do not start from the existing solution and subtract.
Start from the real constraints and build upward.

### Step 5: Compare the first-principles solution to the conventional one
Ask:
- where do they differ?
- which differences are due to legitimate constraints versus inherited assumptions?
- is the conventional solution leaving value on the table?
- is the first-principles solution actually better or just unfamiliar?

---

## First Principles Analysis Template

```md
## Problem Statement (Inherited)
<how the problem was originally stated>

## Actual Goal (Decomposed)
<what must actually be achieved, without method assumptions>

## What We Know (Verified)
- Facts:
  - <fact>
- Inferences:
  - <inference>

## Inherited Assumptions (to Question)
- <assumption> — status: hard constraint / soft constraint / unverified
- <assumption> — status: hard constraint / soft constraint / unverified

## Hard Constraints (Genuinely Non-Negotiable)
- <constraint with evidence of why it is truly fixed>

## Soft Constraints (Can Be Questioned)
- <constraint> — why it has been treated as fixed / whether it needs to be

## First-Principles Solution Sketch
<what emerges from the real constraints, not from convention>

## Comparison to Conventional Approach
- Where they differ:
  - <difference>
- Whether the difference matters:
  - <reasoning>

## Recommendation
<proceed with first-principles approach / validate conventional approach is already optimal / hybrid>
```

---

## Agent Rules

### Do
- separate facts from inherited assumptions explicitly
- question constraints that have never been tested
- build solutions from verified foundations up
- compare the first-principles result to the conventional one
- name which constraints are genuinely hard and which are soft

### Do Not
- mistake familiarity for correctness
- treat "this is how everyone does it" as a first principle
- stop at the inherited problem framing
- use first principles as an excuse to reinvent things that work
- ignore the conventional approach entirely without comparing it

---

## Common Inherited Assumptions to Question

### In software architecture
- "We need a separate service for this" — is that truly required?
- "We need a database for this" — is durable state actually required?
- "This must be real-time" — does the user actually require real-time, or just timely?

### In product design
- "Users want this feature" — do users need the outcome this feature provides, or the feature itself?
- "We need an API for this" — is integration the actual requirement, or something else?

### In planning
- "This will take six weeks" — based on what actual constraints?
- "This requires three teams" — which dependency is truly necessary?

### In debugging
- "The problem is in component X" — is that where the symptom is, or where the cause is?
- "This is the correct behavior" — verified by whom against what specification?

---

## Failure Modes This Skill Prevents

### 1) Framing inheritance
Accepting the problem as stated without questioning what it assumes.

### 2) Analogy reasoning in the wrong domain
"We did it this way for system A so we should do it this way for system B" — without checking whether the two systems share the relevant constraints.

### 3) Optimization inside a bad frame
Making the existing approach faster or cleaner when the approach itself is the problem.

### 4) Assumed constraint acceptance
Treating soft, historical, or organizational constraints as if they were physical laws.

---

## Pairing Guide

- **Inversion** — inversion reasons backward from failure; first principles reasons upward from axioms; use both to stress-test a problem
- **How to Solve It** — first principles reveals the true problem; How to Solve It provides a structured solving protocol
- **ETTO** — first principles is slow-mode work; use ETTO to decide whether this depth is warranted before starting
- **Analogy/How to Solve It Analogy variant** — first principles and analogy are the two poles of a routing decision: strip analogies to test whether the situation truly resembles the analog

---

## Definition of Done

First principles was applied correctly when:
- the inherited problem framing was questioned, not just inherited
- facts were separated from assumptions
- hard constraints were distinguished from soft ones
- the solution was built from verified foundations up
- the first-principles result was compared to the conventional approach
- the final recommendation is stronger because the framing was examined, not just accepted

---

## Final Instruction

Do not inherit the problem as stated.
Do not inherit the constraints of prior solutions.
Strip to what must be true.
Build from there.
