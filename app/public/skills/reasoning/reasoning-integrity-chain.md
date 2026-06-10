# Skill: Reasoning Integrity Chain for AI Agents

An escalating 4-phase verification chain that catches all 4 PRISM hallucination types (missing knowledge, knowledge errors, reasoning errors, instruction drift) while converging efficiently. Fuses Faithfulness-Aware Reasoning (logical entailment), Claim Verification Reasoning (atomic decomposition + tool verification), Reasoning Verification Hybrid (backward contradiction + confidence calibration), and Selective Halt Reasoning (convergence detection).

## Purpose

An escalating 4-phase verification chain that catches all 4 PRISM hallucination types (missing knowledge, knowledge errors, reasoning errors, instruction drift). Fuses Faithfulness-Aware Reasoning, Claim Verification Reasoning, Reasoning Verification Hybrid, and Selective Halt Reasoning into one protocol that reduces false positives from ~13.4% to ~4.3% while improving claim accuracy by up to 39.9%.

Running all four phases in sequence:

1. Catch plausible-but-unentailed reasoning (faithfulness check)
2. Decompose into verifiable atoms (claim decomposition)
3. Stress-test conclusions from the opposite direction (backward verification)
4. Halt when reasoning converges (selective halt)

No phase is optional. Each catches failure modes the others miss. Running all four reduces false positives from ~13.4% to ~4.3% while improving claim accuracy by up to 39.9% (CURE, arXiv:2604.12046).

## When to Use

Use this skill when:
- Hallucinations have caused bad outputs before
- Multi-step reasoning where errors compound
- The task requires high-confidence conclusions (code changes, architectural decisions)
- You need to justify conclusions with traceable evidence
- Previous reasoning contained confabulated justifications

When NOT to use:
- Brainstorming or ideation (verification kills creativity)
- Tasks with no verifiable ground truth (opinions, aesthetics)
- Trivial tasks where verification cost exceeds error risk
- Creative writing or speculative exploration

## Phase 1: FAITHFULNESS CHECK

Detect reasoning that sounds plausible but is not logically entailed by premises. Catches reasoning errors (PRISM type 3) and correlation-causation confusion.

1. Extract all premises from the problem statement, prior verified steps, and explicit assumptions
2. For each reasoning step in your chain, check: does it NECESSARILY follow from the stated premises?
3. Flag these patterns:
   - Correlation presented as causation ("A happened before B, so A caused B")
   - Hidden unstated premises required for the conclusion
   - Generalization beyond what premises allow ("this worked once, so it always works")
   - Equivocation (same word, different meanings across steps)
   - False dichotomy (presenting two options when more exist)
4. For each flagged step, decide:
   - REVISE: Add the missing premise or intermediate step, then re-check entailment
   - FLAG: Mark as speculative with reduced confidence (0.3 max)
5. Commit only steps that pass the entailment test: premises → conclusion necessarily follows
6. Record faithfulness score: verified steps / total steps

**Abort rule:** If >50% of steps are flagged speculative, restart reasoning from scratch — the premise set is insufficient.

## Phase 2: CLAIM DECOMPOSITION

Break verified reasoning into atomic falsifiable claims. Assign confidence labels. Verify uncertain claims with tools. Catches knowledge errors and missing evidence (PRISM types 1, 2).

1. After each committed reasoning step, decompose it into atomic claims:
   - One subject, one predicate per claim
   - Each claim must be falsifiable (you could imagine evidence disproving it)
   - Use precise identifiers (file names, line numbers, function names)
2. Assign confidence labels to each claim:
   - CERTAIN: directly observed (read from source, test output, docs)
   - LIKELY: strong indirect evidence
   - UNCERTAIN: weak or incomplete evidence
   - SPECULATIVE: hypothesis, not yet tested
3. For each UNCERTAIN or SPECULATIVE claim, pick a verification action:
   - Code behavior → read_file at specific lines, or run test
   - API behavior → check docs or run experiment
   - Data fact → query database or check data file
   - Performance claim → benchmark or timer
4. Execute verification. Update labels:
   - Verified → upgrade to CERTAIN
   - Falsified → mark FALSE, backtrack to last valid claim, invalidate all descendants
   - Inconclusive → remain UNCERTAIN, record the gap
5. Build dependency graph: track which claims depend on which
6. Downgrade aggregate confidence: conclusion confidence = min(all ancestor claim confidences)

**Rule:** Never proceed on an unverified UNCERTAIN+ claim. If verification is impossible, state the gap explicitly.

## Phase 3: BACKWARD VERIFICATION

