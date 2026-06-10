---
name: specter
description: Debug by generating competing hypotheses (abductive reasoning), then locate code structurally — no keyword grepping, no root-cause guessing. Feels like a ghost hunting the real bug.
triggers:
  - Multiple possible causes, unknown root cause
  - Bug crashes at location X but causation is elsewhere
  - Classic "find the bug by reasoning backwards"
  - First instinct is always wrong
---

# Specter

**Biological analog:** A bloodhound that doesn't follow scent — it follows structural proximity. It knows where the bug should logically live before you show it evidence.

## When to Use

- Bug has multiple plausible causes and you don't know which is right
- The crash site is not the root cause (deferred execution, async, state machine)
- You've already tried the obvious fixes and they're not working
- The bug is "weird" — behavior doesn't match what the code should do

## How It Works

### Phase 1 — Abductive Hypothesis Generation

Generate 3-5 competing hypotheses for why the bug occurs. Don't guess — structurally analyze:

```
Hypothesis format:
{
  "label": "H1: State desync",
  "premise": "If X was true when Y executed, then Z should be visible",
  "prediction": "If this is the cause, we should see [observable symptom A]",
  "confidence": 0.7,
  "disconfirming_evidence": "Only fails when [condition], not when [condition]"
}
```

Rules:
- Never propose a hypothesis that matches "what you want to be true"
- Include at least one "obvious" hypothesis and at least one "weird" hypothesis
- Each hypothesis must have a falsifiable prediction

### Phase 2 — Structural Code Location (Logic Locator)

For each hypothesis, locate code by **structural relationship** not keyword:

```
Pattern types:
- Control flow: what precedes the bug site?
- Data flow: what's the last write to variable X before crash?
- Call graph: what functions call this and who calls them?
- State machine: what state transitions could produce this?
- Temporal: what runs before/after in event loop?
```

Logic Locator finds code by asking "what structural relationship would produce this symptom?" not "grep for this string."

### Phase 3 — Probe & Disconfirm

For each hypothesis:
1. Write a minimal probe (log, assertion, flag) that distinguishes H1 from H2
2. Run the probe
3. If result disconfirms: eliminate and update other hypothesis confidences
4. If result confirms: elevate confidence, use Logic Locator to trace forward from the confirmed cause

Stop when one hypothesis has confidence > 0.85 or all are below 0.3 (means the model of the bug is wrong — restart).

### Phase 4 — Synthesize

Write a one-paragraph root cause summary:

```
Root cause: [concise description]
Location: [file:line or file:function]
Mechanism: [how the bug manifests]
Fix: [what needs to change and why it will work]
Confidence: [0-100%]
Alternative: [if I'm wrong, what should we check?]
```

## Anti-Patterns (what Specter prevents)

- **First-branch lock-in:** "I know what caused it" → ignoring disconfirming evidence
- **Keyword-only grep:** Finding code that looks right but isn't the real cause
- **Flat reasoning:** Treating all hypotheses as equally likely instead of updating

## Sub-Agent Contracts

### Abductive Generator
- **Inputs:** bug description, crash site, observed behavior
- **Outputs:** 3-5 structured hypotheses with falsifiable predictions
- **Limits:** If all hypotheses are similar (same shape), inject a "weird" one intentionally

### Logic Locator
- **Inputs:** hypothesis premise, codebase structure
- **Outputs:** file:function locations that fit the structural pattern
- **Limits:** Never grep for keywords; only follow control/data/temporal relationships

### Synthesizer
- **Inputs:** surviving hypothesis + evidence, eliminated hypotheses + why
- **Outputs:** root cause report in Phase 4 format
- **Limits:** If confidence < 0.5, flag as "unknown" rather than guessing

## Integration

Use with `trajectory-guard` to detect when you've been hypothesis-hopping without progress (signal: >5 hypothesis cycles). Use with `pre-mortem` before fixing to validate the proposed fix addresses the real cause.

## Fallback Mode

If no sub-agents available: do the hypothesis generation manually in a scratch file, then use `keyword-agnostic-logic-locator` principles by asking "what structurally precedes the crash?" rather than grepping for keywords.