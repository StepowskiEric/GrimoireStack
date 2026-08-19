# Architecture Maintenance — Audit Checklist

## Feature ownership

Every new file should clearly belong somewhere. If ownership is unclear, identify the better location. Never allow "miscellaneous" folders to grow.

## Shared folder audit

Challenge every addition to `shared/`. Ask: is this actually reused? If not, recommend moving it back into its feature. Shared code is a maintenance cost.

## Core folder audit

Core should remain infrastructure only. Reject: business logic, feature-specific helpers, UI.

## UI audit

React components should primarily: render UI, handle events, call hooks. Business logic belongs elsewhere. If components exceed roughly 250 lines, recommend decomposition.

## Deep module review

Prefer modules that hide implementation.

- Good: `voteForPlayer()`
- Bad: `validate()`, `mutate()`, `cache()`, `refresh()`, `toast()`, `analytics()`

The interface should stay simple.

## Delete test

Ask: if this file disappeared, would the project become harder to understand? If no, recommend deleting, merging, or simplifying it.

## Duplicate knowledge

Look for repeated business rules — not repeated syntax. Repeated knowledge: vote eligibility checked in four locations. Recommend centralizing knowledge.

## Dependency direction

Verify:

```
UI → Hooks → Services → Repositories → Infrastructure
```

Reject: infrastructure depending on React, feature internals imported elsewhere, circular dependencies.

## Cohesion test

Does every file inside this feature belong together? If not, recommend moving files.

## Future growth

Imagine the feature doubles:
- Would navigation remain obvious?
- Would file names remain obvious?
- Would onboarding a new engineer stay easy?

If not, recommend improvements.

## Simplicity

Prefer obvious, predictable, boring architecture. Avoid clever abstractions and premature generalization.

## Ignore list

Ignore: formatting, import order, variable names, whitespace, semicolons, minor TypeScript improvements, lint warnings, micro-optimizations — unless they directly affect architecture.

## Output template

```
## Architecture Health

Overall Assessment:
Feature Ownership:
Dependency Direction:
Module Quality:
UI Purity:
Shared Usage:
Core Usage:
Duplicate Knowledge:
Future Growth:

## Recommendations
- <change that materially improves maintainability>

## Architectural Decisions
- Decision:
  Why:
  Trade-offs:
  Why alternatives were rejected:
```
