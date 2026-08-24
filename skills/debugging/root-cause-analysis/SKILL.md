---
name: root-cause-analysis
description: "Distinguish symptoms from causes, verify causal chains, and fix the underlying defect. Stops recurring regressions caused by workarounds."
triggers:
  - recurring-regression
  - symptom-vs-cause
  - incident-postmortem
  - causal-chain-verification
disable-model-invocation: true
---

# Root Cause Analysis

**Fix the cause, not the workaround — a root cause, once fixed, prevents recurrence.** Before investigating, freeze the exact observable failure. Then gather correlated events exhaustively, trace causes with 5 Whys, and verify the causal chain until fixing X makes the symptom impossible under the same conditions. Stop recurring regressions caused by patch-the-symptom workarounds.

## The Move

### 1. Freeze the symptom
Write down the exact observable failure before speculating: symptom, frequency, first observed, affected scope. If you cannot reproduce or precisely describe it, stop — you are not ready for RCA.

### 2. Gather correlated events
List everything that changed around the symptom: code (deployments, merges, config), infrastructure (scaling, dependencies, cert rotations), data (migrations, imports, feature flags), environment (traffic spikes, cron, clock). Be exhaustive, not selective — the most recent change is often a symptom, not a cause.

### 3. Trace with 5 Whys
For each candidate, ask "Why?" recursively — minimum 3, maximum 7 — until you reach a fixable root cause. Each answer must be a cause, not an excuse or restatement; if branches diverge, explore both; stop at a missing process, incorrect assumption, or code defect. If you hit "human error" or "bad data," ask why the system allowed it. Dead end: "marketing ran a campaign" — the fixable cause was the missing rate limiter. For complex branches, force candidates in each Ishikawa category (people, process, technology, data, environment) before eliminating any.

### 4. Separate root cause from contributing factors
Apply the faithfulness test: **if I fix X, is the symptom impossible under the same conditions?** Yes → root cause (or one of them). No → contributing factor — keep digging.

### 5. Verify the causal chain
Before writing code, state the hypothesis and how to falsify it. Then fix, and confirm recurrence is impossible — not just that the symptom is gone today.

## Reference
For the full 5-Whys rules with worked good/bad examples, the Ishikawa categories, and the failure-mode table, see [`references/root-cause-details.md`](references/root-cause-details.md).

## Rules
- **Do** treat "race condition" as a starting point — analyze the actual interleaving, not the label.
- **Do** cross-check code-debugging runs with the `debug-to-fix-pipeline` (verification phases) and `specter` (hypothesis generation); `verify-before-integrate` guards against fix breakage.
