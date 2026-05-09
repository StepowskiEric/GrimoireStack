---
name: Self-Verify Pipeline
description: "Fuse of Bounded Self-Revision + Tool Interactive Critic + Claim Verification Reasoning. An escalating verification chain: internal critique, claim decomposition, external tool verification."
...



---

## Self-Verify Pipeline

An escalating 5-phase verification pipeline for any agent output. Each phase increases cost but catches different failure modes.

Fuses Bounded Self-Revision (internal critique), Claim Verification Reasoning (atomic claim decomposition), and Tool Interactive Critic (external tool-grounded verification).

### Phase 1: DRAFT

Generate the initial output. No verification yet — focus on completeness.

- Write the code, answer, analysis, or plan
- Include your reasoning (this gives Phase 2 something to critique)

### Phase 2: SELF-CRITIQUE

Internal review against explicit dimensions. Maximum 2 revision passes.

**Critique dimensions** (check all that apply):

For CODE:
- [ ] Does it handle the error case?
- [ ] Does it handle the empty/zero/null case?
- [ ] Are types correct at all boundaries?
- [ ] Does it match the stated requirement exactly?
- [ ] Is there anything here that wasn't asked for?

For ANALYSIS/ANSWERS:
- [ ] Does every claim have supporting evidence?
- [ ] Are there unstated assumptions?
- [ ] Could the opposite conclusion also be argued?
- [ ] Are confidence levels appropriate?

For PLANS:
- [ ] Does each step have a clear verification criterion?
- [ ] Are dependencies between steps explicit?
- [ ] Is there a rollback plan?

**Rules:**
- Revise up to 2 times maximum
- Stop revising when gains flatten (no change between passes)
- Do NOT use external tools in this phase — internal judgment only

### Phase 3: CLAIM DECOMPOSE

Break the output into atomic verifiable claims.

1. Extract every factual assertion from the output
2. For each claim, assign:
   - **Confidence:** high / medium / low
   - **Verifiable:** can this be checked with a tool?
   - **Impact:** if wrong, how much does it matter?
3. Flag claims that are: low confidence OR high impact
4. Select the top 3-5 flagged claims for external verification

**Output:** A list of claims with confidence/verifiable/impact ratings.

### Phase 4: TOOL-VERIFY

Externally verify flagged claims using the cheapest available tool.

| Claim type | Verification tool |
|-----------|-------------------|
| Code behavior | Run tests, type checker, linter |
| API contract | Read actual code, run type checker |
| File existence | search_files or read_file |
| Dependency | Check package.json, import statements |
| Performance | Benchmark or profile |
| Security | Static analysis, grep for patterns |

**Rules:**
- Only verify flagged claims (not everything)
- Use the cheapest tool first
- Record evidence: what tool, what query, what result
- If verification fails, note the specific contradiction

### Phase 5: FINAL REVISION

Revise ONLY where tool-grounded evidence demands it.

- If a claim was verified as wrong → fix it and re-check dependent claims
- If a claim was verified as correct → do not touch it (resist the urge to "improve" verified output)
- If verification was inconclusive → mark the claim as uncertain in the output

**Final output format:**
- The revised output
- List of verified claims (tool used, result)
- List of unverifiable claims (reason)
- Overall confidence assessment

### When to Use

- Before committing code changes
- Before presenting analysis to humans
- For any high-stakes output (security, architecture, migration plans)
- When the output will be used as input to another task

### Anti-Patterns

- Skipping Phase 2 and going straight to tools (wastes tool budget on obvious errors)
- Running Phase 2 indefinitely (2 passes max — diminishing returns)
- Verifying every claim instead of flagged ones (waste of tokens)
- Revising verified-correct claims (second-system effect)
- Skipping Phase 4 because "Phase 2 looked good" (the Mental-Reality Gap)
