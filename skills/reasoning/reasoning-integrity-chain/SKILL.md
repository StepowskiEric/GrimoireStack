---
name: reasoning-integrity-chain
description: "Escalating 4-phase verification chain: faithfulness, claims, backward verification, selective halt."
triggers:
  - multi-step-reasoning-hallucination-risk
  - escalating-verification
disable-model-invocation: true
---

# Reasoning Integrity Chain

**Four phases, no optional phases: entailment, atomization, adversarial scrutiny, and a disciplined stop.** Multi-step reasoning compounds errors; this chain catches all four PRISM hallucination types (missing knowledge, knowledge errors, reasoning errors, instruction drift) while converging efficiently — reduced false positives from ~13.4% to ~4.3% with claim accuracy up to +39.9% (CURE, arXiv:2604.12046). Each phase is a standalone skill; the chain sequences them and sets the gates.

## When to Use
- Hallucinations have caused bad outputs before
- Multi-step reasoning where errors compound
- High-confidence conclusions (code changes, architectural decisions) that need traceable justification
- Previous reasoning contained confabulated justifications

Skip it: brainstorming and ideation (verification kills creativity), tasks with no verifiable ground truth, trivial tasks where verification costs more than the error risk.

## The Move

### 1. Faithfulness — entailment first
Extract premises; for each reasoning step, does the conclusion NECESSARILY follow? Flag correlation-as-causation, hidden premises, over-generalization, equivocation, false dichotomies. REVISE (add the missing premise) or FLAG (confidence 0.3 max). Commit only entailed steps; record faithfulness = verified / total. **Abort: over 50% flagged → restart; the premise set is insufficient.**

### 2. Claims — atomize and verify
Decompose committed steps into atomic falsifiable claims (one subject, one predicate, precise identifiers), label CERTAIN / LIKELY / UNCERTAIN / SPECULATIVE, and verify every UNCERTAIN+ claim with tools (read the file, run the test, check the docs). Verified → CERTAIN; falsified → backtrack and invalidate descendants; inconclusive → record the gap. Never proceed on an unverified UNCERTAIN+ claim. Tool-execution layer: verify with the cheapest tool that can falsify the claim.

### 3. Backward verification — assume it is wrong
Take the conclusion, assume it is WRONG, and list 2–4 alternatives that would also explain the evidence. Rule each out with evidence or record it as unresolved. Hunt hidden assumptions: what would have to be true for your conclusion to be the ONLY explanation? Score survival 0–1: ≥0.9 proceed; 0.7–0.9 proceed with caveat; <0.7 STOP — verify further or abstain. Full protocol: `self-verify-pipeline`.

### 4. Selective halt — stop when it converges
Define halting criteria before reasoning. After each step compute the semantic delta: CONCLUSION_CHANGED → continue; CONFIDENCE_INCREASED → continue once more; NO_CHANGE → halt candidate; REGRESSION → backtrack. Three consecutive NO_CHANGEs: criteria met → HALT; unmet → force a novel action (run a test, read a new file) — never keep reasoning. Never halt on an untested fix; never halt after one NO_CHANGE. Token-efficiency twin: `cot-pruning-reasoning`.

## Confidence calibration
Per-claim confidence 0–1; conclusion confidence = min(ancestor claims). Force external verification for anything ≥0.9 — agents overestimate. Default to LIKELY (0.75) when evidence is strong but indirect — false abstention paralyses.

## Exit criteria
All must hold:
1. Faithfulness ≥ 75% (3/4 steps pass entailment)
2. All UNCERTAIN+ claims verified or explicitly gapped
3. Conclusion survived backward scrutiny, or is marked speculative with documented alternatives
4. NO_CHANGE × 3 with all halting criteria met
5. Output includes: conclusion + confidence, claims with verification status, unresolved gaps, alternatives ruled out

If any criterion fails, output a partial result with explicit uncertainty markers — never a polished but unfounded conclusion.

## Rules
- **Do** compress resolved all-CERTAIN branches into summary claims — graph bloat slows the chain.
- **Do** leave verified-correct claims untouched — the second-system effect rewrites good work.
