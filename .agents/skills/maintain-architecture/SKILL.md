---
name: Maintain Architecture
description: Review completed work for architectural quality, maintainability, feature ownership, and long-term scalability.
---

# Purpose

You are reviewing architecture.

NOT formatting.

NOT naming.

NOT lint.

NOT code style.

Focus exclusively on maintaining a clean architecture as the application grows.

Prevent architectural drift.

Avoid unnecessary rewrites.

---

# Core Principle

The project should become easier to work on after every feature.

Never recommend changes that increase complexity without strong justification.

---

# Review Goals

Determine whether the new code:

- belongs in the correct feature
- respects dependency direction
- hides complexity
- keeps React components small
- improves maintainability
- avoids duplicate knowledge
- scales to future features

---

# Feature Ownership

Every new file should clearly belong somewhere.

If ownership is unclear:

identify the better location.

Never allow "miscellaneous" folders to grow.

---

# Shared Folder Audit

Challenge every addition to shared.

Ask:

Is this actually reused?

If not,

recommend moving it back into its feature.

Shared code is a maintenance cost.

---

# Core Folder Audit

Core should remain infrastructure only.

Reject business logic.

Reject feature-specific helpers.

Reject UI.

---

# UI Audit

React components should primarily:

Render UI.

Handle events.

Call hooks.

Business logic belongs elsewhere.

If components exceed roughly 250 lines,

recommend decomposition.

---

# Deep Module Review

Prefer modules that hide implementation.

Good:

voteForPlayer()

Bad:

validate()

mutate()

cache()

refresh()

toast()

analytics()

The interface should stay simple.

---

# Delete Test

Ask:

If this file disappeared,

would the project become harder to understand?

If no,

recommend deleting, merging, or simplifying it.

---

# Duplicate Knowledge

Look for repeated business rules.

Not repeated syntax.

Repeated knowledge.

Example:

Vote eligibility checked in four locations.

Recommend centralizing knowledge.

---

# Dependency Direction

Verify:

UI

↓

Hooks

↓

Services

↓

Repositories

↓

Infrastructure

Reject:

Infrastructure depending on React.

Feature internals imported elsewhere.

Circular dependencies.

---

# Cohesion Test

Does every file inside this feature belong together?

If not,

recommend moving files.

---

# Future Growth

Imagine:

This feature doubles.

Would navigation remain obvious?

Would file names remain obvious?

Would onboarding a new engineer stay easy?

If not,

recommend improvements.

---

# Simplicity

Prefer:

Obvious

Predictable

Boring

Architecture.

Avoid clever abstractions.

Avoid premature generalization.

---

# Ignore

Ignore:

Formatting

Import order

Variable names

Whitespace

Semicolons

Minor TypeScript improvements

Lint warnings

Micro-optimizations

Unless they directly affect architecture.

---

# Output

Produce:

## Architecture Health

Overall Assessment

Feature Ownership

Dependency Direction

Module Quality

UI Purity

Shared Usage

Core Usage

Duplicate Knowledge

Future Growth

Recommendations

Only recommend changes that materially improve maintainability.

Avoid architecture for architecture's sake.

---

# Architectural Decisions

Record every non-trivial architectural recommendation.

Include:

- Decision
- Why
- Trade-offs
- Why alternatives were rejected
