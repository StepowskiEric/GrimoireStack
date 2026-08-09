---
name: review-changes
description: "Structured review checklist for evaluating code changes systematically."
triggers:
  - Need to review code changes systematically
  - Need a structured checklist instead of aimless reading
  - Code review where thoroughness matters
---

# Review Changes

Structured review checklist for evaluating code changes systematically rather than reading through aimlessly.

## Core Protocol

### Step 1: Understand the Change

Read the diff summary, PR description, and linked issues. Understand what the change is trying to accomplish.

**Done when:** the intent and scope of the change are understood.

### Step 2: Check Correctness

Verify logic, edge cases, error handling, and security implications. Focus on what the code does.

**Done when:** all correctness concerns are identified.

### Step 3: Check Quality

Verify test coverage, maintainability, adherence to conventions, and documentation.

**Done when:** quality concerns are identified.

### Step 4: Deliver Feedback

Frame feedback constructively with clear reasoning and actionable suggestions.

**Done when:** feedback is delivered.

## Failure Modes

- **Reading without purpose:** scanning code without a systematic checklist
- **Missing the big picture:** focusing on style while missing correctness issues
- **Vague feedback:** "this could be better" without explaining why or how
