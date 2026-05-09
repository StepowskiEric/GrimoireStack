---
name: claim-verification-reasoning
description: Break reasoning into atomic claims, assign confidence labels, verify uncertain claims with tools, and build dependency graphs to prevent reasoning hallucinations. Based on CURE (arXiv:2604.12046), DCF (arXiv:2604.20098), and PRISM (arXiv:2604.16909).
category: reasoning
tags: [hallucination-prevention, claim-verification, reasoning, confidence-calibration, factuality]
author: Research synthesis
source: arXiv:2604.12046, arXiv:2604.20098, arXiv:2604.16909
date: 2026-04-22
version: 1.0.0
...



---

# Claim Verification Reasoning

## When to Use

Use this skill when:
- The task involves multi-step reasoning where errors compound
- You need to justify conclusions with traceable evidence
- Previous reasoning contained confabulated justifications or unstated assumptions
- The stakes are high enough that unverified claims are dangerous
- Working with code, data, or facts that can be objectively checked

## When NOT to Use

- Creative or speculative tasks where all claims are inherently uncertain
- Tasks where verification tools are unavailable (no tests, no source access)
- Brainstorming or exploration phases where premature verification kills ideation

## The Problem

LLM reasoning hallucinations come in 4 types (PRISM framework):
1. **Knowledge missing** — claim made without supporting evidence
2. **Knowledge errors** — claim contradicts known facts
3. **Reasoning errors** — conclusion doesn't follow from premises
4. **Instruction-following errors** — drift from the actual task

Most skills catch type 3 (reasoning errors) via logical entailment checks. This skill catches types 1, 2, and 4 by forcing every claim to be verified against evidence.

CURE (arXiv:2604.12046) shows that claim-level confidence calibration improves factual accuracy by up to **39.9%**.

## Core Protocol

### Step 1 — Decompose into Atomic Claims

After each reasoning step, break it into atomic claims:

**Bad (vague):**
```
The bug is probably in the routing module.
```

**Good (atomic):**
```
Claim A: APIRouter.__init__ sets self.on_startup before super().__init__(). [FACT]
Claim B: Starlette Router.__init__ overwrites self.on_startup when on_startup=None. [FACT]
Claim C: This overwrite causes the handler to be lost. [INFERENCE]
```

**Rules for atomic claims:**
- Each claim is a single assertion (one subject, one predicate)
- Claims are falsifiable — you could imagine evidence that disproves them
- Claims use precise identifiers (file names, line numbers, function names)

### Step 2 — Assign Confidence Labels

For each claim, assign one of:

| Label | Meaning | Verification Required? |
|-------|---------|----------------------|
| **CERTAIN** | Directly observed or provable | No |
| **LIKELY** | Strong indirect evidence | Optional |
| **UNCERTAIN** | Weak or incomplete evidence | **Yes — before proceeding** |
| **SPECULATIVE** | Hypothesis, not yet tested | **Yes — immediately** |

**Default rule:** If you didn't read it from source code, a test output, or documentation, it's not CERTAIN.

### Step 3 — Verify UNCERTAIN+ Claims

For each UNCERTAIN or SPECULATIVE claim, pick a verification action:

| Claim Type | Verification Action |
|-----------|---------------------|
| Code behavior | `read_file` at specific lines, or run a test |
| API behavior | Check documentation or run an experiment |
| Data fact | Query the database or check the data file |
| Performance claim | Run a benchmark or timer |
| Architectural claim | Read the relevant source file |

**After verification, update the claim:**
- Verified → upgrade to CERTAIN
- Falsified → mark as FALSE, backtrack to last valid claim
- Inconclusive → remain UNCERTAIN, note the gap

### Step 4 — Build Claim Dependency Graph

Track which claims depend on which:

```
Claim A [CERTAIN]: APIRouter sets on_startup before super().__init__()
    └── Claim B [CERTAIN]: Starlette Router.__init__ sets self.on_startup = []
        └── Claim C [INFERENCE]: The handler is overwritten → root cause
            └── Claim D [INFERENCE]: Fix = move assignment after super().__init__()
```

**Rule:** If any ancestor claim is falsified, all descendants become UNVERIFIED and must be re-evaluated.

### Step 5 — Report with Confidence

Final output includes:
1. Conclusion
2. Confidence level (minimum confidence across all supporting claims)
3. List of claims with their verification status
4. Any UNCERTAIN claims that were not verifiable (gaps)

