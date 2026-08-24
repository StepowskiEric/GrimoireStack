---
name: iterative-spec-authoring
description: "Author a detailed technical spec grounded in research, refine through up to 3 judge-LLM review cycles, then present to the user for final approval."
triggers:
  - detailed-spec-needed
  - multi-concern-feature
  - judge-review-cycle
  - stakeholder-review
disable-model-invocation: true
---

# Iterative Spec Authoring

**Let a judge stress-test the spec before the user sees it.** Write a complete, research-grounded technical specification, then run it through up to 3 judge-LLM review rounds to surface blind spots, strengthen acceptance criteria, and improve implementation clarity. The user always gets final approval — agent proposes, human disposes.

## When to Use
- A detailed, reviewable spec is needed before implementation
- The task touches multiple concerns (backend, frontend, email, infra, security)
- The task benefits from structured critique cycles
- A stronger model should stress-test the plan before committing
- The spec must be human-readable for stakeholder review

## The Move

### 1. Clarify & scope
Ask the user: what feature or change, what is explicitly out of scope, and what constraints apply (stack restrictions, patterns to follow, deadlines). Decide whether external research is needed — default yes; skip for internal/trivial features (`--no-research`).

### 2. Research — bounded and grounded
Run `references/conduct-research.sh` with the task description: up to 5–7 targeted web searches and 2–3 page fetches covering best practices, security standards, common pitfalls, recent breaking changes, and alternative approaches. Output structured `research_notes.md` with numbered findings, source URLs, confidence, and date. Target runtime under 2 minutes.

### 3. Draft the spec
Generate `spec.md` from `references/spec-template.md` (10 sections: overview, acceptance criteria, implementation plan, file-by-file changes, testing strategy, security & compliance, dependencies & risks, performance, monitoring, research & references). Incorporate research findings inline — a newer API version goes in the implementation plan; a known pitfall goes in Security & Compliance. Log revision 0 in `spec_revision_log.md`.

### 4. Judge loop — up to 3 rounds
Send the spec to a judge LLM (`references/openrouter-judge.sh`, `JUDGE_MODEL` env var). The judge reviews each section and reports issues with severity (CRITICAL / MAJOR / MINOR / NIT), section number, and suggested fix — or responds `APPROVED`. It may request additional research (`NEEDS_RESEARCH: [topic]`), which triggers exactly one focused pass, in Round 1 only.
- Apply every correction to `spec.md`; log each round in `spec_revision_log.md`
- CRITICAL issues must be resolved before presenting to the user; MINOR/NIT may be noted at your discretion
- Stop early on approval; after round 3, present regardless — the fixed 3-round maximum is not negotiable

### 5. Polish & user gate
Append the final Research & References section and a revision summary (total revisions, judge model, sources consulted, open items). Present the spec with a changes log and ask: approve / revise / no. On approval, begin implementation with `spec_revision_log.md` as the audit trail.

## Reference
For the judge prompt template, decision rules, failure modes, and design rationale, see [`references/spec-authoring-details.md`](references/spec-authoring-details.md). Companion files: `references/spec-template.md`, `references/conduct-research.sh`, `references/openrouter-judge.sh`.

## Rules
- **Do** use the template — freeform specs miss sections.
- **Do** ground the spec in research by default; document when research is skipped.
- **Do** address every CRITICAL finding before presenting to the user.
- **Do** keep the audit trail — `spec_revision_log.md` is the record.
- **Do** give the user the final word — the gate is never optional.
