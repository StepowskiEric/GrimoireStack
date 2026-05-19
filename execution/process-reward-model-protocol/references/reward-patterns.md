# Process Reward Patterns — Common Failure Modes and Rewards

Companion reference for `process-reward-model-protocol`. Concrete reward signal patterns for common agent failure modes.

## Reward Signal Catalog

### High-Reward Process Patterns (reward these)

| Pattern | Reward Signal | Why |
|---------|-------------|-----|
| Verifying assumption before acting | +2 | Prevents hallucinated facts from compounding |
| Reading error output before modifying code | +2 | Diagnoses before treating |
| Writing a failing test before fixing | +3 | Test-driven correctness |
| Checking environment health before debugging | +1 | Saves time on env issues |
| Summarizing what was tried before trying again | +2 | Prevents repetition loops |
| Narrowing scope before deep investigation | +1 | Focuses effort |
| Explicitly stating confidence level | +1 | Metacognitive calibration |

### High-Penalty Process Patterns (penalize these)

| Pattern | Penalty Signal | Why |
|---------|---------------|-----|
| Retrying the same command after failure | -3 | Repetition loop |
| Editing code without reading error output | -2 | Guessing blind |
| Adding try/catch to mask an error | -3 | Hiding symptoms |
| Modifying test expectations to make test pass | -4 | Testing the test, not the code |
| Skipping verification step | -2 | Unverified assumptions |
| Over-engineering beyond the request | -1 | Scope creep |
| Claiming completion without running check | -3 | Unverified work |

### Ambiguous Patterns (context-dependent)

| Pattern | When to Reward | When to Penalize |
|---------|---------------|-----------------|
| Asking the user a question | Clarification needed | Question could be answered from context |
| Re-reading a file | Found new relevant section | Same section, same content |
| Adding a comment | Explains non-obvious logic | States what code already says |
| Using any | Quick prototype | Production code |
| Refactoring | Fixes structural issue | Change wasn't requested |

## Step-Level Verification Checklist

Before each reasoning step, check:

```
□ Does this step follow logically from the previous one?
□ Is the evidence I'm using actually available (not assumed)?
□ Am I solving the stated problem or a different one?
□ Would a colleague agree this step is justified?
□ Is this the cheapest way to make progress?
```

## Common Self-Correction Triggers

```
"I'm not sure about this" → VERIFY (don't proceed on uncertainty)
"Let me try again" → DIFFERENT approach (don't retry same method)
"This should work" → PROVE IT (run the test)
"The user probably wants..." → ASK (don't assume)
"I'll also improve..." → STOP (scope creep)
```