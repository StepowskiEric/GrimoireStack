# Skill: MECE / Pyramid Principle for AI Agents

## Purpose

Use this skill when the agent must structure a complex output — a plan, analysis, recommendation, memo, or explanation — so that it is both complete and non-redundant.

This skill is based on Barbara Minto's *The Pyramid Principle* and the MECE standard she formalized.

**MECE** — Mutually Exclusive, Collectively Exhaustive:
- **Mutually Exclusive**: no overlap between categories or claims — each idea belongs to exactly one place
- **Collectively Exhaustive**: no gaps — the set of categories covers the full space

**The Pyramid Principle**: structure any complex output starting with the governing thought at the top, then group supporting arguments at the next level, each of which groups its own supporting evidence.

Together these ensure outputs that are:
- complete (no important topics missing)
- non-redundant (no topic appearing twice in different forms)
- clearly structured (the hierarchy reveals the logic)
- efficient (the reader can find what matters without wading through overlap)

---

## Core Rule

Start with the answer.
Then support it.
Organize the support so that nothing is missing and nothing overlaps.

---

## When to Use

Use this skill when:
- writing a plan, strategy memo, architecture decision record, or recommendation document
- organizing an analysis that covers multiple dimensions (performance, security, cost, maintainability)
- structuring a response to a complex question where multiple considerations apply
- reviewing a generated output for redundancy or coverage gaps
- any task where the output is long enough to benefit from deliberate structure

Do not use for:
- short, single-point responses
- casual conversational replies
- code outputs where structure is determined by language conventions

---

## The Pyramid Structure

### Level 1 — Governing Thought (the top)
The single most important thing the output must communicate.
This is the answer to the question, the recommendation, or the core insight.
State it first.

Not: "There are several considerations to explore regarding the system design."
But: "The current architecture should adopt an event-driven approach for the notification subsystem to reduce coupling and improve scalability."

### Level 2 — Supporting Arguments (the middle)
Each argument supports the governing thought.
Arguments must be MECE:
- each argument covers a distinct reason or dimension
- together they fully support the governing thought
- no two arguments overlap substantially

Typical structures for Level 2:
- **Why true**: three or more independent reasons why the governing thought is correct
- **How to do it**: the sequential steps or phases of an action plan
- **Problem → solution**: what is wrong and how to fix each part

### Level 3 — Evidence and Data (the base)
Each piece of evidence supports exactly one Level 2 argument.
Evidence is grounded in facts, data, examples, or references.
Evidence that is relevant to multiple arguments probably means the arguments are not fully MECE.

---

## MECE Test

For any set of categories or arguments, apply the MECE test:

**Mutually Exclusive check:**
Take any item from the set. Can it be placed in exactly one category?
If an item fits naturally into two categories, the categories are not mutually exclusive.

**Collectively Exhaustive check:**
Are there items in the domain that do not fit into any category?
If yes, a category is missing.

---

## Pyramid Principle Template

```md
## Governing Thought
<the single most important claim, recommendation, or insight — stated first>

## Supporting Arguments (Level 2)
These arguments are MECE: they do not overlap and together they fully support the governing thought.

### Argument 1: <distinct dimension or reason>
- Evidence: <specific supporting fact or data>
- Evidence: <specific supporting fact or data>

### Argument 2: <distinct dimension or reason>
- Evidence: <specific supporting fact or data>
- Evidence: <specific supporting fact or data>

### Argument 3: <distinct dimension or reason>
- Evidence: <specific supporting fact or data>
- Evidence: <specific supporting fact or data>

## MECE Check
- Do any arguments overlap? <yes — identify / no>
- Are there gaps in coverage? <yes — identify / no>

## Revised Structure (if needed)
<restructured version after MECE correction>
```

---

## Common MECE Violations and How to Fix Them

### Overlap
**Violation**: "Performance" and "Latency" appear as separate Level 2 arguments, but latency is a component of performance.

**Fix**: merge latency into the performance argument, or separate into truly distinct dimensions: "request latency", "throughput under load", and "resource utilization."

### Gap
**Violation**: An analysis of a distributed system discusses consistency and availability but omits partition tolerance, which is fundamental to the tradeoff being analyzed.

**Fix**: add the missing dimension, even if the answer is "this system does not have configurable partition tolerance" — the space must be covered.

### Redundant evidence
**Violation**: the same metric (e.g., p95 latency) appears as evidence under both the "performance" argument and the "user experience" argument.

**Fix**: assign the evidence to exactly one argument. If it legitimately belongs in both, the arguments may not be truly distinct.

### Everything in one bucket
**Violation**: all concerns are listed under "Technical Risk" without distinction.

**Fix**: decompose into distinct sub-categories — implementation risk, dependency risk, operational risk, timeline risk — each MECE with the others.

---

## Governing Thought Patterns

The governing thought should be one of:

**Recommendation:**
"The team should adopt X because it addresses the three core constraints better than the alternatives."

**Diagnosis:**
"The root cause of the performance regression is Y, driven by three compounding factors."

**Assessment:**
"This plan is sound, with two specific risks that need mitigation before execution."

**Decision:**
"Option A is preferable to Option B given the constraints, with one key condition that must be true."

The governing thought is not a topic ("this memo addresses the database choices") — it is a claim ("PostgreSQL is the right choice given the consistency and scaling requirements").

---

## Agent Rules

### Do
- state the governing thought first, not last
- construct Level 2 arguments that are distinctly different from each other
- apply the MECE test after drafting the structure
- fix overlaps and gaps before finalizing the output

### Do Not
- bury the recommendation at the end after a long preamble
- create Level 2 categories that substantially overlap
- present an exhaustive list of considerations without organizing them into a structure
- use headings as topic labels rather than argument statements

---

## Failure Modes This Skill Prevents

### 1) Bottom-up disclosure
The agent presents all evidence first and the recommendation last, forcing the reader to hold uncertainty until the end.

### 2) Overlap pollution
Two or more sections cover the same ground, creating confusion and wasted reading.

### 3) Coverage gaps
Important dimensions are missing, making the output appear complete while omitting things that would change the conclusion.

### 4) Flat lists
All considerations are presented at the same level with no hierarchy, making the relationship between ideas invisible.

---

## Pairing Guide

- **Cognitive Load Operator** — MECE gives the structure; Cognitive Load Operator checks whether the structure is easy to process
- **Bounded Self-Revision** — use the MECE test as the revision criterion in a Bounded Self-Revision pass
- **Feynman Technique** — use Feynman to verify the reasoning is sound; use MECE to structure the verified reasoning clearly
- **Six Thinking Hats** — after a Six Hats analysis, use MECE to structure the conclusions into a clear output

---

## Definition of Done

MECE / Pyramid Principle was applied correctly when:
- the governing thought is stated first and is a claim, not a topic
- Level 2 arguments are distinct and do not substantially overlap
- the set of Level 2 arguments covers the full relevant space
- each piece of evidence belongs to exactly one argument
- the MECE test was applied and violations were corrected
- the output is faster to read and more persuasive because of its structure

---

## Final Instruction

Start with the answer.
Support it with arguments that do not overlap and together cover the space.
Ground each argument in evidence that belongs to exactly one place.

If the structure does not pass the MECE test, fix it before publishing.
