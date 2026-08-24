---
name: advocatus-diaboli
description: "Stress-test a proposal against a separate adversarial sub-agent to break anchoring."
triggers:
  - proposal-stress-test
  - high-stakes-decision
  - anchoring-break
  - adversarial-review
disable-model-invocation: true
---

# Advocatus Diaboli

**Self-critique is not critique.** Anchoring and confirmation bias make the same agent's review systematically weaker than a separate one. This skill uses a **separate sub-agent** in a **fork** context to attack a proposal until only the survivor remains.

## When to Use
- Significant architectural, product, or code decisions.
- When the agent is deeply anchored to a proposal.
- When steelmanning is insufficient and you need a genuinely separate mind.

## The Move

### 1. Crystallize
State the proposal clearly: What, Why, Assumptions, and Tradeoffs. If you can't state it clearly, it's not ready for review.

### 2. Dispatch (Fork)
Invoke a sub-agent with an **adversarial brief**. Always use a **fork** context to prevent shared reasoning.

### 3. Respond
For each challenge from the Diaboli:
- **Accept**: Acknowledge the weakness and adjust.
- **Rebut**: Provide evidence that addresses the challenge.
- **Distinguish**: Show why the challenge applies to a different scenario.

### 4. Synthesize
Produce the refined proposal and measure the **confidence delta** (how much the review changed your certainty).

## Reference
For the 10-category attack framework, full templates, and examples, see [`references/advocatus-diaboli-details.md`](references/advocatus-diaboli-details.md).

## Rules
- **Do** brief the Diaboli on its adversarial posture ("your job is to attack").
- **Do** respond to every challenge explicitly.
- **Do not** have the same agent play both roles.
- **Do not** ignore a challenge because it's uncomfortable.
