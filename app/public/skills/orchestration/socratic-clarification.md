# Skill: Socratic Clarification Protocol for AI Agents

## Purpose

Use this skill when the agent is about to execute an ambiguous or high-stakes task and needs to surface and resolve the most critical unknown assumptions before acting.

The Socratic method — derived from Socrates' practice of asking targeted questions to expose hidden assumptions — applied to agent behavior means:
1. identify what the agent thinks it knows
2. expose what it is actually assuming
3. ask the one most important clarifying question
4. gate action on the answer, or explicitly accept the ambiguity with reasoning

This prevents the most common agent failure mode: confident wrong execution — acting with full competence in the wrong direction because an assumption was wrong and never questioned.

---

## Core Law

An agent that executes brilliantly on a wrong assumption produces worse results than an agent that paused to ask one question.

Do not act on assumptions that, if wrong, would make the entire execution useless or harmful.

---

## Mandatory Diagnostic Artifact

For any task where this skill is invoked, create `clarification-record.md` before acting.

Required structure:

```md
# Clarification Record

## Task as Stated
<exact statement of the task>

## What the Agent Believes It Knows
- <assumption / stated fact>
- <assumption / stated fact>

## What the Agent Is Actually Assuming
- Assumption: <what is believed but not confirmed>
  - If wrong, this would: <consequence of the assumption being false>
  - Verifiable: yes / no / partially
- Assumption: <what is believed but not confirmed>
  ...

## Ranked Critical Assumptions
| Assumption | Consequence If Wrong | Likelihood of Being Wrong | Verifiable? |
|-----------|---------------------|--------------------------|-------------|

## The One Most Critical Clarifying Question
<the single question that, if answered, resolves the most consequential ambiguity>

## Action Gate
<proceed without clarification — ambiguity accepted because: [reason]>
OR
<awaiting clarification on: [question]>

## Resolution
<answer received / ambiguity explicitly accepted / task scope changed>
```

---

## State Machine

## State 0 — Intake

Goal:
- determine whether this task requires clarification before execution

Apply this skill when any of the following is true:
- the task is high-stakes, irreversible, or has a large blast radius
- the task involves an assumption about user intent that has not been explicitly confirmed
- the task has more than one plausible interpretation that would lead to different actions
- the task involves external state changes where being wrong has real consequences

Do not apply when:
- the task is trivially clear and no meaningful ambiguity exists
- the task is explicitly exploratory and the agent is expected to make reasonable assumptions
- the user has explicitly said "use your best judgment" and the stakes are low

Exit condition:
- confirmed that ambiguity is present and consequential enough to warrant clarification

---

## State 1 — Assumption Mapping

Goal:
- make the agent's assumptions explicit

The agent must:
1. write down what it believes it knows (including what was stated vs. inferred)
2. identify which of those beliefs are facts (confirmed) vs. assumptions (inferred or guessed)
3. for each assumption, name the consequence if it is wrong

This is not about generating every conceivable uncertainty.
It is about naming the assumptions that, if wrong, would fundamentally redirect the work.

Questions:
- What am I treating as given that was not explicitly stated?
- What interpretation of the task am I using, and are there other plausible interpretations?
- What does this task implicitly assume about the user's context, intent, or constraints?
- If I am wrong about my central assumption, what would have been better to ask?

Disallowed:
- proceeding to action without completing this map
- listing only the obvious surface assumptions while leaving deeper ones unnamed

Exit condition:
- assumption map is written in `clarification-record.md`
- consequences of each assumption being wrong are named

---

## State 2 — Critical Assumption Ranking

Goal:
- identify the one assumption whose failure would be most harmful

Rank assumptions by:
- **Consequence if wrong**: how badly does this redirect or waste the work?
- **Likelihood of being wrong**: given the task as stated, how plausible is it that this assumption is wrong?
- **Verifiability**: can this be confirmed with a single question?

The highest-priority assumption to clarify is the one combining high consequence × non-trivially likely × resolvable with one question.

