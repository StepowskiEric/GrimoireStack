# Skill: Bounded Self-Revision

## Purpose

Use this skill when the agent’s first output is probably improvable, but you want revision to stay disciplined and finite.

This skill is based on the Self-Refine pattern: the same model generates an initial output, critiques it, and improves it iteratively.

The key improvement here is **boundedness**.

Many agents are good at revising once or twice, but bad at stopping.  
This skill keeps revision from turning into:
- endless polish loops
- vague self-criticism
- rewriting without improvement
- “one more pass” forever

---

## Best Use-Cases

Use this skill for:
- writing
- planning
- structured outputs
- explanations
- prompts
- design memos
- decision docs
- summaries
- presentations of complex reasoning

Good fit:
- “This is decent, but it probably needs one or two stronger passes.”
- “Improve clarity, structure, and usefulness without looping forever.”
- “Refine this iteratively, but with explicit stop rules.”

Bad fit:
- tasks that should be externally verified instead of self-polished
- high-risk factual tasks where tool-based critique matters more
- trivial drafts that are already good enough

---

## Core Behavior

The agent should behave like this:

### Step 1: Generate the Initial Output
Produce the first full version.

### Step 2: Generate Focused Feedback
Critique the output along explicit dimensions such as:
- clarity
- correctness of internal logic
- structure
- usefulness
- completeness
- tone
- adherence to constraints
- actionability

### Step 3: Revise
Improve the output using the feedback.

### Step 4: Decide Whether Another Pass Is Worth It
Only continue if another pass is likely to produce a **meaningful** gain.

### Step 5: Stop
Stop when:
- the target quality bar is met
- the revision gain is marginal
- the revision budget is spent
- feedback becomes repetitive
- the output is stable enough for the task

---

## Revision Budget

Default budget:
- **1 initial draft**
- **up to 2 refinement passes**

For most tasks, more than 2 refinement passes should require a clear reason.

The agent should not revise indefinitely just because it can.

---

## Self-Revision Template

```md
## Initial Goal
<what the output needs to do>

## Revision Criteria
- <criterion>
- <criterion>

## Pass 1 Feedback
- Strong:
- Weak:
- Missing:
- Confusing:

## Pass 1 Revision Changes
- <change>

## Pass 2 Feedback
- Strong:
- Weak:
- Still missing:
- Diminishing returns? <yes/no>

## Pass 2 Revision Changes
- <change>

## Final Stop Reason
<quality bar met / budget spent / marginal gains / repetitive feedback>
```

---

## Agent Rules

### Do
- critique against explicit criteria
- keep each revision purposeful
- prefer meaningful improvement over cosmetic churn
- stop when the output is good enough for the real task
- note when further refinement is low-value

### Do Not
- critique vaguely
- revise just to “make it different”
- keep polishing after the gain becomes marginal
- use this as a substitute for external verification when external verification is needed
- confuse instability with improvement

---

## Good Revision Dimensions

Depending on the task, revise for:
- clarity
- structure
- directness
- usefulness
- completeness
- constraint adherence
- consistency
- actionability
- reduced ambiguity
- better chunking / lower cognitive load

---

## Strong Invocation Examples

### Writing
“Use Bounded Self-Revision. Draft this first, critique it for clarity and usefulness, refine it, and stop after the gains become marginal.”

### Planning
“Generate the first plan, then do one or two structured self-revision passes for completeness, sequencing, and actionability.”

### Prompt design
“Write the initial prompt, then self-refine it against precision, clarity, and constraint coverage with a bounded revision budget.”

---

## When to Pair It with Other Skills

Good pairings:
- **Cognitive Load Operator** -> refine for clarity and lower mental burden
- **ETTO** -> decide whether revision effort is worth it
- **Tool-Interactive Critic** -> external critique first, then self-revision
- **Pragmatic Programmer** -> refine an engineering plan without drifting into perfectionism

---

## Stop Conditions

The agent must stop when any of these are true:
- the output now clearly satisfies the task
- the remaining issues are minor
- the last revision produced only cosmetic change
- feedback is becoming repetitive
- the revision budget is exhausted

If the output is still materially weak after the budget is spent, the correct move is:
- escalate
- change strategy
- bring in external critique
- narrow the scope

Not:
- loop forever

---

## Failure Modes This Skill Prevents

- endless self-editing
- perfectionist drift
- vague self-critique with no concrete gains
- rewriting that changes style more than substance
- polishing when a different skill is actually needed

---

## Quick Summary

Use this when the first draft is decent but should improve through one or two structured refinement passes.

Draft it.  
Critique it against real criteria.  
Revise it.  
Stop when the gains flatten.
