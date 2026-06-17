---
source: "GrimoireStack"
name: empirical-justification
description: Gather empirical evidence — usage telemetry, A/B results, regression counts — to justify retiring, refining, or promoting a skill. Use when a skill change is contested or high-stakes.
category: testing
priority: medium
tags: [evaluation, telemetry, regression, decision-making, skill-lifecycle]
---

## Overview

Skills live or die on data, not taste. This skill is the bridge between
"should we change this skill?" and "here is the evidence." Use it when a
proposal to refine, retire, or promote a skill faces pushback, or when the
stakes of the change are high enough that opinion alone is not enough.

## When to Use

- A skill is being challenged ("is this actually doing anything?")
- A skill change has cross-cutting impact and needs justification
- You have run A/B trials or telemetry that needs translating into a decision
- You need a defensible record of why a skill was changed

## Method

1. **State the decision** in one sentence. "We should retire `<skill>` because…"
2. **List the evidence categories** you have:
   - A/B trial results (link to `skill-ab-evaluation` output)
   - Production telemetry: usage counts, error rates, regression counts
   - Direct observation: incidents where the skill helped / failed
3. **For each piece of evidence**, give: source, sample size, date, and a one-line interpretation.
4. **Identify what the evidence does NOT show** — the things you cannot conclude from this data.
5. **Recommend a decision** with explicit confidence and the conditions under which it should be reversed.

## Output

A short memo (one page) with: decision, evidence summary, limitations,
recommendation, and review date. Store alongside the skill's source so future
maintainers can see why a change was made.

## Anti-Patterns

- Cherry-picking only the trials that support your position
- Citing usage counts as proof of value (popular ≠ useful)
- Conflating "the skill changed" with "the outcome improved" (other factors changed too)
- Skipping the limitations section because it makes the recommendation weaker

## Biological Analog

A pharmacologist writing the package insert. The active ingredient
worked in trials, but the insert has to list side effects, contraindications,
and the studies that did *not* show a benefit. A skill change is the same:
effectiveness is the headline, but the rest of the memo is what makes the
decision defensible six months later.