Exit condition:
- single highest-priority assumption identified

---

## State 3 — Question Formulation

Goal:
- formulate one targeted, clear, minimal clarifying question

Rules for a good clarifying question:
- addresses exactly the highest-priority assumption
- is specific enough to yield a usable answer
- does not bundle multiple questions together
- does not create more ambiguity than it resolves

Bad example: "Can you clarify what you mean?"
Good example: "When you say 'update the configuration,' does that mean the production config or the staging config?"

Bad example: "What are your goals, priorities, and constraints for this project?"
Good example: "Should this change apply to all users or only to users in the pilot group?"

The agent may ask one follow-up question after the answer if the answer itself creates a new critical ambiguity, but should not cascade into an interrogation.

Exit condition:
- one specific, minimal, answerable clarifying question is formulated

---

## State 4 — Action Gate

Goal:
- decide whether to proceed or wait

**Proceed with clarification:**
Ask the question and wait for an answer before acting.
Required when the highest-priority assumption has high consequence if wrong.

**Proceed with explicit ambiguity acceptance:**
Accept the ambiguity and proceed with stated assumptions when:
- the question cannot be answered in a useful timeframe and delay is costly
- the user has explicitly requested that the agent proceed with its best judgment
- the assumption's consequence if wrong is reversible and the blast radius is small
- the task is exploratory and iteration is expected

When accepting ambiguity: state the assumption explicitly, state the action being taken based on it, and flag what would indicate the assumption was wrong.

**Do not proceed:**
When the task is so underspecified that no assumption is reasonable and proceeding would produce work of near-zero value.

Exit condition:
- gate decision is made and documented

---

## State 5 — Resolution and Execution Unlock

Goal:
- resolve the clarification and unlock execution

If clarification was received:
- update `clarification-record.md` with the answer
- revise the assumption map if the answer changes other assumptions
- proceed to execution

If ambiguity was explicitly accepted:
- document the chosen assumption and the consequence if wrong
- note the signal that would indicate course correction is needed
- proceed to execution

Exit condition:
- clarification record is complete
- execution is unlocked with a clear basis

---

## Tool Gating

### Assumption mapping and question formulation
Allowed:
- read, inspect context
- artifact writing

Disallowed:
- external state changes
- writes to the system being worked on
- irreversible actions

### Post-resolution execution
Allowed:
- the planned work based on the clarified or accepted assumptions

---

## Circuit Breakers

Stop and request human input if:
- the highest-priority assumption cannot be resolved with one question and the consequence of being wrong is severe and irreversible
- the answer to the clarifying question creates a new set of equally critical ambiguities (the task needs re-scoping, not more questions)
- the task, once assumptions are mapped, appears to be a different task than the one described

---

## Failure Modes This Skill Prevents

- confident wrong execution (acting brilliantly in the wrong direction)
- assumption inheritance (carrying forward assumptions from prior context that do not apply)
- question flooding (asking many questions instead of the one most important one)
- ambiguity avoidance (proceeding without acknowledging the assumptions being made)
- silent assumption acceptance (acting on assumptions without stating them, making the logic unauditable)

---

## Definition of Done

This skill was correctly applied when:
- `clarification-record.md` exists
- assumptions were made explicit, not left tacit
- the one most important clarifying question was identified
- either the question was asked and resolved, or the ambiguity was explicitly accepted with stated reasoning
- execution proceeded from a known, documented basis rather than from tacit assumptions

---

## Pairing Guide

- **ETTO** — use ETTO to calibrate how much clarification rigor is warranted before this task
- **Inversion** — after clarification, use inversion to stress-test whether the now-clarified plan has failure modes
- **Pre-Mortem** — the assumption map produced here is direct input for a pre-mortem's failure story generation
- **Checklist Manifesto** — for recurring high-stakes tasks, encode the most critical clarifying questions into the pre-procedure checklist

---

## Final Instruction

One wrong assumption can make perfect execution worthless.

Map the assumptions.
Find the critical one.
Ask the single most important question.
Then act from a known basis.
