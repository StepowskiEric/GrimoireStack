     1|---
     2|name: reasoning-verification-hybrid
     3|description: Master anti-hallucination protocol combining claim-level verification, backward contradiction checks, confidence calibration, and logical entailment validation. Catches all 4 hallucination types from PRISM.
     4|category: reasoning
     5|tags: [hallucination-prevention, verification, hybrid, reasoning, factuality, confidence-calibration]
     6|author: Research synthesis
     7|source: arXiv:2604.12046, arXiv:2604.20098, arXiv:2604.16909, arXiv:2601.07199, arXiv:2604.12632, arXiv:2602.05897
     8|date: 2026-04-22
     9|version: 1.0.0
    10|...
    11|
    12|
    13|
    14|---
    15|
    16|# Reasoning Verification Hybrid
    17|
    18|## When to Use
    19|
    20|Use this skill when:
    21|- Hallucinations have caused bad outputs before
    22|- The task requires high-confidence conclusions (code changes, architectural decisions)
    23|- Multi-step reasoning where errors compound across steps
    24|- You need to explain *why* you're confident, not just *that* you're confident
    25|
    26|## When NOT to Use
    27|
    28|- Brainstorming or ideation (verification kills creativity)
    29|- Tasks with no verifiable ground truth (opinions, aesthetics)
    30|- Trivial tasks where the cost of verification exceeds the risk of error
    31|
    32|## Architecture
    33|
    34|```
    35|├── PHASE 1: Claim Decomposition (claim-verification-reasoning)
    36|│   └── Break each step into atomic claims → assign confidence → verify UNCERTAIN+
    37|├── PHASE 2: Backward Contradiction Check (forward-vs-backward reasoning)
    38|│   └── Assume conclusion is wrong → what must be true? → cross-check forward chain
    39|├── PHASE 3: Confidence Calibration (CAPO + CURE)
    40|│   └── Rate confidence 0-1 per claim → <0.7 triggers verification → abstain if unresolved
    41|└── PHASE 4: Logical Entailment Check (faithfulness-aware-reasoning)
    42|    └── Does conclusion follow from verified premises? → detect hidden assumptions
    43|```
    44|
    45|## Phase 1 — Claim Decomposition
    46|
    47|Run `claim-verification-reasoning` protocol:
    48|
    49|1. **Atomic claims:** Each reasoning step becomes 1+ falsifiable claims
    50|2. **Confidence labels:** CERTAIN / LIKELY / UNCERTAIN / SPECULATIVE
    51|3. **Verify UNCERTAIN+:** Use tools (read_file, terminal, web_extract) to check
    52|4. **Dependency graph:** Track which claims depend on which
    53|
    54|**Output:** Verified claim graph with confidence levels.
    55|
    56|## Phase 2 — Backward Contradiction Check
    57|
    58|Run backward reasoning (from Forward vs Backward, arXiv:2601.07199):
    59|
    60|1. Take the proposed conclusion
    61|2. Ask: "Assuming this conclusion is WRONG, what would have to be true?"
    62|3. Check if any of those contradictions exist in the evidence
    63|4. Look for hidden assumptions that weren't stated in forward reasoning
    64|
    65|**Example:**
    66|- Forward: "Bug is in routing.py because handlers are overwritten"
    67|- Backward: "If bug were NOT in routing.py, what else could cause handlers not firing?"
    68|  - Could be: lifespan not triggered, TestClient doesn't run lifespan, handlers are empty lists
    69|- Check each alternative: read TestClient docs, check handler list contents
    70|
    71|**Output:** List of hidden assumptions and alternative explanations considered.
    72|
    73|## Phase 3 — Confidence Calibration
    74|
    75|Run calibration (from CAPO, arXiv:2604.12632 + CURE, arXiv:2604.12046):
    76|
    77|1. **Quantify confidence** for each claim on 0-1 scale
    78|2. **Threshold rule:**
    79|   - ≥ 0.9: Proceed with confidence
    80|   - 0.7-0.9: Proceed with caveat
    81|   - < 0.7: **STOP — verify or abstain**
    82|3. **Abstention option:** "I don't have enough evidence to conclude X"
    83|4. **Aggregate confidence:** Conclusion confidence = min(ancestor claim confidences)
    84|
    85|**Output:** Calibrated confidence score for the conclusion, with explicit gaps.
    86|
    87|## Phase 4 — Logical Entailment Check
    88|
    89|Run `faithfulness-aware-reasoning` protocol:
    90|
    91|1. Check if conclusion is logically entailed by verified premises
    92|2. Detect hidden assumptions (unstated premises required for conclusion)
    93|3. Distinguish correlation from causation
    94|4. Verify no steps confuse "consistent with" for "caused by"
    95|
    96|**Output:** Entailment verdict (ENTAILED / NOT ENTAILED / REQUIRES ASSUMPTION).
    97|
    98|## Integration Rules
    99|
    100|1. **Phase 1 before Phase 4** — entailment checks need verified premises, not speculative ones
   101|2. **Phase 2 runs on conclusion candidates** — only after a candidate conclusion exists
   102|3. **Phase 3 gates action** — don't proceed with fix/implementation if confidence < 0.7
   103|4. **Abort if any phase finds a fatal flaw** — no need to run later phases
   104|5. **Skip Phase 2 for trivial conclusions** — backward check is expensive, use only for non-obvious conclusions
   105|
   106|## Example: Full Task Lifecycle
   107|
   108|**Task:** Debug why Convex Auth returns null after sign-in
   109|
   110|**Phase 1: Claim Decomposition**
   111|```
   112|Claim A [CERTAIN]: getCurrentUser returns null after sign-in [observed]
   113|Claim B [UNCERTAIN]: loading state bundles userLoading + tokenTransition [need check]
   114|Claim C [SPECULATIVE]: useQuery returns undefined while loading [need check]
   115|```
   116|→ Verify B and C: read auth hooks source
   117|
   118|**After verification:**
   119|```
   120|Claim A [CERTAIN]
   121|Claim B [CERTAIN]: loading bundles 3 states [read_file confirmed]
   122|Claim C [CERTAIN]: useQuery returns undefined during loading [read_file confirmed]
   123|Claim D [INFERENCE]: user is null during token propagation [A + B + C → LIKELY]
   124|```
   125|
   126|**Phase 2: Backward Check**
   127|```
   128|Backward: "If user were NOT null during propagation, what would be true?"
   129|  - useQuery would return a user object during loading → FALSE (contradicts C)
   130|  - loading would not include tokenTransition → FALSE (contradicts B)
   131|  - getCurrentUser would wait for token → plausible alternative
   132|→ Check: does getCurrentUser have a retry mechanism? [verified: no]
   133|→ Hidden assumption: user code must handle the loading window
   134|```
   135|
   136|**Phase 3: Confidence Calibration**
   137|```
   138|Root cause confidence: 0.85 (LIKELY → CERTAIN after verification)
   139|Fix confidence: 0.75 (using !!user instead of loading — strong evidence but not tested)
   140|→ Proceed with fix, but run test immediately to upgrade confidence
   141|```
   142|
   143|**Phase 4: Entailment Check**
   144|```
   145|Premises: B + C verified
   146|Conclusion: D (user null during propagation)
   147|Entailment: VALID — follows directly from premises
   148|Hidden assumptions: None found
   149|```
   150|
   151|**Final output:**
   152|```
   153|Conclusion: Auth returns null because loading bundles tokenTransition, making
   154|  user temporarily undefined during token propagation.
   155|Confidence: CERTAIN (after verification)
   156|Fix: Use !!user for UI state; waitForUser checks user?.id && !loadingRef.current
   157|Verification: Test passes after fix
   158|```
   159|
   160|## Expected Improvements
   161|
   162|| Metric | No skill | With hybrid |
   163||--------|----------|-------------|
   164|| False positive rate | 13.4% | ~4.3% (from backward verification) |
   165|| Claim-level accuracy | baseline | +39.9% (from claim-aware calibration) |
   166|| Calibration (AUROC) | baseline | +16.0% (from CURE) |
   167|| Unverified assumptions | unknown | surfaced explicitly |
   168|
   169|## Research Basis
   170|
   171|- **CURE** (arXiv:2604.12046): Claim-aware reasoning with confidence per claim. +39.9% accuracy, +16.0% AUROC.
   172|- **DCF** (arXiv:2604.20098): Dependency graph joint validation. 141% claim retention improvement.
   173|- **PRISM** (arXiv:2604.16909): 4-dimension hallucination taxonomy. Stage-aware diagnosis.
   174|- **Forward vs Backward** (arXiv:2601.07199): Forward improves accuracy (+3.5pp), backward reduces false positives (-9.1pp).
   175|- **CAPO** (arXiv:2604.12632): Calibration-aware policy optimization. +15% calibration, Pareto-optimal precision-coverage.
   176|- **Faithfulness** (arXiv:2602.05897): Logical entailment checking for CoT reasoning.
   177|
   178|## Pitfalls
   179|
   180|- **Over-verification:** Running all 4 phases on every trivial claim is expensive. Use judgment: Phase 1 always, Phase 2 for non-obvious conclusions, Phase 3 for action-gating, Phase 4 for complex entailment.
   181|- **Confidence inflation:** Agents tend to overestimate. Force external verification for anything marked ≥ 0.9.
   182|- **Backward check fatigue:** Phase 2 requires creativity. If stuck, skip it rather than generate weak alternatives.
   183|- **Graph explosion:** Long chains produce huge dependency graphs. Compress verified branches into summary claims.
   184|- **False abstention:** Marking everything < 0.7 produces paralysis. Default to LIKELY (0.75) when evidence is strong.
   185|
   186|## Relationship to Other Skills
   187|
   188|| Skill | Role in hybrid |
   189||-------|---------------|
   190|| `claim-verification-reasoning` | Phase 1 — atomic claims + verification |
   191|| `faithfulness-aware-reasoning` | Phase 4 — logical entailment |
   192|| `cot-pruning-reasoning` | Post-hoc — compress verified reasoning |
   193|| `selective-halt-reasoning` | Post-hoc — stop when converged |
   194|| `context-lifecycle-manager` (absorbs token-budget-operator) | Orchestration — manage context + budget + decay + pruning |
   195|
   196|**Recommended stack for critical tasks:**
   197|```
   198|1. context-lifecycle-manager (compress context + manage budget + decay + pruning)
   199|2. reasoning-verification-hybrid (verify claims + check entailment)
   200|3. cot-pruning-reasoning (compress verified output)
   201|```
   202|