---
name: recognition-primed-triage-state-machine
description: "Gated incident-response protocol: recognize the pattern, simulate the first action, act within scope, reassess, hand off."
triggers:
  - urgent-triage
  - incident-response
  - rapid-first-action
  - pattern-recognition-gate
disable-model-invocation: true
---

# Recognition-Primed Triage

**Speed and recklessness are not the same.** In urgent situations, don't compare every option or build decision trees: recognize the situation pattern, pick the first plausible strong action, simulate it mentally, execute if it survives, then reassess. Move fast — through the gates, not around them.

## The Move

### 1. Recognize (Gate 1) — match the pattern, declare confidence
State what the situation resembles, name the diagnostic cues that support it, name at least one alternative pattern and why it was ruled out, and declare confidence: high / medium / low. Low confidence does not block action — it constrains the first action to more reversible options.

### 2. Simulate (Gate 2) — test the first action mentally
For the proposed first action, write: the expected immediate result, what could go wrong, the **failure signal** (what result would prove this action wrong), and its reversibility. Verdict: **Proceed** (safe, bounded, informative) / **Refine** (too broad or risky — narrow it) / **Reject** (likely makes things worse — return to Gate 1 with updated information).

### 3. Act (Gate 3) — execute within declared scope
Do exactly what was declared. Note side observations for Gate 4 without acting on them now. When pattern confidence is low: prefer information-gathering over state changes, prefer reversible actions, keep blast radius small.

### 4. Reassess (Gate 4) — compare actual to expected, decide next
Record the actual result and compare to the Gate 2 prediction. Update the situation model. Then choose consciously:
- **Continue triage** — urgency reduced but not resolved; a second bounded action fits
- **Hand off** — urgency reduced, root cause needs non-triage analysis (the situation moved from Chaotic to Complicated)
- **Escalate** — the action made things worse, the pattern was wrong, or authority beyond your scope is needed

### 5. Hand off — transfer cleanly
When triage is complete, document: current status, what was tried and what happened, best root-cause hypothesis, remaining risks, and the recommended next skill.

## Reference
For the `triage-record.md` template, tool gating per gate, circuit breakers, failure modes, and pairing guide, see [`references/triage-details.md`](references/triage-details.md).

## Rules
- **Do** declare pattern, cues, alternatives, and confidence before any action.
- **Do** simulate before executing — the simulation is the gate.
- **Do** keep the first action bounded, reversible, and information-producing when confidence is low.
- **Do** reassess after every action before the next one.
- **Do** hand off when the situation needs analysis triage is not the right tool for.
