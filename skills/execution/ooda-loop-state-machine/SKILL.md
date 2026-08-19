---
name: ooda-loop-state-machine
description: "Observe, Orient, Decide, Act, Loop. Maintains decision tempo against an environment that shifts between every move."
triggers:
  - rapid-environment-change
  - adversarial-pressure
  - decision-tempo
  - degrading-situation
---

# OODA Loop — Rapid Response Protocol

**The agent with the faster, more accurate cycle wins.** Speed without accuracy is recklessness; accuracy without speed loses tempo. Move through the loop faster than the situation deteriorates — but orient correctly, not just react.

## The Move

Each pass is one cycle. Before the first action, create `ooda-cycle-log.md` and update it every cycle (template in Reference).

### 1. Observe — collect raw, unfiltered data
Do not interpret yet. Do not filter to confirm prior beliefs. Capture what IS present, not what is expected. Ask: What signals are present right now? What is changing versus stable? What is absent that should be present?

### 2. Orient — build or update the mental model
The most important phase. Ask: How does what I observed compare to what I expected? What prior assumptions need revision? What hypotheses explain the observations — and which is strongest?
- If two hypotheses explain equally well, record both — do not collapse prematurely.
- Update the mental model explicitly; do not silently carry forward a stale picture.
- If orientation is blocked by missing information, name the gap and decide whether to seek it or act with explicit uncertainty.

### 3. Decide — select one bounded action
- Prefer bounded, reversible, information-producing actions.
- Prefer speed over perfection when the environment degrades faster than analysis can complete.
- If no option dominates, choose the one with the best fallback.
- Deciding to do nothing is a valid choice — name it explicitly.

### 4. Act — execute the scoped action
Hold scope tight. Adjacent observations during action go to the next Observe phase — do not let them derail the current action.

### 5. Re-observe — close the loop
The environment changed. What is different? Is the mission met? Does the loop continue, stop, or escalate?

## Circuit breakers
Stop and reassess if:
- Three consecutive cycles fail to produce convergent orientation
- Actions produce expected effects but the model is not updating
- The situation has moved from fast-moving to stable (use a deeper skill)
- You are looping without learning (same observe → same orient → same decide)

Escalate if:
- Orientation is consistently blocked by ungatherable data
- The environment is escalating faster than the loop can keep up
- The situation requires human judgment or broader authority

## When to stop
- Mission objective is met
- Conditions have stabilized and a slower, deeper skill is now more appropriate
- You have explicit uncertainty that no amount of cycling will resolve

## Rules
- **Do** keep `ooda-cycle-log.md` updated every cycle — the log is the proof the loop ran.
- **Do** name every decision explicitly, including "do nothing."
- **Do** hold Act scope to the decision made in Decide.
- **Do** re-observe after every act; a cycle without fresh observation did not close.

## Reference
For the `ooda-cycle-log.md` template, tool gating per phase, failure modes, and pairing guide, see [`references/ooda-details.md`](references/ooda-details.md).
