---
name: maintain-architecture
description: "Review completed work for architectural quality: feature ownership, dependency direction, module quality, and long-term scalability."
triggers:
  - post-implementation-architecture-review
  - architectural-drift
  - maintainability-review
  - feature-ownership-check
---

# Architecture Maintenance

**The project should become easier to work on after every feature.** Review architecture — not formatting, not naming, not lint, not style. Focus exclusively on keeping a clean architecture as the application grows: prevent drift, avoid unnecessary rewrites, and only recommend changes that materially improve maintainability.

## The Move

### 1. Map ownership
Check every new file clearly belongs to a feature: **feature ownership** (no miscellaneous folders), **shared folder audit** (is it actually reused? if not, move it back — shared code is a maintenance cost), and **core folder audit** (infrastructure only — reject business logic, feature helpers, and UI in core).

### 2. Check structure
- **Deep modules** — prefer interfaces that hide implementation (good: `voteForPlayer()`; bad: `validate() mutate() cache() refresh()`)
- **UI purity** — React components render, handle events, call hooks; business logic belongs elsewhere; decompose components over ~250 lines
- **Dependency direction** — UI ↓ Hooks ↓ Services ↓ Repositories ↓ Infrastructure; reject infrastructure depending on React, feature internals imported elsewhere, circular dependencies
- **Cohesion** — every file in a feature belongs together; if not, recommend moving files

### 3. Check knowledge
- **Delete test** — if this file disappeared, would the project become harder to understand? If no, recommend deleting, merging, or simplifying
- **Duplicate knowledge** — repeated business rules (not repeated syntax): vote eligibility checked in four locations → centralize

### 4. Check growth
- **Future growth** — imagine the feature doubles: does navigation stay obvious, do file names stay obvious, does onboarding stay easy?
- **Simplicity** — prefer obvious, predictable, boring architecture; avoid clever abstractions and premature generalization

### 5. Write the verdict
Produce: **Architecture Health** (overall assessment, feature ownership, dependency direction, module quality, UI purity, shared/core usage, duplicate knowledge, future growth) and **Recommendations** — only changes that materially improve maintainability. Record every non-trivial recommendation as an architectural decision: decision, why, trade-offs, why alternatives were rejected.

## Reference
For the full per-audit checklist with the exact review questions, the ignore list, and the output template, see [`references/architecture-maintenance-details.md`](references/architecture-maintenance-details.md).

## Rules
- **Do** review architecture only — formatting, naming, lint, and style are out of scope unless they affect architecture.
- **Do** challenge every addition to shared/ — reuse must be real.
- **Do** prefer small, high-leverage improvements over rewrites.
- **Do** record every non-trivial recommendation as a decision with trade-offs.
