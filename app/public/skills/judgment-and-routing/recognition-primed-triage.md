# Skill: Recognition-Primed Triage

## Purpose

Use this skill when the agent must make a strong **first move** under time pressure, incomplete information, or operational ambiguity.

This skill is based on the idea that in urgent situations, the correct behavior is often **not**:
- compare every possible option
- build a giant decision tree
- keep searching forever

Instead, the agent should:
1. recognize the kind of situation it is in
2. identify the first plausible strong action
3. mentally simulate that action
4. execute only if it survives the simulation
5. reassess quickly

This is a **fast judgment** skill, not a reckless one.

---

## Best Use-Cases

Use this skill for:
- incident triage
- outage response
- fast debugging under pressure
- ops escalation
- urgent prioritization
- choosing the best immediate next move when exhaustive analysis is too slow

Good fit:
- “Something is broken and I need the best next step now.”
- “We cannot fully know everything before acting.”
- “Delay is costly, but a bad move could also make things worse.”

Bad fit:
- deep architecture design
- careful migration planning
- compliance-heavy tasks
- low-urgency work where slower analysis is preferable

---

## Core Behavior

The agent should not try to rank every possible action.

It should:
- match the situation to a known pattern
- choose the first **plausible high-quality move**
- run a quick consequence simulation
- either execute, refine, or reject that move

The goal is to find a **workable move quickly**, not the globally optimal move after endless analysis.

---

## What the Agent Should Look For

### 1. Situation Pattern
Ask:
- What kind of situation is this?
- What does this resemble?
- Is this likely a rollout issue, dependency outage, saturation problem, misconfiguration, stale state, auth break, queue backlog, or something else?

### 2. Diagnostic Cues
What clues matter most?
- recent deploy
- sudden latency spike
- dependency failures
- error pattern
- load pattern
- timing
- user scope
- one service vs many
- local break vs systemic break

### 3. First Plausible Action
Choose one move that is:
- bounded
- likely to improve clarity or stability
- preferably reversible
- appropriate for the urgency

### 4. Mental Simulation
Before acting, ask:
- What do I expect to happen immediately?
- What could go wrong?
- What would prove this action was the wrong move?
- Is it reversible?
- What is my fallback if this fails?

---

## Triage Template

Use this before acting:

```md
## Situation
<what is happening>

## Likely Pattern
<what this resembles>

## Key Cues
- <cue>
- <cue>

## First Plausible Action
<one bounded move>

## Why This Move
<why it fits the pattern>

## Mental Simulation
- Expected immediate result:
- Likely side effects:
- Failure trigger:
- Reversibility:

## Fallback
<next move if this fails>
```

---

## Agent Rules

### Do
- choose one strong next move
- keep scope tight
- prefer reversible actions when possible
- reassess after the first move
- hand off to a slower skill once the situation is stabilized or clarified

### Do Not
- generate an enormous option menu
- mistake triage for full diagnosis
- use this to justify reckless changes
- keep triaging forever when the problem now needs deeper analysis
- act on a move that failed the mental simulation

---

## Good Invocation Examples

### Incident
“Use Recognition-Primed Triage. Identify what kind of incident this resembles, choose the first plausible high-quality response, mentally simulate it, and only then recommend the move.”

### Fast debugging
“Use Recognition-Primed Triage. Do not compare ten theories. Pick the most likely situation pattern, choose one bounded next step, and explain why.”

### Ops response
“Treat this as a triage problem. I need the best immediate move, not a full postmortem.”

---

## When to Switch to Another Skill

Switch away from this skill when:
- the immediate instability is reduced
- the first-response objective is complete
- the problem now requires deep diagnosis
- the situation was not actually urgent
- multiple competing hypotheses remain after the first triage move

Common next skills:
- **How to Solve It** for deeper diagnosis
- **Thinking in Systems** if the issue is systemic
- **Unsafe Control Actions / Hazard Analysis** if the next step has serious downside risk

---

## Failure Modes This Skill Prevents

- analysis paralysis during urgent situations
- endless option generation
- slow response when a strong first move was available
- random action without a quick consequence check
- confusing “I need to act” with “I should act blindly”

---

## Quick Summary

Use this when the agent needs a **strong first move fast**.

Recognize the pattern.  
Choose one plausible action.  
Simulate it.  
Take it if it survives.  
Then reassess.
