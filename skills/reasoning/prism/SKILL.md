---
name: prism
description: "Force numeric confidence on each claim, compress to its essence, then verify the compression reconstructs the original."
triggers:
  - Need to verify understanding before acting
  - Need to catch overconfidence or underconfidence
  - Need to distill a complex situation to its core
disable-model-invocation: true
---

# Prism

Three steps. **Calibrate** every claim with numeric confidence and a disconfirming observation. **Compress** to 1-2 sentences. **Verify** the compression reconstructs the original. If any step fails, return to the previous one.

## When to Use

- You have a working hypothesis or plan and want to verify it's sound before committing
- You want to catch overconfidence or underconfidence before acting
- You need to distill a complex situation into its essential structure
- You're about to explain something to someone else and want to ensure you actually understand it

## When NOT to Use

- **Speculative brainstorming.** Prism locks claims to evidence; you need flexibility early.
- **Pure factual lookup.** There's nothing to compress when the answer is a single fact.

## Phase 1 — Calibrate

For each claim, state:

```
Claim:           <the assertion>
Confidence:      <0.0-1.0>
Evidence:        <why you believe this>
Disconfirming:   <what observation would change your mind>
```

Rules:
- Confidence is a probability, not "pretty sure"
- Every claim needs at least one specific disconfirming observation
- When confidence changes, explicitly note the new evidence

**Done when** every claim has numeric confidence, evidence, and a named disconfirming observation. At least one claim should be <0.7.

## Phase 2 — Compress

Take the calibrated claims and compress each:

```
Original (3 paragraphs): "We have a race condition because the async handler doesn't wait for the DB write before responding, causing the client to read stale data."

Compressed (1 sentence): "Race between DB write and HTTP response — client reads before commit."
```

Rules:
- If you can't compress to 1-2 sentences, you don't understand it
- If the compressed version changes the meaning, your original understanding was wrong
- If someone else can't reconstruct the full picture from the compression, the compression is wrong

**Done when** each claim compresses to ≤2 sentences without losing the original meaning.

## Phase 3 — Verify

Run each compressed claim against existing evidence:

```
Compressed: "Race between DB write and HTTP response"
Verification:
- Does the stack trace show async handler with DB write followed by response? YES
- Is there an await missing on the DB call?                  YES
- Could the client receive stale data?                       YES
- Are there other places with the same pattern?              YES (2 handlers)
```

If verification fails at any step: return to Phase 1 with updated claims.

**Done when** every compressed claim passes ≥3 concrete fact checks against the original evidence. Failures trigger Phase 1, not a forced verdict.

## Phase 4 — Output

```
Understanding Summary:
- Core mechanism:        <1-2 sentences>
- Confidence:            <overall 0-100%>
- Evidence:              <top 3 supporting facts>
- Remaining uncertainty: <what you don't know that matters>
- Compression verified:  YES / NO
- If wrong, check:       <what to look at first>
```

**Done when** every field is filled, `Compression verified` matches Phase 3's outcome, and `If wrong, check` names the next claim to test if this one fails.

## Anti-Patterns

- **Pseudo-understanding:** confidently stating something that can't be compressed or verified
- **Confidence inflation:** claiming 0.95 with only anecdotal evidence
- **Dithering:** never committing to a confidence because "it's complicated"

## Integration

Use after `assumption-grounding` to verify assumptions are actually well-grounded. Use before `counterfactual-policy-testing` to ensure your understanding is accurate enough to test alternatives. Use after `specter` to verify the root cause summary before proposing a fix.
