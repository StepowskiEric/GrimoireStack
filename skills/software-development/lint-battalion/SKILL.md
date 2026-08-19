---
name: lint-battalion
description: "Batch-process 50+ linter errors as a bulk remediation problem, not 50 separate decisions."
triggers:
  - mass-lint-debt
  - post-rule-change-cleanup
  - pre-commit-lint-sprint
  - stricter-lint-onboarding
---

# Lint Battalion

**500 linter errors is not 500 decisions — it is a batch-processing problem.** Mass lint remediation is a pipeline: auto-fix the mechanical errors without spending tokens, categorize the remainder, assign scoped batches to parallel fixer subagents, verify no contamination, and escalate the survivors. Errors are independent, fixes are local, verification is objective — the ideal case for parallel agents.

## When to Use
- 50+ linter errors that are mostly mechanical (missing imports, unused vars, formatting)
- Accumulated lint debt after a rule change or migration
- Pre-commit cleanup where auto-fix did not resolve everything
- Onboarding a project to a stricter lint configuration

Skip it: single-digit errors (direct fix, not battalion overhead), errors tracing to one architectural change (fix the root), security/logic bugs the linter flags (route to a debug skill), or a severely constrained token budget (subagents multiply cost).

## The Move

### 1. Auto-fix sprint — zero-token reduction
Run the linter's built-in auto-fix first: `npx eslint . --fix` / `npx biome check --write` / `npx prettier --write .`. **Gate:** if errors drop below 50, switch to single-agent mode — no battalion needed. Log how many auto-fix eliminated and how many remain.

### 2. Inventory & categorize
Capture structured linter output. With the companion script, pipe the linter's JSON directly: `npx eslint . --format json | python scripts/lint_battalion.py --markdown --json -o batches.json` (also Biome, Ruff). Without it, summarize by rule with `jq`. Categorize each remaining error:
- **mechanical** — syntactic, no logic change (missing import, unused var) → general fixer
- **semantic** — requires understanding intent (type mismatch, async/sync) → specialist
- **architectural** — violates a pattern, needs refactor (cyclic dependency) → human or refactor skill
- `auto` — should have been caught by --fix → run it again, check config

### 3. Batch assignment
Group by **rule ID + directory**. Limits: max 20 errors per batch, max 5 files per batch, never split one rule across >3 subagents, never assign the same file to two subagents. Pre-flight: dedupe same-line/same-rule errors, skip generated files (fix the generator, not the output), and note test-vs-source standard differences. Up to 5 mechanical subagents in parallel; 1–2 semantic subagents sequentially (they need broader context); architectural goes to one at a time.

### 4. Parallel execution & contamination check
Each subagent gets a scoped prompt: fix ONLY the listed errors, smallest change possible, stop and report `NEEDS_REFACTOR` if a fix exceeds 3 lines or 2 files, run the linter on its files, no new dependencies, no suppress-without-justification. After all report: run the full linter and compare counts. Errors increased or new ones appeared → **contamination**: identify the subagent, revert its changes, re-batch with tighter scope, max 3 retries. Run the linter per-subagent during execution to catch contamination early.

### 5. Triage survivors
Errors surviving 3 cycles: false positives (suppress with inline justification), type mismatches needing logic change (debug skill), missing types spanning files (architectural batch, dedicated refactor), linter-config issues (fix the config). If >10% of the original count survives, re-examine the categorization — architectural errors were likely misclassified as semantic or mechanical.

## Reference
For the subagent prompt template, batching/scale tables with token heuristics, installation notes for the companion script, anti-patterns, and research basis, see [`references/lint-battalion-details.md`](references/lint-battalion-details.md).

## Rules
- **Do** run auto-fix first — spawning subagents for fixes `--fix` handles is token waste.
- **Do** keep batches small and file-disjoint — context overflow and merge conflicts are the failure modes.
- **Do** run the full linter after every wave — contamination is real.
- **Do** escalate after 3 failed cycles instead of looping forever.
- **Do** skip generated files — fix the generator, not the output.
