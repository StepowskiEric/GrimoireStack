---
name: reasoning-verification-hybrid
description: Master anti-hallucination protocol combining claim-level verification, backward contradiction checks, confidence calibration, and logical entailment validation. Catches all 4 hallucination types from PRISM.
category: reasoning
tags: [hallucination-prevention, verification, hybrid, reasoning, factuality, confidence-calibration]
author: Research synthesis
source: arXiv:2604.12046, arXiv:2604.20098, arXiv:2604.16909, arXiv:2601.07199, arXiv:2604.12632, arXiv:2602.05897
date: 2026-04-22
version: 1.0.0
...



---

# Reasoning Verification Hybrid

## When to Use

Use this skill when:
- Hallucinations have caused bad outputs before
- The task requires high-confidence conclusions (code changes, architectural decisions)
- Multi-step reasoning where errors compound across steps
- You need to explain *why* you're confident, not just *that* you're confident

## When NOT to Use

- Brainstorming or ideation (verification kills creativity)
- Tasks with no verifiable ground truth (opinions, aesthetics)
- Trivial tasks where the cost of verification exceeds the risk of error

## Architecture

```
├── PHASE 1: Claim Decomposition (claim-verification-reasoning)
│   └── Break each step into atomic claims → assign confidence → verify UNCERTAIN+
├── PHASE 2: Backward Contradiction Check (forward-vs-backward reasoning)
│   └── Assume conclusion is wrong → what must be true? → cross-check forward chain
├── PHASE 3: Confidence Calibration (CAPO + CURE)
│   └── Rate confidence 0-1 per claim → <0.7 triggers verification → abstain if unresolved
└── PHASE 4: Logical Entailment Check (faithfulness-aware-reasoning)
    └── Does conclusion follow from verified premises? → detect hidden assumptions
```

## Phase 1 — Claim Decomposition

Run `claim-verification-reasoning` protocol:

1. **Atomic claims:** Each reasoning step becomes 1+ falsifiable claims
2. **Confidence labels:** CERTAIN / LIKELY / UNCERTAIN / SPECULATIVE
3. **Verify UNCERTAIN+:** Use tools (read_file, terminal, web_extract) to check
4. **Dependency graph:** Track which claims depend on which

**Output:** Verified claim graph with confidence levels.

## Phase 2 — Backward Contradiction Check

Run backward reasoning (from Forward vs Backward, arXiv:2601.07199):

1. Take the proposed conclusion
2. Ask: "Assuming this conclusion is WRONG, what would have to be true?"
3. Check if any of those contradictions exist in the evidence
4. Look for hidden assumptions that weren't stated in forward reasoning

**Example:**
- Forward: "Bug is in routing.py because handlers are overwritten"
- Backward: "If bug were NOT in routing.py, what else could cause handlers not firing?"
  - Could be: lifespan not triggered, TestClient doesn't run lifespan, handlers are empty lists
- Check each alternative: read TestClient docs, check handler list contents

**Output:** List of hidden assumptions and alternative explanations considered.

## Phase 3 — Confidence Calibration

Run calibration (from CAPO, arXiv:2604.12632 + CURE, arXiv:2604.12046):

1. **Quantify confidence** for each claim on 0-1 scale
2. **Threshold rule:**
   - ≥ 0.9: Proceed with confidence
   - 0.7-0.9: Proceed with caveat
   - < 0.7: **STOP — verify or abstain**
3. **Abstention option:** "I don't have enough evidence to conclude X"
4. **Aggregate confidence:** Conclusion confidence = min(ancestor claim confidences)

**Output:** Calibrated confidence score for the conclusion, with explicit gaps.

## Phase 4 — Logical Entailment Check

Run `faithfulness-aware-reasoning` protocol:

1. Check if conclusion is logically entailed by verified premises
2. Detect hidden assumptions (unstated premises required for conclusion)
3. Distinguish correlation from causation
4. Verify no steps confuse "consistent with" for "caused by"

**Output:** Entailment verdict (ENTAILED / NOT ENTAILED / REQUIRES ASSUMPTION).

## Integration Rules

1. **Phase 1 before Phase 4** — entailment checks need verified premises, not speculative ones
2. **Phase 2 runs on conclusion candidates** — only after a candidate conclusion exists
3. **Phase 3 gates action** — don't proceed with fix/implementation if confidence < 0.7
4. **Abort if any phase finds a fatal flaw** — no need to run later phases
5. **Skip Phase 2 for trivial conclusions** — backward check is expensive, use only for non-obvious conclusions

