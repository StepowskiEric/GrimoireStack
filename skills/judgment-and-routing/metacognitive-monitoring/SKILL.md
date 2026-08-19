---
name: metacognitive-monitoring
description: "Explicit KEEP/WITHDRAW decisions tied to measured withdrawal delta — know when you don't know."
triggers:
  - confidence-calibration
  - know-what-you-dont-know
  - selective-prediction
  - post-answer-audit
---

# Metacognitive Monitoring

**Know when you don't know.** After every significant answer or decision, run two probes — KEEP or WITHDRAW the output, then BET or DECLINE on it — and check them against each other. Over time, track the **withdraw delta** (withdrawal rate on incorrect items minus withdrawal rate on correct items): high delta means selective sensitivity, zero means random withdrawal, negative means you are confident exactly when you are wrong.

## When to Use
- Before committing to any high-stakes code change
- When uncertain but possibly overconfident
- For selective prediction — knowing which outputs to trust
- Building human-AI collaboration interfaces
- Any task where knowing what you don't know matters more than raw accuracy

## The Move

### 1. Generate output
Produce the answer, code, or decision as normal. The output must be complete before any probe.

### 2. Confidence probe — KEEP or WITHDRAW?
Ask: *"If you had to choose between keeping this answer or withdrawing it (and saying 'I don't know'), which would you choose?"* Record the decision, a numeric confidence (0–100), and a rationale: for KEEP, why the answer is likely correct; for WITHDRAW, what uncertainty makes it unreliable and what to do instead (investigate, ask, defer).

### 3. Betting probe — BET or DECLINE?
Ask: *"If this answer being correct was worth $100 and being wrong cost you $100, would you bet on it?"* Record BET (with the stake) or DECLINE (with the specific risk and what information would make you willing to bet). The dollar framing removes cheap confidence.

### 4. Calibration check
Compare the probes:
- KEEP + BET → high-confidence path
- KEEP + DECLINE → confidence mismatch — investigate
- WITHDRAW + BET → fatal mismatch — logic error, restart reasoning
- WITHDRAW + DECLINE → low-confidence path

Assess the pattern: well-calibrated, overconfident, underconfident, or random.

### 5. Resolve
- KEEP + BET, well-calibrated → **PROCEED**
- KEEP + DECLINE or WITHDRAW → **INVESTIGATE** — name the specific gap, the evidence to gather, the alternative to evaluate
- WITHDRAW + BET (fatal mismatch) → **HALT** — the self-assessment itself is broken

## Reference
For worked examples (code change, uncertain diagnosis), the metacognitive tracking log with delta thresholds, and integration notes, see [`references/metacognitive-details.md`](references/metacognitive-details.md).

## Rules
- **Do** be specific about why you are uncertain — vagueness is blanket withdrawal in disguise.
- **Do** keep the confidence score consistent with the betting decision.
- **Do** track the withdraw delta over time — one evaluation proves nothing.
- **Do** honor WITHDRAW decisions even when inconvenient.
- **Do** adjust confidence from feedback; calibration is a learned skill.
