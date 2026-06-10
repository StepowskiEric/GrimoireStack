# Skill: Problem-Mode Router (Cynefin)

## Purpose

Use this skill when the agent must decide **what kind of problem this is** before deciding how to solve it.

This skill is valuable because agents often fail by using the wrong mode of reasoning:
- applying a checklist to a messy complex problem
- trying deep analysis when fast stabilization is needed
- treating a genuinely obvious task like a research project
- confusing “unclear” with “complex”
- confusing “chaotic” with “I should do anything quickly”

This skill helps the agent route the task into the correct response style.

---

## Best Use-Cases

Use this skill for:
- task routing
- incident routing
- deciding which skill stack to invoke
- project kickoff analysis
- diagnosing whether a situation is obvious, complicated, complex, chaotic, or still disordered
- preventing the wrong reasoning style from dominating the task

Good fit:
- “What kind of problem is this?”
- “Should I analyze, probe, stabilize, or just follow procedure?”
- “Why does this task keep resisting the method we are using?”

---

## Core Modes

### 1. Obvious
Cause and effect are clear, stable, and widely understood.

Best response:
- sense
- categorize
- respond

Use for:
- routine tasks
- known procedures
- standard checklists
- stable operational work

Typical stack:
- ETTO light
- checklist or direct execution

---

### 2. Complicated
Cause and effect exist, but expert analysis is needed.

Best response:
- sense
- analyze
- respond

Use for:
- diagnosis
- non-trivial engineering questions
- specialist review
- design reasoning
- deep but ultimately knowable problems

Typical stack:
- ETTO
- How to Solve It
- Pragmatic Programmer
- Software Design or domain-specific skill

---

### 3. Complex
Cause and effect are not reliably knowable in advance and become clearer only after interaction.

Best response:
- probe
- sense
- respond

Use for:
- exploratory work
- product/behavior experiments
- messy sociotechnical problems
- emergent behavior
- issues where bounded probes teach more than upfront analysis

Typical stack:
- ETTO
- Explore vs Exploit
- Thinking in Systems
- safe-to-fail experiments

---

### 4. Chaotic
There is no usable stable relationship yet; the priority is to restore order.

Best response:
- act
- sense
- respond

Use for:
- outages
- active incidents
- severe instability
- operational breakdown where immediate containment matters

Typical stack:
- ETTO high mode
- Recognition-Primed Triage
- containment first
- reclassify later

---

### 5. Disorder
It is not yet clear which mode applies.

Best response:
- gather enough signal to classify
- decompose the task if needed

Use for:
- messy starting points
- mixed-signal situations
- unclear task framing

Typical stack:
- ETTO
- light signal gathering
- then classify into one of the other modes

---

## Classification Questions

Before solving, ask:

### Stability
Are cause and effect stable enough to trust?

### Familiarity
Is this a known procedure or a genuinely novel situation?

### Urgency
Is there time to analyze, or must order be restored first?

### Predictability
Can analysis reveal the answer in advance, or do we need bounded probes?

### Confusion
Are we still too unclear to classify the situation?

---

## Routing Template

```md
## Task
<goal>

## Situation Summary
<short summary>

## Signals Observed
- <signal>

## Current Mode
<obvious / complicated / complex / chaotic / disorder>

## Why This Mode Fits
<reason>

## Recommended Response Style
<sense-categorize-respond / sense-analyze-respond / probe-sense-respond / act-sense-respond>

## Suggested Skill Stack
- <skill>

## Misclassification Risk
<what goes wrong if the mode is wrong>

## Reclassification Trigger
<what would change the mode>
```

---

## Agent Rules

### Do
- classify the task before choosing the solving style
- reclassify when the environment changes
- use containment first in chaotic conditions
- use probes in complex conditions
- use analysis in complicated conditions
- use standard procedure in obvious conditions

### Do Not
- treat every task like a complicated analysis problem
- treat every unclear task as complex
- use “chaos” as permission for unbounded action
- keep applying best practices when the system first needs stabilization
- refuse to reclassify after new evidence

---

## Strong Invocation Examples

### Routing
“Use the Problem-Mode Router. Classify whether this is obvious, complicated, complex, chaotic, or disordered before choosing the response style.”

### Incident
“Classify the problem mode first. If it is chaotic, contain before analyzing.”

### Project planning
“Determine whether this task should be handled through procedure, expert analysis, bounded experimentation, or immediate stabilization.”

---

## When to Pair It with Other Skills

Typical pairings:
- **ETTO** -> always useful near the start
- **Recognition-Primed Triage** -> chaotic mode
- **How to Solve It** -> complicated mode
- **Explore vs Exploit** -> complex mode
- **Thinking in Systems** -> complex systems with loops/delays
- **Pragmatic Programmer** -> complicated but bounded engineering work

---

## Failure Modes This Skill Prevents

- wrong response style for the problem
- over-analysis of obvious tasks
- using deterministic procedures for emergent complex situations
- analyzing chaos when immediate stabilization is needed
- staying in disorder too long without classification

---

## Quick Summary

Use this when the first question is not “what do I do?” but:

**What kind of problem is this?**

Classify the mode first.  
Then choose the correct way to think, act, and escalate.
