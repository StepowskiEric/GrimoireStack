---
name: lint-battalion
category: software-development
description: Mass linter error remediation via auto-fix sprint + parallel subagent battalions. Handles 500+ trivial errors mechanically, escalates semantic errors to specialists, and enforces contamination checks.
version: 1.0
priority: high
tags: [linting, bulk-fix, parallel-agents, code-quality, mass-remediation]
...



---

## Overview

500+ linter errors is not 500 separate decisions. It is a batch processing problem.

This skill turns mass lint remediation into a pipeline:
1. **Auto-fix sprint** — eliminate mechanical errors without agent tokens
2. **Categorize remainder** — sort by fix complexity
3. **Parallel subagent battalions** — assign scoped batches to dedicated fixers
4. **Contamination checks** — verify no new errors introduced
5. **Escalate survivors** — semantic errors route to debug subagent

Research on multi-agent code search (AgentGroupChat-V2, RepoAudit) shows parallel agents on partitioned tasks scale sub-linearly. Linting is ideal for this: errors are independent, fixes are local, and verification is objective.

___


## When to Use

- 50+ linter errors that are mostly mechanical (missing imports, unused variables, formatting)
- A codebase with accumulated lint debt after a rule change or migration
- Pre-commit cleanup where auto-fix did not resolve everything
- Onboarding a project to a stricter lint configuration

## When NOT to Use

- Single-digit errors (use direct fix, not battalion overhead)
- Errors that all trace to one architectural change (fix the root, not the symptoms)
- Security or logic bugs flagged by linter (route to `debug-subagent`)
- Token budget severely constrained (subagents multiply cost)

___


## Installation Notes

**This skill requires a companion Python script that is bundled with the skill.**

When installing with `--with-scripts`, the script is copied alongside `SKILL.md` automatically.

```bash
npx jerry-skills install --agent pi --skill lint-battalion --with-scripts
```

**Pi Agent (flat layout):**
```bash
python ~/.pi/agent/skills/lint-battalion/lint_battalion.py --help
```

**Hermes (grouped layout):**
```bash
python ~/.hermes/skills/software-development/lint-battalion/lint_battalion.py --help
```

For manual copy or development symlinks, see the [skill-development-with-supporting-files](development/skill-development-with-supporting-files.md) skill.

___


## Core Protocol

### Phase 0 — Auto-Fix Sprint

Run the linter's built-in auto-fix first. Goal: reduce error count with zero token spend.

```bash
# ESLint
npx eslint . --fix

# Biome
npx biome check --write

# Prettier (formatting only)
npx prettier --write .

# TypeScript (type-only, but often reveals lint-adjacent issues)
npx tsc --noEmit
```

**Gate:** If errors drop below 50, switch to single-agent mode. No battalion needed.

**Log:** Record how many errors auto-fix eliminated and how many remain.

___


### Phase 1 — Inventory & Categorize

Run the linter again and capture structured output.

**Recommended (zero agent tokens):**
```bash
# ESLint JSON output -> auto-categorized batches
npx eslint . --format json | python ~/.pi/agent/skills/lint-battalion/lint_battalion.py --markdown --json -o batches.json

# Biome
npx biome check --json | python ~/.pi/agent/skills/lint-battalion/lint_battalion.py --markdown --json -o batches.json

# Ruff
ruff check --output-format json | python ~/.pi/agent/skills/lint-battalion/lint_battalion.py --markdown --json -o batches.json
```

**Alternative (agent tools):**
```bash
# Summarize by rule with jq
npx eslint . --format json | jq -r '.[] | .ruleId' | sort | uniq -c | sort -rn
```

**Categorize each remaining error:**

| Category | Description | Example | Fix Strategy |
|----------|-------------|---------|--------------|
| `auto` | Should have been caught by --fix | N/A | Run --fix again, check config |
| `mechanical` | Purely syntactic, no logic change | Missing import, unused var, wrong quote style | Subagent batch |
| `semantic` | Requires understanding code intent | Type mismatch, unreachable code, async/sync conflict | Specialist subagent |
| `architectural` | Violates pattern, needs refactor | Cyclic dependency, God class, wrong layer | Escalate to human |

**Tooling:** If the linter does not support JSON output, grep/sed the text output into a structured list per file and rule.

___


### Phase 2 — Batch Assignment

Group errors into battalion-sized batches.

**Batching rules:**
- Group by **rule ID + directory** (keeps context local)
- Max **20 errors per batch** (fits in subagent context)
- Max **5 files per batch** (minimizes blast radius)
- Never split a single rule's fixes across >3 subagents (avoid conflicting fixes)

**Batch types:**

| Type | Assignment | Max Parallel |
|------|-----------|--------------|
| Mechanical | General lint fix subagent | 5 |
| Semantic | Specialist subagent (type-aware) | 2 |
| Architectural | Human review or `refactor-safely` | 1 |

**Pre-flight:** Before spawning subagents, run a quick scan for:
- Duplicate errors (same line, same rule — count once)
- Errors in generated files (auto-generated, node_modules, lockfiles — skip)
- Errors in test files vs source files (different standards may apply)

___


### Phase 3 — Parallel Execution

Spawn subagents with scoped, identical prompts.

**Subagent prompt template:**

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

**Execution:**
- Spawn up to 5 mechanical subagents in parallel (`delegate_task` with `tasks` array)
- Spawn 1-2 semantic subagents sequentially (they may need broader context)
- Each subagent gets read access to assigned files + adjacent imports/types
- Each subagent gets NO write access outside its assigned files