## Example: Full Task Lifecycle

**Task:** Debug why Convex Auth returns null after sign-in

**Phase 1: Claim Decomposition**
```
Claim A [CERTAIN]: getCurrentUser returns null after sign-in [observed]
Claim B [UNCERTAIN]: loading state bundles userLoading + tokenTransition [need check]
Claim C [SPECULATIVE]: useQuery returns undefined while loading [need check]
```
→ Verify B and C: read auth hooks source

**After verification:**
```
Claim A [CERTAIN]
Claim B [CERTAIN]: loading bundles 3 states [read_file confirmed]
Claim C [CERTAIN]: useQuery returns undefined during loading [read_file confirmed]
Claim D [INFERENCE]: user is null during token propagation [A + B + C → LIKELY]
```

**Phase 2: Backward Check**
```
Backward: "If user were NOT null during propagation, what would be true?"
  - useQuery would return a user object during loading → FALSE (contradicts C)
  - loading would not include tokenTransition → FALSE (contradicts B)
  - getCurrentUser would wait for token → plausible alternative
→ Check: does getCurrentUser have a retry mechanism? [verified: no]
→ Hidden assumption: user code must handle the loading window
```

**Phase 3: Confidence Calibration**
```
Root cause confidence: 0.85 (LIKELY → CERTAIN after verification)
Fix confidence: 0.75 (using !!user instead of loading — strong evidence but not tested)
→ Proceed with fix, but run test immediately to upgrade confidence
```

**Phase 4: Entailment Check**
```
Premises: B + C verified
Conclusion: D (user null during propagation)
Entailment: VALID — follows directly from premises
Hidden assumptions: None found
```

**Final output:**
```
Conclusion: Auth returns null because loading bundles tokenTransition, making
  user temporarily undefined during token propagation.
Confidence: CERTAIN (after verification)
Fix: Use !!user for UI state; waitForUser checks user?.id && !loadingRef.current
Verification: Test passes after fix
```

## Expected Improvements

| Metric | No skill | With hybrid |
|--------|----------|-------------|
| False positive rate | 13.4% | ~4.3% (from backward verification) |
| Claim-level accuracy | baseline | +39.9% (from claim-aware calibration) |
| Calibration (AUROC) | baseline | +16.0% (from CURE) |
| Unverified assumptions | unknown | surfaced explicitly |

## Research Basis

- **CURE** (arXiv:2604.12046): Claim-aware reasoning with confidence per claim. +39.9% accuracy, +16.0% AUROC.
- **DCF** (arXiv:2604.20098): Dependency graph joint validation. 141% claim retention improvement.
- **PRISM** (arXiv:2604.16909): 4-dimension hallucination taxonomy. Stage-aware diagnosis.
- **Forward vs Backward** (arXiv:2601.07199): Forward improves accuracy (+3.5pp), backward reduces false positives (-9.1pp).
- **CAPO** (arXiv:2604.12632): Calibration-aware policy optimization. +15% calibration, Pareto-optimal precision-coverage.
- **Faithfulness** (arXiv:2602.05897): Logical entailment checking for CoT reasoning.

## Pitfalls

- **Over-verification:** Running all 4 phases on every trivial claim is expensive. Use judgment: Phase 1 always, Phase 2 for non-obvious conclusions, Phase 3 for action-gating, Phase 4 for complex entailment.
- **Confidence inflation:** Agents tend to overestimate. Force external verification for anything marked ≥ 0.9.
- **Backward check fatigue:** Phase 2 requires creativity. If stuck, skip it rather than generate weak alternatives.
- **Graph explosion:** Long chains produce huge dependency graphs. Compress verified branches into summary claims.
- **False abstention:** Marking everything < 0.7 produces paralysis. Default to LIKELY (0.75) when evidence is strong.

## Relationship to Other Skills

| Skill | Role in hybrid |
|-------|---------------|
| `claim-verification-reasoning` | Phase 1 — atomic claims + verification |
| `faithfulness-aware-reasoning` | Phase 4 — logical entailment |
| `cot-pruning-reasoning` | Post-hoc — compress verified reasoning |
| `selective-halt-reasoning` | Post-hoc — stop when converged |
| `token-budget-operator` | Orchestration — manage context + budget |

**Recommended stack for critical tasks:**
```
1. token-budget-operator (compress context)
2. reasoning-verification-hybrid (verify claims + check entailment)
3. cot-pruning-reasoning (compress verified output)
```
