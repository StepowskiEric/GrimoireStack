---
name: subagent-composer
description: "Compose high-context sub-agent briefs that eliminate first-pass failures."
triggers:
  - subagent-brief
  - delegation-failure
  - context-loading
  - skill-selection
disable-model-invocation: true
---

# Sub-Agent Composer

Sub-agent failure is almost always a context failure. This skill defines the structure of a **high-context brief** — the contract between parent and sub-agent that prevents scope drift, missed constraints, and vague output.

## The Move

### 1. Decide
Use the **Delegation Decision Tree**: if the task fits in your working memory (1-2 files), do it yourself. Delegate for multi-file isolation, fresh perspective, or mechanical bulk.

### 2. Load
Select skills based on the task. **Always** load `subagent-laws` and `tdd` (for code). Add domain-specific skills (e.g., `security-threat-modeling`, `feature-architecture`).

### 3. Compose
Build the brief with these sections in order:
1. **Goal**: One sentence. What is being built?
2. **Skills Loaded**: Why each skill is there.
3. **Persona**: Who is this agent? (Senior expert, junior literalist, security reviewer).
4. **Why**: The stakes. What breaks if this fails?
5. **Context**: File paths, types, existing patterns. Use `reads` for files >100 lines.
6. **Task**: Step-by-step instructions.
7. **Success Criteria**: Specific, measurable, testable.
8. **Boundaries**: What is NOT in scope.

### 4. Verify
After the sub-agent returns, run your own verification: tests, lint, `git diff`, and scope check. Never trust "all tests pass" without proof.

## Context Levels
- **Minimal** (~100 words): Goal → Skills → Task → Success → Stop. Simple edits.
- **Standard** (~300-500 words): Add Persona, Why, Context, Rules, Boundaries. Most tasks.
- **Comprehensive** (~500-1000 words): Full context dump + `reads`. High-risk/complex.

## Reference
For anti-patterns, full brief examples, cost/budget tables, and verification checklists, see [`references/subagent-composer-details.md`](references/subagent-composer-details.md).

## Rules
- **Do** place Skills Loaded right after Goal.
- **Do** place Success Criteria immediately after Task.
- **Do** assign a Persona in every brief.
- **Do not** give a "figure it out" brief — name the files.
- **Do not** let sub-agents fix pre-existing issues outside their scope.
