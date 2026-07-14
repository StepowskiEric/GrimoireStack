---
name: adversarial-review
description: "Stress-test proposals against a separate adversarial subagent. Tool-mediated review with no prior investment."
triggers:
  - Need to stress-test a plan, design, or proposal
  - Self-critique is insufficient — need a genuinely separate perspective
  - High-stakes decision where anchoring to original reasoning is a risk
---

# Adversarial Review

Stress-test proposals against a separate adversarial subagent. Not self-critique — tool-mediated review with no prior investment.

## Core Protocol

### Phase 1: Prepare the Proposal

Write the proposal, plan, or code change as a self-contained document. Include the goal, approach, tradeoffs, and expected outcomes.

**Done when:** the proposal is documented and ready for review.

### Phase 2: Spawn Adversarial Subagent

Spawn a separate subagent with instructions to find every weakness in the proposal. The subagent must have no prior context about the proposal's development.

**Done when:** adversarial subagent has returned its findings.

### Phase 3: Integrate Findings

Review each finding. For each:
- If valid, update the proposal
- If invalid, document why it was rejected
- If unclear, ask the user

**Done when:** all findings are addressed or explicitly deferred.

## Failure Modes

- **Self-critique masquerading as adversarial review:** the same agent arguing against itself lacks genuine separation
- **Anchoring:** providing the adversarial subagent with too much context about the proposal's development
- **Dismissing valid criticism:** rejecting findings because they conflict with prior investment
