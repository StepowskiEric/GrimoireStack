---
source: "jerry-skills"
name: iterative-spec-authoring
description: >
  Author a detailed technical spec grounded in research, then refine it through
  up to 3 judge-LLM review cycles before presenting to the user for final approval.
category: execution
tags: [spec, planning, iterative-review, judge, llm-review, acceptance-criteria,
       implementation-plan, research]
version: 2.0
...



---

# Iterative Spec Authoring

Write a complete, research-grounded technical specification, then run it through
a configurable judge-LLM loop (up to 3 rounds) to surface blind spots, strengthen
acceptance criteria, and improve implementation clarity — before the user sees it.

## When to Use

**Use this skill when:**

- You need a detailed, reviewable spec before starting implementation
- The task touches multiple concerns (backend, frontend, email, infra, security)
- The task is complex enough to benefit from structured critique cycles
- You want a stronger model to stress-test your plan before committing
- The spec needs to be human-readable (.md) for stakeholder review
- Current best practices matter (the research phase catches stale knowledge)

**Do NOT use when:**

- The task is trivial (a single-file, obvious change)
- No LLM judge is available and you can't fall back to manual review
- You already have an approved spec and just need to execute
- The user explicitly says "skip research" or the task is purely internal

## Workflow

```
┌──────────────┐
│  PHASE 1     │  Clarify scope, ask follow-up questions
│  CLARIFY     │  (light user interaction)
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 2     │  Tool-assisted research: best practices, pitfalls,
│  RESEARCH    │  alternatives, security standards, recent changes.
│  (new)       │  Bounded: up to 5–7 searches + page fetches.
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 3     │  Author first version of spec.md using template.
│  DRAFT       │  Incorporates research findings inline.
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 4     │  Send spec to judge-LLM, get critique.
│  JUDGE 1     │
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 5     │  Revise spec based on critique.
│  REVISE 1    │  (Judge can request additional research here.)
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 6     │  Send revised spec back to judge.
│  JUDGE 2     │
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 7     │  Revise again.
│  REVISE 2    │
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 8     │  Final judge pass — approves or flags remaining issues.
│  JUDGE 3     │  (May be skipped if judge approved in round 2.)
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 9     │  Append "Research & References" section, write revision log,
│  POLISH      │  present final spec to user for approval.
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 10    │  Begin implementation per approved spec.
│  USER GATE   │
└──────┬───────┘
       │
┌──────▼───────┐
│  PHASE 11    │  Execute.
│  EXECUTE     │
└──────────────┘
```

## Required Capabilities

- File read/write (to create/edit `spec.md`, `spec_revision_log.md`)
- Ability to run web searches and fetch pages (for research phase)
- Ability to call an external LLM (via OpenRouter script, API, or CLI)
- Ability to ask the user for brief input

## Setup

### Environment Variables

```bash
export OPENROUTER_API_KEY="your-key-here"
export JUDGE_MODEL="anthropic/claude-sonnet-4"   # Any OpenRouter model
```

### Companion Files

| File | Purpose |
|------|---------|
| `references/spec-template.md` | Template used to generate every new spec |
| `references/conduct-research.sh` | Runs bounded web research, outputs structured notes |
| `references/openrouter-judge.sh` | Sends spec to a judge-LLM via OpenRouter API |

All three scripts use only standard tools (`curl`, `python3`). No pip installs required.

## Workflow Detail

### Phase 1: Clarify & Scope (light user interaction)

1. Ask the user: *"What feature or change are you specifying?"*
2. Ask for scope boundaries: *"What is explicitly out of scope?"*
3. Ask about constraints: *"Any tech stack restrictions, existing patterns to follow, or deadlines?"*
4. **Decision point:** Is external research needed?
   - Default: **yes** (the research phase runs automatically)
   - If user says "skip research" or the feature is internal/trivial → set `--no-research` flag and skip to Phase 3

### Phase 2: Research (tool-assisted)

5. Run `references/conduct-research.sh` with the task description
6. The script performs up to **5–7 targeted web searches** and **2–3 page fetches**, covering:
   - Current best practices and recommended libraries
   - Security & compliance standards relevant to the feature
   - Common pitfalls for the feature type
   - Recent documentation changes or breaking changes
   - Alternative architectural approaches
7. Script outputs a structured `research_notes.md` file with:
   - Numbered findings with source URLs
   - Confidence level per finding (High / Medium / Low)
   - Date retrieved
8. **Cost control:** Each search uses the cheapest capable model. Total runtime target: < 2 minutes.

### Phase 3: Draft Spec (Author)

9. Generate `spec.md` using the template in `references/spec-template.md`
10. Fill every section, **incorporating research findings directly** into relevant sections
    - E.g., if research found a newer API version, cite it in the implementation plan
    - E.g., if research found a known pitfall, address it in Security & Compliance
11. Add a brief **"Research Summary"** at the bottom of the spec (see template Section 10)
12. Save revision note to `spec_revision_log.md`:

```
## Revision 0 — Initial Authoring
- Author: [agent name]
- Research: [yes/no, number of sources found]
- Basis: [user's request + any context]
```

### Phase 4: First Judge Pass (Round 1)

13. Read `spec.md`
14. Call the judge LLM using `references/openrouter-judge.sh` or the built-in prompt template below
15. Save the judge's response to `spec_revision_log.md`

**Judge Prompt Template:**