___


### Phase 4 — Verification & Contamination Check

After all subagents report:

1. **Run full linter:** `npx eslint .`
2. **Compare error counts:**
   - If errors decreased: proceed to Phase 5
   - If errors increased or new errors appeared → **contamination**
3. **Contamination response:**
   - Identify which subagent(s) introduced new errors
   - Revert their changes (git checkout or patch reversal)
   - Re-batch their files with tighter scope or different rule grouping
   - Max 3 retry cycles per contaminated batch

**Contamination causes:**
- Subagent "fixed" an import that broke downstream consumers
- Subagent reformatted and triggered new formatting rules
- Subagents touched the same file with conflicting fixes

**Prevention:**
- Never assign the same file to multiple subagents
- Run linter per-subagent during Phase 3 (catches most contamination early)

___


### Phase 5 — Triage Survivors

Errors surviving 3 cycles fall into these buckets:

| Bucket | Action | Skill |
|--------|--------|-------|
| False positive | Suppress with inline disable + justification | None |
| Type mismatch requiring logic change | Route to `debug-subagent` | `debug-subagent` |
| Missing types spanning many files | Batch as architectural, fix in dedicated refactor | `refactor-safely` |
| Linter config issue | Update `.eslintrc` / `biome.json` / `tsconfig.json` | None |

**Escalation rule:** If >10% of original errors are survivors, re-examine categorization. You likely misclassified architectural errors as semantic or mechanical.

___


## State Tracking

Maintain a running log:

```markdown
## Lint Battalion Log

### Phase 0 — Auto-Fix
- Initial errors: 547
- Auto-fix resolved: 423
- Remaining: 124

### Phase 1 — Categorize
- Mechanical: 98
- Semantic: 21
- Architectural: 5

### Phase 2 — Batches
- Mechanical: 5 batches of ~20 errors each
- Semantic: 2 batches of ~10 errors each
- Architectural: 1 batch (deferred)

### Phase 3 — Execution
- Batch M1-M5: PASS (all 5)
- Batch S1: PASS
- Batch S2: FAIL (2 errors remain, retry cycle 1)

### Phase 4 — Verification
- Total errors after battalion: 7
- New errors introduced: 0 (clean)

### Phase 5 — Triage
- 3 false positives → inline disable
- 4 semantic → `debug-subagent`
```

___


## Iteration Budget

| Error Count | Max Subagents | Max Cycles | Typical Time |
|-------------|--------------|------------|--------------|
| 50-100 | 3 | 2 | 3-5 min |
| 100-300 | 5 | 2 | 5-10 min |
| 300-500 | 5 | 3 | 8-15 min |
| 500+ | 5 | 3 | 10-20 min |

**Token budget heuristic:** Mechanical fixes cost ~100 tokens/error. Semantic fixes cost ~500 tokens/error. Plan accordingly.

___


## Anti-Patterns

- **Skipping auto-fix:** Never spawn subagents for mechanical fixes `--fix` could handle. Token waste.
- **Giant batches:** >20 errors per subagent causes context overflow and accuracy drop.
- **Overlapping files:** Assigning the same file to two subagents guarantees merge conflicts.
- **Fixing generated files:** If the file is auto-generated, fix the generator, not the output.
- **Infinite retry:** If a batch fails 3 times, escalate — do not loop forever.
- **Ignoring new errors:** Always run full linter after. Contamination is real.

___


## Integration

| Skill | Integration Point |
|-------|-------------------|
| `checklist-manifesto` | Phase gates and contamination checks |
| `debug-subagent` | Semantic errors requiring logic understanding |
| `refactor-safely` | Architectural errors needing structural change |
| `codebase-divide-conquer-search` | Finding related files when errors span unknown modules |
| `iterative-patch-repair` | If a subagent's first fix is close but wrong |
| `pre-deployment-gate` | Final lint check before commit |

___


## Research Basis

- **AgentGroupChat-V2** (arXiv:2506.15451): Divide-and-conquer with parallel agents scales sub-linearly for independent tasks.
- **RepoAudit** (arXiv:2501.18160): Demand-driven partitioning keeps agent context focused.
- **Meta-RAG on Large Codebases** (arXiv:2508.02611): Hierarchical summarization + partitioning beats monolithic approaches on large codebases.

___


## Example

**Situation:** 612 ESLint errors after migrating a project to stricter TypeScript rules.

**Phase 0:** `eslint --fix` resolves 498 errors. 114 remain.

**Phase 1:** Categorize:
- 89 `mechanical`: missing return types, unused imports
- 18 `semantic`: `any` types that need real types
- 7 `architectural`: cyclic imports between `services/` and `models/`

**Phase 2:** Batches:
- M1-M5: 18 errors each across `components/`, `hooks/`, `utils/`
- S1-S2: 9 errors each in `services/` and `api/`
- A1: Deferred (cyclic imports need human decision)

**Phase 3:** Spawn 5 mechanical + 2 semantic subagents.
- All mechanical pass.
- S1 passes. S2 fails: 2 `any` types in `auth.ts` require understanding external API shape.

**Phase 4:** Re-run linter. 102 errors remain → 12 new errors? No. Clean. 2 errors from S2 batch.

**Phase 5:**
- 2 semantic errors → debug subagent traces external API, adds interface
- 7 architectural → human: "Move shared types to `types/` to break cycles"

**Result:** 612 → 0 in 12 minutes. 1 structural decision deferred to human.