```
Conclusion: The bug is caused by Starlette overwriting on_startup.
Confidence: CERTAIN

Supporting claims:
✓ APIRouter sets on_startup before super().__init__() [read_file: routing.py:952]
✓ Starlette Router.__init__ sets self.on_startup = [] [read_file: starlette/routing.py:234]
✓ Therefore handlers are overwritten [logical inference]

Gaps: None
```

## Verification Tool Mapping

| What you need to verify | Tool to use |
|------------------------|-------------|
| "Function X does Y" | `read_file` at function definition |
| "Test T fails with error E" | `terminal` running the test |
| "Variable V has value N" | `terminal` with print/debugger |
| "API A returns field F" | `web_extract` on API docs |
| "Database table T has column C" | `terminal` with schema query |
| "Commit C changed file F" | `terminal` with git show/diff |

## Example: Debugging Session

**Step 1: Initial hypothesis**
```
Claim: The auth bug is caused by a race condition in useAuth. [SPECULATIVE]
```
→ Must verify. Read useAuth source.

**Step 2: After reading useAuth**
```
Claim A: useAuth returns loading=true while token is propagating. [CERTAIN — observed]
Claim B: The router redirects based on loading state. [UNCERTAIN — need to check router]
```
→ Verify Claim B. Read router code.

**Step 3: After reading router**
```
Claim B: The router redirects based on loading state. [CERTAIN — observed]
Claim C: The redirect happens before token arrives. [INFERENCE from A + B]
└── Depends on A and B. Both CERTAIN → Claim C is LIKELY.
```

**Step 4: Propose fix**
```
Claim D: Changing router to check !!user instead of loading will fix it. [SPECULATIVE]
```
→ Must verify. Apply fix, run test.

**Step 5: After test passes**
```
Claim D: Changing router to check !!user fixes the bug. [CERTAIN — test passes]
```

## Rules

1. **Never proceed on an UNVERIFIED claim.** If you can't verify, mark it and state the gap.
2. **Downgrade confidence when combining claims.** Two LIKELY claims do not make a CERTAIN conclusion. The conclusion's confidence is the minimum of its ancestors.
3. **Verify the fix, not just the diagnosis.** A root cause claim means nothing if the fix doesn't work.
4. **Keep the dependency graph in working memory.** When a claim is falsified, trace back to invalidate descendants.
5. **Prefer falsifiable claims.** "The bug might be in X" is not a claim. "The bug is in X because Y" is.

## Research Basis

- **CURE** (arXiv:2604.12046): Claim-aware reasoning with explicit confidence per claim. Improves claim-level accuracy by up to 39.9% on Biography generation. Enables selective abstention.
- **DCF** (arXiv:2604.20098): Dependency graphs for multi-step reasoning. Joint validation of claims with logical ancestors. 141% improvement in claim retention while maintaining reliability.
- **PRISM** (arXiv:2604.16909): Diagnostic framework disentangling hallucinations into 4 dimensions. Shows mitigation strategies often trade off between dimensions.

## Pitfalls

- **Analysis paralysis:** Verifying every claim is expensive. Use the confidence label to focus on UNCERTAIN+ only. CERTAIN and LIKELY claims don't need verification.
- **Circular dependencies:** Claim A depends on B, B depends on A. Break the cycle by finding an external verification point.
- **False certainty:** A claim "verified" by reading the wrong file or misinterpreting output. Always quote the evidence.
- **Graph bloat:** Long reasoning chains produce many claims. Compress resolved branches (all CERTAIN) into a single summary claim to reduce graph size.
- **Over-abstention:** If everything is marked UNCERTAIN, the agent never acts. Default to LIKELY when evidence is strong but not direct.

## Relationship to Other Skills

| Skill | What it catches | This skill adds |
|-------|----------------|-----------------|
| `faithfulness-aware-reasoning` | Reasoning doesn't follow from premises (type 3) | Types 1, 2, 4: missing knowledge, wrong facts, instruction drift |
| `self-consistency` | Multiple reasoning chains disagree | Single-chain claim verification |
| `cot-pruning-reasoning` | Redundant reasoning steps | Falsifiable claims before pruning |

**Best used together:** Run `claim-verification` to ensure claims are solid, then `faithfulness-aware` to check entailment, then `cot-pruning` to compress.
