---
name: prism
description: Force explicit confidence calibration (metacognitive monitoring), then verify your understanding by compressing it to its essence. If you can't compress it, you don't understand it.
triggers:
  - Complex problem, want to verify understanding before acting
  - Agent confidently says something that feels wrong
  - Need to reduce a complex situation to its core
  - "I'm not sure if I really understand this or just think I do"
---

# Prism

**Biological analog:** A prism separates white light into its component wavelengths. Prism separates a complex understanding into its irreducible components — if you can't name the colors, you don't know what's in the light.

## When to Use

- You have a working hypothesis or plan and want to verify it's sound before committing
- You want to catch overconfidence or underconfidence before acting
- You need to distill a complex situation into its essential structure
- You're about to explain something to someone else and want to ensure you actually understand it

## How It Works

### Phase 1 — Confidence Calibration (Metacognitive Monitoring)

Explicitly state your confidence on each claim:

```
Claim: "The bug is in the auth token validation"
Confidence: 0.85
Evidence: [why you believe this]
Disconfirming: [what would make you change your mind]
```

Rules:
- Confidence is a probability, not a vague "pretty sure"
- Include at least one specific disconfirming observation for each claim
- When confidence changes, explicitly note the new evidence that caused the update

### Phase 2 — Compression Test

Take the calibrated claims and compress them:

```
Original (3 paragraphs): "We have a race condition because the async handler doesn't wait for the DB write before responding, causing the client to read stale data."
Compressed (1 sentence): "Race between DB write and HTTP response — client reads before commit."
```

Rules:
- If you can't compress to 1-2 sentences, you don't understand it
- If the compressed version changes the meaning, your original understanding was wrong
- If someone else can't reconstruct the full picture from the compression, the compression is wrong

### Phase 3 — Verification

Run the compressed understanding against existing evidence:

```
Compressed: "Race between DB write and HTTP response"
Verification:
- Does crash stack show async handler with DB write followed by response? YES
- Is there an await missing on the DB call? YES
- Could the client receive stale data? YES
- Are there other places with same pattern? YES (2 other handlers)
```

If verification fails at any step: return to Phase 1 with updated claims.

### Phase 4 — Output

```
Understanding Summary:
- Core mechanism: [1-2 sentences]
- Confidence: [overall 0-100%]
- Evidence: [top 3 supporting facts]
- Remaining uncertainty: [what you don't know that matters]
- Compression verified: YES/NO
- If wrong, check: [what to look at first]
```

## Anti-Patterns (what Prism prevents)

- **Pseudo-understanding:** confidently stating something that can't be compressed or verified
- **Confidence inflation:** claiming 0.95 when you only have anecdotal evidence
- **Dithering:** never committing to a confidence level because "it's complicated"

## Sub-Agent Contracts

### Confidence Calibrator
- **Inputs:** raw claim or hypothesis
- **Outputs:** structured confidence claim with disconfirming evidence
- **Limits:** Must use numeric confidence, not "likely"/"possible"

### Compressor
- **Inputs:** calibrated claims
- **Outputs:** 1-2 sentence compression + verification check
- **Limits:** Cannot skip verification; if compression is empty, report failure

### Verifier
- **Inputs:** compression + original claims
- **Outputs:** verification result with specific evidence check
- **Limits:** Must test against at least 3 concrete facts from the original

## Integration

Use after `assumption-grounding` to verify assumptions are actually well-grounded. Use before `counterfactual-policy-testing` to ensure your understanding of the problem is accurate enough to test alternatives. Use after `abductive-debugging` or `specter` to verify the root cause summary before proposing a fix.

## Fallback Mode

If sub-agents unavailable: do the calibration manually in scratch — write each claim with a confidence number and a disconfirming observation. Then try to explain it to yourself in 2 sentences. If you can't, you don't understand it.