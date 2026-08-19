# Iterative Spec Authoring — Judge Prompt, Rules & Rationale

## Judge prompt template

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

## Decision rules

- **Fixed 3-judge-round maximum** — not negotiable. If the judge hasn't approved by round 3, present to the user regardless.
- **CRITICAL issues must be addressed** before presenting to the user.
- **MINOR/NIT issues** may be noted but left at your discretion if the user approves.
- **NEEDS_RESEARCH** triggers exactly one focused additional research pass (Round 1 only).
- **Judge unavailable** (API error, timeout after 1 retry): fall back to asking the user to paste a critique or approve as-is.
- **Research toggle:** if the user opts out of research, document this in the revision log.

## Revision log format

```md
## Revision 0 — Initial Authoring
- Author: [agent name]
- Research: [yes/no, number of sources found]
- Basis: [user's request + any context]

## Revision 1 — Judge Round 1
- Judge: [model name]
- Issues found: [count]
- Changes applied: [list]
- Needs-research items: [list or "none"]
- Issues requiring your decision: [flag any]

## Summary
- Total revisions: N
- Judge model: [model name]
- Research sources consulted: [count]
- Open items: [list any deferred decisions]
- Status: USER-REVIEW
```

## Setup

```bash
export OPENROUTER_API_KEY="your-key-here"
export JUDGE_MODEL="anthropic/claude-sonnet-4"   # Any OpenRouter model
```

Companion files use only standard tools (`curl`, `python3`) — no pip installs.

## Failure modes

- **Skipping the template** — freeform specs miss sections
- **Too much scope per spec** — if it doesn't fit in one spec, split the work
- **Ignoring MINOR findings** — they compound; address them or document why not
- **Revising beyond 3 rounds** — stop and present to the user
- **No user gate** — the user must always see and approve the final spec before implementation starts
- **Treating research as optional by default** — the research phase is the main value-add

## Design decisions

| Decision | Rationale |
|----------|-----------|
| Research before drafting | Prevents specs built on stale knowledge; catches breaking changes early |
| Bounded research (5–7 searches) | Controls cost and time; enough to catch major gaps without analysis paralysis |
| Judge can request research | Adds a feedback loop without overcomplicating the loop structure |
| Research toggle (--no-research) | Small/internal features don't need external validation |
| Fixed 3 rounds | Empirically sufficient to catch ~90% of issues; more rounds show diminishing returns |
| User always gets final approval | Agent proposes, human disposes |

## Related skills

- `plan-with-judge` — JSONL plan refinement (this skill is the markdown spec equivalent with research)
- `speculative-drafting-verification` — multi-branch solution exploration
- `structured-feature-planning` — exploration-first planning without the judge loop
- `security-threat-modeling` — deep security analysis (use when the spec reveals security-critical work)