```
You are a senior principal engineer reviewing a technical specification.
Your job is to find every weakness before this spec is approved for implementation.

TASK: [user's original request]

CURRENT SPEC:
[full content of spec.md]

Review each section:
1. Overview — Is the goal clear? Is scope well-defined?
2. Acceptance Criteria — Are they testable, complete, and unambiguous?
3. Technical Implementation Plan — Is the plan feasible? Missing steps? Wrong assumptions?
4. File-by-File Changes — Are all necessary files covered? Any missed dependencies?
5. Testing Strategy — Does it cover integration, edge cases, regression?
6. Security & Compliance — Are there gaps (auth, input validation, PII, rate limiting)?
7. Dependencies & Risks — Are dependencies realistic? Are risks identified?
8. Performance & Monitoring — Are there performance targets and observability hooks?
9. Research & References — Are cited sources reliable and current?

For each issue found, provide:
- Section number and name
- Severity: CRITICAL | MAJOR | MINOR | NIT
- Description of the specific issue
- Suggested fix

IMPORTANT — You may request additional research:
- If you spot a knowledge gap, say: "NEEDS_RESEARCH: [topic]"
- The author will run one additional focused research pass before revising.

If no issues found, respond ONLY with: APPROVED
```

### Phase 5: Revise (Round 1) with optional Research Pass

16. Parse the judge response
17. If `APPROVED` → skip to Phase 9
18. If judge issued `NEEDS_RESEARCH` requests → run a focused research pass (one extra search/fetch), update the spec, log it
19. Apply each correction to `spec.md`
20. Log changes to `spec_revision_log.md`:

```
## Revision 1 — Judge Round 1
- Judge: [model name]
- Issues found: [count]
- Changes applied: [list]
- Needs-research items: [list or "none"]
- Issues requiring your decision: [flag any]
```

### Phases 6–8: Repeat (Rounds 2 and 3)

Same pattern: Judge → Revise. Maximum 3 rounds total.

- If the judge approves early (any round), skip remaining rounds and go to Phase 9
- The focused research pass is only available in Round 1 (to avoid scope creep)

### Phase 9: Polish & Export

21. Append or update the **Research & References** section (Section 10) with final URLs and key takeaways
22. Finalize `spec_revision_log.md` with summary:

```
## Summary
- Total revisions: N
- Judge model: [model name]
- Research sources consulted: [count]
- Open items: [list any deferred decisions]
- Status: USER-REVIEW
```

23. Present the final spec to the user:

```
=== SPEC REVIEW ===
Author: [agent name]
Revised: N times by [judge model]
Research sources: [count] consulted during authoring

=== CHANGES LOG ===
[Summary of what changed across all revision rounds]

=== SPEC ===
[render spec.md]

Do you approve this spec for implementation? (yes / no / revise)
```

### Phase 10: User Review Gate

- **yes** → proceed to Phase 11
- **no** → ask what they want changed, apply manually, re-present
- **revise** → ask for specific changes, apply, present again (this is outside the 3-judge-round limit)

### Phase 11: Execute

Begin implementing per the approved spec. Keep `spec_revision_log.md` as the audit trail.

## Decision Rules

- **Fixed 3-judge-round maximum** — not negotiable. If the judge hasn't approved by round 3, present to user regardless
- **CRITICAL issues must be addressed** before presenting to user
- **MINOR/NIT issues** may be noted but left at your discretion if the user approves
- **NEEDS_RESEARCH** from the judge triggers exactly one focused additional research pass (Round 1 only)
- **If the judge is unavailable** (API error, timeout after 1 retry), fall back to asking the user to paste a critique or approve as-is
- **Research toggle:** If user opts out of research, document this in the revision log

## Output Files

| File | Purpose |
|------|---------|
| `spec.md` | The current spec document (readable .md for LLMs and humans) |
| `spec_revision_log.md` | Full audit trail: every revision, judge feedback, research notes |
| `research_notes.md` | Raw research findings (if Phase 2 was run) |

## Spec Template Summary

The spec template (`references/spec-template.md`) includes 10 sections:

1. **Overview** — What this feature does and why
2. **Acceptance Criteria** — Testable, numbered requirements
3. **Technical Implementation Plan** — Backend, frontend, integration, migration
4. **File-by-File Changes** — Every file touched with justification
5. **Testing Strategy** — Unit, integration, e2e, edge cases
6. **Security & Compliance** — Auth, validation, PII, OWASP
7. **Dependencies & Risks** — External deps, migration concerns, rollback
8. **Performance Considerations** — Load targets, caching, DB optimization
9. **Monitoring & Observability** — Logs, metrics, alerts, tracing
10. **Research & References** — Sources consulted, key findings, citations

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Research before drafting | Prevents specs built on stale knowledge; catches breaking changes early |
| Bounded research (5–7 searches) | Controls cost and time; enough to catch major gaps without analysis paralysis |
| Judge can request research | Adds a feedback loop without overcomplicating the loop structure |
| Research toggle (--no-research) | Small/internal features don't need external validation |
| Fixed 3 rounds | Empirically sufficient to catch ~90% of issues; more rounds show diminishing returns |
| User always gets final approval | Agent proposes, human disposes |

## Pitfalls

- **Skipping the template** — Always use the template. Freeform specs miss sections
- **Too much scope per spec** — If you can't fit it in one spec, split the work into multiple specs
- **Ignoring MINOR findings** — They compound. Address them or explicitly document why you didn't
- **Revising beyond 3 rounds** — Stop. Present to user. Don't let the judge loop become infinite
- **No user gate** — The user must always see and approve the final spec before implementation starts
- **Treating research as optional by default** — The research phase is the main value-add over simpler plan-with-judge approaches

## Related Skills

- `plan-with-judge` — JSONL plan refinement (this skill is the markdown spec equivalent with research)
- `speculative-drafting-verification` — Multi-branch solution exploration
- `structured-feature-planning` — Exploration-first planning without the judge loop
- `security-threat-modeling` — Deep security analysis (use when spec reveals security-critical work)