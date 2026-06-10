---
name: sop-evolution-memory
description: Distill successful task trajectories into reusable Standard Operating Procedures (SOPs). Future similar tasks load the SOP instead of the full history. Based on GenericAgent self-evolution (arXiv:2604.17091).
category: orchestration
tags: [memory, self-evolution, SOP, trajectory-distillation, episodic-memory]
author: Research synthesis
source: arXiv:2604.17091
date: 2026-04-22
version: 1.0.0
...



---

# SOP Evolution Memory

## When to Use

Use this skill when:
- You repeatedly solve similar tasks (e.g., debugging Convex auth, adding API routes)
- Previous task trajectories are long but contain reusable patterns
- You want to improve over time without re-learning from scratch
- Context budget is tight and you can't load full historical trajectories

## The Problem

Agents start every task from zero knowledge. Even if they debugged 10 Convex auth issues before, the 11th starts fresh. Full trajectories are too long to load, but the pattern is reusable.

**GenericAgent** (arXiv:2604.17091) solves this by turning verified trajectories into reusable SOPs and executable code. The agent evolves over time.

## Core Protocol

### Phase 1: Trajectory Execution (During Task)

Execute the task normally, but annotate key decision points:

```
[DECISION] Identified pattern: Convex Auth `loading` bundles userLoading+tokenTransition
[DECISION] Key check: `!!user` for UI state, not `loading`
[DECISION] Fix: waitForUser must check BOTH user?.id AND !loadingRef.current
[VERIFICATION] Test passes after fix
```

### Phase 2: SOP Distillation (After Task Success)

After the task completes successfully, distill the trajectory into an SOP:

```markdown
# SOP: Debug Convex Auth User Loading Race

## Trigger
- `getCurrentUser` returns null after sign-in
- `useQuery` returns undefined while loading
- Routing decisions based on `loading` state are wrong

## Root Cause Pattern
`loading` bundles userLoading + tokenTransition + onboardingLoading.
`useQuery` returns `undefined` during loading, so `user` is temporarily null.

## Diagnostic Steps
1. Check if `getCurrentUser` returns null after successful sign-in
2. Verify `useQuery` loading behavior with `loadingRef.current`
3. Inspect waitForUser for race between `user?.id` and `!loadingRef.current`

## Fix Pattern
- Use `!!user` for UI state, never `loading` alone
- In waitForUser: `if (user?.id && !loadingRef.current)`

## Verification
- Run auth flow end-to-end
- Check onboarding redirect doesn't fire prematurely
```

### Phase 3: SOP Indexing

Store SOPs with searchable metadata:

```yaml
sop_id: convex-auth-user-loading-race
domain: debugging
tech: convex, react-native
triggers: [auth-null, loading-race, onboarding-redirect]
created: 2026-04-22
success_count: 3
last_used: 2026-04-22
```

### Phase 4: SOP Retrieval (Future Tasks)

When a new task arrives:
1. Extract key terms from the task description
2. Search SOP index for matching triggers or domains
3. If match found with success_count > 1, load SOP into context
4. If no match, execute from scratch

## SOP Context Budget

An SOP should fit within a strict token budget:

| Section | Max Tokens |
|---------|-----------|
| Trigger | 50 |
| Root Cause | 100 |
| Diagnostic Steps | 150 |
| Fix Pattern | 150 |
| Verification | 50 |
| **Total** | **500** |

A full trajectory may be 3,000-5,000 tokens. An SOP compresses it to 500.

## SOP Quality Gates

Before promoting a trajectory to SOP:

1. **Verified success**: The fix actually worked (tests pass, user confirms)
2. **Generalizable**: The pattern applies to more than one instance
3. **Minimal**: No task-specific details that wouldn't transfer
4. **Actionable**: Another agent could follow it without original context

## Example: Before vs After

**Loading full trajectory (3,200 tokens):**
```
The user reports Convex Auth loading issue...
[full conversation history]
I searched the codebase and found...
[full search results]
Then I checked the auth hooks...
[full code review]
The fix was to change...
[full patch and verification]
```

**Loading SOP (380 tokens):**
```
[SOP Loaded: convex-auth-user-loading-race]
Trigger: Auth returns null after sign-in
Root: loading bundles user+token+onboarding; useQuery returns undefined
Fix: Use !!user for UI; waitForUser checks user?.id && !loadingRef.current
Verify: Run auth E2E, check onboarding redirect
```

## Rules

1. **Never create an SOP from a failed trajectory** — only successful ones
2. **Never load an SOP with success_count = 0** — needs at least one verification
3. **Always update success_count** when an SOP-guided task succeeds
4. **Archive SOPs** that haven't been used in 30 days (reduce index noise)
5. **Prefer SOP over raw history** when match confidence > 0.7

## Evolution Over Time

As SOPs accumulate, the agent should:
- **Merge** overlapping SOPs into more general ones
- **Split** SOPs that cover too many distinct scenarios
- **Version** SOPs when the underlying tech changes (e.g., Convex Auth v2)
- **Deprecate** SOPs that no longer apply to current codebase versions

## Research Basis

- **GenericAgent** (arXiv:2604.17091): Self-evolving agent that turns verified trajectories into reusable SOPs and executable code. Continues to improve over time. Outperforms leading agents while using fewer tokens.

## Pitfalls

- **Overfitting SOPs**: A trajectory with too many specific details creates a brittle SOP. Strip task-specific variables.
- **SOP staleness**: Codebases evolve. An SOP from 3 months ago may reference renamed functions or deprecated APIs. Version and validate.
- **False positive matches**: A loosely related task may load the wrong SOP, leading the agent astray. Require trigger term overlap > 60%.
- **SOP index bloat**: Too many SOPs make retrieval noisy. Archive low-success-count SOPs. Merge duplicates.
