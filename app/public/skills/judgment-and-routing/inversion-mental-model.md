# Skill: Inversion for AI Agents

## Purpose

Use this skill when the agent needs a stronger way to reason about risks, failure modes, blind spots, or strategy.

Inversion means:
instead of asking only,
- “How do I succeed?”
also ask,
- “How could this fail?”
- “What would make this worse?”
- “What mistakes would create the opposite result?”
- “What conditions would destroy the goal?”

This often reveals problems that forward reasoning misses.

---

## Core Rule

Before recommending a path to success, first model the main paths to failure.

Inversion is especially powerful when:
- the objective is vague
- risks are hidden
- systems are complex
- optimism bias is strong
- the agent is tempted to propose a shiny plan too quickly

---

## When to Use

Use this skill when:
- designing strategy
- reviewing plans
- evaluating systems
- doing risk analysis
- making recommendations under uncertainty
- stress-testing decisions
- planning launches, migrations, rollouts, or workflows
- improving reliability, safety, quality, or trust

---

## Inversion Questions

For any goal, ask:

### Goal inversion
- What would make us fail at this goal?
- What would the opposite of success look like?

### Risk inversion
- What mistakes are most likely?
- What assumptions, if false, would break the plan?

### System inversion
- What interactions could amplify damage?
- What hidden dependencies make this fragile?

### Human inversion
- Where would confusion, overload, delay, or neglect appear?
- What would a rushed or careless operator likely get wrong?

### Process inversion
- What shortcuts would create the worst outcomes?
- What checks are missing?

---

## Standard Inversion Workflow

## Step 1: Define the goal clearly

Example:
- make this process reliable
- choose a good vendor
- improve an onboarding flow
- make this agent trustworthy
- ship a successful launch

---

## Step 2: State the opposite

Ask:
- how would we systematically fail?
- what would sabotage this goal?
- what would create the worst realistic version of the outcome?

---

## Step 3: Generate failure modes

Create a list of:
- direct failures
- indirect failures
- delayed failures
- operator failures
- coordination failures
- measurement failures
- incentive failures

---

## Step 4: Prioritize the failure modes

Rank by:
- likelihood
- severity
- detectability
- reversibility

Do not treat all risks equally.

---

## Step 5: Convert failures into guardrails

For each high-value failure mode, define:
- prevention
- detection
- containment
- rollback or recovery

This is the real output of inversion.

---

## Example Pattern

Goal:
Make this AI workflow trustworthy.

Inversion:
How would I make it untrustworthy?

Possible answers:
- let it act with weak verification
- hide uncertainty
- let it use stale facts
- allow silent assumption jumps
- optimize speed over evidence on high-risk tasks
- give it unclear tool boundaries

Guardrails:
- ETTO preflight
- explicit uncertainty
- evidence thresholds
- tool-scope limits
- validation steps
- rollback rules

---

## Best Use Cases

- safety reviews
- launch planning
- process design
- evaluation design
- incident prevention
- model behavior guardrails
- product strategy
- reliability planning
- hiring/organization decisions
- personal decision support

---

## Failure Modes This Skill Prevents

### 1) Pure optimism
The agent only plans for the happy path.

Counter:
Model concrete ways to fail first.

### 2) Hidden fragility
The agent recommends a plan without stress-testing assumptions.

Counter:
Ask what breaks the plan.

### 3) Shallow risk analysis
The agent names generic risks but does not operationalize them.

Counter:
Convert failure modes into guardrails and detection signals.

### 4) Forward-only reasoning
The agent misses obvious negatives because it only thinks about how to succeed.

Counter:
Use the opposite-outcome lens.

---

## Prompt Snippets

### For strategy
“Use inversion. Do not start by asking how to achieve the goal. First ask how we would fail, what would sabotage success, and what guardrails should block those paths.”

### For safety
“Invert the objective and identify the most likely and most damaging ways this could go wrong. Then turn those into prevention and detection controls.”

### For planning
“Stress-test this plan by reasoning backward from failure.”

### For AI behavior
“List the ways an agent like this would become unreliable, manipulative, brittle, or unsafe, then design the operating rules that prevent that.”

---

## Definition of Done

Inversion was applied correctly when:
- the goal was clearly defined
- meaningful failure modes were generated
- major risks were prioritized
- failure modes were translated into controls
- the final recommendation was stronger because it was stress-tested

---

## Final Instruction

Before you ask how to win, ask how you lose.

Then remove the losing paths.
