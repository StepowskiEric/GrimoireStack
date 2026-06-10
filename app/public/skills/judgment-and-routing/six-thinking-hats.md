# Skill: Six Thinking Hats for AI Agents

## Purpose

Use this skill when the agent must examine a problem, decision, or proposal from multiple perspectives instead of collapsing all reasoning into a single, biased evaluation.

This skill is based on Edward de Bono's *Six Thinking Hats*.

The core insight: most poor decisions come not from lack of information but from thinking modes getting mixed together. A thinker simultaneously expressing caution, optimism, data, and intuition produces conflicted, inconclusive output.

Six Thinking Hats separates these modes so each can do its job fully without being interrupted by the others.

The six hats:
- **White** — facts and data only
- **Red** — intuition, emotion, and gut feeling
- **Black** — caution, risk, and reasons this will not work
- **Yellow** — optimism, value, and reasons this will work
- **Green** — creativity, alternatives, and new possibilities
- **Blue** — process, structure, and what kind of thinking is needed

---

## Core Rule

Do not wear multiple hats at once.

When wearing a hat, stay fully in that mode.
Caution does not belong in the White hat round.
Data does not belong in the Red hat round.
The power of the skill comes from full, uninterrupted engagement with each mode.

---

## When to Use

Use this skill when:
- evaluating a decision that involves multiple stakeholders or perspectives
- reviewing an architecture, design, or plan where both optimism and caution are relevant
- generating alternatives rather than evaluating a single proposal
- reaching an impasse where the team or the agent is stuck in one mode
- needing to balance data-driven analysis with intuitive signals
- preparing a recommendation where one-sided reasoning would undermine trust

Do not use this for:
- trivial, low-stakes decisions that do not need multi-perspective analysis
- urgent incident response where speed matters more than perspective completeness
- routine operational tasks with a clear correct answer

---

## The Six Hats

### White Hat — Information and Data
Wear this hat when thinking only about facts, data, and what is known.

Questions:
- What data do we have?
- What data do we need?
- What is missing from the information picture?
- What is the evidence?

Rules:
- no opinions under the White hat
- no interpretation, just facts and gaps
- note what is not known as well as what is known

---

### Red Hat — Intuition and Emotion
Wear this hat when thinking about intuitive reactions, feelings, and gut signals.

Questions:
- What is my gut reaction to this?
- What does this feel like?
- What concerns me without being able to fully justify?
- What excites me without being able to fully justify?

Rules:
- no data required under the Red hat
- no justification required — these are signals, not conclusions
- capture the reaction honestly even if it cannot be explained yet

---

### Black Hat — Caution and Risk
Wear this hat when thinking only about what could go wrong.

Questions:
- Why might this fail?
- What are the risks?
- What are the weaknesses in this plan or design?
- What assumptions are we making that could be wrong?
- What has gone wrong in similar situations?

Rules:
- the Black hat is not pessimism — it is disciplined caution
- generate the most serious failure modes possible
- do not balance with optimism during this hat — that belongs to Yellow

---

### Yellow Hat — Value and Optimism
Wear this hat when thinking only about what value this delivers and why it could work.

Questions:
- What is the value in this?
- Why might this succeed?
- What are the strongest reasons to proceed?
- What benefits could be realized?
- What opportunities does this create?

Rules:
- the Yellow hat is not blind optimism — it is disciplined benefit analysis
- generate the strongest case for the option, not just the obvious benefits
- do not introduce risk during this hat — that belongs to Black

---

### Green Hat — Creativity and Alternatives
Wear this hat when thinking about new ideas, alternatives, and possibilities.

Questions:
- What other approaches are possible?
- What would we do if the current option were not available?
- What could be different about this?
- What constraints could be relaxed?
- What combination of elements would produce something better?

Rules:
- generate without filtering — the Green hat is the divergent phase
- do not evaluate alternatives during this hat — that belongs to Black and Yellow
- challenge assumptions that have not been challenged yet

