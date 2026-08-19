---
name: feature-architecture
description: "One rule set for three moments: plan where files live before writing, review completed work, and audit the repo as a living system."
triggers:
  - feature-architecture-planning
  - ownership-decision
  - module-boundaries
  - post-implementation-architecture-review
  - architectural-drift
  - long-term-health
---

# Feature Architecture

**Every file must have exactly one obvious owner — and the project must become easier to work on after every feature.** Feature-First Modular Architecture: features own their UI, logic, validation, and data access; infrastructure is centralized; business logic stays out of components; modules hide complexity. Use the same rule set at three moments: decide ownership before writing, review ownership after a feature lands, and audit the whole repo as a living system.

## The Move

### 1. Decide ownership (before writing)
Which feature owns this? Is this an extension or a new feature? Does it belong in shared? Does it need new infrastructure, navigation, or backend APIs? Resolve ownership before planning files — unclear ownership is unclear architecture.

### 2. Apply the boundary rules
- **Feature rules** — each feature owns its components, screens, hooks, services, api, validation, models, constants.
- **Shared rules** — shared code must satisfy BOTH: used by multiple features AND generic functionality. Shared is earned — challenge every addition; if reuse is not real, move it back.
- **Core rules** — core holds infrastructure only: auth, storage, analytics, networking, logging, configuration, permissions.

### 3. Design deep modules and dependency direction
Hide implementation: good `voteForPlayer()`, bad `validateVote() saveVote() refreshVotes() showToast()`. Direction: UI ↓ Hooks ↓ Services ↓ Repositories ↓ Infrastructure. Reject infrastructure depending on React, features importing another feature's internals, and circular dependencies.

### 4. Test the plan
**Simplicity test** — could another engineer find every file without searching? **Growth test** — if the feature doubles, does the structure still make sense? **Delete test** — if this file disappeared, would the project become harder to understand? If no, recommend deleting, merging, or simplifying.

### 5. Review completed work
Check every new file for ownership, structure (deep modules, UI purity, dependency direction, cohesion), knowledge (duplicate business rules → centralize), and growth. Review architecture only — formatting, naming, lint, and style are out of scope.

### 6. Audit evolution
Walk the folder tree: what responsibility does each top-level directory own, and is it growing around one concept or becoming a dumping ground? One oversized component is acceptable; five is a pattern — prefer patterns over isolated issues. Score findings by leverage × effort × blast radius; pick the top 5; recommend small, high-leverage improvements, never rewrites.

### 7. Write the verdict
Plan: feature owner, affected features, new/modified files, dependencies, risks, growth notes, testing strategy. Review: Architecture Health + Recommendations. Audit: Architecture Trend + Top 5 + Future Risks. Record every non-trivial recommendation as a decision: the decision, why, trade-offs, why alternatives were rejected.

## Reference
For the full rule set, per-audit checklist, and output templates, see [`references/feature-architecture-details.md`](references/feature-architecture-details.md), [`references/architecture-maintenance-details.md`](references/architecture-maintenance-details.md), and [`references/architecture-evolution-details.md`](references/architecture-evolution-details.md).

## Rules
- **Do** resolve ownership before planning files — unclear ownership is unclear architecture.
- **Do** keep feature files in their feature; shared and core are earned, not assumed.
- **Do** check dependency direction for every new import.
- **Do** prefer patterns over isolated issues — one case is noise, five is a trend.
- **Do** record every non-trivial decision with its trade-offs and rejected alternatives.
