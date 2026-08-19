---
name: code-review-excellence
description: "Structured code review that catches bugs early, provides constructive feedback, and shares knowledge while keeping team morale intact."
triggers:
  - systematic-code-review
  - constructive-feedback
  - knowledge-sharing-review
---

# Code Review Excellence

**Review with a checklist, not aimless reading — and leave the author better off than you found them.** Catch bugs early, check quality systematically, and deliver feedback that explains why and suggests how, so the review teaches instead of demoralizing.

## When to Use
- Any code change that needs a review (PR, patch, AI-generated diff)
- Reviews where thoroughness matters — a structured checklist beats skim-reading
- Reviews where the human outcome matters: feedback the author can act on

## The Move

### 1. Understand the change
Read the diff, PR description, linked issues, and related tests. Done when the intent and scope of the change are understood.

### 2. Check correctness
Logic errors, edge cases, error handling, security implications. Focus on what the code does, not how it is written. Done when all correctness concerns are documented.

### 3. Check quality
Test coverage, maintainability, readability, adherence to conventions, documentation. Done when quality concerns are documented.

### 4. Deliver feedback
Frame feedback constructively: explain why something is a problem, not just that it is; suggest alternatives when possible; acknowledge what works well. Done when feedback is delivered with clear reasoning and actionable suggestions.

## Rules
- **Do** review with the checklist — reading without purpose misses the big picture.
- **Do** prioritize correctness and maintainability over personal style preferences.
- **Do** acknowledge good solutions, not only what needs improvement.
- **Do** make every comment actionable: state why it matters and how to fix it.

## Failure modes
Nitpicking style over substance; dismissing good solutions; vague feedback ("this could be better" without why or how).