---

### Blue Hat — Process and Control
Wear this hat when thinking about how the thinking itself should be organized.

Questions:
- What kind of thinking is needed here?
- What is the goal of this analysis session?
- What hats should be used and in what order?
- What is the summary of thinking so far?
- What is the next step?

Rules:
- the Blue hat is usually used at the start to set up and at the end to summarize
- it can be invoked mid-session to redirect unproductive thinking

---

## Standard Hat Sequence

The most common effective sequence:

1. **Blue** — set the goal and plan the sequence
2. **White** — establish the information foundation
3. **Green** — generate alternatives before evaluating
4. **Yellow** — build the case for each option
5. **Black** — surface risks and weaknesses for each option
6. **Red** — capture intuitive signals after analysis
7. **Blue** — summarize and decide

This sequence is not mandatory. Adjust for the situation.
Common adjustments:
- put Black before Yellow when risks are the primary concern
- add a second Green round after Black to generate solutions to the risks identified
- use only three or four hats for simpler decisions

---

## Six Thinking Hats Analysis Template

```md
## Topic
<decision, proposal, or problem being analyzed>

## Blue Hat (Setup)
- Goal of this analysis:
- Hats to be used and in what order:

## White Hat (Information)
- Facts we have:
  - <fact>
- Data we need but do not have:
  - <gap>

## Red Hat (Intuition)
- Gut reaction:
- What concerns me without full justification:
- What excites me without full justification:

## Black Hat (Caution)
- What could go wrong:
  - <risk>
- Weak assumptions:
  - <assumption>
- Historical failures in similar situations:
  - <pattern>

## Yellow Hat (Value)
- Why this could succeed:
  - <reason>
- Value delivered if successful:
  - <value>
- Strongest case for proceeding:
  - <case>

## Green Hat (Alternatives)
- Alternative approaches:
  - <alternative>
- What could be done differently:
  - <option>
- Constraints worth challenging:
  - <constraint>

## Blue Hat (Summary)
- Summary of thinking:
- Key tensions to resolve:
- Recommendation or next step:
```

---

## Agent Rules

### Do
- fully commit to each hat before moving to the next
- document each hat's output before switching
- treat the Red hat as a legitimate signal, not noise
- use the Blue hat to keep the analysis purposeful

### Do Not
- mix hats within a single analysis phase
- skip Black because it feels pessimistic
- skip Yellow because the option has problems
- treat Red hat reactions as irrational and discard them

---

## Failure Modes This Skill Prevents

### 1) One-mode collapse
The agent defaults to one mode (usually cautious analysis or enthusiastic recommendation) and never genuinely engages the others.

### 2) Argument-as-thinking
The agent frames the analysis as a debate between positions rather than a complete exploration.

### 3) Suppressed intuition
The Red hat surfaces valuable signals that pure data analysis misses. Agents that skip it lose relevant information.

### 4) Premature evaluation
The agent evaluates options before generating alternatives, narrowing the solution space unnecessarily.

---

## Pairing Guide

- **Inversion** — the Black hat can be deepened with formal inversion to produce a failure map
- **Pre-Mortem** — use the Black hat output as input for a pre-mortem's failure story generation
- **First Principles** — use First Principles under the Green hat when alternatives seem exhausted
- **Bounded Self-Revision** — after a Six Hats session, use Bounded Self-Revision on the recommendation output

---

## Definition of Done

Six Thinking Hats was applied correctly when:
- each hat was worn fully and separately
- Black and Yellow were both applied (not skipped)
- the Red hat captured genuine intuitive signals
- the Green hat generated at least one alternative
- the Blue hat summarized and identified the key tensions
- the final recommendation was informed by all relevant hat outputs

---

## Final Instruction

Do not mix the hats.
Do not skip the uncomfortable ones.
Wear each fully.
Then decide.
