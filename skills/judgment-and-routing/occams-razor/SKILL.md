---
name: occams-razor
description: "Favor the simplest sufficient explanation or solution. Try the simplest thing that fits the evidence before escalating."
triggers:
  - over-engineering-risk
  - premature-abstraction
  - scope-creep-risk
  - simplest-fit-first
disable-model-invocation: true
---

# Occam's Razor

**Start simple. Stay simple as long as the evidence permits. Escalate only when you must.** LLMs have a documented bias toward over-engineering — frameworks, abstraction layers, scope expansion, elegant-but-unnecessary solutions before the simple ones are exhausted. Among explanations or solutions that fit the evidence, prefer the simplest: fewest moving parts, fewest assumptions, least new infrastructure, least change from the current state. Not least code — least complexity. Complexity is expensive; make it earn its keep.

## When to Use
- Diagnosing a bug with multiple possible explanations
- Designing a solution with approaches of different complexity
- Answering a question with several consistent interpretations
- Proposing a change — tiny edit or large refactor
- Reviewing code or a plan for over-engineering

Skip it: the simplest explanation already tested and ruled out, genuinely complex problems (distributed consensus), purely creative tasks.

## The Move

### 1. Name the simplest explanation first
Before any analysis, write down the simplest plausible explanation or solution — the version requiring the fewest new assumptions. Do not start from the most comprehensive one.

### 2. Rank alternatives simplest → most complex
List alternatives explicitly, each with its assumptions. Every additional assumption, dependency, or abstraction is a complexity cost; each alternative beyond the simplest must earn its place. Rough tiers: **0 — read/observe** (no change), **1 — single edit** (one file, one conceptual change), **2 — local refactor** (within existing boundaries), **3 — new abstraction** (new component/module), **4 — new infrastructure** (new dependency, table, service). Justify why the problem cannot be solved at a lower tier before escalating; tier 4 is a last resort.

### 3. Test the simplest that fits
Run the cheapest check for the simplest explanation: read the relevant log, inspect state, run a targeted test, sketch the design against the actual requirement. If it fits, commit and stop — do not explore alternatives already rendered unnecessary.

### 4. Escalate only on failure
If the simplest is falsified, move to the next simplest — do not skip, the ordering encodes that complexity costs are real. Failure of one explanation does not validate the most complex one.

### 5. Apply the complexity tax
Every solution component answers: what does this buy that a simpler approach does not? "Nothing" or "I'm not sure" → remove it. Concrete verified benefit → keep it. Stop when the simplest viable approach works; the discipline is "simplest viable," not "simplest possible."

## Reference
For the simplicity checklist, the tier table with examples, worked debugging/design examples, anti-patterns, and pairing guide, see [`references/occam-details.md`](references/occam-details.md).

## Rules
- **Do** state the simplest explanation before listing alternatives.
- **Do** rank alternatives by complexity — not just list them.
- **Do** test or falsify each tier before moving to the next.
- **Do** make every added component justify itself with a verified benefit.
- **Do** escalate when evidence demands it — under-solving is not the goal.
