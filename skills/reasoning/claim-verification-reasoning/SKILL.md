---
name: claim-verification-reasoning
description: "Atomic decomposition with confidence labels and tool-grounded verification."
triggers:
  - unverified-reasoning-claims
  - atomic-claim-decomposition
  - tool-grounded-verification
disable-model-invocation: true
---

# Claim Verification Reasoning

**Part of the `reasoning-integrity-chain` — Phase 2 (atomize and verify).**

**Every claim gets a label and a source — or it does not proceed.** LLM hallucinations come in four types: missing knowledge, wrong facts, faulty reasoning, and instruction drift. Entailment checks catch only the third. This skill catches all four by decomposing reasoning into atomic, falsifiable claims, labeling their confidence, and verifying every uncertain claim against evidence before building on it.

## When to Use
- Multi-step reasoning where errors compound
- Conclusions need traceable evidence
- Previous reasoning contained confabulated justifications or unstated assumptions
- Stakes are high enough that unverified claims are dangerous
- Working with code, data, or facts that can be objectively checked

Skip it: creative/speculative tasks where all claims are inherently uncertain, tasks without verification tools (no tests, no source access), or brainstorming where premature verification kills ideation.

## The Move

### 1. Decompose into atomic claims
Break each reasoning step into single-assertion, falsifiable claims with precise identifiers: "APIRouter.__init__ sets self.on_startup before super().__init__()" — not "the bug is probably in the routing module." One subject, one predicate, evidence you could imagine disproving it.

### 2. Assign confidence labels
- **CERTAIN** — directly observed or provable; no verification needed
- **LIKELY** — strong indirect evidence; optional
- **UNCERTAIN** — weak or incomplete evidence; **must verify before proceeding**
- **SPECULATIVE** — hypothesis, untested; **must verify immediately**

Default rule: if you did not read it from source, test output, or documentation, it is not CERTAIN.

### 3. Verify UNCERTAIN+ claims
Pick the verification action by claim type: code behavior → read the file at specific lines or run a test; API behavior → docs or an experiment; data fact → query the source; performance → benchmark; architectural → read the source. After verification: upgrade to CERTAIN, mark FALSE and backtrack to the last valid claim, or leave UNCERTAIN and note the gap. The full tool mapping is in Reference.

### 4. Build the claim dependency graph
Track which claims depend on which. The conclusion's confidence is the **minimum across all supporting claims** — two LIKELY claims do not make a CERTAIN conclusion. If any ancestor is falsified, all descendants become UNVERIFIED and must be re-evaluated. Compress resolved all-CERTAIN branches into single summary claims to keep the graph small.

### 5. Report with confidence
Output: the conclusion, its confidence (minimum of supporting claims), the claim list with verification status and quoted evidence, and any unverifiable UNCERTAIN gaps. Verify the fix, not just the diagnosis — a root-cause claim means nothing if the fix does not work.

## Reference
For the verification tier definitions with concrete commands per claim type, the tool mapping, the anchor-store pattern for cross-session consistency, and research basis, see [`references/verification-tiers.md`](references/verification-tiers.md) and [`references/claim-verification-details.md`](references/claim-verification-details.md).

## Rules
- **Do** proceed on an UNVERIFIED claim — never; mark it and state the gap instead.
- **Do** prefer falsifiable claims — "the bug is in X because Y" over "the bug might be in X."
- **Do** quote the evidence for every verification — reading the wrong file is false certainty.
- **Do** downgrade confidence when combining claims — minimum of ancestors, always.
- **Do** verify the fix works, not just that the diagnosis reads well.
