---
name: specter
description: "Abduce the bug — generate competing hypotheses, locate code by structural relationship, then disconfirm until one survivor remains. Use when the crash site is not the cause, the bug is 'weird,' or your first instinct is suspect."
triggers:
  - Multiple plausible causes and your first guess is suspect
  - Crash site is not the root cause (deferred execution, async, state machine)
  - Debugging by reasoning from symptom back to cause
---

# Specter

Abduction, not deduction. Given a symptom, infer the best explanation, then **disconfirm** until one **survivor** remains. Locate code by structural relationship — never by keyword.

## When to Use

- Bug has multiple plausible causes and your first instinct is suspect
- The crash site is not the root cause (deferred execution, async, state machine)
- You've tried the obvious fixes and they're not working
- The bug is "weird" — behavior doesn't match what the code should do

## When NOT to Use

- **Deterministic bug with a reproducing test:** use `debug-subagent` instead
- **Tight tool-call budget (≤25 calls):** the probe loop needs ~10-15 calls before any code change
- **Silent logic error in a single module** (type mismatch, init order): use a simpler debugging skill

## Phase 1 — Hypothesize

Generate 3-5 competing hypotheses. For each:

- **Premise:** "If X was true when Y executed, then Z should follow"
- **Prediction:** observable symptom that distinguishes this from the others
- **Disconfirming condition:** the specific observation that would kill this hypothesis

Rules:
- Include at least one **obvious** and at least one **weird** hypothesis
- Never propose what you *want* to be true
- If all hypotheses look similar, inject a wildcard

**Done when** you have 3-5 hypotheses, each with premise + falsifiable prediction + disconfirming condition, including at least one obvious and one weird.

## Phase 2 — Locate by Structure

For each surviving hypothesis, locate code by **structural relationship**, not keyword:

- **Control flow:** what precedes the bug site?
- **Data flow:** what's the last write to variable X before crash?
- **Call graph:** what calls this, and what does it call?
- **State machine:** what transitions could produce this state?
- **Temporal:** what runs before/after in the event loop?

Ask "what structurally precedes the crash?" — never "grep for this string."

**Done when** each hypothesis points to a specific `file:function` candidate reachable through one of the structural relationships above.

## Phase 3 — Probe & Disconfirm

For each hypothesis:
1. Design a minimal probe (log, assertion, flag) whose predictions for the leading hypotheses diverge under it
2. Run it
3. On contradiction: **disconfirm** — eliminate and update other confidences
4. On confirmation: elevate confidence, then trace forward from the confirmed cause using the structural lens

**Stop when** one hypothesis reaches confidence > 0.85, or all drop below 0.3 (model of the bug is wrong — restart with fresh symptom data).

## Phase 4 — Synthesize

Write the root cause:

```
Root cause:    [concise description]
Location:      [file:line or file:function]
Mechanism:     [how the bug manifests]
Fix:           [what changes and why it works]
Confidence:    [0-100%]
Alternative:   [if I'm wrong, what to check next]
```

**Done when** every field is filled, and `Alternative` names the next hypothesis to test if this fix doesn't land.

## Failure Modes

- **First-branch lock-in:** declaring cause before probes have run — ignoring disconfirming evidence
- **Keyword grep:** finding code that looks right but isn't structurally upstream of the symptom
- **Flat reasoning:** treating hypotheses as equally likely instead of updating confidence from evidence

## Integration

Pair with `trajectory-guard` if you've cycled through >5 hypotheses without convergence (signal: hypothesis-hopping without progress). Pair with `pre-mortem` before committing the fix to confirm it addresses the confirmed cause, not a correlated symptom.

## Rigor — 6-State Protocol

For hard cases where the 4-phase loop converges but you need stronger evidence before committing a fix, load the extended reference. It adds the 6-state abductive protocol with explicit coherence scoring, Inference to Best Explanation (IBE), and discriminatory-test design, plus two critical pitfalls around silent server-side failures in auth flows and `browser_console` eval context mismatches.

## References

- [`references/abductive-reasoning-extended.md`](references/abductive-reasoning-extended.md) — extended 6-state abductive protocol with explanatory coherence scoring, IBE selection logic, discriminatory-test design, and auth/browser-console pitfalls.
