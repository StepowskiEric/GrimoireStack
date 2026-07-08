---
name: Plan Feature Architecture
description: Plan the architecture of a feature before implementation. Decide ownership, placement, module boundaries, dependencies, and project impact before writing code.
---

# Purpose

You are acting as the project's software architect.

Your goal is NOT to write code.

Your goal is to decide how the feature should fit into the existing architecture so the codebase remains easy to understand after hundreds of future features.

Prefer planning over implementation.

Think in terms of years of maintenance, not today's feature.

---

# Core Philosophy

The project follows a Feature-First Modular Architecture with lightweight Clean Architecture principles.

Every feature owns its UI, business logic, validation, hooks, and data access.

Infrastructure is centralized.

Business logic stays outside React components.

Modules should hide complexity rather than expose it.

Architecture should optimize for future development speed rather than minimizing today's file count.

---

# Folder Philosophy

Assume a structure similar to:

src/

    app/

    core/

    features/

    shared/

Only recommend new top-level folders if absolutely necessary.

---

# Ownership Rules

Every file must have exactly one obvious owner.

Ask:

Which feature owns this?

If ownership is unclear, the architecture is unclear.

---

# Feature Rules

Each feature owns:

- components
- screens
- hooks
- services
- api
- validation
- models
- constants

Do not move feature-specific files into shared.

---

# Shared Rules

Shared code must satisfy BOTH:

1. Used by multiple features.

2. Represents generic functionality.

Never create shared code because it "might" be reused later.

Shared is earned.

---

# Core Rules

Core contains infrastructure only.

Examples:

- auth
- storage
- analytics
- networking
- logging
- configuration
- permissions

Business logic does not belong here.

---

# Questions To Ask

Before planning, determine:

What feature owns this?

Is this extending an existing feature?

Does this create a new feature?

Does it belong in shared?

Does it require new infrastructure?

Does it require new navigation?

Does it require new backend APIs?

Will this likely grow substantially later?

---

# Module Planning

Favor deep modules.

Good:

voteForPlayer()

Bad:

validateVote()

saveVote()

refreshVotes()

showToast()

trackAnalytics()

The caller should know as little as possible.

---

# File Creation

Estimate the minimum number of files.

Prefer:

5 focused files

over

1 gigantic file

Do not split prematurely.

Do not combine unrelated responsibilities.

---

# Dependency Direction

Allowed:

UI

↓

Hooks

↓

Services

↓

Repositories

↓

Backend

Forbidden:

Repositories importing React.

Features importing another feature's internal files.

Business logic inside UI.

---

# Simplicity Test

Ask:

Could another engineer find this file without searching?

If not,

the architecture probably needs improvement.

---

# Growth Test

Imagine this feature doubles in size.

Would the folder structure still make sense?

If not,

plan for that now.

---

# Output

Always produce:

## Architecture Plan

Feature Owner

Affected Features

New Files

Modified Files

New Dependencies

Potential Risks

Future Growth Considerations

Testing Strategy

Architectural Notes

Do NOT begin implementation until the architecture is coherent.

---

# Architectural Decisions

Record every non-trivial architectural recommendation.

Include:

- Decision
- Why
- Trade-offs
- Why alternatives were rejected