Assume the conclusion is wrong. What must be true? Cross-check against forward chain. Catches hidden assumptions and alternative explanations.

1. Take the proposed conclusion from Phase 2
2. Ask: "Assuming this conclusion is WRONG, what would have to be true?"
3. List 2-4 alternative explanations that would also explain the evidence
4. For each alternative:
   - Is it consistent with all verified claims from Phase 2?
   - Can you find evidence that rules it out?
   - If you cannot rule it out, record it as an unresolved alternative
5. Look for hidden assumptions in the forward chain:
   - What did you assume without stating?
   - What would need to be true for your conclusion to be the ONLY explanation?
6. Apply confidence calibration (CAPO, arXiv:2604.12632):
   - Score the conclusion 0-1 based on how well it survived backward scrutiny
   - Score ≥ 0.9: proceed with confidence
   - Score 0.7-0.9: proceed with caveat, note unresolved alternatives
   - Score < 0.7: STOP — verify further or abstain ("I don't have enough evidence to conclude X")
7. Record the backward verification result: which alternatives were ruled out and how

**Abort rule:** If conclusion confidence < 0.7 and no further verification is possible, abstain rather than guess.

## Phase 4: CONVERGENCE HALT

Detect when reasoning has stabilized. Halt early to save tokens and prevent over-elaboration. Based on DASH delta-attention selective halting (arXiv:2604.18103).

1. Define halting criteria before reasoning: what does "done" look like?
   - Root cause identified with specific file/line?
   - Fix proposed and verified?
   - No regressions?
2. After each reasoning step, compute semantic delta:
   - CONCLUSION_CHANGED: new info altered the answer → continue
   - CONFIDENCE_INCREASED: same conclusion, stronger support → continue once more, then re-check
   - NO_CHANGE: same conclusion, same confidence → halt candidate
   - REGRESSION: new info weakens conclusion → backtrack
3. If 3 consecutive NO_CHANGE steps:
   - Review halting criteria
   - All criteria met → HALT immediately
   - Criteria unmet → force a novel action (run test, read new file) — do NOT keep reasoning
4. Confidence threshold halting:
   - confidence > 0.9 AND all criteria met → HALT
   - confidence > 0.7 AND token budget > 80% used → HALT with caveat
   - confidence < 0.5 → continue (never halt on uncertainty)
5. Two reasoning steps are semantically equivalent if they produce the same conclusion, same next action, and same confidence — mere rephrasing counts as NO_CHANGE
6. Two steps are NOT equivalent if one introduces new evidence, changes fix scope, or reveals a new edge case

**Rule:** Never halt on an untested fix. Never halt after only 1 NO_CHANGE. Always force action after 3 consecutive NO_CHANGEs.

## Anti-Patterns

- **Skipping Phase 1 and going straight to claims:** wastes verification budget on unentailed reasoning that should have been revised or flagged first
- **Running Phase 2 on every trivial claim:** only verify UNCERTAIN+ claims — CERTAIN and LIKELY claims don't need tool verification
- **Skipping Phase 3 because "forward chain looks solid":** the Mental-Reality Gap — backward checking catches assumptions forward reasoning hides
- **Halt-checking too early:** premature halting on complex problems — multi-step fixes have lulls between breakthroughs
- **Halt-checking too late:** repeating the same conclusion 5+ times — 3 NO_CHANGEs is the threshold, stop polishing
- **Confidence inflation:** agents overestimate. Force external verification for anything marked ≥ 0.9
- **Graph bloat:** long chains produce huge dependency graphs — compress resolved branches (all CERTAIN) into summary claims
- **False abstention:** marking everything < 0.7 produces paralysis — default to LIKELY (0.75) when evidence is strong but not direct
- **Revising verified-correct claims:** second-system effect — if a claim was verified as correct, do not touch it

## Exit Criteria

The chain is complete when ALL of the following hold:

1. Faithfulness score ≥ 75% (Phase 1: at least 3/4 steps pass entailment)
2. All UNCERTAIN+ claims either verified or explicitly marked as gaps (Phase 2)
3. Backward verification shows conclusion survived scrutiny OR conclusion is marked speculative with documented alternatives (Phase 3)
4. Semantic delta is NO_CHANGE for 3 consecutive steps AND all halting criteria met (Phase 4)
5. Final output includes:
   - Conclusion with confidence level
   - Supporting claims with verification status (tool used, result)
   - Unresolved gaps or flagged speculative steps
   - Alternatives ruled out by backward verification

If any exit criterion cannot be met, output a partial result with explicit uncertainty markers rather than a polished but unfounded conclusion.
