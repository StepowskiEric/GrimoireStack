---
name: code-review-excellence
description: "Provide constructive feedback, catch bugs early, and foster knowledge sharing while maintaining team morale."
triggers:
  - Need to review code with constructive feedback
  - Need to catch bugs early while maintaining team morale
  - Code review where knowledge sharing is a goal
---

# Code Review Excellence

Provide constructive feedback, catch bugs early, and foster knowledge sharing while maintaining team morale.

## Core Protocol

### Phase 1: Understand the Change

Read the diff and understand what the change is trying to accomplish. Check the PR description, linked issues, and any related tests.

**Done when:** the intent of the change is understood.

### Phase 2: Review for Correctness

Check for logic errors, edge cases, security vulnerabilities, and correctness issues. Focus on what the code does, not how it's written.

**Done when:** all correctness concerns are documented.

### Phase 3: Review for Quality

Check for maintainability, readability, test coverage, and adherence to project conventions.

**Done when:** quality feedback is documented.

### Phase 4: Deliver Feedback

Frame feedback constructively. Explain why something is a problem, not just that it is. Suggest alternatives when possible.

**Done when:** feedback is delivered with clear reasoning and actionable suggestions.

## Failure Modes

- **Nitpicking style over substance:** focus on correctness and maintainability, not personal preferences
- **Dismissing good solutions:** acknowledge what works well, not just what needs improvement
- **Vague feedback:** "this could be better" without explaining why or how
