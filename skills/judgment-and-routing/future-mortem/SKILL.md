---
name: future-mortem
description: "After code is written, assume it will cause future pain and work backward to find what will bite: debt with interest, extension traps, hidden assumptions, maintenance memory, time bombs, and upgrade cliffs. Use when implementation is done and the agent must surface what the code will cost the project later."
display-name: "Future Mortem"
triggers:
  - Implementation is complete and needs a future-failure review before being called done
  - Need to know what the code will cost the project in six months
  - Code will be built upon by future features
  - Post-implementation risk audit
---

# Skill: Future Mortem — Post-Implementation Failure Review

## Purpose

Use this skill after code has been written to surface the future problems the code plants.

A future mortem works by assuming the code has already caused material pain — bugs, blocked features, wasted hours — and reasoning backward to explain why.

It is the post-implementation counterpart to the pre-mortem:
- **Pre-mortem**: before execution, assume the plan failed. Work backward to prevent it.
- **Future mortem**: after execution, assume the code causes pain. Work backward to find what will bite.

The narrative framing does the work. Assuming the pain has already happened produces more specific and more honest findings than asking "could this cause problems?" — the same effect Gary Klein documented for pre-mortems.

This is a failure review, not a quality review. It does not judge whether the code is well-shaped. It finds where the code will hurt later. For shape, use maintain-architecture or architecture-evolution-review.

## Core Rule

Assume the future failure has already happened.
You are not predicting whether the code will cause problems.
You are explaining how it did.

## When to Use

Use this skill when:
- a substantive implementation is complete, before calling it done
- a large diff is about to be merged
- code will be built upon by future features
- the codebase will outlive the current session
- a feature shipped and the agent wants to know what it left behind

Do not use this skill for:
- trivial, easily reversible changes
- throwaway code with no future
- diffs already fully covered by a code review (use code-review)

## Standard Future Mortem Workflow

### Step 1: Scope the Code

State what is under review: the diff, the feature, or the whole repository.
Be specific: which files, which behaviors, which future work will build on it.

Completion: the scope is one sentence a future reader can repeat.

### Step 2: Invoke the Failure Assumption

State explicitly:

"It is [a future date]. This code shipped. It is now causing material pain — bugs, blocked features, wasted hours. We are looking back at the code and explaining why."

Do not hedge. The pain happened. That is the premise.

### Step 3: Read the Code and Generate Failure Stories

From the pain-assumed vantage point, read the code and generate plausible stories for what went wrong.

Useful categories:

- **Debt with interest** — shortcuts, TODOs, workarounds, hardcoded values. Every future touch pays interest on the shortcut.
- **Extension traps** — code that resists the next feature: tight coupling, missing seams, premature abstraction, over-generalization.
- **Hidden assumptions** — invariants nothing enforces: ordering, timing, data shape, environment. The future change that violates them.
- **Maintenance memory** — rules every future change must remember: "if you touch X you must also Y." Unwritten contracts between parts of the code.
- **Time bombs** — safe today, unsafe later: unversioned APIs, magic numbers, global state, implicit defaults, security assumptions.
- **Upgrade and scale cliffs** — pinned dependencies, performance cliffs, data growth, platform assumptions.

Generate at least five failure stories before stopping.
Do not filter for plausibility at this stage — capture first, rank later.
Every story must name a specific line, file, or behavior. A story without a location is not a story.

Completion: at least five stories, each grounded in a specific location.

### Step 4: Rank the Failure Stories

Rank by:
- likelihood given what is known about the project
- severity of outcome if it occurred
- detectability — will it fail loudly or silently? Silent failures rank higher.

Completion: every story has a likelihood, severity, and detectability rating.

### Step 5: Write the Future-Cost Ledger

For every story, write the ledger entry:
- the story
- cost to fix now
- cost to fix later
- recommendation: pay now, or pay later and accept the interest

Then give the verdict: which items must be fixed before the code is called done, and which are consciously accepted debt.

Completion: every story has a cost pair and a recommendation. No story is left unranked.

## Output

Produce:

## Future-Cost Ledger

For each failure story:
- Location
- Story
- Cost now
- Cost later
- Verdict: pay now / pay later

## Verdict

- Must-fix before done
- Accepted debt, with the reason

Only recommend changes that materially reduce future cost.
Avoid speculative fixes for stories that will not happen.
