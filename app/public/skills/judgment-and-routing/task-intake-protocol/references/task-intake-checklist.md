# Task Intake Checklist — Quick Reference

Companion reference for `task-intake-protocol`. A one-page checklist for rapid task triage.

## Pre-Intake Gate (30 seconds)

Before starting any task, answer these five questions:

| # | Question | If NO | If YES |
|---|----------|-------|--------|
| 1 | Is the problem stated in one sentence? | Ask for clarification | Proceed |
| 2 | Do I have enough context to start? | List what's missing | Proceed |
| 3 | Is the expected outcome measurable? | Define acceptance criteria | Proceed |
| 4 | Is the scope bounded (not open-ended)? | Bound it now | Proceed |
| 5 | Are there constraints I must respect? | Confirm none | Proceed |

If you can't answer yes to all 5, stop and ask the user before proceeding.

## Problem Classification (Cynefin)

| Domain | Signal | Approach |
|--------|--------|----------|
| **Obvious** | Known cause, known solution | Best practice. Execute. |
| **Complicated** | Known cause, need analysis | Expert analysis. Investigate, then decide. |
| **Complex** | Unknown cause, need experimentation | Probe-sense-respond. Try, learn, adapt. |
| **Chaotic** | No pattern, immediate action needed | Act-sense-respond. Stabilize first. |

## Task Scope Sizing

| Size | Tool calls | Time estimate | Verification |
|------|-----------|---------------|-------------|
| **Tiny** | 1-3 | <5 min | One command |
| **Small** | 4-10 | 5-30 min | Single test or check |
| **Medium** | 10-25 | 30 min - 2 hr | `npm run check` or equivalent |
| **Large** | 25-50 | 2-4 hr | Full test suite + manual review |
| **Epic** | 50+ | 4+ hr | Break into smaller tasks first |

## Red Flags — Escalate Immediately

- Ambiguous pronouns ("it", "this", "that") with no clear referent
- "Just" or "simply" describing the task — often hides complexity
- No error message or reproduction steps
- Multiple unrelated changes requested in one task
- "Also, while you're at it..." — scope creep signal

## Handoff Template

If task intake reveals the task is too large or unclear, hand back to the user:

```
Task: [one-sentence description]
Classification: [Obvious/Complicated/Complex/Chaotic]
Estimated size: [Tiny/Small/Medium/Large/Epic]
Clarifications needed:
1. [specific question]
2. [specific question]
Suggested approach: [brief plan]
Constraints: [list any known constraints]
```