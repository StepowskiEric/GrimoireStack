---
name: bounded-self-revision
description: "Capped self-critique passes that terminate on improvement or budget exhaustion."
triggers:
  - draft-polish-needed
  - finite-revision-discipline
  - self-refine-bounded
disable-model-invocation: true
---

# Bounded Self-Revision

**Draft it. Critique it against real criteria. Revise it. Stop when the gains flatten.** Many agents are good at revising once or twice and bad at stopping — this skill keeps self-refinement finite: an initial draft, focused critique along explicit dimensions, purposeful revision, and a hard stop on marginal gain, repetitive feedback, or budget exhaustion. Never "one more pass" forever.

## When to Use
- Writing, planning, structured outputs, explanations, prompts, design memos, decision docs, summaries
- "This is decent, but it probably needs one or two stronger passes"
- "Improve clarity, structure, and usefulness without looping forever"

Skip it: tasks needing external verification (tool-based critique matters more), high-risk factual tasks, or drafts already good enough.

## The Move

### 1. Draft
Produce the first full version. This is pass 0.

### 2. Critique — against explicit criteria
Score the output along named dimensions — clarity, internal-logic correctness, structure, usefulness, completeness, tone, constraint adherence, actionability. Vague self-criticism ("could be better") produces vague revision. Pick the dimensions that matter for the task before critiquing.

### 3. Revise — meaningfully
Improve the output using the feedback. Prefer meaningful improvement over cosmetic churn — rewriting that changes style more than substance is not revision.

### 4. Decide — is another pass worth it?
Only continue if another pass is likely to produce a meaningful gain. Budget default: 1 draft + up to 2 refinement passes; more than 2 requires a clear reason. If the output is still materially weak after the budget is spent, the move is escalate, change strategy, bring in external critique, or narrow scope — not loop forever.

### 5. Stop — on any of these
- The output clearly satisfies the task
- Remaining issues are minor
- The last revision produced only cosmetic change
- Feedback is becoming repetitive
- The revision budget is exhausted

## Reference
For the revision template, revision dimensions, stop-condition detail, and pairing guide, see [`references/revision-details.md`](references/revision-details.md).

## Rules
- **Do** critique against explicit criteria — vague critique is the root of endless revision.
- **Do** keep every revision purposeful and meaningful.
- **Do** stop when the output is good enough for the real task.
- **Do** note when further refinement is low-value — and honor that note.
- **Do** use external verification when the task demands it; self-revision is not a substitute.
