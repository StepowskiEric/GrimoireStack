# Feature Architecture Planning — Rules & Output Template

## Ownership rules

Every file must have exactly one obvious owner. Ask: which feature owns this? If ownership is unclear, the architecture is unclear.

## Feature rules

Each feature owns: components, screens, hooks, services, api, validation, models, constants. Do not move feature-specific files into shared.

## Shared rules

Shared code must satisfy BOTH:
1. Used by multiple features
2. Represents generic functionality

Never create shared code because it "might" be reused later. Shared is earned.

## Core rules

Core contains infrastructure only: auth, storage, analytics, networking, logging, configuration, permissions. Business logic does not belong here.

## Questions to ask before planning

- What feature owns this?
- Is this extending an existing feature?
- Does this create a new feature?
- Does it belong in shared?
- Does it require new infrastructure?
- Does it require new navigation?
- Does it require new backend APIs?
- Will this likely grow substantially later?

## Module planning

Favor deep modules.

- Good: `voteForPlayer()`
- Bad: `validateVote()`, `saveVote()`, `refreshVotes()`, `showToast()`, `trackAnalytics()`

The caller should know as little as possible.

## File creation

Estimate the minimum number of files. Prefer 5 focused files over 1 gigantic file. Do not split prematurely. Do not combine unrelated responsibilities.

## Dependency direction

```
UI → Hooks → Services → Repositories → Backend
```

Forbidden: repositories importing React, features importing another feature's internal files, business logic inside UI.

## Simplicity test

Could another engineer find this file without searching? If not, the architecture probably needs improvement.

## Growth test

Imagine this feature doubles in size. Would the folder structure still make sense? If not, plan for that now.

## Architecture plan output

```
## Architecture Plan

Feature Owner:
Affected Features:
New Files:
Modified Files:
New Dependencies:
Potential Risks:
Future Growth Considerations:
Testing Strategy:
Architectural Notes:

## Architectural Decisions
- Decision:
  Why:
  Trade-offs:
  Why alternatives were rejected:
```
