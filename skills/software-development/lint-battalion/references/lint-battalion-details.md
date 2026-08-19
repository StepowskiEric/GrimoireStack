# Lint Battalion — Prompts, Tables & Notes

## Subagent prompt template

```markdown
You are a Lint Fix Subagent. Your ONLY job is fix the specific linter errors in your assigned files.

## Your Batch
Files: [file1.ts, file2.ts]
Errors:
- [rule-id] [message] @ [file]:[line]:[col]

## Rules
- Fix ONLY the listed errors. Do not "improve" adjacent code.
- Prefer the smallest possible change (one line > five lines).
- If a fix requires >3 lines or touches >2 files, STOP and report "NEEDS_REFACTOR".
- After fixing, run the linter on your files and report: PASS / FAIL.
- Do not add new dependencies.
- Do not change logic unless the lint rule explicitly requires it.
- Do not suppress rules with eslint-disable without justification.

## Output Format
1. Changes made (file + line + before -> after)
2. Linter result (PASS / FAIL)
3. Any errors you could not fix and why
```

## Batch types

| Type | Assignment | Max parallel |
|------|-----------|--------------|
| Mechanical | general lint fix subagent | 5 |
| Semantic | specialist subagent (type-aware) | 2 |
| Architectural | human review or refactor skill | 1 |

## Scale table

| Error count | Max subagents | Max cycles | Typical time |
|-------------|--------------|------------|--------------|
| 50–100 | 3 | 2 | 3–5 min |
| 100–300 | 5 | 2 | 5–10 min |
| 300–500 | 5 | 3 | 8–15 min |
| 500+ | 5 | 3 | 10–20 min |

**Token budget heuristic:** mechanical fixes ~100 tokens/error; semantic ~500 tokens/error.

## Companion script installation

Requires `lint_battalion.py`, bundled with the skill. With `--with-scripts` it is copied alongside SKILL.md automatically.

```bash
npx GrimoireStack install --agent pi --skill lint-battalion --with-scripts
```

- **Pi agent (flat layout):** `python ~/.pi/agent/skills/lint-battalion/lint_battalion.py --help`
- **Hermes (grouped layout):** `python ~/.hermes/skills/software-development/lint-battalion/lint_battalion.py --help`

## Contamination causes and prevention

Causes: subagent "fixed" an import that broke downstream consumers; subagent reformatted and triggered new formatting rules; subagents touched the same file with conflicting fixes.

Prevention: never assign the same file to multiple subagents; run the linter per-subagent during execution.

## Survivor triage

| Bucket | Action | Skill |
|--------|--------|-------|
| False positive | suppress with inline disable + justification | — |
| Type mismatch requiring logic change | route to debug subagent | `debug-subagent` |
| Missing types spanning many files | batch as architectural, dedicated refactor | `legacy-rescue-protocol` |
| Linter config issue | update `.eslintrc` / `biome.json` / `tsconfig.json` | — |

## Anti-patterns

- Skipping auto-fix — never spawn subagents for what `--fix` handles
- Giant batches — >20 errors per subagent causes context overflow
- Overlapping files — same file to two subagents guarantees merge conflicts
- Fixing generated files — fix the generator, not the output
- Infinite retry — 3 failed cycles means escalate
- Ignoring new errors — always run the full linter after; contamination is real

## Integration

| Skill | Integration point |
|-------|-------------------|
| `checklist-manifesto` | phase gates and contamination checks |
| `debug-subagent` | semantic errors requiring logic understanding |
| `legacy-rescue-protocol` | architectural errors needing structural change |
| `codebase-divide-conquer-search` | finding related files when errors span unknown modules |
| `iterative-patch-repair` | subagent's first fix is close but wrong |
| `pre-deployment-gate` | final lint check before commit |

## Research basis

- **AgentGroupChat-V2** (arXiv:2506.15451) — divide-and-conquer with parallel agents scales sub-linearly on independent tasks
- **RepoAudit** (arXiv:2501.18160) — demand-driven partitioning keeps agent context focused
- **Meta-RAG on Large Codebases** (arXiv:2508.02611) — hierarchical summarization + partitioning beats monolithic approaches
