---
name: retrospective
description: "After an incident, shipped feature, or completed project, systematically learn from what happened."
triggers:
  - after-action-review
  - incident-postmortem
  - project-retro
  - learning-loop
disable-model-invocation: true
---

# Retrospective

**You cannot improve what you do not examine.** A retrospective turns outcomes into learning by separating facts from blame and identifying systemic root causes.

## The Move

### 1. Set the Stage
Define the scope: What is being reviewed? What is the time period? What is the goal (action items, root causes, or patterns)?

### 2. Gather Facts
Collect the timeline and impact. No interpretation yet — just what happened, when, and to whom.

### 3. Well / Wrong
- **What went well**: Patterns to keep and reinforce.
- **What went wrong**: Gaps to close and patterns to change.

### 4. Root Cause (Five Whys)
For every problem, ask "why?" until you reach a **systemic cause** (a process, policy, or design issue) rather than a surface cause (a person or one-time mistake).

### 5. Action Items
Produce specific, owned, and trackable commitments. No "improve testing" — only "add load-test step to deploy pipeline, owner: platform, deadline: next sprint."

## Reference
For detailed retrospective types (incident, project, personal), templates, the Five Whys technique, and failure modes, see [`references/retrospective-details.md`](references/retrospective-details.md).

## Rules
- **Do** focus on systems and processes, not people.
- **Do** capture what went well, not just what went wrong.
- **Do** set a follow-up mechanism for action items.
- **Do not** assign blame — the question is "what allowed this to happen?"
- **Do not** stop at surface causes like "human error" or "better communication."
