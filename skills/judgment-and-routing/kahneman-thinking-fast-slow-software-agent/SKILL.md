---
name: kahneman-thinking-fast-slow-software-agent
description: "Switch between fast pattern recognition and slow deliberation as stakes demand."
triggers:
  - reasoning-mode-switch
  - architectural-decision
  - complex-refactor
  - ambiguous-bug
---

# Thinking Fast and Slow for Software Agents

**Move fast for recognition, slow for commitment.** This skill turns Kahneman’s fast/slow model into an operating discipline: use **fast mode** for cheap pattern recognition and triage, and **slow mode** for anything expensive, irreversible, or ambiguous.

## The Move

### 1. Scout (Fast)
Scan, cluster, and label. Identify smells, likely root causes, and candidate seams for extraction.
- **Output**: Repo map, smells list, unknowns list.
- **Danger**: Overconfidence. Treat the first answer as a hypothesis.

### 2. Switch
Check the **Mode-Switch Rules**:
- **Escalate to Slow if**: multiple plausible causes, multi-module impact, touches auth/security/money/data, or the first fix failed.
- **Stay Fast if**: scope is local, behavior is understood, change is reversible.

### 3. Skeptic (Slow)
Diagnose with evidence. Trace real paths, inspect invariants, and force alternative hypotheses.
- **Output**: Actual problem statement, architectural options, chosen strategy.
- **Guardrail**: Run one **disprover test** for your main hypothesis.

### 4. Surgeon (Execute)
Perform the smallest safe extraction or patch. Prefer reversible, staged refactors using seams, adapters, or facades.

## Reference
For detailed biases (WYSIATI, Anchoring, etc.), the 5-phase application pattern, and refactor standards, see [`references/kahneman-details.md`](references/kahneman-details.md).

## Rules
- **Do** separate generation from judgment (one pass to draft, another to critique).
- **Do** use the **outside view** for estimates (compare to similar past work).
- **Do not** ship the first plausible explanation without a verification pass.
- **Do not** mix behavior changes and structural moves in one opaque diff.
