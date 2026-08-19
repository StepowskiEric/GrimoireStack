---
name: weak-link-detection-multi-agent
description: "Identify and isolate the weakest reasoning chain in multi-agent outputs before aggregation."
triggers:
  - multi-agent-aggregation
  - quality-variance
  - error-propagation
  - output-consistency
---

# Weak-Link Detection for Multi-Agent Systems

**One bad agent poisons the chain.** Detect the weak link before aggregation amplifies the error; isolate, repair if possible, or exclude.

## The Move

### 1. Collect
Gather raw outputs from all agents. Preserve metadata (confidence, reasoning) without modification.

### 2. Assess
Evaluate each output for internal consistency, evidence quality, and reasoning clarity.

### 3. Score
Calculate a **weakness score** for each agent based on quality, deviation from consensus, and logical flaws.

### 4. Identify
Rank agents by weakness score. If any exceed the threshold, proceed to **Isolate**; otherwise, **Aggregate**.

### 5. Isolate / Aggregate
- **Isolate**: Quarantine weak output. If repairable, send feedback and request revision; if not, exclude.
- **Aggregate**: Combine strong outputs using consensus, voting, or weighted strategies.

## Reference
For detailed state-machine templates, example usage, and pitfalls, see [`references/weak-link-details.md`](references/weak-link-details.md).

## Rules
- **Do** limit repair attempts to prevent infinite loops.
- **Do** document why agents were excluded.
- **Do not** force consensus when legitimate disagreement exists.
- **Do not** over-exclude — diversity matters.
