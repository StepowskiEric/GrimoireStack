     1|---
     2|name: claim-verification-reasoning
     3|description: Break reasoning into atomic claims, assign confidence labels, verify uncertain claims with tools, and build dependency graphs to prevent reasoning hallucinations. Based on CURE (arXiv:2604.12046), DCF (arXiv:2604.20098), and PRISM (arXiv:2604.16909).
     4|category: reasoning
     5|tags: [hallucination-prevention, claim-verification, reasoning, confidence-calibration, factuality]
     6|author: Research synthesis
     7|source: arXiv:2604.12046, arXiv:2604.20098, arXiv:2604.16909
     8|date: 2026-04-22
     9|version: 1.0.0
    10|...
    11|
    12|
    13|
    14|---
    15|
    16|# Claim Verification Reasoning
    17|
    18|## When to Use
    19|
    20|Use this skill when:
    21|- The task involves multi-step reasoning where errors compound
    22|- You need to justify conclusions with traceable evidence
    23|- Previous reasoning contained confabulated justifications or unstated assumptions
    24|- The stakes are high enough that unverified claims are dangerous
    25|- Working with code, data, or facts that can be objectively checked
    26|
    27|## When NOT to Use
    28|
    29|- Creative or speculative tasks where all claims are inherently uncertain
    30|- Tasks where verification tools are unavailable (no tests, no source access)
    31|- Brainstorming or exploration phases where premature verification kills ideation
    32|
    33|## The Problem
    34|
    35|LLM reasoning hallucinations come in 4 types (PRISM framework):
    36|1. **Knowledge missing** — claim made without supporting evidence
    37|2. **Knowledge errors** — claim contradicts known facts
    38|3. **Reasoning errors** — conclusion doesn't follow from premises
    39|4. **Instruction-following errors** — drift from the actual task
    40|
    41|Most skills catch type 3 (reasoning errors) via logical entailment checks. This skill catches types 1, 2, and 4 by forcing every claim to be verified against evidence.
    42|
    43|CURE (arXiv:2604.12046) shows that claim-level confidence calibration improves factual accuracy by up to **39.9%**.
    44|
    45|## Core Protocol
    46|
    47|### Step 1 — Decompose into Atomic Claims
    48|
    49|After each reasoning step, break it into atomic claims:
    50|
    51|**Bad (vague):**
    52|```
    53|The bug is probably in the routing module.
    54|```
    55|
    56|**Good (atomic):**
    57|```
    58|Claim A: APIRouter.__init__ sets self.on_startup before super().__init__(). [FACT]
    59|Claim B: Starlette Router.__init__ overwrites self.on_startup when on_startup=None. [FACT]
    60|Claim C: This overwrite causes the handler to be lost. [INFERENCE]
    61|```
    62|
    63|**Rules for atomic claims:**
    64|- Each claim is a single assertion (one subject, one predicate)
    65|- Claims are falsifiable — you could imagine evidence that disproves them
    66|- Claims use precise identifiers (file names, line numbers, function names)
    67|
    68|### Step 2 — Assign Confidence Labels
    69|
    70|For each claim, assign one of:
    71|
    72|| Label | Meaning | Verification Required? |
    73||-------|---------|----------------------|
    74|| **CERTAIN** | Directly observed or provable | No |
    75|| **LIKELY** | Strong indirect evidence | Optional |
    76|| **UNCERTAIN** | Weak or incomplete evidence | **Yes — before proceeding** |
    77|| **SPECULATIVE** | Hypothesis, not yet tested | **Yes — immediately** |
    78|
    79|**Default rule:** If you didn't read it from source code, a test output, or documentation, it's not CERTAIN.
    80|
    81|### Step 3 — Verify UNCERTAIN+ Claims
    82|
    83|For each UNCERTAIN or SPECULATIVE claim, pick a verification action:
    84|
    85|| Claim Type | Verification Action |
    86||-----------|---------------------|
    87|| Code behavior | `read_file` at specific lines, or run a test |
    88|| API behavior | Check documentation or run an experiment |
    89|| Data fact | Query the database or check the data file |
    90|| Performance claim | Run a benchmark or timer |
    91|| Architectural claim | Read the relevant source file |
    92|
    93|**After verification, update the claim:**
    94|- Verified → upgrade to CERTAIN
    95|- Falsified → mark as FALSE, backtrack to last valid claim
    96|- Inconclusive → remain UNCERTAIN, note the gap
    97|
    98|### Step 4 — Build Claim Dependency Graph
    99|
   100|Track which claims depend on which:
   101|
   102|```
   103|Claim A [CERTAIN]: APIRouter sets on_startup before super().__init__()
   104|    └── Claim B [CERTAIN]: Starlette Router.__init__ sets self.on_startup = []
   105|        └── Claim C [INFERENCE]: The handler is overwritten → root cause
   106|            └── Claim D [INFERENCE]: Fix = move assignment after super().__init__()
   107|```
   108|
   109|**Rule:** If any ancestor claim is falsified, all descendants become UNVERIFIED and must be re-evaluated.
   110|
   111|### Step 5 — Report with Confidence
   112|
   113|Final output includes:
   114|1. Conclusion
   115|2. Confidence level (minimum confidence across all supporting claims)
   116|3. List of claims with their verification status
   117|4. Any UNCERTAIN claims that were not verifiable (gaps)
   118|
   119|```
   120|Conclusion: The bug is caused by Starlette overwriting on_startup.
   121|Confidence: CERTAIN
   122|
   123|Supporting claims:
   124|✓ APIRouter sets on_startup before super().__init__() [read_file: routing.py:952]
   125|✓ Starlette Router.__init__ sets self.on_startup = [] [read_file: starlette/routing.py:234]
   126|✓ Therefore handlers are overwritten [logical inference]
   127|
   128|Gaps: None
   129|```
   130|
   131|## Verification Tool Mapping
   132|
   133|| What you need to verify | Tool to use |
   134||------------------------|-------------|
   135|| "Function X does Y" | `read_file` at function definition |
   136|| "Test T fails with error E" | `terminal` running the test |
   137|| "Variable V has value N" | `terminal` with print/debugger |
   138|| "API A returns field F" | `web_extract` on API docs |
   139|| "Database table T has column C" | `terminal` with schema query |
   140|| "Commit C changed file F" | `terminal` with git show/diff |
   141|
   142|## Example: Debugging Session
   143|
   144|**Step 1: Initial hypothesis**
   145|```
   146|Claim: The auth bug is caused by a race condition in useAuth. [SPECULATIVE]
   147|```
   148|→ Must verify. Read useAuth source.
   149|
   150|**Step 2: After reading useAuth**
   151|```
   152|Claim A: useAuth returns loading=true while token is propagating. [CERTAIN — observed]
   153|Claim B: The router redirects based on loading state. [UNCERTAIN — need to check router]
   154|```
   155|→ Verify Claim B. Read router code.
   156|
   157|**Step 3: After reading router**
   158|```
   159|Claim B: The router redirects based on loading state. [CERTAIN — observed]
   160|Claim C: The redirect happens before token arrives. [INFERENCE from A + B]
   161|    └── Depends on A and B. Both CERTAIN → Claim C is LIKELY.
   162|```
   163|
   164|**Step 4: Propose fix**
   165|```
   166|Claim D: Changing router to check !!user instead of loading will fix it. [SPECULATIVE]
   167|```
   168|→ Must verify. Apply fix, run test.
   169|
   170|**Step 5: After test passes**
   171|```
   172|Claim D: Changing router to check !!user fixes the bug. [CERTAIN — test passes]
   173|```
   174|
   175|## Rules
   176|
   177|1. **Never proceed on an UNVERIFIED claim.** If you can't verify, mark it and state the gap.
   178|2. **Downgrade confidence when combining claims.** Two LIKELY claims do not make a CERTAIN conclusion. The conclusion's confidence is the minimum of its ancestors.
   179|3. **Verify the fix, not just the diagnosis.** A root cause claim means nothing if the fix doesn't work.
   180|4. **Keep the dependency graph in working memory.** When a claim is falsified, trace back to invalidate descendants.
   181|5. **Prefer falsifiable claims.** "The bug might be in X" is not a claim. "The bug is in X because Y" is.
   182|
   183|## Research Basis
   184|
   185|- **CURE** (arXiv:2604.12046): Claim-aware reasoning with explicit confidence per claim. Improves claim-level accuracy by up to 39.9% on Biography generation. Enables selective abstention.
   186|- **DCF** (arXiv:2604.20098): Dependency graphs for multi-step reasoning. Joint validation of claims with logical ancestors. 141% improvement in claim retention while maintaining reliability.
   187|- **PRISM** (arXiv:2604.16909): Diagnostic framework disentangling hallucinations into 4 dimensions. Shows mitigation strategies often trade off between dimensions.
   188|
   189|## Pitfalls
   190|
   191|- **Analysis paralysis:** Verifying every claim is expensive. Use the confidence label to focus on UNCERTAIN+ only. CERTAIN and LIKELY claims don't need verification.
   192|- **Circular dependencies:** Claim A depends on B, B depends on A. Break the cycle by finding an external verification point.
   193|- **False certainty:** A claim "verified" by reading the wrong file or misinterpreting output. Always quote the evidence.
   194|- **Graph bloat:** Long reasoning chains produce many claims. Compress resolved branches (all CERTAIN) into a single summary claim to reduce graph size.
   195|- **Over-abstention:** If everything is marked UNCERTAIN, the agent never acts. Default to LIKELY when evidence is strong but not direct.
   196|
   197|## Relationship to Other Skills
   198|
   199|| Skill | What it catches | This skill adds |
   200||-------|----------------|-----------------|
   201|| `faithfulness-aware-reasoning` | Reasoning doesn't follow from premises (type 3) | Types 1, 2, 4: missing knowledge, wrong facts, instruction drift |
   202|| `self-consistency` | Multiple reasoning chains disagree | Single-chain claim verification |
   203|| `cot-pruning-reasoning` | Redundant reasoning steps | Falsifiable claims before pruning |
   204|
   205|**Best used together:** Run `claim-verification` to ensure claims are solid, then `faithfulness-aware` to check entailment, then `cot-pruning` to compress.