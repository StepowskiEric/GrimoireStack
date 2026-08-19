---
name: bayesian-updating
description: "Maintain explicit priors updated by likelihood, avoiding over- and under-reaction to new evidence."
triggers:
  - belief-update
  - evidence-evaluation
  - anti-anchoring
  - anti-whiplash
---

# Bayesian Belief Updating

**New evidence does not replace your prior — it updates it.** Hold explicit priors about competing hypotheses, update each by how well it predicted the evidence, and let the strength of the evidence relative to the prior determine how much your belief shifts. This prevents two failure modes: anchoring (stuck on your first guess) and whiplash (flipping on every new data point).

## The Move

### 1. Name hypotheses before gathering evidence
List all plausible explanations. Assign rough confidence: high / medium / low. State the basis for each prior. Do this before looking at any evidence — the moment you see results, confirmation bias starts working.

### 2. Gather evidence
For each observation, ask: **which hypothesis predicted this best?**
- One hypothesis predicted it and others did not → large update toward it.
- Evidence is consistent with several hypotheses → small update, keep them ranked.
- Evidence is neutral (equally likely under all) → no update.

### 3. Update explicitly
After each major piece of evidence, state the new belief state: which hypothesis leads, by how much, and why. A single data point rarely justifies abandoning a prior entirely.

### 4. Name what would change your mind
For the leading hypothesis, write the evidence that would strongly update toward an alternative, and the evidence that would strongly update away from the leader. This is the falsifiability check — if nothing could change your mind, you are defending, not reasoning.

### 5. Act or continue
- One hypothesis clearly dominates and stakes are low → act on it.
- Hypotheses are close or stakes are high → gather one more targeted piece of evidence.
- Evidence is exhausted and uncertainty remains → commit to the leader and name the residual risk.

## Reference
For the prior/likelihood/posterior mechanics table, the debugging pattern, and the full template, see [`references/bayesian-details.md`](references/bayesian-details.md).

## Rules
- **Do** name all plausible hypotheses before seeing evidence.
- **Do** update after each major observation.
- **Do** maintain alternatives until disconfirmed, not just until one is convenient.
- **Do** weigh each observation by how well the hypotheses predicted it.
