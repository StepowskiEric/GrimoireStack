# Skill: Bayesian Belief Updating for AI Agents

## Purpose

Use this skill when the agent must maintain and update beliefs in the face of new evidence — without swinging too far on a single data point, without ignoring evidence that conflicts with prior beliefs, and without losing track of what was known before.

Bayesian updating means:
- hold explicit prior beliefs about competing hypotheses
- when new evidence arrives, update each hypothesis's probability based on how well it predicted that evidence
- the updated probability is the new prior for the next piece of evidence

This prevents two common failure modes:
1. **Over-updating**: one new piece of evidence causes the agent to completely abandon its prior and swing to a new belief (as if the prior never existed)
2. **Under-updating**: new evidence is acknowledged but does not actually change the agent's confidence or reasoning

Sources: Bayes' theorem, Philip Tetlock's *Superforecasting*, Eliezer Yudkowsky's *Rationality: A-Z*.

---

## Core Rule

New evidence does not replace your prior.
It updates it.

Hold both the prior and the evidence explicitly.
Let the strength of the evidence — relative to your prior — determine how much your belief shifts.

---

## When to Use

Use this skill when:
- debugging: holding competing hypotheses about a root cause and updating as test results arrive
- planning: estimating probability of success or risk as evidence accumulates
- architecture decisions: maintaining competing models of the system and updating as data arrives
- incident analysis: tracking multiple failure hypotheses and updating as logs, metrics, and tests produce evidence
- any situation where beliefs should evolve over multiple observations rather than flip at each new signal

Do not use when:
- the question has a definitive right answer that has already been established
- a single piece of evidence is conclusive (use it and move on)
- the task calls for exploration of unknown unknowns rather than updating on known hypotheses

---

## The Core Mechanics

### Prior probability
Before new evidence, what is your confidence that hypothesis H is true?
Express as a probability (or at least a qualitative level: high / medium / low / very low).

### Likelihood ratio
How much more likely is this evidence if H is true versus if H is false?
- **Strong positive evidence**: this result was very likely if H is true and unlikely otherwise → large update toward H
- **Weak positive evidence**: this result is slightly more consistent with H than alternatives → small update
- **Neutral evidence**: this result was equally likely under all hypotheses → no meaningful update
- **Disconfirming evidence**: this result was unlikely if H is true → update away from H

### Posterior probability
After applying the likelihood ratio to the prior, what is the new probability?
This becomes the new prior for the next piece of evidence.

---

## Practical Application for Agents

Agents do not need to compute exact probabilities.
The discipline is in the qualitative structure:
- name the competing hypotheses before gathering evidence
- for each piece of evidence, ask: which hypothesis predicted this best?
- update confidence toward the hypothesis that best predicted the evidence
- update away from hypotheses that would have predicted different evidence
- track the cumulative state across multiple observations

---

## Bayesian Updating Template

```md
## Question / Problem
<what is being reasoned about>

## Competing Hypotheses
| Hypothesis | Prior Confidence | Basis for Prior |
|-----------|-----------------|----------------|
| H1: <hypothesis> | high/medium/low | <why> |
| H2: <hypothesis> | high/medium/low | <why> |
| H3: <hypothesis> | high/medium/low | <why> |

## Evidence Log

### Evidence 1: <description>
- Expected under H1: likely / unlikely / neutral
- Expected under H2: likely / unlikely / neutral
- Expected under H3: likely / unlikely / neutral
- Update: favors H? / against H? / neutral
- Posterior (post this evidence):
  | Hypothesis | Post-Evidence Confidence |
  |-----------|------------------------|

### Evidence 2: <description>
(repeat structure)

## Current Belief State
| Hypothesis | Current Confidence | Trend |
|-----------|------------------|-------|

## Leading Hypothesis
<which hypothesis is now strongest and why>

## What Would Change This
- Evidence that would strongly update toward H2:
  - <evidence>
- Evidence that would strongly update away from H1:
  - <evidence>

## Uncertainty Remaining
<what is still not known that would meaningfully resolve the belief state>
```

---

## Agent Rules

### Do
- name all plausible competing hypotheses before collecting evidence
- update explicitly after each major piece of evidence
- ask which hypothesis predicted each piece of evidence best
- be willing to update away from the leading hypothesis if evidence demands it
- name what evidence would change your current belief state

### Do Not
- treat new evidence as either conclusive proof or irrelevant noise
- update toward a hypothesis only because it is familiar or comfortable
- stop tracking alternative hypotheses just because one is currently leading
- present a conclusion without acknowledging remaining uncertainty

---

## The Two Failure Modes to Avoid

### 1) Belief anchoring (under-updating)
Prior confidence is so strong that new disconfirming evidence barely moves it.

Signs:
- the agent acknowledges evidence but qualifies it into irrelevance
- the same hypothesis leads no matter what evidence arrives

Correction:
- for each piece of disconfirming evidence, ask: "how likely was I to see this if my hypothesis were correct?"
- if the answer is "not very likely," the update must be meaningful

### 2) Belief whiplash (over-updating)
Each new piece of evidence causes the agent to swing completely to a different hypothesis.

Signs:
- belief changes sharply after each observation
- the prior plays no role in the outcome

Correction:
- the prior exists because earlier evidence or reasoning established it
- a single new data point rarely justifies abandoning it entirely
- ask: "how much more consistent is this evidence with the new hypothesis than with my prior?"

---

## Debugging Application Pattern

This is one of the most common uses for this skill.

Before running tests or inspecting logs, generate a hypothesis list:
- H1: config error (prior: medium — last deployment changed config)
- H2: dependency outage (prior: low — no alerts from dependency monitoring)
- H3: memory leak in the new code path (prior: medium — the code path is new and untested)
- H4: caching inconsistency (prior: low — cache was not touched in this deployment)

As each test result arrives, update:
- "Error only occurs on requests that use the new code path" → strongly favors H3, weakly against H1
- "Memory usage is flat" → strongly against H3, neutral on H1
- Update: H1 now leads; request the config diff next

This prevents the agent from latching onto the first plausible hypothesis and stopping.

---

## Failure Modes This Skill Prevents

- first-hypothesis fixation (stopping at the first plausible explanation)
- evidence cherry-picking (only processing evidence that confirms the leading hypothesis)
- silent certainty drift (becoming increasingly confident without documenting why)
- hypothesis abandonment without cause (dropping alternatives without disconfirming evidence)

---

## Pairing Guide

- **How to Solve It** — use How to Solve It for the problem-framing structure; use Bayesian Updating for belief management as evidence accumulates during diagnosis
- **Recognition-Primed Triage** — RPT chooses the first plausible action fast; Bayesian Updating refines the diagnosis as evidence arrives after that first action
- **Steelmanning** — steelmanning builds the opposing case; Bayesian Updating quantifies how much that case should update confidence
- **Reference Class Forecasting** — use the reference class base rate as the prior before inside-view evidence is applied

---

## Definition of Done

Bayesian updating was applied correctly when:
- competing hypotheses were named before evidence was gathered
- each piece of evidence was evaluated against all hypotheses
- the leading hypothesis was updated based on evidence, not just held from the start
- alternative hypotheses were maintained until disconfirmed
- the final belief state was stated with explicit remaining uncertainty

---

## Final Instruction

Hold your prior.
Update it when evidence demands.
Do not abandon it on a single data point.
Do not ignore evidence that challenges it.

The truth is in the accumulated update, not in the first plausible guess.
