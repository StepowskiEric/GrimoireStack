     1|---
     2|name: Self-Verify Pipeline
     3|description: "Fuse of Bounded Self-Revision + Tool Interactive Critic + Claim Verification Reasoning. An escalating verification chain: internal critique, claim decomposition, external tool verification."
     4|...
     5|
     6|
     7|
     8|---
     9|
    10|## Self-Verify Pipeline
    11|
    12|An escalating 5-phase verification pipeline for any agent output. Each phase increases cost but catches different failure modes.
    13|
    14|Fuses Bounded Self-Revision (internal critique), Claim Verification Reasoning (atomic claim decomposition), and Tool Interactive Critic (external tool-grounded verification).
    15|
    16|### Phase 1: DRAFT
    17|
    18|Generate the initial output. No verification yet — focus on completeness.
    19|
    20|- Write the code, answer, analysis, or plan
    21|- Include your reasoning (this gives Phase 2 something to critique)
    22|
    23|### Phase 2: SELF-CRITIQUE
    24|
    25|Internal review against explicit dimensions. Maximum 2 revision passes.
    26|
    27|**Critique dimensions** (check all that apply):
    28|
    29|For CODE:
    30|- [ ] Does it handle the error case?
    31|- [ ] Does it handle the empty/zero/null case?
    32|- [ ] Are types correct at all boundaries?
    33|- [ ] Does it match the stated requirement exactly?
    34|- [ ] Is there anything here that wasn't asked for?
    35|
    36|For ANALYSIS/ANSWERS:
    37|- [ ] Does every claim have supporting evidence?
    38|- [ ] Are there unstated assumptions?
    39|- [ ] Could the opposite conclusion also be argued?
    40|- [ ] Are confidence levels appropriate?
    41|
    42|For PLANS:
    43|- [ ] Does each step have a clear verification criterion?
    44|- [ ] Are dependencies between steps explicit?
    45|- [ ] Is there a rollback plan?
    46|
    47|**Rules:**
    48|- Revise up to 2 times maximum
    49|- Stop revising when gains flatten (no change between passes)
    50|- Do NOT use external tools in this phase — internal judgment only
    51|
    52|### Phase 3: CLAIM DECOMPOSE
    53|
    54|Break the output into atomic verifiable claims.
    55|
    56|1. Extract every factual assertion from the output
    57|2. For each claim, assign:
    58|   - **Confidence:** high / medium / low
    59|   - **Verifiable:** can this be checked with a tool?
    60|   - **Impact:** if wrong, how much does it matter?
    61|3. Flag claims that are: low confidence OR high impact
    62|4. Select the top 3-5 flagged claims for external verification
    63|
    64|**Output:** A list of claims with confidence/verifiable/impact ratings.
    65|
    66|### Phase 4: TOOL-VERIFY
    67|
    68|Externally verify flagged claims using the cheapest available tool.
    69|
    70|| Claim type | Verification tool |
    71||-----------|-------------------|
    72|| Code behavior | Run tests, type checker, linter |
    73|| API contract | Read actual code, run type checker |
    74|| File existence | search_files or read_file |
    75|| Dependency | Check package.json, import statements |
    76|| Performance | Benchmark or profile |
    77|| Security | Static analysis, grep for patterns |
    78|
    79|**Rules:**
    80|- Only verify flagged claims (not everything)
    81|- Use the cheapest tool first
    82|- Record evidence: what tool, what query, what result
    83|- If verification fails, note the specific contradiction
    84|
    85|### Phase 5: FINAL REVISION
    86|
    87|Revise ONLY where tool-grounded evidence demands it.
    88|
    89|- If a claim was verified as wrong → fix it and re-check dependent claims
    90|- If a claim was verified as correct → do not touch it (resist the urge to "improve" verified output)
    91|- If verification was inconclusive → mark the claim as uncertain in the output
    92|
    93|**Final output format:**
    94|- The revised output
    95|- List of verified claims (tool used, result)
    96|- List of unverifiable claims (reason)
    97|- Overall confidence assessment
    98|
    99|### When to Use
   100|
   101|- Before committing code changes
   102|- Before presenting analysis to humans
   103|- For any high-stakes output (security, architecture, migration plans)
   104|- When the output will be used as input to another task
   105|
   106|### Anti-Patterns
   107|
   108|- Skipping Phase 2 and going straight to tools (wastes tool budget on obvious errors)
   109|- Running Phase 2 indefinitely (2 passes max — diminishing returns)
   110|- Verifying every claim instead of flagged ones (waste of tokens)
   111|- Revising verified-correct claims (second-system effect)
   112|- Skipping Phase 4 because "Phase 2 looked good" (the Mental-Reality Gap)
   113|