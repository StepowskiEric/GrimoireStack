---
name: plan-feature-architecture
description: "Decide ownership, placement, module boundaries, dependencies, and project impact before writing code."
triggers:
  - feature-architecture-planning
  - ownership-decision
  - module-boundaries
  - pre-implementation-planning
---

# Feature Architecture Planning

**Every file must have exactly one obvious owner.** You are the project's architect — your job is not to write code but to decide how the feature fits the existing architecture, thinking in years of maintenance, not today's feature. The project follows a Feature-First Modular Architecture: features own their UI, logic, validation, and data access; infrastructure is centralized; business logic stays out of React components; modules hide complexity.

## The Move

### 1. Decide ownership
Determine: which feature owns this? Is this extending an existing feature or creating a new one? Does it belong in shared? Does it require new infrastructure, navigation, or backend APIs? Will it grow substantially later? If ownership is unclear, the architecture is unclear — resolve it before planning files.

### 2. Check the boundary rules
- **Feature rules** — each feature owns its components, screens, hooks, services, api, validation, models, constants. Feature-specific files stay in the feature.
- **Shared rules** — shared code must satisfy BOTH: used by multiple features AND generic functionality. Shared is earned — never create it because it "might" be reused.
- **Core rules** — core holds infrastructure only: auth, storage, analytics, networking, logging, configuration, permissions. Business logic does not belong there.

### 3. Plan the modules
- **Deep modules** — hide implementation: good `voteForPlayer()`, bad `validateVote() saveVote() refreshVotes() showToast() trackAnalytics()`. The caller should know as little as possible.
- **File count** — estimate the minimum; prefer 5 focused files over 1 gigantic file, but do not split prematurely or combine unrelated responsibilities.
- **Dependency direction** — UI ↓ Hooks ↓ Services ↓ Repositories ↓ Backend. Forbidden: repositories importing React, features importing another feature's internals, business logic in UI.

### 4. Test the plan
- **Simplicity test** — could another engineer find every file without searching? If not, improve the architecture.
- **Growth test** — imagine this feature doubles: would the folder structure still make sense? If not, plan for that now.
- **Folder philosophy** — fit the existing `app/ core/ features/ shared/` structure; recommend new top-level folders only when absolutely necessary.

### 5. Write the plan
Produce: **Architecture Plan** — feature owner, affected features, new files, modified files, new dependencies, potential risks, future growth considerations, testing strategy, architectural notes. Record every non-trivial recommendation as a decision: decision, why, trade-offs, why alternatives were rejected. Do not begin implementation until the architecture is coherent.

## Reference
For the full rule set and the architecture-plan output template, see [`references/feature-architecture-details.md`](references/feature-architecture-details.md).

## Rules
- **Do** resolve ownership before planning files — unclear ownership is unclear architecture.
- **Do** keep feature-specific files in their feature; shared and core are earned, not assumed.
- **Do** hide complexity behind deep modules.
- **Do** check dependency direction for every new import.
- **Do** record every non-trivial decision with its trade-offs and rejected alternatives.
